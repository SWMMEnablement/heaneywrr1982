import { motion } from "framer-motion";
import { BookOpen, Users, Target, Lightbulb, Quote, ArrowRight, FileText, ExternalLink, GraduationCap, Library, Landmark, Zap } from "lucide-react";
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

  const recentCitations = [
    {
      authors: "Zhang, L., Xie, J., Chen, X., Zhan, Y., & Zhou, L.",
      year: "2020",
      title: "Cooperative Game-Based Synergistic Gains Allocation Methods for Wind-Solar-Hydro Hybrid Generation System with Cascade Hydropower",
      journal: "Energies, 13(15), 3890",
      note: "Cites the paper noting that Heaney et al. investigated boundaries of the core and proposed the MCRS method to simplify allocation processes compared to the Shapley value or nucleolus methods.",
      url: "https://doi.org/10.3390/en13153890",
    },
    {
      authors: "Dinar, A., & Hogarth, M.",
      year: "2015",
      title: "Game Theory and Water Resources: Critical Review of its Contributions, Progress and Remaining Challenges",
      journal: "Foundations and Trends® in Microeconomics, 11(1–2), 1–139",
      note: "Lists it as a key historical publication in their comprehensive review of game theory applications in water resources.",
      url: "https://doi.org/10.1561/0700000066",
    },
    {
      authors: "Danesh-yazdi, M., Abrishamchi, A., & Tajrishy, M.",
      year: "n.d.",
      title: "Conflict Resolution of Water Resources Allocations Using the Game Theoretic Approach: The Case of Orumieh River Basin",
      journal: "Water and Wastewater",
      note: "Groups it with foundational game theory approaches like those by Rogers (1969) and Lejano & Davos (1995) for conflict resolution.",
      url: "https://www.wwjournal.ir/article_4195_en.html",
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

        {/* Paper Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8"
        >
          <Card className="card-elevated border-l-4 border-l-primary">
            <CardContent className="py-6">
              <div className="flex gap-4">
                <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Paper Details</h3>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <p className="font-medium">Methods for Apportioning the Cost of a Water Resource Project</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Authors:</span>
                      <p className="font-medium">James P. Heaney & Robert E. Dickinson</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Publication:</span>
                      <p className="font-medium">Water Resources Research, 18(3), 476–482</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Year:</span>
                      <p className="font-medium">1982</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Recent Citations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-interactive/10 text-interactive text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              Active Research Impact
            </span>
            <h3 className="text-2xl font-serif font-bold text-primary">
              Recent Citations & Significance
            </h3>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              This paper is well-documented in the literature and continues to be actively cited in recent research regarding cooperative game theory and water resource management.
            </p>
          </div>

          <div className="space-y-4">
            {recentCitations.map((citation, index) => (
              <motion.div
                key={citation.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <Card className="card-elevated hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-interactive/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-interactive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-sm leading-snug mb-1">
                              {citation.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {citation.authors} ({citation.year}) • <span className="italic">{citation.journal}</span>
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border-l-2 border-interactive/50">
                              {citation.note}
                            </p>
                          </div>
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            title="View publication"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Significance note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="mt-6"
          >
            <Card className="card-elevated bg-gradient-to-br from-interactive/5 to-accent/5 border-interactive/20">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-interactive/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-interactive" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">Research Significance</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This paper is recognized for its contribution to cost allocation methods, specifically regarding the <strong>Minimum Cost-Remaining Savings (MCRS)</strong> method (also known as the Separable Costs-Remaining Benefits method). The framework continues to inform modern applications in renewable energy allocation, transboundary water management, and infrastructure cost-sharing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Further Reading Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Library className="w-4 h-4" />
              Further Reading
            </span>
            <h3 className="text-2xl font-serif font-bold text-primary">
              Foundational Works & Modern Applications
            </h3>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Explore the theoretical foundations and cutting-edge applications of cooperative game theory in cost allocation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Foundational Papers */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Foundational Papers</h4>
              </div>
              <div className="space-y-3">
                <a
                  href="https://doi.org/10.1515/9781400881970-018"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="card-elevated hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">A Value for n-Person Games</h5>
                          <p className="text-xs text-muted-foreground mt-1">Lloyd S. Shapley (1953) • Contributions to the Theory of Games II</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">The seminal paper introducing the Shapley value—a fair method to distribute gains among players based on their marginal contributions.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>

                <a
                  href="https://press.princeton.edu/books/paperback/9780691130613/games-and-decisions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="card-elevated hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Games and Decisions</h5>
                          <p className="text-xs text-muted-foreground mt-1">R. Duncan Luce & Howard Raiffa (1957) • Wiley</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">A foundational textbook that brought game theory to a wider audience, covering cooperative games and bargaining theory.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>

                <a
                  href="https://doi.org/10.1007/BF01766485"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="card-elevated hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">The Nucleolus of a Characteristic Function Game</h5>
                          <p className="text-xs text-muted-foreground mt-1">David Schmeidler (1969) • SIAM Journal on Applied Mathematics</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">Introduces the nucleolus concept—an allocation that minimizes the maximum dissatisfaction of any coalition.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </div>
            </div>

            {/* Modern Applications */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">Modern Applications</h4>
              </div>
              <div className="space-y-3">
                <a
                  href="https://doi.org/10.1016/j.apenergy.2019.113458"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="card-elevated hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                          <Zap className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">Cost Allocation in Energy Communities</h5>
                          <p className="text-xs text-muted-foreground mt-1">Applied Energy (2019) • Renewable Energy Sharing</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">Uses Shapley values and nucleolus for fair cost/benefit allocation in renewable energy cooperatives and microgrids.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>

                <a
                  href="https://doi.org/10.1109/ACCESS.2020.3020119"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="card-elevated hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                          <Zap className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">Blockchain-Based Cooperative Game Theory</h5>
                          <p className="text-xs text-muted-foreground mt-1">IEEE Access (2020) • Decentralized Systems</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">Applies cooperative game theory to blockchain consensus mechanisms and cryptocurrency reward distribution.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>

                <a
                  href="https://doi.org/10.1016/j.ejor.2021.06.025"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="card-elevated hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                          <Zap className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">Supply Chain Cost Sharing</h5>
                          <p className="text-xs text-muted-foreground mt-1">European Journal of Operational Research (2021)</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">Modern logistics and supply chain optimization using cooperative game theory for joint procurement and distribution.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="mt-8"
          >
            <Card className="card-elevated bg-muted/30">
              <CardContent className="py-5">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <span className="text-muted-foreground">Quick Resources:</span>
                  <a
                    href="https://en.wikipedia.org/wiki/Shapley_value"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-interactive hover:underline"
                  >
                    Shapley Value <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://en.wikipedia.org/wiki/Core_(game_theory)"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-interactive hover:underline"
                  >
                    Core (Game Theory) <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://en.wikipedia.org/wiki/Nucleolus_(game_theory)"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-interactive hover:underline"
                  >
                    Nucleolus <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://en.wikipedia.org/wiki/Cooperative_game_theory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-interactive hover:underline"
                  >
                    Cooperative Game Theory <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PaperDetails;
