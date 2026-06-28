# Development Log

## 2026-06-28 - Project setup

- Initialized git repo and created feature/init-project branch
- Set up project skeleton with docs and logs directories
- TODO: Install Docker Desktop and Lemma stack
- TODO: Create pod definition files (tables, agents, workflows)

## 2026-06-28 - Datastore schemas

- Created branch: feature/datastore-schemas (from main)
- Defined 3 core tables:
  - Estate_Inventory: classification, institution_name, account_number, estimated_value, resolution_status, source_doc_path, description, date_discovered
  - Action_Queue: related_entity_id (FK to Estate_Inventory), action_type, draft_payload, human_approval_status, execution_timestamp, feedback
  - Communications_Log: direction, institution, subject, body, delivery_status, related_task_id (FK to Action_Queue), zk_proof_ref
- All tables use enable_rls: true (row-level security per executor)
- Foreign keys established between tables for relational integrity
