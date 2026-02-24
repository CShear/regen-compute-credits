import { describe, expect, it } from "vitest";
import { estimateFootprint } from "../src/services/estimator.js";

describe("estimateFootprint", () => {
  it("returns deterministic estimates for a session without tool calls", () => {
    const result = estimateFootprint(10);

    expect(result.session_minutes).toBe(10);
    expect(result.estimated_queries).toBe(15);
    expect(result.energy_kwh).toBe(0.15);
    expect(result.co2_kg).toBe(0.06);
    expect(result.co2_tonnes).toBe(0.00006);
    expect(result.equivalent_carbon_credits).toBe(0.00006);
    expect(result.equivalent_cost_usd).toBe(0);
    expect(result.methodology_note.length).toBeGreaterThan(0);
  });

  it("applies output rounding precision across all derived fields", () => {
    const result = estimateFootprint(123.456);

    expect(result.estimated_queries).toBe(185);
    expect(result.energy_kwh).toBe(1.8518);
    expect(result.co2_kg).toBe(0.741);
    expect(result.co2_tonnes).toBe(0.00074);
    expect(result.equivalent_carbon_credits).toBe(0.00074);
    expect(result.equivalent_cost_usd).toBe(0.03);
  });

  it("uses tool calls as a minimum query floor when larger than duration estimate", () => {
    const result = estimateFootprint(2, 4);

    expect(result.estimated_queries).toBe(8);
    expect(result.energy_kwh).toBe(0.08);
    expect(result.co2_kg).toBe(0.032);
    expect(result.co2_tonnes).toBe(0.00003);
  });

  it("uses duration estimate when it exceeds tool-call floor", () => {
    const result = estimateFootprint(50, 10);

    expect(result.estimated_queries).toBe(75);
    expect(result.energy_kwh).toBe(0.75);
    expect(result.co2_kg).toBe(0.3);
    expect(result.co2_tonnes).toBe(0.0003);
    expect(result.equivalent_cost_usd).toBe(0.01);
  });

  it("treats zero tool calls the same as omitting tool calls", () => {
    const withoutToolCalls = estimateFootprint(1);
    const zeroToolCalls = estimateFootprint(1, 0);

    expect(zeroToolCalls).toEqual(withoutToolCalls);
  });
});
