import { beforeEach, describe, expect, it } from "vite-plus/test";
import sampleCsv from "../../../data/sample.csv?raw";
import { useMonthRange } from "./useMonthRange";
import { resetTransactions, useTransactions } from "./useTransactions";

const csvFile = (text: string) => new File([text], "export.csv", { type: "text/csv" });

describe("useMonthRange", () => {
  beforeEach(() => resetTransactions());

  it("defaults to the full range of the file", async () => {
    await useTransactions().loadFile(csvFile(sampleCsv));
    const range = useMonthRange();
    expect(range.months.value).toEqual(["2026-07", "2026-08", "2026-09", "2026-10"]);
    expect(range.from.value).toBe("2026-07");
    expect(range.to.value).toBe("2026-10");
    expect(range.rangeTransactions.value).toHaveLength(52);
  });

  it("narrows the transactions to the selected range", async () => {
    await useTransactions().loadFile(csvFile(sampleCsv));
    const range = useMonthRange();
    range.setFrom("2026-08");
    range.setTo("2026-09");
    expect(
      range.rangeTransactions.value.every((t) =>
        ["2026-08", "2026-09"].includes(t.date.slice(0, 7)),
      ),
    ).toBe(true);
    expect(range.rangeTransactions.value.length).toBeGreaterThan(0);
  });

  it("keeps from <= to when the user picks a crossing value", async () => {
    await useTransactions().loadFile(csvFile(sampleCsv));
    const range = useMonthRange();
    range.setFrom("2026-08");
    range.setTo("2026-09");
    range.setFrom("2026-10");
    expect([range.from.value, range.to.value]).toEqual(["2026-10", "2026-10"]);
    range.setTo("2026-07");
    expect([range.from.value, range.to.value]).toEqual(["2026-07", "2026-07"]);
  });

  it("resets the selection on a new upload", async () => {
    const state = useTransactions();
    await state.loadFile(csvFile(sampleCsv));
    const range = useMonthRange();
    range.setFrom("2026-09");
    await state.loadFile(csvFile(sampleCsv));
    expect(range.from.value).toBe("2026-07");
  });

  it("is empty without data", () => {
    const range = useMonthRange();
    expect(range.months.value).toEqual([]);
    expect(range.from.value).toBeNull();
    expect(range.rangeTransactions.value).toEqual([]);
  });
});
