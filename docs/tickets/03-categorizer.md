# 03 — Keyword categorizer

**Depends on:** 01

## Description

Assign each transaction a category from `data/mapping.json`.

## Acceptance criteria

- [x] Loads `data/mapping.json` (category name -> keywords) at build time
- [x] Case-insensitive whole-word match against payee and purpose; punctuated/multi-word keywords matched literally (e.g. `Wilhelm.tel`, `Media Markt`)
- [x] First matching category in file order wins; first keyword hit within it; no warning on duplicate keywords across categories
- [x] No match -> category `Others`
- [x] Tests: `Dm` matches `DM FIL 1234` but not `Admin`; compound words are not matched; ordering/duplicate behavior; fallback
