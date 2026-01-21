import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, SkipBack, SkipForward, ChevronRight, Eye, RotateCcw, Info, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlossaryTermLink } from "./Glossary";

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

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface StoryStep {
  id: string;
  title: string;
  description: string;
  constraints: string[];
  explanationComponent: React.ReactNode;
  color: string;
  quiz?: QuizQuestion;
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
  const [quizState, setQuizState] = useState<{
    answered: boolean;
    selectedIndex: number | null;
    showExplanation: boolean;
  }>({ answered: false, selectedIndex: null, showExplanation: false });

  // Build story steps dynamically based on participants
  const storySteps: StoryStep[] = [
    {
      id: "intro",
      title: "The Full Picture",
      description: "This triangle represents ALL possible ways to divide the grand coalition cost.",
      constraints: [],
      explanationComponent: (
        <span>
          Each corner is a participant getting 100%. Any point inside shows a valid division where the costs sum to the total. 
          This is called an <GlossaryTermLink term="Imputation">imputation</GlossaryTermLink>.
        </span>
      ),
      color: "bg-muted-foreground",
    },
    ...participants.map((p, i) => ({
      id: `individual-${p.id}`,
      title: `Individual Rationality: ${p.name}`,
      description: `${p.name} won't pay more than ${p.independentCost}—they could just build alone!`,
      constraints: [`x${p.id}`],
      explanationComponent: (
        <span>
          This constraint enforces <GlossaryTermLink term="Individual Rationality">individual rationality</GlossaryTermLink>: 
          x{p.id} ≤ {p.independentCost}. Any allocation above this line would make {p.name} walk away since they'd pay less going solo.
        </span>
      ),
      color: i === 0 ? "bg-blue-500" : i === 1 ? "bg-green-500" : "bg-purple-500",
      // Add quiz to first individual rationality step
      ...(i === 0 ? {
        quiz: {
          question: "If a participant is asked to pay MORE than their standalone cost, what will they do?",
          options: ["Accept it for the greater good", "Leave the coalition", "Negotiate a lower price", "Pay half"],
          correctIndex: 1,
          explanation: "They'll leave! This is Individual Rationality—no one will pay more than they'd pay going solo."
        }
      } : {})
    })),
    ...coalitions
      .filter(c => c.participants.length === 2)
      .map((c, i) => {
        const names = c.participants.map(id => 
          participants.find(p => p.id === id)?.name || `Player ${id}`
        ).join(' + ');
        const ids = c.participants.map(id => `x${id}`).join('+');
        return {
          id: `coalition-${c.participants.join('')}`,
          title: `Coalition Rationality: ${names}`,
          description: `Together, they could build for ${c.cost}. So their combined payment can't exceed that.`,
          constraints: [`x${c.participants.join('')}`],
          explanationComponent: (
            <span>
              This constraint enforces <GlossaryTermLink term="Coalition Rationality">coalition rationality</GlossaryTermLink>: 
              {ids} ≤ {c.cost}. If they're charged more than {c.cost} together, they'd leave and form their own <GlossaryTermLink term="Coalition">coalition</GlossaryTermLink>.
            </span>
          ),
          color: "bg-amber-500",
          // Add quiz to first coalition step
          ...(i === 0 ? {
            quiz: {
              question: "Why do we also check constraints for groups of 2 participants?",
              options: ["It's just extra math", "To ensure no subgroup is overcharged", "For visual symmetry", "Historical tradition"],
              correctIndex: 1,
              explanation: "Coalition Rationality ensures no subgroup pays more than they'd pay building together alone—otherwise they'd defect!"
            }
          } : {})
        };
      }),
    {
      id: "core",
      title: "The Core!",
      description: "The shaded region is where ALL constraints are satisfied.",
      constraints: ["all"],
      explanationComponent: (
        <span>
          Any allocation in this region is 'stable'—no individual or group would benefit from leaving. 
          This is <GlossaryTermLink term="The Core">the Core</GlossaryTermLink>. 
          The <GlossaryTermLink term="Excess">excess</GlossaryTermLink> for every coalition is non-negative here.
        </span>
      ),
      color: "bg-interactive",
      quiz: {
        question: "What does it mean if an allocation is 'in the Core'?",
        options: ["It's the cheapest option", "No one would benefit from leaving", "Everyone pays equally", "It maximizes savings"],
        correctIndex: 1,
        explanation: "The Core contains all 'stable' allocations where no individual or coalition would be better off going alone."
      }
    },
    {
      id: "solutions",
      title: "Where Solutions Land",
      description: "SCRB, Shapley, and Nucleolus each pick a specific point.",
      constraints: ["all", "points"],
      explanationComponent: (
        <span>
          Notice: The <GlossaryTermLink term="Shapley Value">Shapley Value</GlossaryTermLink> is sometimes OUTSIDE the Core! 
          It prioritizes <GlossaryTermLink term="Marginal Contribution">marginal contribution</GlossaryTermLink> fairness, not stability. 
          The <GlossaryTermLink term="Nucleolus">Nucleolus</GlossaryTermLink> and <GlossaryTermLink term="SCRB Method">SCRB</GlossaryTermLink> are designed to always be inside (when the Core exists).
        </span>
      ),
      color: "bg-accent",
      quiz: {
        question: "The Shapley Value can sometimes be OUTSIDE the Core. Why might this happen?",
        options: ["Calculation error", "It prioritizes fairness over stability", "It's always inside", "Random chance"],
        correctIndex: 1,
        explanation: "Shapley prioritizes marginal contribution fairness, not coalition stability. In some games, what's 'fair' by this measure isn't 'stable'."
      }
    },
  ];

  const handleQuizAnswer = (index: number) => {
    if (quizState.answered) return;
    setQuizState({ answered: true, selectedIndex: index, showExplanation: true });
  };

  const resetQuizState = () => {
    setQuizState({ answered: false, selectedIndex: null, showExplanation: false });
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    resetQuizState(); // Reset quiz when changing steps
    
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
                <p className="text-sm text-muted-foreground">{step.explanationComponent}</p>
              </div>

              {/* Inline Quiz Checkpoint */}
              {step.quiz && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 p-3 rounded-lg border border-interactive/30 bg-interactive/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-interactive" />
                    <span className="text-xs font-semibold text-interactive uppercase tracking-wide">Quick Check</span>
                  </div>
                  <p className="text-sm font-medium mb-2">{step.quiz.question}</p>
                  <div className="grid gap-1.5">
                    {step.quiz.options.map((option, idx) => {
                      const isSelected = quizState.selectedIndex === idx;
                      const isCorrect = idx === step.quiz!.correctIndex;
                      const showResult = quizState.answered;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(idx)}
                          disabled={quizState.answered}
                          className={`text-left text-xs p-2 rounded border transition-all ${
                            showResult
                              ? isCorrect
                                ? 'bg-accent/30 border-accent text-accent-foreground'
                                : isSelected
                                ? 'bg-destructive/20 border-destructive text-destructive'
                                : 'border-border opacity-50'
                              : 'border-border hover:border-interactive hover:bg-interactive/10'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {showResult && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-accent-foreground" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-destructive" />}
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {quizState.showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 rounded bg-muted text-xs text-muted-foreground"
                    >
                      {quizState.selectedIndex === step.quiz.correctIndex ? "✓ Correct! " : "✗ Not quite. "}
                      {step.quiz.explanation}
                    </motion.div>
                  )}
                </motion.div>
              )}
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
