# EstateResolve

EstateResolve is a local-first workspace for managing estate settlement and probate execution. It uses AI agents to help executors discover assets, track liabilities, draft correspondence, and manage approvals.

## What it does

- Upload scanned documents (bills, statements, legal papers)
- AI agents read documents and build a structured ledger of assets and liabilities
- AI agents draft legal correspondence to notify institutions
- Human review and approve every action before anything is sent
- Zero-knowledge proofs selectively share only required information with third parties

## Tech stack

- Lemma SDK (datastores, document stores, agents, workflows)
- Python (backend functions)
- Next.js + TypeScript (frontend dashboard)
- lemmoracle SDK (zero-knowledge proofs)

## Project structure

```
estateresolve/
  pod/              # Lemma pod definition files
  frontend/         # Next.js dashboard application
  functions/        # Python functions for the pod
  docs/             # Documentation
  logs/             # Development logs
```

## Getting started

See [docs/setup.md](docs/setup.md) for setup instructions.
