# 04 — Upload component and app state

**Depends on:** 02, 03

## Description

Let the user upload a CSV and hold the parsed, categorized data in memory.

## Acceptance criteria

- [x] Upload component in `frontend/src/components/` (file picker; drag and drop optional)
- [x] Composable in `frontend/src/composables/` holding transactions, categories and per-payee overrides
- [x] A new upload replaces all previous data, including overrides; nothing is persisted (no localStorage, no network)
- [x] Parse errors are shown to the user in German
- [x] German UI text throughout
