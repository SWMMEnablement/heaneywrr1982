import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, CheckCircle2, XCircle, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; label: string; isCorrect: boolean }[];
  explanation: string;
  hint?: string;
}

interface ContextualQuizPromptProps {
  context: 'core' | 'shapley' | 'scrb' | 'nucleolus';
  onDismiss: () => void;
  onComplete: () => void;
}

const contextQuestions: Record<string, QuizQuestion> = {
  core: {
    id: "core-intro",
    question: "Can the Shapley Value ever be OUTSIDE the Core?",
    options: [
      { id: "a", label: "Never - Shapley is always stable", isCorrect: false },
      { id: "b", label: "Yes - when costs are highly asymmetric", isCorrect: true },
      { id: "c", label: "Only when the Core is empty", isCorrect: false },
    ],
    explanation: "The Shapley value prioritizes 'average marginal contribution' fairness, not stability. Try dragging the Shapley point in the visualization to see when it turns red!",
    hint: "The Shapley value and Core optimize for different things...",
  },
  shapley: {
    id: "shapley-order",
    question: "Why does Shapley consider ALL possible orderings of players joining?",
    options: [
      { id: "a", label: "To make calculations more complex", isCorrect: false },
      { id: "b", label: "To treat no player as 'first' or 'last'", isCorrect: true },
      { id: "c", label: "Because real coalitions form randomly", isCorrect: false },
    ],
    explanation: "By averaging over all orderings, Shapley ensures no player is systematically advantaged by their position. This satisfies the 'symmetry' axiom - players who contribute equally get equal shares.",
    hint: "Think about what would happen if we only considered one order...",
  },
  scrb: {
    id: "scrb-separable",
    question: "In SCRB, what is a 'separable cost'?",
    options: [
      { id: "a", label: "Each player's standalone cost", isCorrect: false },
      { id: "b", label: "The cost that can be directly attributed to one player", isCorrect: true },
      { id: "c", label: "The total cost minus savings", isCorrect: false },
    ],
    explanation: "Separable costs are 'undeniably caused by' a participant - the grand coalition cost increases by exactly this amount when they join. Non-separable costs (the rest) are shared proportionally.",
  },
  nucleolus: {
    id: "nucleolus-unhappy",
    question: "The Nucleolus minimizes the 'excess' of the most unhappy coalition. What happens if that excess is already low?",
    options: [
      { id: "a", label: "It minimizes the second-most unhappy, then third...", isCorrect: true },
      { id: "b", label: "It stops optimizing", isCorrect: false },
      { id: "c", label: "It distributes remaining costs equally", isCorrect: false },
    ],
    explanation: "The Nucleolus uses 'lexicographic' minimization - first minimize the maximum unhappiness, then the second-maximum, and so on. This creates a unique, maximally fair solution.",
  },
};

const ContextualQuizPrompt = ({ context, onDismiss, onComplete }: ContextualQuizPromptProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const question = contextQuestions[context];
  const isCorrect = question.options.find(o => o.id === selectedAnswer)?.isCorrect ?? false;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
  };

  const handleContinue = () => {
    onComplete();
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      className="p-4 rounded-xl bg-gradient-to-br from-interactive/10 via-background to-accent/5 border-2 border-interactive/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-interactive/20">
            <Brain className="w-4 h-4 text-interactive" />
          </div>
          <span className="text-sm font-semibold text-interactive">Quick Check</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-sm font-medium text-foreground mb-3">{question.question}</p>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RadioGroup
              value={selectedAnswer ?? ""}
              onValueChange={setSelectedAnswer}
              className="space-y-2 mb-3"
            >
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                    selectedAnswer === option.id
                      ? "bg-interactive/10 border-interactive/30"
                      : "bg-muted/30 border-transparent hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={option.id} id={`quiz-${option.id}`} />
                  <Label htmlFor={`quiz-${option.id}`} className="text-xs cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-center justify-between">
              {question.hint && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-7"
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {showHint ? "Hide Hint" : "Need a hint?"}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="ml-auto bg-interactive hover:bg-interactive/90 h-7 text-xs"
              >
                Check Answer
              </Button>
            </div>

            <AnimatePresence>
              {showHint && question.hint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-muted-foreground italic mt-2 p-2 bg-muted/30 rounded"
                >
                  💡 {question.hint}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className={`flex items-start gap-2 p-2 rounded-lg ${
              isCorrect ? "bg-green-500/10" : "bg-red-500/10"
            }`}>
              {isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              )}
              <div>
                <p className={`text-xs font-semibold ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {isCorrect ? "Correct!" : "Not quite..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {question.explanation}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleContinue}
              className="w-full bg-interactive hover:bg-interactive/90 h-7 text-xs"
            >
              Continue Exploring
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContextualQuizPrompt;
