import { createOpenAI } from "npm:@ai-sdk/openai@4";
import { streamText, Output, jsonSchema, NoObjectGeneratedError, APICallError } from "npm:ai@7";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
} from "../_shared/run-id.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";
const MAX_FAILURES = 40;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Failure {
  id: string;
  method: string;
  coalition: string;
  members: { name: string; pays: number; standaloneCost: number }[];
  coalitionCost: number;
  paid: number;
  overcharge: number;
}

interface Payload {
  grandCoalitionCost: number;
  participants: { name: string; standaloneCost: number }[];
  coalitionCosts: { members: string; cost: number }[];
  failures: Failure[];
}

const INSTRUCTIONS = `You explain cost-allocation results to students and water-utility managers with no game-theory background.
You receive a cooperative cost game and a list of FAILED stability constraints that the app has already computed.
For each failure, write one or two short plain-language sentences explaining what the failure means for the people involved and why that group would be tempted to leave the shared project.
Rules:
- Use ONLY numbers that appear in the input, written with two decimals exactly as given. Never compute new totals, never propose different allocations, never say what the method "should" charge.
- Name the participants. Avoid jargon such as "core", "imputation" or "x(S)"; say "together they are charged" and "on their own they could build it for".
- For a single participant, contrast what they are charged with their standalone cost.
- Write natural, grammatical sentences with the participants as the subject, e.g. "Purpose 1 and Purpose 2 are charged 6.00 together, but could build their own project for 5.00, so they would be better off leaving."
- Return exactly one entry per failure id, in the same order.`;

/** Every number quoted in an explanation must be one of that failure's own figures. */
function isGrounded(text: string, f: Failure): boolean {
  const allowed = new Set(
    [f.paid, f.coalitionCost, f.overcharge, ...f.members.flatMap(m => [m.pays, m.standaloneCost])].map(v => v.toFixed(2)),
  );
  const quoted = text.match(/\d+\.\d+/g) ?? [];
  return quoted.every(q => allowed.has(Number(q).toFixed(2)));
}

const schema = jsonSchema<{ explanations: { id: string; text: string }[] }>({
  type: "object",
  additionalProperties: false,
  required: ["explanations"],
  properties: {
    explanations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "text"],
        properties: { id: { type: "string" }, text: { type: "string" } },
      },
    },
  },
});

const json = (body: unknown, status: number, extra?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: getLovableAiGatewayResponseHeaders(extra, { ...corsHeaders, "Content-Type": "application/json" }),
  });

const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v);

function validate(body: unknown): Payload | null {
  const b = body as Payload;
  if (!b || !isNum(b.grandCoalitionCost) || !Array.isArray(b.failures) || !Array.isArray(b.participants)) return null;
  if (b.failures.length === 0 || b.failures.length > MAX_FAILURES) return null;
  const ok = b.failures.every(
    f => typeof f.id === "string" && typeof f.coalition === "string" && isNum(f.paid) &&
      isNum(f.coalitionCost) && isNum(f.overcharge) && Array.isArray(f.members),
  );
  return ok ? b : null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured for this project." }, 500);

  let payload: Payload | null = null;
  try {
    payload = validate(await request.json());
  } catch {
    payload = null;
  }
  if (!payload) return json({ error: `Send between 1 and ${MAX_FAILURES} failed constraints.` }, 400);

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const runHeaders = () => {
    const id = runIdFetch.getRunId();
    return id ? { "X-Lovable-AIG-Run-ID": id } : undefined;
  };

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
      output: Output.object({ schema }),
      abortSignal: request.signal,
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const output = await result.output;
    const byId = new Map(payload.failures.map(f => [f.id, f]));
    const explanations = (output?.explanations ?? []).filter(e => {
      const f = byId.get(e.id);
      return f && e.text.trim() && isGrounded(e.text, f);
    });
    if (explanations.length === 0) {
      return json({ error: "Lovable AI returned no explanation. Try again later." }, 502, runHeaders());
    }
    return json({ explanations }, 200, runHeaders());
  } catch (error) {
    if ((error as Error)?.name === "AbortError") return json({ error: "Request cancelled" }, 499);
    if (NoObjectGeneratedError.isInstance(error)) {
      return json({ error: "Lovable AI returned an unreadable answer. Try again later." }, 502, runHeaders());
    }
    const cause = APICallError.isInstance(error)
      ? error
      : APICallError.isInstance((error as { lastError?: unknown })?.lastError)
        ? (error as { lastError: APICallError }).lastError
        : null;
    if (cause?.statusCode) {
      let message = cause.message;
      try {
        const parsed = JSON.parse(cause.responseBody ?? "");
        message = parsed?.error?.message ?? parsed?.message ?? message;
      } catch { /* keep SDK message */ }
      if (cause.statusCode === 402) message = message || "Lovable AI credits are used up. Add credits in Settings → Plans & credits.";
      if (cause.statusCode === 429) message = message || "Lovable AI is busy. Please wait a moment and try again.";
      return json({ error: message }, cause.statusCode, runHeaders());
    }
    console.error("explain-audit failed", error);
    return json({ error: "Lovable AI could not explain these results right now." }, 500, runHeaders());
  }
});
