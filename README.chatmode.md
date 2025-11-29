# Chatmode & MCP (Model Context Protocol)

This repository includes example "chatmode" prompts and a small MCP configuration so you can use conversational agents to help debug, plan, and heal Playwright tests.

- What it is: Chatmode files are written prompts that guide an AI test agent (examples live under `.github/chatmodes/`). MCP (Model Context Protocol) is a lightweight server integration pattern used by editor/assistant tooling to exchange messages with the local test runner and the repo.

Files to inspect:
- `.github/chatmodes/` — ready-made chatmode agent prompts (e.g. `🎭 healer.chatmode.md`) for debugging and healing tests.
- `test.chatmode.md` — example test-plan style chat prompt you can use as an input to a chat agent.
- `.vscode/mcp.json` — a small MCP client configuration that points to a local server command for editor integration.

Quick start (local, minimal):

1. Install dependencies (if not already):

```powershell
cd C:\Playwright-AI-Agent-POM-MCP-Server
npm install
npx playwright install --with-deps
```

2. Start any local demo server you want to exercise (optional):

```powershell
# serve the demo site used by visual tests
node tools/dev-server.js
```

3. Start the Playwright MCP server (used by some editor/assistant integrations):

```powershell
# this matches the command in .vscode/mcp.json
npx playwright run-test-mcp-server
```

Note: `package.json` in this repo contains standard Playwright scripts but may not define an explicit `run-test-mcp-server` script. The `npx` invocation above relies on Playwright's CLI. If you prefer an npm script, add one locally, for example:

```powershell
npm set-script mcp:start "npx playwright run-test-mcp-server"
```

Using chatmodes with an assistant or editor

- Paste `test.chatmode.md` into your LLM chat session as the plan, or open the `.github/chatmodes/*` file in an editor that exposes it to your assistant.
- With the MCP server running, some VS Code extensions (or local agents) can attach to the Playwright process to collect snapshots, run a failing test in debug mode, and return actionable fixes.

Example debugging workflow

1. Run tests to reproduce the failure:

```powershell
npx playwright test tests/wesendcv.spec.ts --project=chromium
```

2. Open the relevant chatmode prompt (e.g. `🎭 healer.chatmode.md`) in your assistant or editor and attach it to the running MCP session. The assistant will:
- Run or debug failing tests
- Capture page snapshots and console/network logs
- Suggest selector fixes or code changes

3. Apply suggested fixes locally, re-run tests, and iterate.

Troubleshooting & tips

- If `npx playwright run-test-mcp-server` isn't available, ensure your `@playwright/test` is a recent version and that Playwright CLI exposes the command for your release. Upgrading Playwright may add this capability.
- If your editor doesn't auto-detect `.vscode/mcp.json`, you can still use chatmode files by copying their contents into any LLM chat session or by using a local agent that accepts markdown prompts.
- Keep sensitive data out of chatmode files. Use placeholders for secrets and provide them via secure environment variables or CI secrets.

This integration pattern is designed to let you combine Playwright's rich diagnostics with AI-driven debugging: use the chatmode prompts as repeatable, documented instructions for the assistant, and use MCP (when available) to let the assistant interact programmatically with tests and the browser.
