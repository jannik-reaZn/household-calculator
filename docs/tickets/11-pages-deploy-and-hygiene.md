# 11 — GitHub Pages deployment and repo hygiene

**Depends on:** none

## Description

Publish the static frontend and make sure no real bank data can be committed.

## Acceptance criteria

- [ ] GitHub Actions workflow builds the frontend and deploys it to GitHub Pages; correct Vite `base` for the repo path
- [ ] Build does not need the backend; check `pnpm build` (it currently runs `gen:api`) works in CI and adjust if needed
- [ ] `.gitignore` ignores `*.csv` with an exception for `data/sample.csv`
- [ ] No analytics or third-party scripts in `index.html`
- [ ] Short README note: data never leaves the browser
