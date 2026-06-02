# Cost Allocation Game Theory Explorer

An interactive educational web application that teaches **cooperative game theory** through the cost allocation of shared water-resource infrastructure projects. The app is based on the 1982 paper **“Methods for Apportioning the Cost of a Water Resource Project”** by **James P. Heaney** and **Robert E. Dickinson**. [page:4]

**Live app:** [heaneywrr1982.lovable.app](https://heaneywrr1982.lovable.app/) [page:4]

---

## Overview

This project explains how multiple participants can share the cost of a joint infrastructure project fairly, using a narrative scenario, transparent algorithms, interactive visualizations, and guided learning features. It is designed as a browser-based single-page application for students, engineers, and researchers interested in water resources economics, cooperative game theory, and infrastructure cost sharing. [page:4]

The application is entirely **client-side**. It has **no backend**, no database, and no authentication layer; all user interaction is handled in React state, with a few onboarding flags stored in `localStorage`. [page:4]

---

## What the app teaches

The explorer centers on a classic water-resources cost allocation problem and demonstrates how different allocation methods behave under the same coalition-cost structure. Users can learn the theory, manipulate example scenarios, compare solution methods, inspect the feasible Core region, and test their understanding with quizzes. [page:4]

The app includes a built-in “Three Towns, One Reservoir” example with Riverside, Hilltop, and Lakeview, along with additional three-player and four-player scenarios. It also embeds the original research paper and provides a printable cheat sheet summarizing the methods. [page:4]

---

## Features

- Interactive **cost allocation calculator** with editable participant and coalition costs. [page:4]
- Four allocation methods: **SCRB**, **Shapley**, **Nucleolus**, and **Equal Split**. [page:4]
- **Triangular Core visualization** using barycentric coordinates for 3-player games. [page:4]
- **3D tetrahedron visualization** for 4-player games using React Three Fiber. [page:4]
- Step-by-step **algorithm breakdowns** for method transparency. [page:4]
- **Example scenario bank** with beginner, intermediate, and advanced cases. [page:4]
- Multi-layer **onboarding and guided learning** system. [page:4]
- Embedded **quizzes** and active-learning prompts. [page:4]
- Embedded **PDF viewer** for the original paper. [page:4]
- Printable **cheat sheet** with formulas, guidance, and comparisons. [page:4]

---

## Allocation methods

| Method | Purpose |
|---|---|
| **SCRB** | Separable Costs / Remaining Benefits allocation. [page:4] |
| **Shapley Value** | Average marginal contribution approach across player orderings. [page:4] |
| **Nucleolus** | Approximate iterative balancing of the most binding excesses. [page:4] |
| **Equal Split** | Divides the grand coalition cost equally among all players. [page:4] |

The app color-codes these methods consistently across charts and visualizations: SCRB in deep blue, Shapley in teal, Nucleolus in gold, and Equal Split in gray. [page:4]

---

## Learning flow

The application is structured as a guided, progressive learning experience rather than a raw calculator alone. It includes a first-visit full-screen introduction, a dialog-based calculator tour, an inline Core “story mode,” and contextual quizzes that appear after key visual steps. [page:4]

A “Restart Tutorial” control in the footer clears the onboarding flags from `localStorage` and restarts the full guided experience. The local storage keys used are `hasSeenFirstTimeExperience`, `hasSeenCostCalculatorTour`, and `hasSeenCoreQuiz`. [page:4]

---

## Example scenarios

The app ships with several built-in scenarios that replace the current calculator inputs when selected. These include the **3-Town Reservoir** example, **Airport Runway**, **Empty Core Game**, **Multi-Factory**, and **Regional Infrastructure**. [page:4]

The default 3-player scenario uses three participants with standalone costs of 2, 4, and 6, and coalition costs of 5, 6, 6, and 7 for the grand coalition. This makes it easy to compare how each allocation method treats the same shared savings structure. [page:4]

---

## Visualizations

The Core plot is a custom SVG visualization that shows the feasible region for 3-player cooperative games. It renders individual and coalition rationality constraints, shades the Core region, plots the method solutions, and lets users drag allocation points to test whether they remain inside the Core. [page:4]

The app also includes grouped bar, stacked bar, pie, radar, and method-comparison charts, plus a parallel coordinates chart for comparing allocation vectors. In 4-player mode, a tetrahedron visualization maps 4D barycentric allocations into a 3D interactive view. [page:4]

---

## Project structure

```text
src/
├── App.tsx
├── main.tsx
├── index.css
├── pages/
│   ├── Index.tsx
│   └── NotFound.tsx
├── components/
│   ├── Navigation.tsx
│   ├── HeroSection.tsx
│   ├── ExecutiveSummary.tsx
│   ├── GameTheoryBackground.tsx
│   ├── CostCalculator.tsx
│   ├── CoreVisualization.tsx
│   ├── CoreStoryMode.tsx
│   ├── ShowStepsPanel.tsx
│   ├── CompareChart.tsx
│   ├── ParallelCoordinatesChart.tsx
│   ├── TetrahedronVisualization.tsx
│   ├── ExampleBank.tsx
│   ├── ActiveLearningChallenges.tsx
│   ├── ContextualQuizPrompt.tsx
│   ├── FirstTimeExperience.tsx
│   ├── OnboardingTour.tsx
│   ├── CheatSheet.tsx
│   ├── Glossary.tsx
│   ├── PaperDetails.tsx
│   ├── DocumentViewer.tsx
│   ├── Footer.tsx
│   └── ui/
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── utils.ts
│   ├── calculations.ts
│   └── calculations.test.ts
└── test/
    ├── setup.ts
    └── example.test.ts
```

This is a single-page React application with minimal routing: `/` for the main app and a catch-all `*` route for the 404 page. The main page assembles the navigation, theory section, calculator, paper summary, document viewer, and footer into one scroll-based experience. [page:4]

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18.3.1 [page:4] |
| Build tool | Vite [page:20][page:4] |
| Language | TypeScript [page:20][page:4] |
| Styling | Tailwind CSS + shadcn/ui [page:20][page:4] |
| Animation | Framer Motion [page:4] |
| Charts | Recharts [page:4] |
| 3D graphics | three, @react-three/fiber, @react-three/drei [page:4] |
| Routing | react-router-dom [page:4] |
| Testing | Vitest [page:20][page:4] |

The repository is overwhelmingly TypeScript, with GitHub reporting about 98.2% TypeScript and a smaller CSS footprint. The current README in the repo is still the default Lovable template and should be replaced by project-specific documentation. [page:20]

---

## Development

```bash
npm install
npm run dev
```

The repository includes the standard Vite project files such as `package.json`, `vite.config.ts`, Tailwind configuration, and Vitest configuration, which supports local development with Node.js and npm. [page:20]

---

## Testing

The core calculation logic has been extracted into `src/lib/calculations.ts` as pure functions for testability. A dedicated test file, `src/lib/calculations.test.ts`, contains 20 unit tests covering SCRB, Shapley, Nucleolus, and cross-method properties. [page:4]

---

## Notes on implementation

The calculator is the central hub of the application and manages participant data, coalition costs, chart mode selection, onboarding dialogs, example scenarios, and derived allocation results. The calculation engine is functional and side-effect free, with results derived from participants and coalitions through memoized React logic. [page:4]

The Shapley implementation is described in the handover document as a simplified averaging approach for 3-player and 4-player scenarios, while the Nucleolus implementation is an approximate iterative method rather than an exact linear-programming solution. That makes the app especially useful for teaching concepts transparently, while also making its numerical assumptions explicit. [page:4]

---

## Citation

Heaney, J. P., & Dickinson, R. E. (1982). *Methods for Apportioning the Cost of a Water Resource Project*. Water Resources Research, 18(3), 476–482. [page:4]

---

## Acknowledgments

This project turns a classic water-resources cost allocation paper into an interactive learning environment. It is especially relevant for engineers, educators, and students exploring fairness, coalition stability, and cost-sharing decisions in infrastructure planning. [page:4]
