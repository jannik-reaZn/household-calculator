import { describe, expect, it } from "vite-plus/test";
import mappingJson from "../../../data/mapping.json";
import sampleCsv from "../../../data/sample.csv?raw";
import { categorizeTransactions, createCategorizer, FALLBACK_CATEGORY } from "./categorizer";
import { parseBankCsv } from "./parseBankCsv";

const tx = (payee: string, purpose = "") => ({ payee, purpose });

describe("createCategorizer", () => {
  const categorize = createCategorizer({
    Lebensmittel: ["Rewe", "Dm", "Media Markt"],
    Wohnung: ["Wilhelm.tel", "Rewe"],
    Technik: ["Media Markt"],
  });

  it("matches case-insensitively", () => {
    expect(categorize(tx("REWE Markt GmbH"))).toBe("Lebensmittel");
    expect(categorize(tx("rewe"))).toBe("Lebensmittel");
  });

  it("matches whole words only", () => {
    expect(categorize(tx("DM FIL 1234"))).toBe("Lebensmittel");
    expect(categorize(tx("Admin GmbH"))).toBe(FALLBACK_CATEGORY);
    expect(categorize(tx("Rewemarkt"))).toBe(FALLBACK_CATEGORY);
    expect(categorize(tx("Rewe2"))).toBe(FALLBACK_CATEGORY);
  });

  it("matches punctuation and surrounding symbols", () => {
    expect(categorize(tx("Wilhelm.tel GmbH"))).toBe("Wohnung");
    expect(categorize(tx("REWE-Markt"))).toBe("Lebensmittel");
    expect(categorize(tx("Kauf bei (Rewe)"))).toBe("Lebensmittel");
  });

  it("matches multi-word keywords literally", () => {
    expect(categorize(tx("Media Markt Hamburg"))).toBe("Lebensmittel");
    expect(categorize(tx("Media  Markt"))).toBe(FALLBACK_CATEGORY);
  });

  it("searches payee and purpose", () => {
    expect(categorize(tx("Kartenzahlung", "Einkauf Rewe Filiale 5"))).toBe("Lebensmittel");
  });

  it("does not match across the payee/purpose boundary", () => {
    expect(categorize(tx("Media", "Markt"))).toBe(FALLBACK_CATEGORY);
  });

  it("lets the first category in order win for duplicate keywords", () => {
    expect(categorize(tx("Rewe"))).toBe("Lebensmittel");
  });

  it("treats regex characters in keywords literally", () => {
    const c = createCategorizer({ A: ["a+b", "(x)"] });
    expect(c(tx("a+b"))).toBe("A");
    expect(c(tx("aab"))).toBe(FALLBACK_CATEGORY);
    expect(c(tx("Zahlung (x) ok"))).toBe("A");
  });

  it("falls back to Others for no match or empty keywords", () => {
    const c = createCategorizer({ A: ["", "  "] });
    expect(c(tx("Irgendwer"))).toBe("Others");
  });
});

describe("categorizeTransactions with data/mapping.json", () => {
  it("categorizes the sample file", () => {
    const result = categorizeTransactions(parseBankCsv(new TextEncoder().encode(sampleCsv)));
    const byPayee = (payee: string) => result.find((t) => t.payee === payee)?.category;
    expect(byPayee("REWE Markt GmbH")).toBe("Lebensmittel");
    expect(byPayee("dm-drogerie markt")).toBe("Lebensmittel");
    expect(byPayee("Amazon EU S.a.r.l.")).toBe("Sonstige 2");
    expect(byPayee("Hausverwaltung Muster GmbH")).toBe(FALLBACK_CATEGORY);
  });

  it("only maps to categories from mapping.json or the fallback", () => {
    const allowed = new Set([...Object.keys(mappingJson), FALLBACK_CATEGORY]);
    const result = categorizeTransactions(parseBankCsv(new TextEncoder().encode(sampleCsv)));
    expect(result.every((t) => allowed.has(t.category))).toBe(true);
  });
});
