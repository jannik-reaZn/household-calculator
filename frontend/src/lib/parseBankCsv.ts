import type { Transaction } from "./types";

const COL_DATE = "Buchungstag";
const COL_PAYEE = "Beguenstigter/Zahlungspflichtiger";
const COL_PURPOSE = "Verwendungszweck";
const COL_AMOUNT = "Betrag";
const REQUIRED_COLUMNS = [COL_DATE, COL_PAYEE, COL_PURPOSE, COL_AMOUNT];

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

/** UTF-8 if the bytes are valid UTF-8, otherwise Windows-1252 (typical bank export). */
function decode(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

/** Splits `;`-delimited text into rows. Supports quoted fields, `""` escapes and CRLF/LF. */
function splitRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const endRow = () => {
    row.push(field);
    field = "";
    if (row.some((value) => value !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      endRow();
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (inQuotes)
    throw new CsvParseError("Die CSV-Datei ist beschädigt (nicht geschlossene Anführungszeichen).");
  endRow();
  return rows;
}

/** `DD.MM.YY` or `DD.MM.YYYY` -> `YYYY-MM-DD`, or null if invalid. */
function parseDate(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** German amount (`-1.234,56`) -> signed cents, or null if invalid. */
function parseAmountCents(value: string): number | null {
  const match = /^([+-]?)(\d+)(?:,(\d{1,2}))?$/.exec(value.trim().replaceAll(".", ""));
  if (!match) return null;
  const cents = Number(match[2]) * 100 + Number((match[3] ?? "").padEnd(2, "0") || 0);
  return match[1] === "-" ? -cents : cents;
}

/**
 * Parses the bank's CSV export and returns its expenses (negative amounts only).
 * Income and zero amounts are dropped; transfers are not excluded.
 */
export function parseBankCsv(input: Uint8Array): Transaction[] {
  const text = decode(input).replace(/^﻿/, "");
  const [header, ...rows] = splitRows(text);
  if (!header) throw new CsvParseError("Die CSV-Datei ist leer.");

  const index = new Map(header.map((name, i) => [name.trim(), i]));
  const missing = REQUIRED_COLUMNS.filter((name) => !index.has(name));
  if (missing.length > 0) {
    throw new CsvParseError(`Unbekanntes Dateiformat. Fehlende Spalten: ${missing.join(", ")}.`);
  }
  const col = (row: string[], name: string) => (row[index.get(name)!] ?? "").trim();

  const transactions: Transaction[] = [];
  rows.forEach((row, i) => {
    const line = i + 2;
    const date = parseDate(col(row, COL_DATE));
    if (!date)
      throw new CsvParseError(`Ungültiges Datum in Zeile ${line}: "${col(row, COL_DATE)}".`);
    const cents = parseAmountCents(col(row, COL_AMOUNT));
    if (cents === null)
      throw new CsvParseError(`Ungültiger Betrag in Zeile ${line}: "${col(row, COL_AMOUNT)}".`);
    if (cents >= 0) return;
    transactions.push({
      date,
      payee: col(row, COL_PAYEE),
      purpose: col(row, COL_PURPOSE),
      expenseCents: -cents,
    });
  });
  return transactions;
}
