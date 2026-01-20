import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookText, X, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export interface GlossaryTerm {
  term: string;
  definition: string;
  formula?: string;
  example?: string;
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Subadditive",
    definition: "A cost function is subadditive when the cost of a combined coalition is never greater than the sum of costs for separate coalitions. This property ensures that cooperation can reduce total costs.",
    formula: "c(S ∪ T) ≤ c(S) + c(T) for all disjoint S, T",
    example: "If Town A costs $5M alone and Town B costs $4M alone, but together they cost $7M, the game is subadditive (7 ≤ 5+4).",
    relatedTerms: ["Characteristic Function", "Coalition"],
  },
  {
    term: "Characteristic Function",
    definition: "A function c(S) that assigns a value (cost or worth) to every possible coalition S of players. It defines the 'rules' of the cooperative game by specifying what each group can achieve.",
    formula: "c: 2^N → ℝ",
    example: "c({1}) = 5, c({2}) = 4, c({1,2}) = 7 defines costs for player 1 alone, player 2 alone, and both together.",
    relatedTerms: ["Coalition", "Subadditive"],
  },
  {
    term: "Imputation",
    definition: "A cost allocation that is both efficient (total allocations equal total cost) and individually rational (no player pays more than their standalone cost). The set of all imputations is the first step toward defining fairness.",
    formula: "Σxᵢ = c(N) and xᵢ ≤ c({i}) for all i",
    example: "If the grand coalition costs $7 and allocations are (2, 2, 3), this is an imputation if each player's allocation is below their standalone cost.",
    relatedTerms: ["Individual Rationality", "The Core"],
  },
  {
    term: "Coalition Rationality",
    definition: "The requirement that no subgroup of players should pay more together than they would by forming their own separate coalition. Allocations satisfying this for all coalitions lie in the core.",
    formula: "Σᵢ∈S xᵢ ≤ c(S) for all S ⊂ N",
    example: "If players 1 and 2 can build together for $5, their combined allocation should not exceed $5, or they'd leave the grand coalition.",
    relatedTerms: ["The Core", "Imputation"],
  },
  {
    term: "Individual Rationality",
    definition: "The principle that each player should pay no more in the coalition than they would pay acting alone. This ensures every player benefits from cooperation.",
    formula: "xᵢ ≤ c({i}) for all players i",
    example: "If Town A can build alone for $5M, a fair allocation should charge Town A at most $5M.",
    relatedTerms: ["Imputation", "Coalition Rationality"],
  },
  {
    term: "The Core",
    definition: "The set of all allocations that satisfy coalition rationality for every possible coalition. Allocations in the core are stable because no group has an incentive to break away.",
    formula: "Core = {x : Σxᵢ = c(N), Σᵢ∈S xᵢ ≤ c(S) ∀S}",
    example: "In a 3-player game, the core is a polygon inside the simplex where all constraint boundaries intersect.",
    relatedTerms: ["Coalition Rationality", "Nucleolus", "Shapley Value"],
  },
  {
    term: "Shapley Value",
    definition: "A unique allocation method that gives each player their average marginal contribution across all possible orderings of players joining the coalition. Satisfies efficiency, symmetry, and additivity axioms.",
    formula: "φᵢ = Σ [|S|!(n-|S|-1)!/n!] × [c(S∪{i}) - c(S)]",
    example: "If player 1 adds $3 of cost when joining first, $2 when joining second, and $1 when joining last, their Shapley value is the average: $2.",
    relatedTerms: ["Marginal Contribution", "The Core"],
  },
  {
    term: "Nucleolus",
    definition: "The unique allocation that lexicographically minimizes the maximum 'excess' (dissatisfaction) of any coalition. Always lies in the core when the core is non-empty.",
    formula: "Minimize max{c(S) - Σᵢ∈S xᵢ} over all S",
    example: "The nucleolus finds the allocation where the most unhappy coalition is as satisfied as possible, then the second-most unhappy, and so on.",
    relatedTerms: ["The Core", "Excess"],
  },
  {
    term: "Marginal Contribution",
    definition: "The additional cost incurred when a player joins an existing coalition. It measures the incremental impact of adding that player.",
    formula: "MCᵢ(S) = c(S ∪ {i}) - c(S)",
    example: "If a coalition of players {1,2} costs $5 and adding player 3 raises it to $7, player 3's marginal contribution is $2.",
    relatedTerms: ["Shapley Value", "Separable Cost"],
  },
  {
    term: "Separable Cost",
    definition: "The portion of the grand coalition's cost that is directly attributable to a specific player. Calculated as the cost with the player minus the cost without them.",
    formula: "SCᵢ = c(N) - c(N \\ {i})",
    example: "If the 3-player coalition costs $7 and removing player 1 reduces it to $5, player 1's separable cost is $2.",
    relatedTerms: ["SCRB Method", "Marginal Contribution"],
  },
  {
    term: "SCRB Method",
    definition: "Separable Costs - Remaining Benefits method. Each player pays their separable cost plus a share of non-separable costs proportional to their remaining benefits (standalone cost minus separable cost).",
    formula: "xᵢ = SCᵢ + (RBᵢ/ΣRBⱼ) × NSC",
    example: "If separable costs are (2,1,1) and remaining benefits are (3,3,2), the non-separable cost $3 is split proportionally.",
    relatedTerms: ["Separable Cost", "MCRS Method"],
  },
  {
    term: "MCRS Method",
    definition: "Minimum Costs - Remaining Savings method. An improvement over SCRB that uses actual core boundaries instead of nominal bounds, ensuring the allocation always lies within the core.",
    formula: "Uses tight core constraints as bounds",
    example: "MCRS adjusts the remaining benefits calculation to respect all coalition constraints, not just individual ones.",
    relatedTerms: ["SCRB Method", "The Core"],
  },
  {
    term: "Excess",
    definition: "A measure of a coalition's dissatisfaction with an allocation. The excess is the difference between what the coalition could achieve alone and what its members are allocated.",
    formula: "e(S, x) = c(S) - Σᵢ∈S xᵢ",
    example: "If coalition {1,2} could operate for $5 but they're allocated $6 total, their excess is -$1 (they're overpaying).",
    relatedTerms: ["Nucleolus", "Coalition Rationality"],
  },
  {
    term: "Grand Coalition",
    definition: "The coalition containing all players in the game. In cost allocation, the grand coalition's cost c(N) is the total cost to be allocated among all participants.",
    formula: "N = {1, 2, ..., n}",
    example: "In a 3-town water project, the grand coalition is all three towns cooperating together.",
    relatedTerms: ["Characteristic Function", "Coalition"],
  },
  {
    term: "Coalition",
    definition: "Any subset of players who agree to cooperate. A cooperative game considers all 2ⁿ possible coalitions for n players.",
    formula: "S ⊆ N",
    example: "With 3 players, coalitions are: {1}, {2}, {3}, {1,2}, {1,3}, {2,3}, {1,2,3}.",
    relatedTerms: ["Grand Coalition", "Characteristic Function"],
  },
];

// Hoverable term component for inline use
interface GlossaryTermLinkProps {
  term: string;
  children?: React.ReactNode;
}

export const GlossaryTermLink = ({ term, children }: GlossaryTermLinkProps) => {
  const glossaryEntry = glossaryTerms.find(
    (t) => t.term.toLowerCase() === term.toLowerCase()
  );

  if (!glossaryEntry) {
    return <span>{children || term}</span>;
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="text-interactive underline decoration-dotted underline-offset-2 hover:text-interactive/80 transition-colors cursor-help inline">
          {children || term}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" align="start" side="top">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookText className="w-4 h-4 text-interactive" />
            <h4 className="font-semibold text-foreground">{glossaryEntry.term}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{glossaryEntry.definition}</p>
          {glossaryEntry.formula && (
            <div className="mb-3 p-2 rounded bg-muted/50 font-mono text-xs text-foreground">
              {glossaryEntry.formula}
            </div>
          )}
          {glossaryEntry.example && (
            <p className="text-xs text-muted-foreground italic border-l-2 border-interactive/50 pl-2">
              {glossaryEntry.example}
            </p>
          )}
          {glossaryEntry.relatedTerms && glossaryEntry.relatedTerms.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1">Related:</p>
              <div className="flex flex-wrap gap-1">
                {glossaryEntry.relatedTerms.map((rt) => (
                  <span key={rt} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {rt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

// Full glossary section component
const Glossary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filteredTerms = glossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTermClick = (term: GlossaryTerm) => {
    setSelectedTerm(selectedTerm?.term === term.term ? null : term);
  };

  const handleRelatedTermClick = (termName: string) => {
    const term = glossaryTerms.find((t) => t.term === termName);
    if (term) {
      setSelectedTerm(term);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mt-16"
    >
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <BookText className="w-4 h-4" />
          Interactive Glossary
        </span>
        <h3 className="text-2xl font-serif font-bold text-primary">
          Key Terms & Definitions
        </h3>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Click any term to explore its definition, formula, and examples
        </p>
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Terms List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredTerms.map((term) => (
                <motion.button
                  key={term.term}
                  onClick={() => handleTermClick(term)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedTerm?.term === term.term
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${selectedTerm?.term === term.term ? "text-primary" : "text-foreground"}`}>
                      {term.term}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedTerm?.term === term.term ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {term.definition}
                  </p>
                </motion.button>
              ))}
              {filteredTerms.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No terms found matching "{searchQuery}"
                </p>
              )}
            </div>

            {/* Detail Panel */}
            <div className="border-l border-border pl-4">
              <AnimatePresence mode="wait">
                {selectedTerm ? (
                  <motion.div
                    key={selectedTerm.term}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xl font-semibold text-primary font-serif">
                        {selectedTerm.term}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTerm(null)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      {selectedTerm.definition}
                    </p>

                    {selectedTerm.formula && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Formula</p>
                        <p className="font-mono text-sm text-foreground">
                          {selectedTerm.formula}
                        </p>
                      </div>
                    )}

                    {selectedTerm.example && (
                      <div className="p-3 rounded-lg bg-interactive/5 border-l-2 border-interactive">
                        <p className="text-xs text-interactive font-medium mb-1">Example</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedTerm.example}
                        </p>
                      </div>
                    )}

                    {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Related Terms</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTerm.relatedTerms.map((relatedTerm) => (
                            <button
                              key={relatedTerm}
                              onClick={() => handleRelatedTermClick(relatedTerm)}
                              className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {relatedTerm}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-12 text-center"
                  >
                    <BookText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Select a term to view its definition
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Click any term from the list on the left
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Glossary;
