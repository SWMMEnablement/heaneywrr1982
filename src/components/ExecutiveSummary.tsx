import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

const ExecutiveSummary = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <div className="relative p-6 rounded-xl bg-gradient-to-br from-interactive/10 via-accent/5 to-transparent border border-interactive/20 shadow-lg">
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive text-interactive-foreground text-xs font-semibold shadow-md">
            <Lightbulb className="w-3.5 h-3.5" />
            Key Takeaway
          </span>
        </div>
        
        <p className="text-base md:text-lg leading-relaxed text-foreground/90 mt-2">
          This explorer demonstrates how{" "}
          <span className="font-semibold text-interactive">cooperative game theory</span>—concepts 
          like the <span className="font-medium">Core</span>,{" "}
          <span className="font-medium">Shapley Value</span>, and{" "}
          <span className="font-medium">Nucleolus</span>—provides mathematically fair 
          solutions to cost-sharing problems, moving beyond simple equal splits or 
          standalone costs to allocations that are{" "}
          <em className="text-accent-foreground">stable</em>,{" "}
          <em className="text-accent-foreground">equitable</em>, and{" "}
          <em className="text-accent-foreground">justifiable</em>.
        </p>
      </div>
    </motion.div>
  );
};

export default ExecutiveSummary;
