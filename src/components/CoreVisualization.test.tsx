import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ComponentProps, ReactElement } from "react";
import CoreVisualization from "./CoreVisualization";
import CostCalculator from "./CostCalculator";
import { TooltipProvider } from "@/components/ui/tooltip";

const renderWithProviders = (ui: ReactElement) =>
  render(<TooltipProvider>{ui}</TooltipProvider>);


vi.mock("./TetrahedronVisualization", () => ({
  default: () => <div data-testid="tetrahedron-visualization">4-player visualization</div>,
}));

const participants = [
  { id: 1, name: "Riverside", independentCost: 2 },
  { id: 2, name: "Hilltop", independentCost: 4 },
  { id: 3, name: "Lakeview", independentCost: 6 },
];

const coalitions = [
  { participants: [1, 2], cost: 5 },
  { participants: [1, 3], cost: 6 },
  { participants: [2, 3], cost: 6 },
  { participants: [1, 2, 3], cost: 7 },
];

const baseProps: ComponentProps<typeof CoreVisualization> = {
  participants,
  coalitions,
  scrbAllocations: [1.5, 2.25, 3.25],
  mcrsAllocations: [10 / 7, 16 / 7, 23 / 7],
  shapleyValues: [1.5, 2.5, 3],
  nucleolusValues: [1.5, 2.25, 3.25],
  grandCoalitionCost: 7,
};

const allocationKeys = [
  "scrbAllocations",
  "mcrsAllocations",
  "shapleyValues",
  "nucleolusValues",
] as const;

const pointLabels: Record<(typeof allocationKeys)[number], string> = {
  scrbAllocations: "SCRB",
  mcrsAllocations: "MCRS",
  shapleyValues: "Shapley",
  nucleolusValues: "Nucleolus",
};

function expectFiniteSvgPoints(container: HTMLElement) {
  const circles = container.querySelectorAll("svg circle");
  expect(circles.length).toBeGreaterThan(0);

  circles.forEach((circle) => {
    const cx = circle.getAttribute("cx");
    const cy = circle.getAttribute("cy");
    expect(cx).not.toBeNull();
    expect(cy).not.toBeNull();
    expect(Number.isFinite(Number(cx))).toBe(true);
    expect(Number.isFinite(Number(cy))).toBe(true);
  });
}

function getSvgPointLabel(label: string) {
  const element = screen
    .getAllByText(label)
    .find((node) => node.tagName.toLowerCase() === "text");
  expect(element).toBeDefined();
  return element!;
}

describe("CoreVisualization allocation regressions", () => {
  beforeEach(() => {
    localStorage.clear();
  });


  it.each(allocationKeys)(
    "renders and shows a safe tooltip when %s is undefined",
    async (key) => {
      const props = {
        ...baseProps,
        [key]: undefined as unknown as number[],
      };
      const { container } = renderWithProviders(<CoreVisualization {...props} />);


      expect(
        screen.getByRole("img", { name: /Triangular core diagram/i })
      ).toBeInTheDocument();
      expectFiniteSvgPoints(container);

      fireEvent.mouseEnter(getSvgPointLabel(pointLabels[key]));
      expect(await screen.findByText("Total: 7.00")).toBeInTheDocument();
      expectFiniteSvgPoints(container);
    }
  );

  it("renders and shows a safe tooltip when allocations are empty", async () => {
    const props = {
      ...baseProps,
      scrbAllocations: [],
      mcrsAllocations: [],
      shapleyValues: [],
      nucleolusValues: [],
    };
    const { container } = renderWithProviders(<CoreVisualization {...props} />);


    expect(
      screen.getByRole("img", { name: /Triangular core diagram/i })
    ).toBeInTheDocument();
    expectFiniteSvgPoints(container);

    fireEvent.mouseEnter(getSvgPointLabel("SCRB"));
    expect(await screen.findByText("Total: 7.00")).toBeInTheDocument();
    expectFiniteSvgPoints(container);
  });

  it("switches between three-player and four-player visualizations and back", async () => {
    localStorage.setItem("hasSeenFirstTimeExperience", "true");
    renderWithProviders(<CostCalculator />);


    expect(
      await screen.findByRole("img", { name: /Triangular core diagram/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /4 Players/i }));
    expect(await screen.findByTestId("tetrahedron-visualization")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /Triangular core diagram/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /3 Players/i }));
    expect(
      await screen.findByRole("img", { name: /Triangular core diagram/i })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("tetrahedron-visualization")).not.toBeInTheDocument();
  });
});
