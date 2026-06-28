# User Guide

## Getting started

1. Make sure Docker Desktop is running on your machine
2. Start the Lemma stack: `lemma-stack start`
3. Open the dashboard in your browser: http://localhost:3000
4. The top-right corner shows a green dot when connected to the pod

## Uploading documents

1. Go to the left panel labeled "Document Ingestion"
2. Drag and drop scanned documents (PDF, images, or text files) into the drop zone
3. You can also click the drop zone to browse and select files
4. Each file shows its upload status:
   - Uploading: file is being sent to the pod
   - Processing: the Discovery Worker is reading the document
   - Done: document has been processed

## Viewing the estate ledger

1. The middle panel shows the "Estate Ledger" table
2. All discovered assets, liabilities, and expenses appear here
3. Use the filter dropdown to show only Assets, Liabilities, or Expenses
4. Click column headers to sort by that column
5. Each entry shows:
   - Type badge (Asset = green, Liability = red, Expense = amber)
   - Institution name
   - Account number
   - Estimated value
   - Resolution status badge

## Approving or rejecting actions

1. The right panel shows the "Action Desk"
2. Each card shows a drafted action from the Execution Worker
3. Read the drafted correspondence in the preview area
4. Click "Approve" to execute the action
5. Click "Reject" to send it back for redrafting
6. Approved actions move to "Executed" status
7. Rejected actions show a feedback message

## Understanding statuses

### Resolution statuses for estate entries

- Discovered: Newly found, no action taken yet
- Notified: Institution has been contacted
- In Progress: Action is being taken
- Resolved: Issue has been resolved
- Closed: Entry is complete

### Approval statuses for actions

- Pending: Waiting for human approval
- Approved: Human approved, action will execute
- Rejected: Human rejected, sent back for redrafting
- Executed: Action has been completed

## Privacy and security

- All data stays on your machine. Nothing is sent to cloud servers.
- The Lemma pod runs locally via Docker.
- When you approve a communication to a bank, the system sends a zero-knowledge proof instead of the full death certificate.
- The ZK proof reveals only the minimum information needed: name, date of death, and executor authorization.
- The deceased's SSN, cause of death, and other sensitive details remain hidden.
