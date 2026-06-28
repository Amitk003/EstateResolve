# Architecture

## Overview

EstateResolve is a local-first workspace for estate settlement. It uses AI agents to help executors manage the probate process. The system is built on the Lemma SDK and runs completely on your machine.

## System diagram

```
Executor uses the Dashboard (Next.js UI)
          |
          v
+---------------------------+
|    Dashboard UI           |
|  - Ingestion Dropzone     |  Upload scanned documents
|  - Estate Ledger          |  View assets and liabilities
|  - Action Desk            |  Approve or reject actions
+---------------------------+
          |
          v
+---------------------------+
|    Lemma Pod              |
|  - Datastores (tables)    |  Estate_Inventory, Action_Queue, Communications_Log
|  - Document Store (files) |  Uploaded PDFs, templates, knowledge base
|  - Agents                 |  Discovery Worker, Execution Worker
|  - Workflows              |  Creditor Resolution Workflow
|  - Functions              |  dispatch_communication, update_entity_status, etc.
+---------------------------+
          |
          v
+---------------------------+
|    lemmoracle SDK         |  Zero-knowledge proofs for selective disclosure
+---------------------------+
```

## How it works step by step

### Step 1: Upload documents

The executor uploads scanned documents (bank statements, bills, legal papers) through the Ingestion Dropzone. Files are saved to the pod's Document Store under /documents.

### Step 2: Discovery Worker reads documents

The Discovery Worker agent watches for new files in the /documents folder. When a new document appears, the agent:
1. Reads the document content
2. Identifies what type of document it is (bank statement, credit card bill, etc.)
3. Decides if it is an Asset, Liability, or Expense
4. Creates a new row in the Estate_Inventory table with the details
5. Links back to the original source document

### Step 3: Execution Worker drafts actions

The Execution Worker agent watches the Estate_Inventory table for new entries. When a new Liability is found, the agent:
1. Reads the entry details from the table
2. Fetches the correct legal template from /templates
3. Fills in the template with the specific details
4. Creates a new row in Action_Queue with status "Pending"

### Step 4: Human reviews and approves

The action appears in the Action Desk panel on the dashboard. The executor can:
1. Read the drafted correspondence
2. View the original source document
3. Click "Approve" to dispatch the communication
4. Click "Reject" to send it back for redrafting with feedback

### Step 5: Communication is dispatched

On approval, the system:
1. Updates the Action_Queue entry status to "Executed"
2. Creates a log entry in Communications_Log
3. Updates the Estate_Inventory entry status to "Notified"

On rejection, the system:
1. Records the feedback
2. Sends the entry back for redrafting
3. Keeps the Estate_Inventory entry status as "Discovered"

## Data model

### Estate_Inventory table

| Field | Type | Purpose |
|-------|------|---------|
| classification | Enum | Asset, Liability, or Expense |
| institution_name | Text | Bank or company name |
| account_number | Text | Account reference number |
| estimated_value | Float | Monetary value |
| resolution_status | Enum | Discovered, Notified, In Progress, Resolved, Closed |
| source_doc_path | File Path | Link to uploaded document |
| description | Text | Notes about this entry |
| date_discovered | DateTime | When it was logged |

### Action_Queue table

| Field | Type | Purpose |
|-------|------|---------|
| related_entity_id | UUID (FK) | Links to Estate_Inventory |
| action_type | Enum | Close Account, Notify Creditor, etc. |
| draft_payload | JSON | Drafted correspondence |
| human_approval_status | Enum | Pending, Approved, Rejected, Executed |
| execution_timestamp | DateTime | When action was completed |
| feedback | Text | Human rejection feedback |

### Communications_Log table

| Field | Type | Purpose |
|-------|------|---------|
| direction | Enum | Outgoing or Incoming |
| institution | Text | Institution name |
| subject | Text | Communication subject |
| body | Text | Full message body |
| delivery_status | Enum | Drafted, Sent, Delivered, Failed |
| related_task_id | UUID (FK) | Links to Action_Queue |
| zk_proof_ref | Text | Reference to ZK proof |

## Agents

### Discovery Worker

Role: Reads uploaded documents and creates structured records.

Permissions:
- Read access to /documents folder
- Read access to /knowledge folder
- Write access to Estate_Inventory table
- No access to Action_Queue or Communications_Log

### Execution Worker

Role: Drafts legal correspondence and manages approval workflow.

Permissions:
- Read access to Estate_Inventory table
- Read access to /templates folder
- Read/Write access to Action_Queue table
- Read/Write access to Communications_Log table
- No access to uploaded documents

## Workflows

### Creditor Resolution Workflow

Trigger: A new row is inserted into Estate_Inventory.

Steps:
1. Check if the new entry is a Liability
2. If yes, run the Execution Worker to draft a notice
3. Pause and wait for human approval
4. If approved, dispatch the communication and log it
5. If rejected, record feedback and loop back to redraft

## ZK Proofs (Zero-Knowledge)

### What problem it solves

When the executor needs to prove to a bank that the account holder has died, they currently have to send a physical copy of the death certificate. This exposes private information like the deceased's SSN and cause of death.

### How EstateResolve handles it

1. **Issue**: A probate court issues a Verifiable Credential for the death certificate. Raw data is hashed and signed using BBS+ signatures.

2. **Prove**: When the Execution Worker needs to send a closure request to a bank, it does not attach a raw death certificate. Instead, it generates a selective disclosure proof that reveals only:
   - Legal name (required)
   - Date of death (required)
   - Executor authorization status (required)
   
   The SSN, date of birth, and cause of death remain hidden.

3. **Verify**: The bank receives the selectively disclosed attributes along with a ZK proof that guarantees the data is authentic and untampered.

## Frontend

The dashboard is built with Next.js and TypeScript, using the Lemma TypeScript SDK.

### Panels

1. **Ingestion Dropzone**: Drag-and-drop area for uploading documents. Shows upload status for each file.

2. **Estate Ledger**: Sorted data table of all discovered assets and liabilities. Supports filtering by type and sorting by columns.

3. **Action Desk**: Approval queue showing drafted actions. Each card shows the action type, institution, draft body, and Approve/Reject buttons.

### Lemma SDK hooks used

- useRecords: To fetch data from Estate_Inventory and Action_Queue tables
- useUpdateRecord: To update action approval status
- LemmaClient: For file uploads and other API operations
