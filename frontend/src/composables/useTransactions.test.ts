import { beforeEach, describe, expect, it } from "vite-plus/test";
import sampleCsv from "../../../data/sample.csv?raw";
import { resetTransactions, useTransactions } from "./useTransactions";

const csvFile = (text: string, name = "export.csv") => new File([text], name, { type: "text/csv" });

describe("useTransactions", () => {
  beforeEach(() => resetTransactions());

  it("loads and categorizes a CSV file", async () => {
    const state = useTransactions();
    await state.loadFile(csvFile(sampleCsv, "sample.csv"));
    expect(state.error.value).toBeNull();
    expect(state.fileName.value).toBe("sample.csv");
    expect(state.transactions.value).toHaveLength(52);
    expect(state.transactions.value.find((t) => t.payee === "REWE Markt GmbH")?.category).toBe(
      "Lebensmittel",
    );
  });

  it("applies payee overrides with precedence over the mapping", async () => {
    const state = useTransactions();
    await state.loadFile(csvFile(sampleCsv));
    state.setPayeeCategory("Hausverwaltung Muster GmbH", "Wohnung");
    state.setPayeeCategory("REWE Markt GmbH", "Sonstige 1");
    const category = (payee: string) =>
      state.transactions.value.find((t) => t.payee === payee)?.category;
    expect(category("Hausverwaltung Muster GmbH")).toBe("Wohnung");
    expect(category("REWE Markt GmbH")).toBe("Sonstige 1");
    state.clearPayeeCategory("REWE Markt GmbH");
    expect(category("REWE Markt GmbH")).toBe("Lebensmittel");
  });

  it("a new upload replaces all data including overrides", async () => {
    const state = useTransactions();
    await state.loadFile(csvFile(sampleCsv, "a.csv"));
    state.setPayeeCategory("Hausverwaltung Muster GmbH", "Wohnung");
    await state.loadFile(csvFile(sampleCsv, "b.csv"));
    expect(state.fileName.value).toBe("b.csv");
    expect(state.overrides.value).toEqual({});
    expect(
      state.transactions.value.find((t) => t.payee === "Hausverwaltung Muster GmbH")?.category,
    ).toBe("Others");
  });

  it("shows a German error and forgets old data when the file is invalid", async () => {
    const state = useTransactions();
    await state.loadFile(csvFile(sampleCsv));
    await state.loadFile(csvFile('"A";"B"\n"1";"2"', "bad.csv"));
    expect(state.error.value).toMatch(/Fehlende Spalten/);
    expect(state.transactions.value).toEqual([]);
    expect(state.fileName.value).toBeNull();
  });

  it("reports a file without expenses", async () => {
    const state = useTransactions();
    const header = sampleCsv.split("\n")[0];
    await state.loadFile(csvFile(header + "\n"));
    expect(state.error.value).toBe("Die Datei enthält keine Ausgaben.");
  });

  it("keeps overridden payees in the unmatched list so the override can be changed", async () => {
    const state = useTransactions();
    await state.loadFile(csvFile(sampleCsv));
    const names = () => state.unmatchedPayees.value.map((p) => p.payee);
    expect(names()).toContain("Hausverwaltung Muster GmbH");
    expect(names()).not.toContain("REWE Markt GmbH");
    state.setPayeeCategory("Hausverwaltung Muster GmbH", "Wohnung");
    expect(names()).toContain("Hausverwaltung Muster GmbH");
  });
});
