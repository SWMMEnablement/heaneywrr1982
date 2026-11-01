import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CostCalculator from "./CostCalculator";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("./TetrahedronVisualization", () => ({
  default: () => <div data-testid="tetrahedron-visualization" />,
}));

const renderCalc = () =>
  render(
    <TooltipProvider>
      <CostCalculator />
    </TooltipProvider>
  );

describe("CostCalculator deployment check", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("hasSeenFirstTimeExperience", "true");
  });

  it("shows the corrected default MCRS allocation", () => {
    renderCalc();
    const table = screen.getAllByRole("table")[0];
    for (const v of ["1.43", "2.29", "3.29"]) {
      expect(table.textContent).toContain(v);
    }
  });

  it("rejects a negative grand-coalition cost and hides the results", () => {
    renderCalc();
    const grand = screen.getByLabelText(/Coalition cost c\(123\)/);
    fireEvent.change(grand, { target: { value: "-1" } });
    expect(screen.getByRole("alert").textContent).toMatch(/cannot be negative/);
    expect(screen.getByTestId("results-suppressed")).toBeInTheDocument();
    expect(screen.queryByText(/Coalition Audit/)).not.toBeInTheDocument();
  });
});
