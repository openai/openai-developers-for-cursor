---
name: openai-docs
description: Use whenever the user asks anything about OpenAI products, APIs, models, or SDKs — including factual lookups ("what is the newest model", "does X support Y"), build/coding requests ("write a script using the Responses API"), latest/current/default-model prompting guidance, model migrations, and citation requests. Invoke before calling any openaiDeveloperDocs MCP tool.
---

# OpenAI Docs

Use the Cursor-configured OpenAI Docs MCP server at `https://developers.openai.com/mcp` first for current OpenAI developer guidance. This skill owns model selection, model migration, and prompt-upgrade guidance as well as general documentation lookup.

## API key setup

For requests to build, run, configure, debug, or implement an API-backed app, use `openai-platform-api-key` before implementation. Docs-only questions do not need that gate.

For latest/current/default/unspecified model migration or prompting requests, complete the read-only resolver and guide fetch before the credential gate. The credential gate blocks implementation, not current-guidance retrieval.

## First action for latest-model work

Before inspecting the project, fetching docs, or checking credentials, classify the request:

- **Latest/current prompting guidance, or a requested change with a latest/current/newest/recommended/default/flagship/unspecified target:** immediately run the resolver and inspect its JSON. This includes changing prompts, model pickers, model references, or SDK integrations and asking which model to migrate to. Do not directly fetch `latest-model.md` first.
- **Pure model-selection question with no requested change or prompting guidance:** fetch `https://developers.openai.com/api/docs/guides/latest-model.md` directly. Do not run the resolver.
- **Requested change with an explicit target model:** preserve that target and do not run the resolver. For GPT-5.6 Sol or a GPT-5.6-family migration, fetch the live GPT-5.6 model-guidance page and read `references/upgrading-to-gpt-5p6-sol.md`.
- **Prompting or migration guidance for an explicitly named GPT-5-family model:** fetch `https://developers.openai.com/api/docs/guides/model-guidance?model=<requested-model>` and extract the relevant migration section or `## Prompting Best Practices` through the next H2. Do not substitute latest-model guidance.

Run the resolver without relying on executable bits:

- POSIX: `sh <skill-dir>/scripts/resolve-latest-model-info`
- Windows: `node <skill-dir>\scripts\resolve-latest-model-info.cjs` with Node.js 18 or newer.

Do not suppress or redirect resolver stdout. Success requires JSON containing `model`, `migrationGuideUrl`, and `promptingGuideUrl`. If any field is absent, run it once more before falling back.

If no compatible Node.js runtime is available, fetch `latest-model.md` through Docs MCP, read its `latestModelInfo` block, resolve the listed migration and prompting paths against `https://developers.openai.com`, and continue with those exact URLs. Use bundled static references only if that live metadata fallback also fails, and disclose the fallback.

## Source priority

1. Use the OpenAI Docs MCP tools exposed by the configured `openaiDeveloperDocs` server.
2. Start general lookup with a compact, title-like search query of 2-6 essential terms. If search is noisy, narrow it.
3. When a plausible official docs URL is known, fetch it through Docs MCP before web fallback.
4. For API schemas, parameters, or required fields, use `get_openapi_spec` when available alongside the guide.
5. Use `list_openai_docs` only when no clear query or URL exists.
6. For docs-only model selection, fetch `https://developers.openai.com/api/docs/guides/latest-model.md`; if unavailable, use `references/latest-model.md` and disclose the fallback.
7. For latest/current/default prompting or migrations, run the resolver first; if its runtime is unavailable, use the live `latestModelInfo` metadata fallback above.
8. Preserve explicit targets even when current docs name a newer model. Mention newer guidance only as optional.
9. Treat the resolver's migration and prompting URLs as opaque. Fetch those exact URLs; do not derive, substitute, or append a model query.
10. If a prompting URL resolves to a combined model-guidance page, extract only `## Prompting Best Practices` through the next H2.
11. If a fetched guide contains only a title or no substantive body, retry the exact markdown URL through MCP/search. If that fails, use the matching bundled reference and disclose the fallback.
12. If Docs MCP is unavailable or unhelpful, use web search only on official OpenAI domains such as `developers.openai.com` and `platform.openai.com`.

## Migration rules

- Prefer current remote guidance over bundled references.
- Keep upgrades behavior-preserving. Update active OpenAI model defaults, directly related prompts, and only the registries, routing, pricing, capability, or picker surfaces the user placed in scope.
- Preserve multi-model cost, latency, and quality roles. Do not collapse a router or picker into one flagship model.
- Leave historical docs, examples, eval baselines, fixtures, provider comparisons, intentionally pinned fallbacks, and ambiguous older usage unchanged unless explicitly requested.
- Keep SDK, tooling, IDE, plugin, shell, auth, and provider-environment migrations out of a model-and-prompt upgrade unless explicitly requested.
- Do not invent pricing, limits, availability, parameters, API changes, or capability flags.
- If a safe change requires endpoint/schema rewiring, tool-handler changes, state changes, or another compatibility migration outside scope, report the exact blocker or ask for confirmation.

## Validation

After changes, run targeted tests for changed behavior and the most relevant type, lint, build, or smoke checks available. For model migrations, verify every active default surface in scope and exercise representative requests or evals. If validation cannot run, state why and name the next best check.

## Reference map

- `references/latest-model.md` — bundled fallback for current model selection.
- `references/upgrade-guide.md` — routing fallback for model upgrades.
- `references/upgrading-to-gpt-5p6-sol.md` — GPT-5.6 migration judgment, compatibility gates, and validation.
- `references/prompting-guide.md` — GPT-5.6 prompting fallback and live-section extraction contract.

## Rules

- Treat OpenAI docs as the source of truth.
- Fetch the exact page or section needed before answering.
- Cite retrieved official sources for links, quotes, and precise claims.
- Prefer concise summaries over long excerpts.
- If sources conflict, state the difference. If evidence is missing, narrow the answer instead of guessing.
