import { motion } from "framer-motion";
import { BookOpen, Calculator, Lightbulb, FileText } from "lucide-react";

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
}

const HeroSection = ({ onNavigate }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Floating Math Symbols */}
      <motion.div 
        className="absolute top-20 left-10 text-6xl text-white/10 font-serif"
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        Σ
      </motion.div>
      <motion.div 
        className="absolute top-40 right-20 text-5xl text-white/10 font-serif"
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        ∩
      </motion.div>
      <motion.div 
        className="absolute bottom-32 left-1/4 text-4xl text-white/10 font-serif"
        animate={{ y: [-5, 15, -5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        ≤
      </motion.div>

      <div className="container relative z-10 py-20 px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span 
            className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Water Resources Research • 1982
          </motion.span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
            Methods for Apportioning the Cost of a{" "}
            <span className="text-accent">Water Resource Project</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Exploring cooperative game theory and fair cost allocation methods 
            through the lens of Heaney & Dickinson's seminal research
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <FeatureCard
              icon={<Calculator className="w-6 h-6" />}
              title="Calculator"
              description="Interactive cost allocation"
              onClick={() => onNavigate("calculator")}
              delay={0.3}
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Paper Details"
              description="Key research insights"
              onClick={() => onNavigate("paper")}
              delay={0.4}
            />
            <FeatureCard
              icon={<Lightbulb className="w-6 h-6" />}
              title="Game Theory"
              description="Background concepts"
              onClick={() => onNavigate("theory")}
              delay={0.5}
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Document"
              description="Original PDF"
              onClick={() => onNavigate("document")}
              delay={0.6}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(220 25% 97%)"
          />
        </svg>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  delay: number;
}

const FeatureCard = ({ icon, title, description, onClick, delay }: FeatureCardProps) => (
  <motion.button
    onClick={onClick}
    className="group flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-left"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="p-3 rounded-lg bg-accent/20 text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  </motion.button>
);

export default HeroSection;
