import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight, CheckCircle2, XCircle, RotateCcw, Brain, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Challenge {
  id: string;
  title: string;
  description: string;
  question: string;
  options: { id: string; label: string; isCorrect: boolean }[];
  explanation: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ActiveLearningChallengesProps {
  scrbAllocations: number[];
  shapleyValues: number[];
  nucleolusValues: number[];
  participantNames: string[];
  grandCoalitionCost: number;
}

const challenges: Challenge[] = [
  {
    id: "shapley-fairness",
    title: "Understanding Shapley Value",
    description: "The Shapley value considers all possible orderings of players joining a coalition.",
    question: "If Player 1's standalone cost increases significantly while others stay the same, which allocation method will show the LARGEST increase for Player 1?",
    options: [
      { id: "a", label: "Equal Split", isCorrect: false },
      { id: "b", label: "SCRB Method", isCorrect: true },
      { id: "c", label: "Nucleolus", isCorrect: false },
      { id: "d", label: "All change equally", isCorrect: false },
    ],
    explanation: "The SCRB method directly uses 'remaining benefits' which depend on each player's standalone cost. A higher standalone cost means higher potential savings, so SCRB allocates more of the non-separable costs to that player.",
    hint: "Think about how each method uses standalone costs in its formula.",
    difficulty: 'medium',
  },
  {
    id: "core-stability",
    title: "Core Stability Intuition",
    description: "The Core represents all stable allocations where no group wants to leave.",
    question: "Can the Shapley Value ever be OUTSIDE the Core?",
    options: [
      { id: "a", label: "Never - Shapley is always stable", isCorrect: false },
      { id: "b", label: "Yes - when costs are highly asymmetric", isCorrect: true },
      { id: "c", label: "Only when the Core is empty", isCorrect: false },
      { id: "d", label: "Only in 4+ player games", isCorrect: false },
    ],
    explanation: "The Shapley value can fall outside the Core in games with highly asymmetric cost structures. The Shapley value satisfies different axioms (efficiency, symmetry, additivity) but does not guarantee coalition rationality for all subgroups.",
    hint: "Drag the Shapley point in the Core visualization to see when it turns red!",
    difficulty: 'hard',
  },
  {
    id: "nucleolus-property",
    title: "Nucleolus Uniqueness",
    description: "The Nucleolus minimizes the maximum 'unhappiness' of any coalition.",
    question: "The Nucleolus is guaranteed to be in the Core when:",
    options: [
      { id: "a", label: "Always, regardless of the game", isCorrect: false },
      { id: "b", label: "When the Core is non-empty", isCorrect: true },
      { id: "c", label: "Only in subadditive games", isCorrect: false },
      { id: "d", label: "When all players have equal costs", isCorrect: false },
    ],
    explanation: "A key property of the Nucleolus is that it always lies in the Core whenever the Core is non-empty. This makes it a particularly attractive solution concept for practical cost allocation problems.",
    difficulty: 'medium',
  },
  {
    id: "coalition-power",
    title: "Coalition Bargaining Power",
    description: "Different coalitions have different leverage based on their alternative options.",
    question: "In a 3-player game, which coalition typically has the LEAST bargaining power?",
    options: [
      { id: "a", label: "The grand coalition {1,2,3}", isCorrect: true },
      { id: "b", label: "Two-player coalitions like {1,2}", isCorrect: false },
      { id: "c", label: "Individual players", isCorrect: false },
      { id: "d", label: "It depends entirely on costs", isCorrect: false },
    ],
    explanation: "The grand coalition must form for efficiency (total cost minimization), so it has no 'exit threat'. Two-player coalitions and individuals can threaten to leave, giving them bargaining power that constrains the final allocation.",
    hint: "Consider what 'power' means - the ability to credibly threaten to leave.",
    difficulty: 'hard',
  },
  {
    id: "subadditive-benefit",
    title: "Why Cooperate?",
    description: "Cooperation only makes sense when working together reduces total costs.",
    question: "If c({1,2}) = c({1}) + c({2}) exactly (no savings from cooperation), what happens to the Core?",
    options: [
      { id: "a", label: "The Core becomes a single point", isCorrect: false },
      { id: "b", label: "The Core grows larger", isCorrect: false },
      { id: "c", label: "Players 1 and 2 lose bargaining power", isCorrect: true },
      { id: "d", label: "The game becomes unstable", isCorrect: false },
    ],
    explanation: "When a coalition offers no savings over acting separately, that coalition's constraint becomes non-binding. This means the coalition {1,2} cannot credibly threaten to leave, so they lose bargaining leverage in the allocation negotiation.",
    difficulty: 'medium',
  },
];

const ActiveLearningChallenges = ({
  scrbAllocations,
  shapleyValues,
  nucleolusValues,
  participantNames,
  grandCoalitionCost,
}: ActiveLearningChallengesProps) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentChallenge = challenges[currentChallengeIndex];
  const isCorrect = currentChallenge.options.find(o => o.id === selectedAnswer)?.isCorrect ?? false;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
    if (isCorrect && !completedChallenges.has(currentChallenge.id)) {
      setCorrectAnswers(prev => prev + 1);
    }
    setCompletedChallenges(prev => new Set(prev).add(currentChallenge.id));
  };

  const handleNext = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    }
  };

  const handleReset = () => {
    setCurrentChallengeIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setCompletedChallenges(new Set());
    setCorrectAnswers(0);
  };

  const difficultyColor = {
    easy: 'bg-green-500/10 text-green-700 dark:text-green-400',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    hard: 'bg-destructive/10 text-destructive',
  };

  const progress = (completedChallenges.size / challenges.length) * 100;

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Brain className="w-5 h-5 text-interactive" />
              Test Your Intuition
            </CardTitle>
            <CardDescription>
              Challenge yourself with questions about game theory concepts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {correctAnswers}/{challenges.length}
            </Badge>
            {completedChallenges.size > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-4">
          <motion.div 
            className="h-full bg-interactive"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Challenge navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Challenge {currentChallengeIndex + 1} of {challenges.length}
            </span>
            <Badge className={difficultyColor[currentChallenge.difficulty]}>
              {currentChallenge.difficulty}
            </Badge>
          </div>
          <div className="flex gap-1">
            {challenges.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentChallengeIndex(i);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setShowHint(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentChallengeIndex 
                    ? 'w-6 bg-interactive' 
                    : completedChallenges.has(challenges[i].id)
                      ? 'bg-green-500'
                      : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Challenge content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChallenge.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-interactive shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{currentChallenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentChallenge.description}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-medium text-foreground">{currentChallenge.question}</p>
            </div>

            {/* Options */}
            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={setSelectedAnswer}
              disabled={showResult}
              className="space-y-3"
            >
              {currentChallenge.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const showCorrectness = showResult;
                
                return (
                  <motion.div
                    key={option.id}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                  >
                    <Label
                      htmlFor={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        showCorrectness && option.isCorrect
                          ? 'bg-green-500/10 border-green-500/50'
                          : showCorrectness && isSelected && !option.isCorrect
                            ? 'bg-destructive/10 border-destructive/50'
                            : isSelected
                              ? 'bg-interactive/10 border-interactive'
                              : 'bg-card border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <span className="flex-1">{option.label}</span>
                      {showCorrectness && option.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {showCorrectness && isSelected && !option.isCorrect && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </Label>
                  </motion.div>
                );
              })}
            </RadioGroup>

            {/* Hint */}
            {currentChallenge.hint && !showResult && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-muted-foreground"
                >
                  {showHint ? 'Hide hint' : 'Need a hint?'}
                </Button>
              </div>
            )}

            <AnimatePresence>
              {showHint && !showResult && currentChallenge.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    💡 {currentChallenge.hint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg border ${
                    isCorrect 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <div>
                      <p className={`font-semibold mb-1 ${
                        isCorrect 
                          ? 'text-green-700 dark:text-green-400' 
                          : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        {isCorrect ? 'Correct!' : 'Not quite - but great learning opportunity!'}
                      </p>
                      <p className="text-sm text-muted-foreground">{currentChallenge.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentChallengeIndex === 0}
          >
            <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="gap-2"
              >
                Check Answer
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentChallengeIndex === challenges.length - 1}
                className="gap-2"
              >
                Next Challenge
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Completion message */}
        {completedChallenges.size === challenges.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-interactive/10 to-accent/10 border border-interactive/30 text-center"
          >
            <p className="font-semibold text-foreground">
              🎉 Congratulations! You've completed all challenges!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You got {correctAnswers} out of {challenges.length} correct. 
              {correctAnswers === challenges.length 
                ? " Perfect score!" 
                : " Try again to improve your understanding."}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveLearningChallenges;
