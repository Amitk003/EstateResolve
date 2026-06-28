# Development Log

## 2026-06-28 - Project setup

- Initialized git repo and created feature/init-project branch
- Set up project skeleton with docs and logs directories
- TODO: Install Docker Desktop and Lemma stack
- TODO: Create pod definition files (tables, agents, workflows)

## 2026-06-28 - Agents

- Created branch: feature/agents (from main)
- Created Discovery Worker agent:
  - Reads uploaded documents from /documents folder
  - Extracts asset/liability/expense information
  - Creates records in Estate_Inventory table
  - Scoped to folder.read on /documents and /knowledge
  - Write access to Estate_Inventory only
- Created Execution Worker agent:
  - Monitors Estate_Inventory for new discovered entries
  - Drafts legal correspondence using /templates
  - Creates entries in Action_Queue for human approval
  - Logs executed communications in Communications_Log
  - No access to raw documents (separation of concerns)
