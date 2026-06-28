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
