import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, ChevronRight, Eye, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Participant {
  id: number;
  name: string;
  independentCost: number;
}

interface CoalitionCost {
  participants: number[];
  cost: number;
}

interface CoreStoryModeProps {
  participants: Participant[];
  coalitions: CoalitionCost[];
  grandCoalitionCost: number;
  onHighlightConstraints: (constraints: string[]) => void;
  onResetHighlights: () => void;
}

interface StoryStep {
  id: string;
  title: string;
  description: string;
  constraints: string[];
  explanation: string;
  color: string;
}

const CoreStoryMode = ({ 
  participants, 
  coalitions, 
  grandCoalitionCost,
  onHighlightConstraints,
  onResetHighlights
}: CoreStoryModeProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Build story steps dynamically based on participants
  const storySteps: StoryStep[] = [
    {
      id: "intro",
      title: "The Full Picture",
      description: "This triangle represents ALL possible ways to divide the grand coalition cost.",
      constraints: [],
      explanation: "Each corner is a participant getting 100%. Any point inside shows a valid division where the costs sum to the total.",
      color: "bg-muted-foreground",
    },
    ...participants.map((p, i) => ({
      id: `individual-${p.id}`,
      title: `Individual Rationality: ${p.name}`,
      description: `${p.name} won't pay more than ${p.independentCost}—they could just build alone!`,
      constraints: [`x${p.id}`],
      explanation: `This constraint says: x${p.id} ≤ ${p.independentCost}. Any allocation above this line would make ${p.name} walk away.`,
      color: i === 0 ? "bg-blue-500" : i === 1 ? "bg-green-500" : "bg-purple-500",
    })),
    ...coalitions
      .filter(c => c.participants.length === 2)
      .map(c => {
        const names = c.participants.map(id => 
          participants.find(p => p.id === id)?.name || `Player ${id}`
        ).join(' + ');
        const ids = c.participants.map(id => `x${id}`).join('+');
        return {
          id: `coalition-${c.participants.join('')}`,
          title: `Coalition Rationality: ${names}`,
          description: `Together, they could build for ${c.cost}. So their combined payment can't exceed that.`,
          constraints: [`x${c.participants.join('')}`],
          explanation: `This constraint says: ${ids} ≤ ${c.cost}. If they're charged more than ${c.cost} together, they'd leave and partner up alone.`,
          color: "bg-amber-500",
        };
      }),
    {
      id: "core",
      title: "The Core!",
      description: "The shaded region is where ALL constraints are satisfied.",
      constraints: ["all"],
      explanation: "Any allocation in this region is 'stable'—no individual or group would benefit from leaving the grand coalition. This is the Core.",
      color: "bg-interactive",
    },
    {
      id: "solutions",
      title: "Where Solutions Land",
      description: "SCRB, Shapley, and Nucleolus each pick a specific point.",
      constraints: ["all", "points"],
      explanation: "Notice: Shapley is sometimes OUTSIDE the Core! It prioritizes 'average contribution' fairness, not stability. SCRB and Nucleolus are designed to always be inside (when the Core exists).",
      color: "bg-accent",
    },
  ];

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    
    if (newStep < 0) {
      onResetHighlights();
      return;
    }
    
    const step = storySteps[newStep];
    if (step.constraints.includes("all")) {
      // Highlight everything
      const allConstraints = [
        ...participants.map(p => `x${p.id}`),
        ...coalitions.filter(c => c.participants.length === 2).map(c => `x${c.participants.join('')}`),
      ];
      onHighlightConstraints(allConstraints);
    } else {
      onHighlightConstraints(step.constraints);
    }
  };

  const handleNext = () => {
    if (currentStep < storySteps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const handleReset = () => {
    handleStepChange(-1);
    setIsPlaying(false);
  };

  const step = currentStep >= 0 ? storySteps[currentStep] : null;

  return (
    <Card className="border-interactive/30 bg-gradient-to-br from-interactive/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif text-base">
              <Eye className="w-4 h-4 text-interactive" />
              Story Mode: Build the Core
            </CardTitle>
            <CardDescription>
              Step through constraints one by one to understand stability
            </CardDescription>
          </div>
          {currentStep >= 0 && (
            <Badge variant="outline" className="gap-1">
              Step {currentStep + 1} of {storySteps.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={currentStep < 0}
            className="gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentStep <= 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="default"
            onClick={currentStep < 0 ? () => handleStepChange(0) : handleNext}
            disabled={currentStep >= storySteps.length - 1}
            className="gap-2 bg-interactive hover:bg-interactive/90 min-w-[140px]"
          >
            {currentStep < 0 ? (
              <>
                <Play className="w-4 h-4" />
                Start Tour
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentStep >= storySteps.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {storySteps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleStepChange(i)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-interactive'
                  : i < currentStep
                  ? 'bg-interactive/40'
                  : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>

        {/* Current step content */}
        <AnimatePresence mode="wait">
          {step && (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full ${step.color} mt-1.5 shrink-0`} />
                <div>
                  <h4 className="font-semibold">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 border border-border flex gap-2">
                <Info className="w-4 h-4 text-interactive mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{step.explanation}</p>
              </div>
            </motion.div>
          )}

          {currentStep < 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-sm text-muted-foreground">
                Click <span className="font-medium text-interactive">Start Tour</span> to learn how the Core is built step by step
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick jump buttons */}
        {currentStep >= 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground w-full mb-1">Jump to:</span>
            {storySteps.map((s, i) => (
              <Button
                key={s.id}
                variant={i === currentStep ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepChange(i)}
                className="text-xs h-7 px-2"
              >
                {s.title.split(':')[0]}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoreStoryMode;
