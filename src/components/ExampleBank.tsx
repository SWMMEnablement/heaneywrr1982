import { motion } from "framer-motion";
import { Droplets, Plane, AlertTriangle, ChevronRight, Factory, Building2, Users2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  highlight: string;
  participants: { id: number; name: string; independentCost: number }[];
  coalitions: { participants: number[]; cost: number }[];
  playerCount: 3 | 4;
}

export const scenarios: Scenario[] = [
  // 3-Player Scenarios
  {
    id: 'reservoir',
    name: "3-Town Reservoir",
    description: "Three municipal towns pooling resources to build a shared water reservoir. The classic example from the 1982 paper.",
    icon: Droplets,
    difficulty: 'Beginner',
    highlight: "The foundational cooperative game example",
    playerCount: 3,
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
    playerCount: 3,
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
    playerCount: 3,
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
  // 4-Player Scenarios
  {
    id: 'industrial-park',
    name: "Industrial Park",
    description: "Four companies sharing infrastructure costs for a new industrial park including utilities, roads, and security.",
    icon: Factory,
    difficulty: 'Advanced',
    highlight: "4-player cost sharing with economies of scale",
    playerCount: 4,
    participants: [
      { id: 1, name: "TechCorp", independentCost: 15 },
      { id: 2, name: "ManufaCo", independentCost: 25 },
      { id: 3, name: "LogiPlex", independentCost: 20 },
      { id: 4, name: "BioLabs", independentCost: 18 },
    ],
    coalitions: [
      { participants: [1, 2], cost: 32 },
      { participants: [1, 3], cost: 28 },
      { participants: [1, 4], cost: 26 },
      { participants: [2, 3], cost: 36 },
      { participants: [2, 4], cost: 34 },
      { participants: [3, 4], cost: 30 },
      { participants: [1, 2, 3], cost: 42 },
      { participants: [1, 2, 4], cost: 40 },
      { participants: [1, 3, 4], cost: 38 },
      { participants: [2, 3, 4], cost: 45 },
      { participants: [1, 2, 3, 4], cost: 50 },
    ],
  },
  {
    id: 'regional-transit',
    name: "Regional Transit",
    description: "Four municipalities pooling resources to build a shared public transit system with rail and bus networks.",
    icon: Building2,
    difficulty: 'Advanced',
    highlight: "Complex 4-player cooperative game",
    playerCount: 4,
    participants: [
      { id: 1, name: "Downtown", independentCost: 30 },
      { id: 2, name: "Suburbs", independentCost: 45 },
      { id: 3, name: "Harbor", independentCost: 35 },
      { id: 4, name: "Airport", independentCost: 40 },
    ],
    coalitions: [
      { participants: [1, 2], cost: 55 },
      { participants: [1, 3], cost: 50 },
      { participants: [1, 4], cost: 52 },
      { participants: [2, 3], cost: 60 },
      { participants: [2, 4], cost: 65 },
      { participants: [3, 4], cost: 55 },
      { participants: [1, 2, 3], cost: 75 },
      { participants: [1, 2, 4], cost: 80 },
      { participants: [1, 3, 4], cost: 72 },
      { participants: [2, 3, 4], cost: 85 },
      { participants: [1, 2, 3, 4], cost: 90 },
    ],
  },
  {
    id: 'research-consortium',
    name: "Research Consortium",
    description: "Four universities forming a research consortium to share expensive laboratory equipment and facilities.",
    icon: Users2,
    difficulty: 'Intermediate',
    highlight: "Symmetric 4-player scenario",
    playerCount: 4,
    participants: [
      { id: 1, name: "StateU", independentCost: 20 },
      { id: 2, name: "TechInst", independentCost: 20 },
      { id: 3, name: "MedSchool", independentCost: 20 },
      { id: 4, name: "SciAcad", independentCost: 20 },
    ],
    coalitions: [
      { participants: [1, 2], cost: 30 },
      { participants: [1, 3], cost: 30 },
      { participants: [1, 4], cost: 30 },
      { participants: [2, 3], cost: 30 },
      { participants: [2, 4], cost: 30 },
      { participants: [3, 4], cost: 30 },
      { participants: [1, 2, 3], cost: 40 },
      { participants: [1, 2, 4], cost: 40 },
      { participants: [1, 3, 4], cost: 40 },
      { participants: [2, 3, 4], cost: 40 },
      { participants: [1, 2, 3, 4], cost: 48 },
    ],
  },
];

interface ExampleBankProps {
  onSelectScenario: (scenario: Scenario) => void;
  playerMode?: 3 | 4;
}

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

const ExampleBank = ({ onSelectScenario, playerMode = 3 }: ExampleBankProps) => {
  const filteredScenarios = scenarios.filter(s => s.playerCount === playerMode);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-semibold text-lg">Example Scenarios</h3>
          <p className="text-sm text-muted-foreground">
            Pre-built {playerMode}-player scenarios to explore different cost allocation problems
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredScenarios.map((scenario, index) => (
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
