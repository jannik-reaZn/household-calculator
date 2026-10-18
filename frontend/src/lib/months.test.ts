import { describe, expect, it } from "vite-plus/test";
import {
  availableMonths,
  filterByMonthRange,
  formatMonth,
  monthKey,
  monthsBetween,
} from "./months";

const tx = (date: string) => ({ date });

describe("months", () => {
  it("derives month keys", () => {
    expect(monthKey("2026-07-15")).toBe("2026-07");
  });

  it("lists unique months ascending, across years", () => {
    const result = availableMonths([tx("2026-02-01"), tx("2025-12-31"), tx("2026-02-20")]);
    expect(result).toEqual(["2025-12", "2026-02"]);
  });

  it("formats German month names", () => {
    expect(formatMonth("2026-07")).toBe("Juli 2026");
    expect(formatMonth("2026-03")).toBe("März 2026");
  });

  it("filters inclusively by month range", () => {
    const data = [tx("2026-06-30"), tx("2026-07-01"), tx("2026-08-31"), tx("2026-09-01")];
    expect(filterByMonthRange(data, "2026-07", "2026-08")).toEqual([
      tx("2026-07-01"),
      tx("2026-08-31"),
    ]);
  });

  it("lists every month in a range without gaps, across years", () => {
    expect(monthsBetween("2025-11", "2026-02")).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
    expect(monthsBetween("2026-05", "2026-05")).toEqual(["2026-05"]);
  });
});
