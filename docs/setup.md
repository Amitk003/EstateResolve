# Setup

## Prerequisites

- Docker Desktop (for running Lemma stack locally)
- Node.js v18+ and npm
- Git
- Lemma CLI

## Install Lemma stack

1. Open PowerShell as Administrator
2. Run the installer:
   ```
   iwr https://raw.githubusercontent.com/lemma-work/lemma-platform/main/install.ps1 | iex
   ```
3. This installs lemma-stack and starts the app at http://127-0-0-1.sslip.io:3711

## Set up the project

1. Clone the repo:
   ```
   git clone https://github.com/Amitk003/EstateResolve.git
   cd EstateResolve
   ```

2. Import the pod:
   ```
   lemma auth login
   lemma pod import ./pod
   ```

3. Start the daemon:
   ```
   lemma daemon start
   ```

4. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

5. Run the frontend:
   ```
   npm run dev
   ```

## Configure model provider

Edit `~/.lemma/local/config.toml` to set your API key:

```
[backend.env]
LEMMA_DEFAULT_MODEL_TYPE = "anthropic_compat"
LEMMA_ANTHROPIC_API_KEY = "sk-ant-..."
```

Then restart:
```
lemma-stack restart
```
