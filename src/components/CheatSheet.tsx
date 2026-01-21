import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Printer, X, BookOpen, Scale, Award, Puzzle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CheatSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const methods = [
    {
      name: "SCRB Method",
      fullName: "Separable Costs-Remaining Benefits",
      icon: <Calculator className="w-5 h-5" />,
      color: "bg-primary",
      formula: "xᵢ = SCᵢ + (RBᵢ / ΣRB) × NSC",
      components: [
        { term: "SCᵢ", def: "Separable Cost = c(N) − c(N\\{i})" },
        { term: "RBᵢ", def: "Remaining Benefit = max(0, c({i}) − SCᵢ)" },
        { term: "NSC", def: "Non-Separable Cost = c(N) − ΣSCᵢ" },
      ],
      whenToUse: [
        "Cost allocation for shared infrastructure",
        "When 'causation' matters (who drives costs)",
        "Water resource & utility projects",
      ],
      pros: ["Intuitive cost attribution", "Widely accepted in practice"],
      cons: ["May fall outside the Core", "Sensitive to standalone costs"],
    },
    {
      name: "Shapley Value",
      fullName: "Average Marginal Contribution",
      icon: <Award className="w-5 h-5" />,
      color: "bg-interactive",
      formula: "φᵢ = Σ [|S|!(n-|S|-1)!/n!] × [c(S∪{i}) − c(S)]",
      components: [
        { term: "S", def: "Coalition not containing player i" },
        { term: "c(S∪{i}) − c(S)", def: "Marginal contribution of i to S" },
        { term: "n!", def: "Total orderings of all players" },
      ],
      whenToUse: [
        "Fair division based on contribution",
        "When all orderings are equally likely",
        "Academic/theoretical applications",
      ],
      pros: ["Unique & axiomatically fair", "Always exists", "Nobel Prize-winning concept"],
      cons: ["Can fall outside the Core", "Computationally expensive for large n"],
    },
    {
      name: "Nucleolus",
      fullName: "Lexicographic Minimum of Excesses",
      icon: <Puzzle className="w-5 h-5" />,
      color: "bg-accent",
      formula: "min max e(S,x) where e(S,x) = c(S) − Σᵢ∈S xᵢ",
      components: [
        { term: "e(S,x)", def: "Excess = how much S 'overpays'" },
        { term: "lexmin", def: "Minimize worst, then 2nd worst, etc." },
      ],
      whenToUse: [
        "When stability is paramount",
        "Dispute resolution (minimizes complaints)",
        "When Core might be complex",
      ],
      pros: ["Always in Core (if non-empty)", "Unique solution", "Maximally fair"],
      cons: ["Complex computation", "Less intuitive than Shapley"],
    },
    {
      name: "Equal Split",
      fullName: "Simple Equal Division",
      icon: <Scale className="w-5 h-5" />,
      color: "bg-muted-foreground",
      formula: "xᵢ = c(N) / n",
      components: [
        { term: "c(N)", def: "Grand coalition cost" },
        { term: "n", def: "Number of participants" },
      ],
      whenToUse: [
        "When simplicity is valued over fairness",
        "Equal-sized participants",
        "Quick baseline comparison",
      ],
      pros: ["Simple to compute & explain", "No data needed beyond total"],
      cons: ["Ignores individual contributions", "Often unfair", "Usually outside Core"],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="w-4 h-4" />
          Cheat Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Cost Allocation Methods Cheat Sheet
          </DialogTitle>
        </DialogHeader>

        {/* Print button */}
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </div>

        {/* Printable content */}
        <div className="print:p-8" id="cheat-sheet-content">
          {/* Header for print */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Cost Allocation Methods</h1>
            <p className="text-sm text-muted-foreground">Quick Reference Cheat Sheet</p>
          </div>

          {/* Methods grid */}
          <div className="grid md:grid-cols-2 gap-4 print:gap-3">
            {methods.map((method, index) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 print:p-3 print:break-inside-avoid bg-card"
              >
                {/* Method header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-md ${method.color} text-primary-foreground print:bg-gray-800`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{method.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{method.fullName}</p>
                  </div>
                </div>

                {/* Formula */}
                <div className="bg-muted/50 rounded-md p-2 mb-3 print:bg-gray-100">
                  <p className="text-[10px] text-muted-foreground mb-1">Formula</p>
                  <p className="font-mono text-xs font-medium">{method.formula}</p>
                </div>

                {/* Components */}
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Key Terms</p>
                  <div className="space-y-0.5">
                    {method.components.map((comp) => (
                      <div key={comp.term} className="flex gap-2 text-[10px]">
                        <span className="font-mono font-semibold min-w-[60px]">{comp.term}</span>
                        <span className="text-muted-foreground">{comp.def}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* When to use */}
                <div className="mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">When to Use</p>
                  <ul className="space-y-0.5">
                    {method.whenToUse.map((use, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex gap-1">
                        <span className="text-interactive">•</span> {use}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pros/Cons */}
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400 mb-0.5">✓ Pros</p>
                    {method.pros.map((pro, i) => (
                      <p key={i} className="text-muted-foreground">{pro}</p>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400 mb-0.5">✗ Cons</p>
                    {method.cons.map((con, i) => (
                      <p key={i} className="text-muted-foreground">{con}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick comparison table */}
          <div className="mt-6 print:mt-4">
            <h3 className="font-bold text-sm mb-2">Quick Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-muted/50 print:bg-gray-100">
                    <th className="border p-1.5 text-left font-semibold">Method</th>
                    <th className="border p-1.5 text-center font-semibold">Always in Core?</th>
                    <th className="border p-1.5 text-center font-semibold">Unique?</th>
                    <th className="border p-1.5 text-center font-semibold">Complexity</th>
                    <th className="border p-1.5 text-left font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-1.5 font-medium">SCRB</td>
                    <td className="border p-1.5 text-center">❌ No</td>
                    <td className="border p-1.5 text-center">✅ Yes</td>
                    <td className="border p-1.5 text-center">Low</td>
                    <td className="border p-1.5">Infrastructure cost attribution</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border p-1.5 font-medium">Shapley</td>
                    <td className="border p-1.5 text-center">❌ No</td>
                    <td className="border p-1.5 text-center">✅ Yes</td>
                    <td className="border p-1.5 text-center">High (n!)</td>
                    <td className="border p-1.5">Fair contribution-based division</td>
                  </tr>
                  <tr>
                    <td className="border p-1.5 font-medium">Nucleolus</td>
                    <td className="border p-1.5 text-center">✅ Yes*</td>
                    <td className="border p-1.5 text-center">✅ Yes</td>
                    <td className="border p-1.5 text-center">High (LP)</td>
                    <td className="border p-1.5">Stability-critical negotiations</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border p-1.5 font-medium">Equal Split</td>
                    <td className="border p-1.5 text-center">❌ No</td>
                    <td className="border p-1.5 text-center">✅ Yes</td>
                    <td className="border p-1.5 text-center">None</td>
                    <td className="border p-1.5">Simple baseline only</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[9px] text-muted-foreground mt-1">*When Core is non-empty</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center print:mt-4">
            <p className="text-[10px] text-muted-foreground">
              Based on Heaney & Dickinson (1982) • Water Resources Research
            </p>
            <p className="text-[9px] text-muted-foreground mt-1">
              Generated from the Interactive Cost Allocation Calculator
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheatSheet;
