import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import CostCalculator from "@/components/CostCalculator";
import PaperDetails from "@/components/PaperDetails";
import GameTheoryBackground from "@/components/GameTheoryBackground";
import DocumentViewer from "@/components/DocumentViewer";
import Footer from "@/components/Footer";
import ScrollProgressTracker from "@/components/ScrollProgressTracker";

const Index = () => {
  const [activeTab, setActiveTab] = useState("hero");
  
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    calculator: useRef<HTMLDivElement>(null),
    paper: useRef<HTMLDivElement>(null),
    theory: useRef<HTMLDivElement>(null),
    document: useRef<HTMLDivElement>(null),
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    const ref = sectionRefs[tab as keyof typeof sectionRefs];
    if (ref?.current) {
      const yOffset = -80;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: tab === "hero" ? 0 : y, behavior: "smooth" });
    }
  };

  // Update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      const sections = Object.entries(sectionRefs);
      for (let i = sections.length - 1; i >= 0; i--) {
        const [key, ref] = sections[i];
        if (ref.current && ref.current.offsetTop <= scrollPosition) {
          setActiveTab(key);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onNavigate={handleNavigate} />
      <ScrollProgressTracker />
      
      <div ref={sectionRefs.hero}>
        <HeroSection onNavigate={handleNavigate} />
      </div>

      <ExecutiveSummary />
      
      <div ref={sectionRefs.theory}>
        <GameTheoryBackground />
      </div>
      
      <div ref={sectionRefs.calculator}>
        <CostCalculator />
      </div>
      
      <div ref={sectionRefs.paper}>
        <PaperDetails />
      </div>
      
      <div ref={sectionRefs.document}>
        <DocumentViewer />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
