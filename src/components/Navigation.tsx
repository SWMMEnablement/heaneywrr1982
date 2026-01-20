import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BookOpen, Calculator, Lightbulb, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Navigation = ({ activeTab, onNavigate }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "calculator", label: "Calculator", icon: <Calculator className="w-4 h-4" /> },
    { id: "paper", label: "Paper Details", icon: <BookOpen className="w-4 h-4" /> },
    { id: "theory", label: "Game Theory", icon: <Lightbulb className="w-4 h-4" /> },
    { id: "document", label: "Document", icon: <FileText className="w-4 h-4" /> },
  ];

  const handleNavigate = (tab: string) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => handleNavigate("hero")}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-interactive flex items-center justify-center text-white font-serif font-bold text-lg group-hover:scale-105 transition-transform">
                Σ
              </div>
              <div className="hidden sm:block">
                <div className={`font-serif font-semibold ${isScrolled ? 'text-primary' : 'text-white'}`}>
                  Cost Allocation
                </div>
                <div className={`text-xs ${isScrolled ? 'text-muted-foreground' : 'text-white/70'}`}>
                  Game Theory Explorer
                </div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 transition-all ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${isScrolled ? 'text-foreground' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-lg md:hidden"
          >
            <div className="container px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
