import { describe, expect, it } from "vite-plus/test";
import sampleCsv from "../../../data/sample.csv?raw";
import { CsvParseError, parseBankCsv } from "./parseBankCsv";

const HEADER =
  '"Auftragskonto";"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Glaeubiger ID";"Mandatsreferenz";"Kundenreferenz (End-to-End)";"Sammlerreferenz";"Lastschrift Ursprungsbetrag";"Auslagenersatz Ruecklastschrift";"Beguenstigter/Zahlungspflichtiger";"Kontonummer/IBAN";"BIC (SWIFT-Code)";"Betrag";"Waehrung";"Info"';

function row(date: string, purpose: string, payee: string, amount: string): string {
  return `"DE00";"${date}";"${date}";"KARTENZAHLUNG";"${purpose}";"";"";"";"";"";"";"${payee}";"DE00";"BIC";"${amount}";"EUR";"Umsatz gebucht"`;
}

const bytes = (text: string) => new TextEncoder().encode(text);

describe("parseBankCsv", () => {
  it("parses the sample file and keeps only expenses", () => {
    const transactions = parseBankCsv(bytes(sampleCsv));
    // 56 rows, 4 of them salary (income)
    expect(transactions).toHaveLength(52);
    expect(transactions.every((t) => t.expenseCents > 0)).toBe(true);
    expect(transactions[0]).toEqual({
      date: "2026-07-01",
      payee: "Hausverwaltung Muster GmbH",
      purpose: "MIETE WOHNUNG",
      expenseCents: 95000,
    });
  });

  it("parses dates, German amounts and thousands separators", () => {
    const [t] = parseBankCsv(
      bytes([HEADER, row("05.03.26", "X", "Shop", "-1.234,5")].join("\r\n")),
    );
    expect(t.date).toBe("2026-03-05");
    expect(t.expenseCents).toBe(123450);
  });

  it("accepts four-digit years", () => {
    const [t] = parseBankCsv(bytes([HEADER, row("05.03.2026", "X", "Shop", "-1,00")].join("\n")));
    expect(t.date).toBe("2026-03-05");
  });

  it("drops income and zero amounts but keeps transfers", () => {
    const csv = [
      HEADER,
      row("01.01.26", "Gehalt", "Arbeitgeber", "2850,00"),
      row("02.01.26", "Null", "Shop", "0,00"),
      row("03.01.26", "Umbuchung Sparkonto", "Eigenes Konto", "-100,00"),
    ].join("\n");
    const result = parseBankCsv(bytes(csv));
    expect(result).toHaveLength(1);
    expect(result[0].purpose).toBe("Umbuchung Sparkonto");
  });

  it("handles empty fields, escaped quotes and a trailing blank line", () => {
    const csv = [HEADER, row("01.01.26", 'Zweck ""zitiert""', "", "-5,00"), ""].join("\n");
    const [t] = parseBankCsv(bytes(csv));
    expect(t.purpose).toBe('Zweck "zitiert"');
    expect(t.payee).toBe("");
  });

  it("decodes UTF-8 with BOM", () => {
    const csv = "﻿" + [HEADER, row("01.01.26", "Käse", "Bäckerei Müller", "-5,00")].join("\n");
    const [t] = parseBankCsv(bytes(csv));
    expect(t.payee).toBe("Bäckerei Müller");
  });

  it("falls back to Windows-1252 for non-UTF-8 bytes", () => {
    const text = [HEADER, row("01.01.26", "Käse", "Bäckerei Müller", "-5,00")].join("\n");
    const latin1 = Uint8Array.from(text, (c) => c.charCodeAt(0));
    const [t] = parseBankCsv(latin1);
    expect(t.payee).toBe("Bäckerei Müller");
    expect(t.purpose).toBe("Käse");
  });

  it("throws a clear error for missing columns", () => {
    expect(() => parseBankCsv(bytes('"A";"B"\n"1";"2"'))).toThrow(/Fehlende Spalten: Buchungstag/);
  });

  it("throws for empty input", () => {
    expect(() => parseBankCsv(bytes(""))).toThrow(CsvParseError);
  });

  it("reports the line of an invalid date or amount", () => {
    expect(() =>
      parseBankCsv(bytes([HEADER, row("31.02.26", "X", "S", "-1,00")].join("\n"))),
    ).toThrow(/Datum in Zeile 2/);
    expect(() =>
      parseBankCsv(bytes([HEADER, row("01.01.26", "X", "S", "abc")].join("\n"))),
    ).toThrow(/Betrag in Zeile 2/);
  });
});
