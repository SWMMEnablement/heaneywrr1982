import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, Users, ArrowRight, ArrowLeft, CheckCircle, 
  X, Lightbulb, Calculator, DollarSign, HelpCircle,
  Play, SkipForward, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { GlossaryTermLink } from "./Glossary";

interface FirstTimeExperienceProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: "problem",
    title: "The Problem",
    subtitle: "Why We Need Fair Cost Sharing",
  },
  {
    id: "towns",
    title: "Three Towns, One Reservoir",
    subtitle: "A Real-World Scenario",
  },
  {
    id: "coalitions",
    title: "The Power of Cooperation",
    subtitle: "When Working Together Saves Money",
  },
  {
    id: "fairness",
    title: "The Fairness Challenge",
    subtitle: "How Should We Split $7M?",
  },
  {
    id: "ready",
    title: "You're Ready!",
    subtitle: "Let's Explore the Calculator",
  },
];

const FirstTimeExperience = ({ onComplete, onSkip }: FirstTimeExperienceProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay for smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Esc to skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onSkip}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90dvh]"
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-primary/20 flex flex-col max-h-[90dvh]">
              {/* Header */}
              <div className="shrink-0 bg-gradient-to-r from-primary via-primary/90 to-interactive px-6 py-4 text-primary-foreground">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-primary-foreground/20 shrink-0">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
                        Getting Started • Step {currentStep + 1} of {steps.length}
                      </p>
                      <h2 id="onboarding-title" className="text-xl font-serif font-bold truncate">{step.title}</h2>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSkip}
                    aria-label="Close onboarding"
                    className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0 focus-visible:ring-2 focus-visible:ring-primary-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Progress value={progress} className="h-1.5 bg-primary-foreground/20" />
              </div>

              {/* Content */}
              <CardContent className="p-6 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <p className="text-interactive font-medium">{step.subtitle}</p>


                    {/* Step 0: The Problem */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border">
                          <div className="flex gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 h-fit">
                              <HelpCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg mb-2">The Big Question</h3>
                              <p className="text-muted-foreground leading-relaxed">
                                When a group of people share the cost of a project, 
                                <span className="text-foreground font-medium"> how do you split the bill fairly?</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                            <p className="text-sm font-medium text-destructive mb-1">❌ Too Naive</p>
                            <p className="text-sm text-muted-foreground">
                              "Just split it equally" ignores who benefits more
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/30">
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">⚠️ Misses the Point</p>
                            <p className="text-sm text-muted-foreground">
                              "Pay what you'd pay alone" removes incentive to cooperate
                            </p>
                          </div>
                        </div>


                        <div className="flex items-center gap-3 p-4 rounded-lg bg-interactive/10 border border-interactive/20">
                          <Lightbulb className="w-5 h-5 text-interactive shrink-0" />
                          <p className="text-sm">
                            <GlossaryTermLink term="Cooperative Games">Cooperative game theory</GlossaryTermLink> gives us 
                            mathematically principled ways to solve this problem fairly using concepts like{" "}
                            <GlossaryTermLink term="The Core">the Core</GlossaryTermLink> and{" "}
                            <GlossaryTermLink term="Shapley Value">the Shapley Value</GlossaryTermLink>.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 1: The Towns */}
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <p className="text-muted-foreground leading-relaxed">
                          Imagine three towns that each need a water reservoir. 
                          If each builds alone, here's what they'd pay:
                        </p>

                        <div className="space-y-3">
                          {[
                            { emoji: "🏘️", name: "Riverside", cost: 2, color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30" },
                            { emoji: "🏔️", name: "Hilltop", cost: 4, color: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/30" },
                            { emoji: "🌊", name: "Lakeview", cost: 6, color: "from-cyan-500/20 to-cyan-600/10", border: "border-cyan-500/30" },
                          ].map(town => (
                            <motion.div
                              key={town.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${town.color} border ${town.border}`}
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-3xl" aria-hidden="true">{town.emoji}</span>
                                <div>
                                  <p className="font-semibold">{town.name}</p>
                                  <p className="text-sm text-muted-foreground">Building alone</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold font-mono">${town.cost}M</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted border-2 border-dashed border-muted-foreground/30">
                          <p className="font-medium">Total if everyone builds separately:</p>
                          <p className="text-2xl font-bold font-mono">$12M</p>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Coalitions */}
                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <p className="text-muted-foreground leading-relaxed">
                          But wait! If they <span className="text-foreground font-medium">work together</span>, 
                          they can share infrastructure and save money. Here's what different partnerships cost:
                        </p>

                        <div className="space-y-3">
                          {[
                            { partners: ["🏘️", "🏔️"], names: "Riverside + Hilltop", cost: 5, alone: 6, savings: 1 },
                            { partners: ["🏘️", "🌊"], names: "Riverside + Lakeview", cost: 6, alone: 8, savings: 2 },
                            { partners: ["🏔️", "🌊"], names: "Hilltop + Lakeview", cost: 6, alone: 10, savings: 4 },
                          ].map(c => (
                            <div key={c.names} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                              <div className="flex items-center gap-3">
                                <div className="flex -space-x-2 text-xl" aria-hidden="true">
                                  {c.partners.map((p, i) => <span key={i}>{p}</span>)}
                                </div>

                                <p className="text-sm font-medium">{c.names}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-mono font-bold">${c.cost}M</p>
                                <span className="text-xs px-2 py-1 rounded-full bg-interactive/10 text-interactive font-medium">
                                  saves ${c.savings}M
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="p-5 rounded-xl bg-gradient-to-r from-interactive/20 via-accent/10 to-primary/10 border-2 border-interactive/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-2 text-2xl" aria-hidden="true">
                                <span>🏘️</span><span>🏔️</span><span>🌊</span>
                              </div>

                              <div>
                                <p className="font-bold text-lg">All Three Together</p>
                                <p className="text-sm text-muted-foreground">
                                  The <GlossaryTermLink term="Grand Coalition">Grand Coalition</GlossaryTermLink>
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold font-mono text-interactive">$7M</p>
                              <p className="text-sm font-medium text-interactive">saves $5M!</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Paper narrative callout */}
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-3">
                          <div className="text-2xl">📜</div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">This exact problem</span> was studied by 
                              Heaney & Dickinson in their seminal 1982 paper in <em>Water Resources Research</em>. 
                              They proposed new methods to fix common flaws in traditional cost-sharing approaches.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Fairness Challenge */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <p className="text-muted-foreground leading-relaxed">
                          Cooperation creates <span className="text-interactive font-semibold">$5M in savings</span>. 
                          The question is: how do we divide the <span className="text-foreground font-medium">$7M bill</span> so everyone feels it's fair?
                        </p>

                        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                          <p className="text-sm font-medium text-accent mb-3">🤔 Consider this:</p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                              <span>•</span>
                              <span>Riverside only needs $2M on its own—should it pay more than $2M?</span>
                            </li>
                            <li className="flex gap-2">
                              <span>•</span>
                              <span>Hilltop and Lakeview save $4M together—who gets that credit?</span>
                            </li>
                            <li className="flex gap-2">
                              <span>•</span>
                              <span>If we split $7M equally ($2.33M each), Riverside pays MORE than going alone!</span>
                            </li>
                          </ul>
                        </div>

                        <div className="grid gap-3">
                          <p className="text-sm font-medium">Game theorists developed these methods:</p>
                          {[
                            { name: "SCRB", term: "SCRB Method", desc: "Separable costs + fair share of joint benefits", color: "bg-primary" },
                            { name: "Shapley Value", term: "Shapley Value", desc: "Your average marginal contribution across all team orderings", color: "bg-interactive" },
                            { name: "Nucleolus", term: "Nucleolus", desc: "Makes the angriest coalition as happy as possible", color: "bg-accent" },
                          ].map(m => (
                            <div key={m.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <div className={`w-3 h-3 rounded-full ${m.color}`} />
                              <div>
                                <p className="font-medium text-sm">
                                  <GlossaryTermLink term={m.term}>{m.name}</GlossaryTermLink>
                                </p>
                                <p className="text-xs text-muted-foreground">{m.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Ready */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-interactive/10 to-accent/10 border border-interactive/20">
                          <div className="p-3 rounded-full bg-interactive/20">
                            <CheckCircle className="w-8 h-8 text-interactive" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">You've Got the Basics!</h3>
                            <p className="text-muted-foreground">
                              Now you understand why fair cost allocation is tricky—and why game theory helps.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="font-medium">What you can do next:</p>
                          
                          <div className="grid gap-3">
                            {[
                              { icon: Calculator, title: "Use the Calculator", desc: "Input custom costs and see how different methods divide them" },
                              { icon: Users, title: "Try Example Scenarios", desc: "Load classic game theory problems with pre-set values" },
                              { icon: DollarSign, title: "Explore the Core", desc: "See which allocations are 'stable'—where no coalition wants to leave" },
                            ].map(item => (
                              <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <item.icon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground pt-2">
                          Don't worry—hover over anything with an{" "}
                          <span className="inline-flex items-center gap-1 text-interactive">
                            <HelpCircle className="w-3 h-3" /> info icon
                          </span>{" "}
                          for help!
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>

              {/* Footer */}
              <div className="shrink-0 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t bg-muted/30">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="gap-1 focus-visible:ring-2 focus-visible:ring-interactive"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="gap-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-interactive"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span className="hidden sm:inline">Skip tutorial</span>
                    <span className="sm:hidden">Skip</span>
                  </Button>
                </div>

                <div className="flex gap-1.5" role="tablist" aria-label="Onboarding steps">
                  {steps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      role="tab"
                      aria-label={`Go to step ${i + 1}: ${s.title}`}
                      aria-current={i === currentStep ? "step" : undefined}
                      aria-selected={i === currentStep}
                      className={`w-2.5 h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 ${
                        i === currentStep
                          ? "bg-interactive scale-110"
                          : i < currentStep
                          ? "bg-interactive/50"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 bg-interactive hover:bg-interactive/90 min-w-[110px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-interactive"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Play className="w-4 h-4" />
                      Start
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstTimeExperience;
