import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Section {
  id: string;
  label: string;
  icon: string;
}

const sections: Section[] = [
  { id: "hero", label: "Introduction", icon: "📖" },
  { id: "theory", label: "Game Theory", icon: "🎯" },
  { id: "calculator", label: "Calculator", icon: "🧮" },
  { id: "paper", label: "Paper Details", icon: "📄" },
  { id: "document", label: "Document", icon: "📑" },
];

const ScrollProgressTracker = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);

      // Determine active section
      const sectionElements = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id) ?? document.querySelector(`[data-section="${s.id}"]`),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, el } = sectionElements[i];
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (sectionId: string) => {
    const el = document.getElementById(sectionId) ?? document.querySelector(`[data-section="${sectionId}"]`);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: sectionId === "hero" ? 0 : y, behavior: "smooth" });
    }
  };

  const activeIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-1"
        >
          {/* Progress bar background */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-border rounded-full" />
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-interactive rounded-full transition-all duration-300 origin-top"
            style={{ height: `${(activeIndex / (sections.length - 1)) * 100}%` }}
          />

          {sections.map((section, i) => {
            const isActive = section.id === activeSection;
            const isPast = i <= activeIndex;

            return (
              <button
                key={section.id}
                onClick={() => handleClick(section.id)}
                className="relative group flex items-center z-10 my-2"
                aria-label={`Navigate to ${section.label}`}
              >
                {/* Dot */}
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-interactive border-interactive scale-125 shadow-sm shadow-interactive/30"
                      : isPast
                      ? "bg-interactive/50 border-interactive/50"
                      : "bg-background border-muted-foreground/30"
                  }`}
                />

                {/* Label tooltip */}
                <div
                  className={`absolute right-6 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "opacity-100 bg-interactive text-interactive-foreground"
                      : "opacity-0 group-hover:opacity-100 bg-card text-foreground border border-border shadow-sm"
                  }`}
                >
                  <span className="mr-1">{section.icon}</span>
                  {section.label}
                  {isActive && " ←"}
                </div>
              </button>
            );
          })}

          {/* Overall progress */}
          <div className="mt-3 text-[10px] text-muted-foreground font-mono">
            {Math.round(scrollProgress)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollProgressTracker;
