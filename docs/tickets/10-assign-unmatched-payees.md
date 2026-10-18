# 10 — Assign categories to unmatched payees

**Depends on:** 04

## Description

Let the user categorize payees that landed in `Others`, for the current session only.

## Acceptance criteria

- [x] List of payees currently in `Others` with their totals
- [x] Choose a category per payee from the existing categories; applies to all that payee's transactions
- [x] All charts update immediately
- [x] Override is session-only: lost on new upload or refresh; no export/snippet
- [x] Overrides take precedence over `mapping.json` rules
