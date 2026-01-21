import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Droplets, Users, Calculator, Target, Lightbulb, CheckCircle2, Triangle, MousePointer, Move, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Animated Core Demo component showing drag interaction
const CoreDragDemo = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isInCore, setIsInCore] = useState(true);
  const [showHint, setShowHint] = useState(true);
  
  // Auto-animate on mount to demonstrate drag
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-48 bg-muted/30 rounded-xl border border-border overflow-hidden">
      {/* Triangle visualization */}
      <svg viewBox="0 0 200 180" className="w-full h-full">
        {/* Triangle outline */}
        <polygon
          points="100,15 15,165 185,165"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        
        {/* Core region (shaded) */}
        <polygon
          points="100,45 45,130 155,130"
          fill="hsl(var(--interactive) / 0.15)"
          stroke="hsl(var(--interactive))"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        
        {/* Constraint lines */}
        <line x1="30" y1="100" x2="170" y2="100" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5" />
        <line x1="60" y1="30" x2="140" y2="150" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.5" />
        <line x1="140" y1="30" x2="60" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />
        
        {/* Labels */}
        <text x="100" y="12" textAnchor="middle" className="text-[8px] fill-muted-foreground">Town A (100%)</text>
        <text x="10" y="175" textAnchor="start" className="text-[8px] fill-muted-foreground">Town B</text>
        <text x="190" y="175" textAnchor="end" className="text-[8px] fill-muted-foreground">Town C</text>
        
        {/* Core label */}
        <text x="100" y="95" textAnchor="middle" className="text-[10px] font-medium fill-interactive">Core</text>
      </svg>
      
      {/* Draggable point */}
      <motion.div
        drag
        dragConstraints={{ left: -60, right: 60, top: -40, bottom: 50 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onDrag={(_, info) => {
          // Check if within core region (simplified check)
          const inCore = Math.abs(info.offset.x) < 30 && info.offset.y > -20 && info.offset.y < 30;
          setIsInCore(inCore);
        }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
        whileDrag={{ scale: 1.2 }}
        initial={{ x: 0, y: 0 }}
      >
        <motion.div
          className={`w-6 h-6 rounded-full border-2 shadow-lg flex items-center justify-center text-[8px] font-bold transition-colors ${
            isInCore 
              ? "bg-green-500 border-green-600 text-white" 
              : "bg-red-500 border-red-600 text-white"
          }`}
          animate={{
            scale: isDragging ? 1.1 : [1, 1.1, 1],
            boxShadow: isInCore 
              ? "0 0 12px rgba(34, 197, 94, 0.5)" 
              : "0 0 12px rgba(239, 68, 68, 0.5)"
          }}
          transition={{ 
            scale: { duration: 0.5, repeat: isDragging ? 0 : Infinity, repeatDelay: 1 },
          }}
        >
          S
        </motion.div>
      </motion.div>
      
      {/* Animated hand cursor hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              x: [20, 0, -30, -30],
              y: [20, 0, 20, 20]
            }}
            transition={{ 
              duration: 2.5,
              times: [0, 0.2, 0.7, 1],
              repeat: Infinity,
              repeatDelay: 0.5
            }}
            className="absolute left-1/2 top-1/2 pointer-events-none z-20"
          >
            <Hand className="w-6 h-6 text-foreground drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Status indicator */}
      <div className={`absolute bottom-2 left-2 right-2 text-center text-xs font-medium py-1.5 px-2 rounded-lg transition-colors ${
        isInCore 
          ? "bg-green-500/20 text-green-700 dark:text-green-400" 
          : "bg-red-500/20 text-red-700 dark:text-red-400"
      }`}>
        {isInCore ? "✓ Shapley is inside the Core (stable!)" : "✗ Outside Core — some coalition would defect!"}
      </div>
      
      {/* Drag instruction */}
      <div className="absolute top-2 right-2 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Drag the "S" point →
      </div>
    </div>
  );
};

interface OnboardingTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const tourSteps = [
  {
    id: 1,
    icon: Droplets,
    title: "The Scenario",
    subtitle: "Three Towns, One Reservoir",
    content: "Imagine three towns—Riverside, Hilltop, and Lakeview—that each need a water reservoir. Building alone is expensive, but cooperation creates savings.",
    story: [
      { town: "Riverside", cost: "$2M alone", emoji: "🏘️" },
      { town: "Hilltop", cost: "$4M alone", emoji: "🏔️" },
      { town: "Lakeview", cost: "$6M alone", emoji: "🌊" },
    ],
    highlight: "Total if separate: $12M. But together they could build for just $7M!",
  },
  {
    id: 2,
    icon: Users,
    title: "Coalition Costs",
    subtitle: "The Power of Partnerships",
    content: "When towns partner up, costs drop. But not all partnerships save equally—this is where game theory helps us find fair allocations.",
    coalitions: [
      { partners: "Riverside + Hilltop", cost: "$5M", savings: "$1M saved" },
      { partners: "Riverside + Lakeview", cost: "$6M", savings: "$2M saved" },
      { partners: "Hilltop + Lakeview", cost: "$6M", savings: "$4M saved" },
      { partners: "All Three Towns", cost: "$7M", savings: "$5M saved!" },
    ],
  },
  {
    id: 3,
    icon: Calculator,
    title: "Try the Calculator",
    subtitle: "Input Costs Yourself",
    content: "In the Input Parameters panel, you'll see individual costs c(1), c(2), c(3) and coalition costs. These represent our three towns' building costs.",
    tips: [
      "c(1) = 2 means Riverside pays $2M alone",
      "c(123) = 7 is the grand coalition cost",
      "Try changing values to see how allocations shift!",
    ],
  },
  {
    id: 4,
    icon: Target,
    title: "Understanding Results",
    subtitle: "Four Allocation Methods",
    content: "The calculator shows four different ways to split the $7M cost fairly. Each method has different fairness criteria:",
    methods: [
      { name: "SCRB", desc: "Based on separable costs + remaining benefits" },
      { name: "Shapley", desc: "Average marginal contribution across orderings" },
      { name: "Nucleolus", desc: "Minimizes maximum dissatisfaction" },
      { name: "Equal Split", desc: "Simple equal division" },
    ],
  },
  {
    id: 5,
    icon: Triangle,
    title: "The Core Visualization",
    subtitle: "Interactive Stability Analysis",
    content: "The triangular Core plot shows all stable allocations. It's fully interactive—click and drag to explore!",
    interactiveFeatures: [
      { 
        icon: "click", 
        title: "Click Constraint Lines", 
        desc: "Each colored line (like x₁+x₂ ≤ 5) represents a stability condition. Click any line to see what it means in plain English." 
      },
      { 
        icon: "drag", 
        title: "Drag Allocation Points", 
        desc: "Drag the SCRB, Shapley, or Nucleolus dots around. Watch them change color—green means stable (in the Core), red means unstable!" 
      },
      { 
        icon: "hover", 
        title: "Hover for Values", 
        desc: "Hover over any point to see the exact allocation amounts for each participant." 
      },
    ],
  },
  {
    id: 6,
    icon: Lightbulb,
    title: "Explore & Experiment",
    subtitle: "What Happens If...?",
    content: "Now you're ready to explore! Try these experiments:",
    experiments: [
      "Increase Hilltop's standalone cost to $8M—who benefits?",
      "Make all coalition costs equal—what happens to Shapley?",
      "Find inputs where Equal Split is unfair to someone",
      "Drag Shapley outside the Core—which constraint breaks first?",
    ],
    cta: "Ready to start experimenting?",
  },
];

const OnboardingTour = ({ open, onOpenChange, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="relative">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary to-interactive px-6 py-4">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-foreground/20 backdrop-blur-sm">
                    <step.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/70 font-medium">
                      Step {step.id} of {tourSteps.length}
                    </p>
                    <DialogTitle className="text-primary-foreground font-serif text-lg">
                      {step.title}
                    </DialogTitle>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={handleClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            <Progress value={progress} className="mt-4 h-1 bg-primary-foreground/20" />
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-semibold text-interactive">{step.subtitle}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.content}</p>

                {/* Step-specific content */}
                {step.story && (
                  <div className="space-y-2 pt-2">
                    {step.story.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="font-medium flex-1">{item.town}</span>
                        <span className="text-muted-foreground text-sm">{item.cost}</span>
                      </div>
                    ))}
                    {step.highlight && (
                      <div className="mt-3 p-3 rounded-lg bg-interactive/10 border border-interactive/20 text-center">
                        <p className="text-sm font-medium text-interactive">{step.highlight}</p>
                      </div>
                    )}
                  </div>
                )}

                {step.coalitions && (
                  <div className="grid gap-2 pt-2">
                    {step.coalitions.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-medium">{c.partners}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{c.cost}</span>
                          <span className="text-xs font-medium text-interactive bg-interactive/10 px-2 py-1 rounded">
                            {c.savings}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.tips && (
                  <div className="space-y-2 pt-2">
                    {step.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-interactive shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                {step.methods && (
                  <div className="grid gap-2 pt-2">
                    {step.methods.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{
                            backgroundColor:
                              i === 0
                                ? "hsl(var(--primary))"
                                : i === 1
                                ? "hsl(var(--interactive))"
                                : i === 2
                                ? "hsl(var(--accent))"
                                : "hsl(var(--muted-foreground))",
                          }}
                        />
                        <div>
                          <span className="font-medium text-sm">{m.name}</span>
                          <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.interactiveFeatures && (
                  <div className="space-y-4 pt-2">
                    {/* Live animated demo */}
                    <CoreDragDemo />
                    
                    {/* Feature list */}
                    <div className="space-y-2">
                      {step.interactiveFeatures.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div className="p-1 rounded-md bg-interactive/10 shrink-0">
                            {feature.icon === 'click' && <MousePointer className="w-3.5 h-3.5 text-interactive" />}
                            {feature.icon === 'drag' && <Move className="w-3.5 h-3.5 text-accent" />}
                            {feature.icon === 'hover' && <Target className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <div>
                            <span className="font-medium text-xs">{feature.title}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step.experiments && (
                  <div className="space-y-2 pt-2">
                    {step.experiments.map((exp, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                        <span className="text-muted-foreground">{exp}</span>
                      </div>
                    ))}
                    {step.cta && (
                      <p className="text-center font-medium text-primary pt-3">{step.cta}</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex gap-1.5">
              {tourSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep
                      ? "bg-interactive"
                      : i < currentStep
                      ? "bg-interactive/40"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1 bg-interactive hover:bg-interactive/90"
            >
              {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
