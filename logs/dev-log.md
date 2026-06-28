# Development Log

## 2026-06-28 - Project setup

- Initialized git repo and created feature/init-project branch
- Set up project skeleton with docs and logs directories
- TODO: Install Docker Desktop and Lemma stack
- TODO: Create pod definition files (tables, agents, workflows)

## 2026-06-28 - Dashboard UI

- Created branch: feature/dashboard-ui (from main)
- Scaffolded Next.js app with TypeScript and Tailwind in frontend/
- Installed lemma-sdk and @tanstack/react-query
- Created Lemma client utility (lib/lemma-client.ts)
- Created React Query provider wrapper (lib/providers.tsx)
- Built 3 core dashboard panels as client components:
  - IngestionDropzone: drag-and-drop file upload area with status tracking
  - EstateLedger: sortable/filterable data table for Estate_Inventory with classification badges
  - ActionDesk: approval queue with approve/reject buttons and draft preview
- Dashboard layout features 3-column design (sidebar + ledger + action desk)
- Clean, minimal design without em dashes or emojis
- Build verified successful with Next.js 16.2.9
