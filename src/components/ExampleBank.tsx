import { motion } from "framer-motion";
import { Droplets, Plane, AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlossaryTermLink } from "./Glossary";

export interface Scenario {
  id: 'reservoir' | 'airport' | 'emptyCore';
  name: string;
  description: string;
  icon: React.ElementType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  highlight: string;
  participants: { id: number; name: string; independentCost: number }[];
  coalitions: { participants: number[]; cost: number }[];
}

export const scenarios: Scenario[] = [
  {
    id: 'reservoir',
    name: "3-Town Reservoir",
    description: "Three municipal towns pooling resources to build a shared water reservoir. The classic example from the 1982 paper.",
    icon: Droplets,
    difficulty: 'Beginner',
    highlight: "The foundational cooperative game example",
    participants: [
      { id: 1, name: "Riverside", independentCost: 2 },
      { id: 2, name: "Hilltop", independentCost: 4 },
      { id: 3, name: "Lakeview", independentCost: 6 },
    ],
    coalitions: [
      { participants: [1, 2], cost: 5 },
      { participants: [1, 3], cost: 6 },
      { participants: [2, 3], cost: 6 },
      { participants: [1, 2, 3], cost: 7 },
    ],
  },
  {
    id: 'airport',
    name: "Airport Runway",
    description: "Airlines sharing runway construction costs. Larger planes need longer runways, creating asymmetric cost structures.",
    icon: Plane,
    difficulty: 'Intermediate',
    highlight: "Asymmetric cost requirements",
    participants: [
      { id: 1, name: "Regional Air", independentCost: 8 },
      { id: 2, name: "National Jet", independentCost: 20 },
      { id: 3, name: "Global Cargo", independentCost: 45 },
    ],
    coalitions: [
      { participants: [1, 2], cost: 20 },
      { participants: [1, 3], cost: 45 },
      { participants: [2, 3], cost: 45 },
      { participants: [1, 2, 3], cost: 45 },
    ],
  },
  {
    id: 'emptyCore',
    name: "Empty Core Game",
    description: "A scenario where no stable allocation exists—any proposed split gives someone an incentive to leave the coalition. The core is empty.",
    icon: AlertTriangle,
    difficulty: 'Advanced',
    highlight: "Demonstrates coalition instability when the core is empty",
    participants: [
      { id: 1, name: "Party A", independentCost: 10 },
      { id: 2, name: "Party B", independentCost: 10 },
      { id: 3, name: "Party C", independentCost: 10 },
    ],
    coalitions: [
      { participants: [1, 2], cost: 8 },
      { participants: [1, 3], cost: 8 },
      { participants: [2, 3], cost: 8 },
      { participants: [1, 2, 3], cost: 15 },
    ],
  },
];

interface ExampleBankProps {
  onSelectScenario: (scenario: Scenario) => void;
}

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

const ExampleBank = ({ onSelectScenario }: ExampleBankProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-semibold text-lg">Example Scenarios</h3>
          <p className="text-sm text-muted-foreground">
            Pre-built scenarios to explore different cost allocation problems
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-interactive/30 group"
              onClick={() => onSelectScenario(scenario)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-interactive/10 text-interactive shrink-0">
                    <scenario.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base font-serif">{scenario.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-xs ${difficultyColors[scenario.difficulty]}`}
                      >
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm line-clamp-2">
                      {scenario.description}
                    </CardDescription>
                    <p className="text-xs text-interactive mt-2 font-medium">
                      {scenario.highlight}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-interactive transition-colors shrink-0" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExampleBank;
