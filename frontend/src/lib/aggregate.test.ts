import { describe, expect, it } from "vite-plus/test";
import {
  categoryTotals,
  categoryTrend,
  largestTransactions,
  topPayees,
  unmatchedPayees,
  UNKNOWN_PAYEE,
} from "./aggregate";
import { formatDate, formatEuro } from "./format";
import { monthsBetween } from "./months";

describe("categoryTotals", () => {
  it("sums per category, largest first", () => {
    const result = categoryTotals([
      { category: "A", expenseCents: 100 },
      { category: "B", expenseCents: 500 },
      { category: "A", expenseCents: 250 },
    ]);
    expect(result).toEqual([
      { category: "B", cents: 500 },
      { category: "A", cents: 350 },
    ]);
  });

  it("returns an empty list without transactions", () => {
    expect(categoryTotals([])).toEqual([]);
  });
});

describe("formatEuro", () => {
  it("uses German formatting", () => {
    expect(formatEuro(123456)).toMatch(/^1\.234,56\s€$/);
  });
});

describe("categoryTrend", () => {
  const data = [
    { category: "A", expenseCents: 100, date: "2026-01-05" },
    { category: "A", expenseCents: 50, date: "2026-01-20" },
    { category: "A", expenseCents: 70, date: "2026-03-01" },
    { category: "B", expenseCents: 900, date: "2026-02-10" },
  ];

  it("sums per month and fills gaps with 0", () => {
    const months = monthsBetween("2026-01", "2026-03");
    expect(categoryTrend(data, ["A", "B"], months)).toEqual([
      { category: "A", cents: [150, 0, 70] },
      { category: "B", cents: [0, 900, 0] },
    ]);
  });

  it("only includes requested categories and months", () => {
    expect(categoryTrend(data, ["B"], ["2026-02"])).toEqual([{ category: "B", cents: [900] }]);
  });
});

describe("topPayees", () => {
  const data = [
    { payee: "Rewe", expenseCents: 1000 },
    { payee: "Aldi", expenseCents: 500 },
    { payee: "Rewe", expenseCents: 1500 },
    { payee: "  ", expenseCents: 700 },
    { payee: "Lidl", expenseCents: 100 },
  ];

  it("sums per payee, largest first, limited", () => {
    expect(topPayees(data, 3)).toEqual([
      { payee: "Rewe", cents: 2500 },
      { payee: UNKNOWN_PAYEE, cents: 700 },
      { payee: "Aldi", cents: 500 },
    ]);
  });

  it("returns fewer entries when there are fewer payees", () => {
    expect(topPayees(data, 10)).toHaveLength(4);
    expect(topPayees([], 10)).toEqual([]);
  });
});

describe("largestTransactions", () => {
  it("returns the biggest single transactions, ties newest first, without mutating input", () => {
    const data = [
      { expenseCents: 100, date: "2026-01-01" },
      { expenseCents: 900, date: "2026-01-02" },
      { expenseCents: 900, date: "2026-02-01" },
      { expenseCents: 300, date: "2026-03-01" },
    ];
    const copy = [...data];
    expect(largestTransactions(data, 3)).toEqual([data[2], data[1], data[3]]);
    expect(data).toEqual(copy);
  });
});

describe("formatDate", () => {
  it("formats German dates", () => {
    expect(formatDate("2026-07-05")).toBe("05.07.2026");
  });
});

describe("unmatchedPayees", () => {
  it("lists payees in the fallback category with count and total, largest first", () => {
    const data = [
      { payee: "Miete AG", category: "Others", expenseCents: 95000 },
      { payee: "Rewe", category: "Lebensmittel", expenseCents: 1000 },
      { payee: "Kiosk", category: "Others", expenseCents: 300 },
      { payee: "Kiosk", category: "Others", expenseCents: 200 },
    ];
    expect(unmatchedPayees(data)).toEqual([
      { payee: "Miete AG", count: 1, cents: 95000 },
      { payee: "Kiosk", count: 2, cents: 500 },
    ]);
  });
});
