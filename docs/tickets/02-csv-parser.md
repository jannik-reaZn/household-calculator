# 02 — CSV parser for the bank export

**Depends on:** 01

## Description

Parse the uploaded bank CSV into typed transactions, entirely in the browser.

## Acceptance criteria

- [x] Pure function in `frontend/src/` (no Vue dependency) taking the file bytes and returning `Transaction[]` (date, payee, purpose, amount in cents or number, raw row optional)
- [x] Decodes as UTF-8 if valid, otherwise Windows-1252 (Windows-1252 never fails, so it can only be the fallback)
- [x] Handles `;` delimiter, quoted fields, `DD.MM.YY` dates, decimal-comma amounts like `-950,00`
- [x] Uses columns `Buchungstag`, `Beguenstigter/Zahlungspflichtiger`, `Verwendungszweck`, `Betrag`
- [x] Only negative amounts are kept as expenses; positive amounts are dropped; transfers are NOT excluded
- [x] Clear error for a file with missing/unknown header columns
- [x] Tests use `data/sample.csv` plus small inline edge cases (umlauts, empty fields, income row)
