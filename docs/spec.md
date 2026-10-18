# Household Calculator — Spec

Status: agreed in a design discussion; nothing implemented yet except the dependencies (`echarts`, `vue-echarts`), `data/sample.csv` and `data/mapping.json`.

## Goal

Upload a CSV export from one bank and see where the money goes, as charts. Single user.

## Architecture

- **Browser-only.** CSV parsing, categorization and charts all run in the Vue frontend (`frontend/`).
- No backend calls, no database, no authentication. The existing FastAPI backend (`backend/`) stays in the repo but is unused and not deployed.
- Hosted as a static site on **GitHub Pages** (build via GitHub Actions).
- Chart stack: **ECharts** via **vue-echarts**.
- UI components: **Nuxt UI** (Vue + Vite, Tailwind CSS 4, `router: false`). Interactive and structural elements (upload, selects, checkboxes, tables, cards, alerts) use Nuxt UI components rather than plain HTML. Lucide icons are bundled locally so the app makes no runtime requests to the Iconify API.

### Why no auth

GitHub Pages serves static files only, so the site contains no data. The uploaded CSV never leaves the user's browser. Nothing sensitive is stored server-side, so there is nothing to protect with login.

### Security rules (keep it that way)

- Do not send CSV data or derived data to any server.
- No analytics, error-reporting services or third-party scripts that could read the page.
- Never commit real CSVs. `*.csv` should be git-ignored, except the anonymized `data/sample.csv`.
- If persistence is ever wanted, use browser storage only (e.g. localStorage), never a server.

## Data handling

- One upload at a time. A new upload replaces everything from the previous one. A page refresh forgets everything.
- **One bank, fixed format** (`data/sample.csv` has the layout, with made-up data):
  - delimiter `;`, all fields quoted
  - dates `DD.MM.YY`
  - amounts with a decimal comma, e.g. `-950,00`
  - columns: Auftragskonto, Buchungstag, Valutadatum, Buchungstext, Verwendungszweck, Glaeubiger ID, Mandatsreferenz, Kundenreferenz (End-to-End), Sammlerreferenz, Lastschrift Ursprungsbetrag, Auslagenersatz Ruecklastschrift, Beguenstigter/Zahlungspflichtiger, Kontonummer/IBAN, BIC (SWIFT-Code), Betrag, Waehrung, Info
- Encoding: try UTF-8 (strict) first; if the bytes are not valid UTF-8, decode as Windows-1252. (Windows-1252 decoding never fails, so it has to be the fallback, not the first attempt.)
- **Expenses only:** only negative `Betrag` values count. Income (positive amounts) is ignored.
- Internal transfers, savings and similar are **not** excluded; every negative amount is an expense.
- Payee = `Beguenstigter/Zahlungspflichtiger`, purpose = `Verwendungszweck`, date = `Buchungstag`.

## Categorization

- Rules live in `data/mapping.json`, committed to the repo (public).
- Format: an object of `category name → list of keywords`.
- Matching: case-insensitive **whole-word** match against payee and purpose. A keyword matches only if the characters directly before and after it are not letters or digits (or it is at the start/end of the text). So "Dm" matches "DM FIL 1234" but not "Admin". Multi-word and punctuated keywords ("Media Markt", "Wilhelm.tel") are matched literally as a whole.
- Precedence: first matching rule wins (category order in the file, then keyword order).
- No match → fallback category **"Others"**.
- In the UI, the user can assign a category to an unmatched payee. The assignment applies to all transactions of that payee, for the current session only. There is no export of these assignments; making one permanent means editing `mapping.json` by hand.

## Views

- **Global month-range selector** drives the donut, trend and top-payees views. Default: all data in the file.
- **Category donut:** share of each category in the selected range.
- **Category trend (line):** a category's spending per month over the selected range.
- **Top payees / largest transactions:** ranked list or bar chart.
- **Month comparison:** compare expenses between two months, with its own two month pickers. Default: the last two months in the file.

## UI

- German UI text, EUR currency, German number and date formatting.

## Testing

- Vitest for the parser and categorizer (the correctness-critical parts), using `data/sample.csv`.

## Planned work order

1. Vitest setup, CSV parser, categorizer with tests.
2. Upload component and state handling.
3. Charts: donut, trend, top payees, month comparison.
4. GitHub Actions workflow for Pages; `.gitignore` entry for `*.csv` with an exception for the sample.

## Decisions on edge cases

- Keywords inside compound words are not matched (e.g. "Rewe" in "Rewemarkt"). Accepted; add variants to `mapping.json` if needed.
- If a keyword appears in more than one category, the first one in file order wins. No warning.
