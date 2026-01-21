import { motion } from "framer-motion";
import { Lightbulb, GitBranch, Scale, Award, ChevronRight, Puzzle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Glossary, { GlossaryTermLink } from "./Glossary";

const GameTheoryBackground = () => {
  const concepts = [
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Cooperative Games",
      subtitle: "Coalition Formation",
      content: (
        <>
          In cooperative game theory, players can form binding agreements. A <GlossaryTermLink term="Coalition">coalition</GlossaryTermLink> is any subset of players who agree to work together. The key question is how to fairly divide the gains (or costs) from cooperation.
        </>
      ),
      examples: [
        "Water resource projects with multiple beneficiaries",
        "Shared infrastructure costs",
        "Joint venture profit distribution",
      ],
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "The Core",
      subtitle: "Stability Concept",
      content: (
        <>
          <GlossaryTermLink term="The Core">The core</GlossaryTermLink> is the set of all allocations where no group of players would prefer to break away and form their own coalition. An allocation is in the core if every <GlossaryTermLink term="Coalition">coalition</GlossaryTermLink> receives at least as much value as it could achieve on its own.
        </>
      ),
      examples: [
        "Ensures no participant is exploited",
        "Guarantees coalition stability",
        "May be empty for some games",
      ],
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Shapley Value",
      subtitle: "Unique Fair Solution",
      content: (
        <>
          <GlossaryTermLink term="Shapley Value">The Shapley value</GlossaryTermLink> assigns each player their average <GlossaryTermLink term="Marginal Contribution">marginal contribution</GlossaryTermLink> across all possible orderings of coalition formation. It satisfies axioms of efficiency, symmetry, additivity, and null player.
        </>
      ),
      examples: [
        "Named after Lloyd Shapley (Nobel Prize 2012)",
        "Always exists and is unique",
        "May fall outside the core",
      ],
    },
    {
      icon: <Puzzle className="w-6 h-6" />,
      title: "Nucleolus",
      subtitle: "Maximum Fairness",
      content: (
        <>
          <GlossaryTermLink term="Nucleolus">The nucleolus</GlossaryTermLink> minimizes the maximum dissatisfaction (<GlossaryTermLink term="Excess">excess</GlossaryTermLink>) of any coalition. It always lies in <GlossaryTermLink term="The Core">the core</GlossaryTermLink> (when non-empty) and provides a unique, stable solution that treats all players as fairly as possible.
        </>
      ),
      examples: [
        "Found by solving linear programs",
        "Always in the core if core exists",
        "Lexicographically minimizes complaints",
      ],
    },
  ];

  const faqs = [
    {
      question: "What's the difference between cooperative and non-cooperative games?",
      answer: (
        <>
          In cooperative games, players can form binding agreements and <GlossaryTermLink term="Coalition">coalitions</GlossaryTermLink>. In non-cooperative games (like the Prisoner's Dilemma), players act independently without binding commitments. Cost allocation problems are typically modeled as cooperative games since participants can negotiate and agree on cost-sharing arrangements.
        </>
      ),
    },
    {
      question: "Why is fair cost allocation important?",
      answer: (
        <>
          Fair cost allocation ensures that all participants benefit from cooperation. If allocations are perceived as unfair, participants may refuse to cooperate or leave the <GlossaryTermLink term="Coalition">coalition</GlossaryTermLink>, leading to inefficient outcomes. Game theory provides rigorous methods to determine what 'fair' means mathematically through concepts like <GlossaryTermLink term="The Core">the core</GlossaryTermLink> and <GlossaryTermLink term="Shapley Value">Shapley value</GlossaryTermLink>.
        </>
      ),
    },
    {
      question: "What makes a cost game subadditive?",
      answer: (
        <>
          A cost game is <GlossaryTermLink term="Subadditive">subadditive</GlossaryTermLink> when c(S ∪ T) ≤ c(S) + c(T) for any two non-overlapping <GlossaryTermLink term="Coalition">coalitions</GlossaryTermLink> S and T. This means forming larger coalitions never costs more than operating separately—a prerequisite for beneficial cooperation. Subadditivity arises from economies of scale, shared resources, or avoided redundancy.
        </>
      ),
    },
    {
      question: "Can the core be empty?",
      answer: (
        <>
          Yes, some games have an empty <GlossaryTermLink term="The Core">core</GlossaryTermLink>, meaning no allocation satisfies all <GlossaryTermLink term="Coalition Rationality">coalition rationality</GlossaryTermLink> constraints. This occurs when the benefits of the <GlossaryTermLink term="Grand Coalition">grand coalition</GlossaryTermLink> are relatively small compared to what sub-coalitions can achieve. The <GlossaryTermLink term="MCRS Method">MCRS method</GlossaryTermLink> addresses this by relaxing bounds until a solution exists.
        </>
      ),
    },
    {
      question: "How does SCRB differ from MCRS?",
      answer: (
        <>
          <GlossaryTermLink term="SCRB Method">SCRB (Separable Costs, Remaining Benefits)</GlossaryTermLink> uses nominal bounds based only on individual and <GlossaryTermLink term="Grand Coalition">grand coalition</GlossaryTermLink> costs. <GlossaryTermLink term="MCRS Method">MCRS (Minimum Costs, Remaining Savings)</GlossaryTermLink> considers all intermediate coalitions to find the true <GlossaryTermLink term="The Core">core</GlossaryTermLink> boundaries. This makes MCRS more accurate but computationally more demanding for large games.
        </>
      ),
    },
  ];

  const timeline = [
    { year: "1944", event: "Von Neumann & Morgenstern publish 'Theory of Games and Economic Behavior'" },
    { year: "1953", event: "Lloyd Shapley introduces the Shapley value for n-person games" },
    { year: "1963", event: "Shapley & Shubik apply game theory to cost allocation" },
    { year: "1969", event: "Schmeidler introduces the nucleolus concept" },
    { year: "1982", event: "Heaney & Dickinson propose MCRS method for water resources" },
    { year: "2012", event: "Shapley & Roth receive Nobel Prize in Economics for game theory" },
  ];

  return (
    <section id="theory" className="py-20 px-6">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Lightbulb className="w-4 h-4" />
            Background Theory
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Game Theory Fundamentals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understanding the mathematical foundations of fair cost allocation
          </p>
        </motion.div>

        {/* Core Concepts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {concepts.map((concept, index) => (
            <motion.div
              key={concept.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="card-elevated h-full group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-interactive flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {concept.icon}
                    </div>
                    <div>
                      <CardTitle className="font-serif text-xl">{concept.title}</CardTitle>
                      <CardDescription className="text-interactive font-medium">
                        {concept.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground leading-relaxed">
                    {concept.content}
                  </div>
                  <div className="space-y-2">
                    {concept.examples.map((example, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-foreground/80">{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-serif font-bold text-primary mb-8 text-center">
            Historical Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary via-interactive to-accent hidden md:block" />
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`flex items-center gap-4 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <Card className="card-elevated inline-block">
                      <CardContent className="py-4 px-6">
                        <div className="text-2xl font-bold text-primary font-serif mb-1">{item.year}</div>
                        <p className="text-sm text-muted-foreground">{item.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg hidden md:block z-10" />
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-serif font-bold text-primary mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Why It Matters - Real World Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-interactive/10 text-interactive text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Why It Matters
            </span>
            <h3 className="text-2xl font-serif font-bold text-primary">
              Real-World Applications Today
            </h3>
          </div>
          
          <Card className="card-elevated bg-gradient-to-br from-interactive/5 via-background to-accent/5 border-interactive/20">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
                These methods aren't just academic exercises—they're used daily to solve real allocation challenges:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
                  <div className="text-3xl mb-3">🏗️</div>
                  <h4 className="font-semibold text-primary mb-2">Shared Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">
                    Airports, highways, and water systems use these methods to fairly split construction and maintenance costs among municipalities.
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
                  <div className="text-3xl mb-3">⚡</div>
                  <h4 className="font-semibold text-primary mb-2">Energy Communities</h4>
                  <p className="text-sm text-muted-foreground">
                    Renewable energy cooperatives allocate costs for shared solar farms and wind turbines using Shapley and SCRB methods.
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
                  <div className="text-3xl mb-3">🌍</div>
                  <h4 className="font-semibold text-primary mb-2">International Treaties</h4>
                  <p className="text-sm text-muted-foreground">
                    Transboundary water treaties and climate agreements use game-theoretic allocation to ensure fair burden-sharing.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground italic">
                  "From the 1982 reservoir paper to today's blockchain cost-sharing protocols, 
                  the fundamental question remains: <span className="text-primary font-medium">How do we divide costs so everyone agrees to cooperate?</span>"
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interactive Glossary */}
        <Glossary />
      </div>
    </section>
  );
};

export default GameTheoryBackground;
