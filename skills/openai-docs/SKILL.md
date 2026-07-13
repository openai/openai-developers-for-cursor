---
name: openai-docs
description: Use whenever the user asks anything about OpenAI products, APIs, models, or SDKs — including factual lookups ("what is the newest model", "does X support Y"), build/coding requests ("write a script using the Responses API"), latest/current/default-model prompting guidance, model migrations, and citation requests. Invoke before calling any openaiDeveloperDocs MCP tool.
---

# OpenAI Docs

Use the Cursor-configured OpenAI Docs MCP server at `https://developers.openai.com/mcp?source=cursor` first for current OpenAI developer guidance.

## API key setup

For requests that require a live OpenAI API call, use `openai-platform-api-key` first when available. Missing credentials block only the live call. They do not block requested source or configuration edits, documentation retrieval, or offline, mocked, static, fixture-based, or syntax validation.

Complete read-only documentation retrieval before any live-call credential check. Continue with requested source edits and offline validation when no API key is available; skip only validation that actually sends a live API request, and say that it was skipped.

## Model guidance routing

Classify the model request before inspecting the project or checking credentials:

- **Dynamic target:** For latest, current, newest, recommended, default, flagship, or otherwise unspecified model selection, prompting, or migration, fetch `https://developers.openai.com/api/docs/guides/latest-model.md`. Read its `latestModelInfo` metadata. For migrations or prompting guidance, resolve the exact `migrationGuide` and `promptingGuide` paths against `https://developers.openai.com` and fetch those exact URLs. Treat the metadata values as opaque; do not derive or substitute another route.
- **Explicit target:** Preserve the requested model and fetch `https://developers.openai.com/api/docs/guides/latest-model?model=<requested-model>`. For example, use `https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6` for GPT-5.6 and `https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.3-codex` for `gpt-5.3-codex`. Do not replace the explicit target with the current model.

If an exact URL is unavailable or lacks substantive content, retry it once through Docs MCP, then run a compact Docs MCP search for that exact model or page. If necessary, fall back only to official OpenAI domains such as `developers.openai.com` and `platform.openai.com`.

If current-model metadata or an explicit model guide still cannot be retrieved, say what could not be verified and return bounded uncertainty. Do not infer current model facts, migration steps, limits, pricing, availability, parameters, or capabilities from static knowledge.

## General workflow

1. Use the OpenAI Docs MCP tools exposed by the configured `openaiDeveloperDocs` server.
2. Start general lookup with a compact, title-like search query of 2-6 essential terms. If search is noisy, narrow it.
3. When a plausible official docs URL is known, fetch it through Docs MCP before web fallback.
4. For API schemas, parameters, or required fields, use `get_openapi_spec` when available alongside the guide.
5. Use `list_openai_docs` only when no clear query or URL exists.
6. Fetch the exact page or section needed before answering.
7. Cite retrieved official sources for links, quotes, and precise claims.

## Migration rules

- Keep upgrades behavior-preserving. Update active OpenAI model defaults, directly related prompts, and only the registries, routing, pricing, capability, or picker surfaces the user placed in scope.
- Preserve multi-model cost, latency, and quality roles. Do not collapse a router or picker into one flagship model.
- Leave historical docs, examples, eval baselines, fixtures, provider comparisons, intentionally pinned fallbacks, and ambiguous older usage unchanged unless explicitly requested.
- Keep SDK, tooling, IDE, plugin, shell, auth, and provider-environment migrations out of a model-and-prompt upgrade unless explicitly requested.
- If a safe change requires endpoint or schema rewiring, tool-handler changes, state changes, or another compatibility migration outside scope, report the exact blocker or ask for confirmation.

## Validation

After changes, run targeted tests for changed behavior and the most relevant type, lint, build, or smoke checks available. For model migrations, verify every active default surface in scope and exercise representative requests or evals. If validation cannot run, state why and name the next best check.

## Rules

- Treat live OpenAI documentation as the source of truth; never use bundled model guidance as a fallback.
- Preserve explicit model targets.
- Prefer concise summaries over long excerpts.
- If sources conflict, state the difference. If evidence is missing, narrow the answer instead of guessing.
