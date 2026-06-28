# Architecture

## Overview

EstateResolve is built on the Lemma SDK. It uses a pod as the central workspace that holds all data, agents, workflows, and permissions.

```
User (Executor)
     |
     v
+------------------+
|  Dashboard UI    |  Next.js frontend with 3 panels
|  (Ingestion,     |
|   Ledger,        |
|   Action Desk)   |
+------------------+
     |
     v
+------------------+
|  Lemma Pod       |  Local workspace
|  +-------------+ |
|  | Datastores  | |  Estate_Inventory, Action_Queue, Communications_Log
|  +-------------+ |
|  | Doc Store   | |  Markdown memory for uploaded documents
|  +-------------+ |
|  | Agents      | |  Discovery Worker, Execution Worker
|  +-------------+ |
|  | Workflows   | |  Creditor Resolution Workflow
|  +-------------+ |
+------------------+
     |
     v
+------------------+
|  lemmoracle SDK  |  Zero-knowledge proofs for selective disclosure
+------------------+
```

## Data flow

1. User uploads a scanned document (PDF) via the Ingestion panel
2. The file is saved to the pod's Document Store
3. Discovery Worker agent reads the document, extracts key information
4. Discovery Worker creates a row in Estate_Inventory table
5. Execution Worker detects the new liability row
6. Execution Worker drafts a legal notice using templates
7. The drafted notice appears in Action Queue for human review
8. User approves or rejects the action
9. On approval, the system dispatches the communication and logs it
10. On rejection, feedback goes back to the Execution Worker for redrafting

## Tables

### Estate_Inventory
Tracks all discovered assets, liabilities, and expenses during probate.

### Action_Queue
Holds all drafted actions waiting for human approval. Each row links to an Estate_Inventory entry.

### Communications_Log
Append-only log of all sent communications with institutions.

## Agents

### Discovery Worker
Reads uploaded documents and creates structured records in Estate_Inventory.

### Execution Worker
Monitors Estate_Inventory for new liabilities, drafts correspondence, and submits to Action_Queue.

## Workflows

### Creditor Resolution
Triggered when a new liability is discovered. Goes through: draft -> human approve/reject -> execute.
