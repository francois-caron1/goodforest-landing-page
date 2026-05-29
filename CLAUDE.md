# Goodforest Landing Page — Context for Claude Code

## Stack
Static site — plain HTML, CSS, JavaScript. No framework, no build step.
Deployed on Vercel directly from the repo root.

## Project structure
/                          ← repo root
├── insurance/
│   ├── index.html         ← Insurance landing page (goodforest.vercel.app/insurance/)
│   └── (styles likely inline or in a linked CSS file here)
├── monitoring/
│   └── index.html         ← Monitoring landing page
├── assets/                ← Shared assets
├── logos/                 ← Logo files
├── logo.png
├── logo normal.png
├── Heatmap example.png
├── App example.png
└── Dashboard example.png
## Key rule
When modifying the insurance landing page → go directly to insurance/index.html.
Do NOT explore the full repo before acting. Read only the file(s) mentioned in the task.
## CSS
Styles are in insurance/style.css (linked from insurance/index.html).
Always edit insurance/style.css for any style changes.
Never add <style> blocks inside the HTML.

## Workflow
Never launch a local preview server (no `npm run dev`, no `python -m http.server`, 
no `live-server` or equivalent).
Changes are verified directly on the live site after git commit and Vercel deployment.
