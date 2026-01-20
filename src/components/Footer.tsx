import { BookOpen, Github, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-6">
      <div className="container max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-serif font-bold text-lg">
                Σ
              </div>
              <div>
                <div className="font-serif font-semibold">Cost Allocation</div>
                <div className="text-xs text-primary-foreground/70">Game Theory Explorer</div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              An interactive exploration of cooperative game theory applied to water resource cost allocation, 
              based on the 1982 paper by Heaney & Dickinson.
            </p>
          </div>

          {/* References */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Key References
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Heaney & Dickinson (1982)</li>
              <li>Shapley Value (1953)</li>
              <li>Schmeidler's Nucleolus (1969)</li>
              <li>Tennessee Valley Authority Studies</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Learn More
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://en.wikipedia.org/wiki/Cooperative_game_theory" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-flex items-center gap-1"
                >
                  Cooperative Game Theory
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://en.wikipedia.org/wiki/Shapley_value" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-flex items-center gap-1"
                >
                  Shapley Value
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://en.wikipedia.org/wiki/Core_(game_theory)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-flex items-center gap-1"
                >
                  The Core Concept
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>
            Based on research from Water Resources Research, Vol. 18, No. 3, June 1982
          </p>
          <p>
            © {new Date().getFullYear()} Educational Tool • Built with React
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
