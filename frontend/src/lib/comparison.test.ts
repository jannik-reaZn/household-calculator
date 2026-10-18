import { describe, expect, it } from "vite-plus/test";
import { compareMonths } from "./comparison";
import { formatSignedEuro, formatSignedPercent } from "./format";

const tx = (category: string, expenseCents: number, date: string) => ({
  category,
  expenseCents,
  date,
});

const data = [
  tx("A", 1000, "2026-07-03"),
  tx("A", 500, "2026-07-20"),
  tx("B", 200, "2026-07-21"),
  tx("A", 900, "2026-08-02"),
  tx("C", 1200, "2026-08-15"),
  tx("A", 99999, "2026-09-01"), // other month, ignored
];

describe("compareMonths", () => {
  it("compares per category, sorted by size", () => {
    const result = compareMonths(data, "2026-07", "2026-08");
    expect(result.rows).toEqual([
      { category: "A", firstCents: 1500, secondCents: 900 },
      { category: "C", firstCents: 0, secondCents: 1200 },
      { category: "B", firstCents: 200, secondCents: 0 },
    ]);
  });

  it("computes totals, difference and percent relative to the first month", () => {
    const result = compareMonths(data, "2026-07", "2026-08");
    expect(result.firstTotalCents).toBe(1700);
    expect(result.secondTotalCents).toBe(2100);
    expect(result.diffCents).toBe(400);
    expect(result.diffPercent).toBeCloseTo(23.53, 1);
  });

  it("has no percent when the first month has no expenses", () => {
    const result = compareMonths(data, "2026-06", "2026-08");
    expect(result.firstTotalCents).toBe(0);
    expect(result.diffPercent).toBeNull();
  });

  it("does not double count when both months are the same", () => {
    const result = compareMonths(data, "2026-07", "2026-07");
    expect(result.firstTotalCents).toBe(1700);
    expect(result.secondTotalCents).toBe(1700);
    expect(result.diffCents).toBe(0);
    expect(result.diffPercent).toBe(0);
  });

  it("handles no data", () => {
    expect(compareMonths([], "2026-07", "2026-08").rows).toEqual([]);
  });
});

describe("signed formats", () => {
  it("adds an explicit plus sign", () => {
    expect(formatSignedEuro(400)).toMatch(/^\+4,00\s€$/);
    expect(formatSignedEuro(-400)).toMatch(/^[-−]4,00\s€$/);
    expect(formatSignedPercent(23.53)).toBe("+23,5 %");
    expect(formatSignedPercent(-5)).toMatch(/^[-−]5 %$/);
  });
});
