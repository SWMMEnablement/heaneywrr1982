import { motion } from "framer-motion";
import { BookOpen, Users, Target, Lightbulb, Quote, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PaperDetails = () => {
  const sections = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Research Objective",
      content: "This paper addresses the challenge of fairly apportioning costs among participants in water resource projects. The authors compare ad hoc methods used in water resources with rigorous fairness axioms from cooperative game theory.",
      color: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Key Contributors",
      content: "James P. Heaney and Robert E. Dickinson from the University of Florida developed this framework, building upon 50 years of cost allocation practices and game theory developments by Shapley, Raiffa, and others.",
      color: "from-interactive/10 to-interactive/5",
      iconBg: "bg-interactive/10 text-interactive",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Main Contribution",
      content: "The MCRS (Minimum Costs, Remaining Savings) method is proposed as an improvement over the SCRB method. It uses the actual core boundaries rather than potentially infeasible nominal bounds.",
      color: "from-accent/10 to-accent/5",
      iconBg: "bg-accent/10 text-accent",
    },
  ];

  const keyFindings = [
    {
      title: "Fairness Criteria",
      description: "Three fundamental axioms for fair cost allocation: individual rationality (pay no more than standalone cost), budget balance (total costs recovered), and coalition rationality (core stability).",
    },
    {
      title: "Characteristic Functions",
      description: "Cost games are defined by characteristic functions c(S) that specify the cost for each possible coalition S. These must satisfy subadditivity for cooperation to be beneficial.",
    },
    {
      title: "Core Concept",
      description: "The core represents all stable allocations where no group would be better off leaving the coalition. The goal is to find a solution in the center of the core.",
    },
    {
      title: "SCRB Limitations",
      description: "The traditional Separable Costs, Remaining Benefits method may produce allocations outside the core, especially for three or more participants.",
    },
  ];

  return (
    <section id="paper" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Paper Analysis
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Research Summary
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Key insights from the 1982 Water Resources Research paper on cost allocation methods
          </p>
        </motion.div>

        {/* Citation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="card-elevated border-l-4 border-l-accent">
            <CardContent className="py-6">
              <div className="flex gap-4">
                <Quote className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg italic text-foreground/80 mb-3">
                    "Numerous ad hoc methods are used to apportion the costs of a water resource project among participants and/or purposes. Unfortunately these procedures do not always work, i.e., they lead to unfair assignment of costs."
                  </p>
                  <p className="text-sm text-muted-foreground">
                    — Heaney & Dickinson, Water Resources Research, Vol. 18, No. 3, 1982
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Card className={`card-elevated h-full bg-gradient-to-br ${section.color}`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${section.iconBg} flex items-center justify-center mb-4`}>
                    {section.icon}
                  </div>
                  <CardTitle className="font-serif text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Key Findings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-serif font-bold text-primary mb-8 text-center">
            Key Concepts Explained
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {keyFindings.map((finding, index) => (
              <motion.div
                key={finding.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card className="card-elevated h-full group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">{finding.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mathematical Formulas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="card-elevated mathematical-border">
            <CardHeader>
              <CardTitle className="font-serif text-center">Core Mathematical Notation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-4">
                  <div className="text-2xl font-mono mb-2 text-primary">x(i) ≤ c(i)</div>
                  <p className="text-sm text-muted-foreground">
                    Individual rationality: Pay no more than standalone cost
                  </p>
                </div>
                <div className="p-4 border-x border-border">
                  <div className="text-2xl font-mono mb-2 text-primary">Σx(i) = c(N)</div>
                  <p className="text-sm text-muted-foreground">
                    Budget balance: Total costs must be recovered
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-2xl font-mono mb-2 text-primary">Σx(i) ≤ c(S)</div>
                  <p className="text-sm text-muted-foreground">
                    Coalition rationality: Core stability condition
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default PaperDetails;
