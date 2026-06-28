# Development Log

## 2026-06-28 - Project setup

- Initialized git repo and created feature/init-project branch
- Set up project skeleton with docs and logs directories
- TODO: Install Docker Desktop and Lemma stack
- TODO: Create pod definition files (tables, agents, workflows)

## 2026-06-28 - ZK Proofs

- Created branch: feature/zk-proofs (from main)
- Created issue_credential function:
  - Generates W3C Verifiable Credential for death certificates
  - Uses BBS+ signature format for selective disclosure
  - Marks sensitive fields (SSN, cause of death) as non-revealed by default
- Created generate_zk_proof function:
  - Generates selective disclosure proofs for specific attributes
  - Reveals only legal_name, date_of_death, and executor_authorization to institutions
  - Keeps SSN and cause of death hidden via ZK proof commitment
  - Creates Communication_Log entry with reference to the ZK proof
- Both functions mirror the @lemmaoracle/sdk API patterns
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
## 2026-06-28 - Workflow

- Created branch: feature/workflow (from main)
- Created Creditor Resolution Workflow:
  - Start type: DATASTORE_EVENT (triggered on INSERT to Estate_Inventory)
  - Step 1 (DECISION): Classify if the new entry is a Liability
  - Step 2 (AGENT): Run execution_worker to draft legal correspondence
  - Step 3 (FORM): Human approval step - pause workflow, wait for approve/reject
  - Step 4 (DECISION): Route based on approval decision
  - Step 5a (FUNCTION): dispatch_communication - send the approved notice and log it
  - Step 5b (FUNCTION): handle_rejection - record feedback, loop back to redraft
- Created dispatch_communication function: updates Action_Queue status and creates Communications_Log entry
- Created update_entity_status function: updates Estate_Inventory resolution_status
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
## 2026-06-28 - Datastore schemas

- Created branch: feature/datastore-schemas (from main)
- Defined 3 core tables:
  - Estate_Inventory: classification, institution_name, account_number, estimated_value, resolution_status, source_doc_path, description, date_discovered
  - Action_Queue: related_entity_id (FK to Estate_Inventory), action_type, draft_payload, human_approval_status, execution_timestamp, feedback
  - Communications_Log: direction, institution, subject, body, delivery_status, related_task_id (FK to Action_Queue), zk_proof_ref
- All tables use enable_rls: true (row-level security per executor)
- Foreign keys established between tables for relational integrity
## 2026-06-28 - Document store

- Created branch: feature/document-store (from main)
- Set up file folder structure: documents/, templates/, knowledge/
- Created folder metadata (.folder.json) for each directory
- Created document templates:
  - notice_of_death.md - template for notifying institutions of death and requesting account closure
  - creditor_notification.md - template for notifying creditors
  - probate_guidelines.md - knowledge base with executor instructions
