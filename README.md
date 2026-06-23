# OpenAI Developers Plugin for Cursor

This plugin is the Cursor-facing bundle for OpenAI developer workflows. It pairs the public OpenAI Docs MCP server with Cursor-native skills so users can build AI applications, agents, and ChatGPT Apps from Cursor.

## What Is Included

- `.cursor-plugin/plugin.json` declares the `OpenAI Developers` Cursor plugin and logo.
- `mcp.json` configures the public OpenAI Docs MCP server.
- `skills/openai-docs/` routes OpenAI product, API, model, and SDK questions through OpenAI documentation.
- `skills/openai-platform-api-key/` guides local `OPENAI_API_KEY` setup for API-backed work.
- `skills/openai-api-troubleshooting/` classifies common runtime API failures and routes users to the right next step.
- `skills/agents-sdk/` helps plan and build Agents SDK applications.
- `skills/build-chatgpt-app/` helps design and implement ChatGPT Apps SDK projects.
- `skills/chatgpt-app-submission/` prepares submission-oriented ChatGPT Apps guidance.
- `assets/openai-platform.png` provides the plugin logo.

## Install

Install from GitHub in Cursor:

```text
/add-plugin https://github.com/openai/openai-developers-for-cursor.git
```

## Verify

After installation, ask Cursor Agent:

1. `what is the newest OpenAI model?`
2. `write a small Responses API example`
3. `help me set up OPENAI_API_KEY for this repo`

The docs questions should use the OpenAI Docs MCP server. API-backed work requires a locally configured `OPENAI_API_KEY`; this plugin cannot create or retrieve API keys automatically.

## Local Validation

```bash
npm test
```

## License

This project is licensed under the [Apache License 2.0](LICENSE).
