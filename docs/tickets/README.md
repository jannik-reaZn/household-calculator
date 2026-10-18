# Tickets

Source of truth for scope: [../spec.md](../spec.md). Work order roughly follows the numbers.

| # | Ticket | Depends on |
|---|---|---|
| 01 | [Set up Vitest](01-vitest-setup.md) | none |
| 02 | [CSV parser for the bank export](02-csv-parser.md) | 01 |
| 03 | [Keyword categorizer](03-categorizer.md) | 01 |
| 04 | [Upload component and app state](04-app-state-upload.md) | 02, 03 |
| 05 | [Global month-range selector](05-month-range-selector.md) | 04 |
| 06 | [Category donut chart](06-category-donut.md) | 04, 05 |
| 07 | [Category trend line chart](07-category-trend.md) | 04, 05 |
| 08 | [Top payees and largest transactions](08-top-payees.md) | 04, 05 |
| 09 | [Month-vs-month comparison](09-month-comparison.md) | 04 |
| 10 | [Assign categories to unmatched payees](10-assign-unmatched-payees.md) | 04 |
| 11 | [GitHub Pages deployment and repo hygiene](11-pages-deploy-and-hygiene.md) | none |
