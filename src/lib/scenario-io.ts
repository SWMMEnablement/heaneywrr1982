import type { Participant, CoalitionCost } from "./calculations";

export interface SavedScenario {
  playerMode: 3 | 4;
  participants: Participant[];
  coalitions: CoalitionCost[];
}

const FORMAT = "cost-allocation-scenario";
const VERSION = 1;

export function serializeScenario(s: SavedScenario): string {
  return JSON.stringify({ format: FORMAT, version: VERSION, savedAt: new Date().toISOString(), ...s }, null, 2);
}

/** Parse an exported scenario file. Throws an Error with a readable message on bad input. */
export function parseScenario(text: string): SavedScenario {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  const d = data as Record<string, unknown>;
  if (!d || d.format !== FORMAT) throw new Error("This is not a cost-allocation scenario file.");
  const mode = d.playerMode;
  if (mode !== 3 && mode !== 4) throw new Error("The scenario must have 3 or 4 players.");

  const participants = d.participants;
  if (!Array.isArray(participants) || participants.length !== mode) {
    throw new Error(`Expected ${mode} participants.`);
  }
  const parsedParticipants: Participant[] = participants.map((p, i) => {
    const r = p as Record<string, unknown>;
    if (typeof r.id !== "number" || typeof r.independentCost !== "number") {
      throw new Error(`Participant ${i + 1} is missing an id or cost.`);
    }
    return { id: r.id, name: String(r.name ?? `Participant ${r.id}`), independentCost: r.independentCost };
  });
  const ids = new Set(parsedParticipants.map(p => p.id));

  const coalitions = d.coalitions;
  if (!Array.isArray(coalitions)) throw new Error("The coalitions list is missing.");
  const parsedCoalitions: CoalitionCost[] = coalitions.map((c, i) => {
    const r = c as Record<string, unknown>;
    if (!Array.isArray(r.participants) || typeof r.cost !== "number" ||
        !r.participants.every(id => typeof id === "number" && ids.has(id))) {
      throw new Error(`Coalition ${i + 1} is malformed.`);
    }
    return { participants: r.participants as number[], cost: r.cost };
  });
  if (!parsedCoalitions.some(c => c.participants.length === mode)) {
    throw new Error("The grand-coalition cost is missing.");
  }

  return { playerMode: mode, participants: parsedParticipants, coalitions: parsedCoalitions };
}
