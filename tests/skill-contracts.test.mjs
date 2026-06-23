import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("docs skill strongly routes OpenAI questions through Docs MCP", () => {
  const skill = read("skills/openai-docs/SKILL.md");

  assert.match(skill, /OpenAI products, APIs, models, or SDKs/i);
  assert.match(skill, /newest model/i);
  assert.match(skill, /Responses API/i);
  assert.match(skill, /https:\/\/developers\.openai\.com\/mcp/);
  assert.match(skill, /openaiDeveloperDocs/);
  assert.match(skill, /official OpenAI domains/i);
});

test("API key skill uses guided local setup only", () => {
  const skill = read("skills/openai-platform-api-key/SKILL.md");

  assert.match(skill, /OPENAI_API_KEY/);
  assert.match(skill, /sk-proj/);
  assert.match(skill, /provider-unspecified AI app/i);
  assert.match(skill, /requests phrased only as "using AI"/i);
  assert.match(skill, /credential gate/i);
  assert.match(skill, /\.env\.local/);
  assert.match(skill, /reuse an existing key/i);
  assert.match(
    skill,
    /if no usable key exists, ask whether they want to create one manually before building the rest of the app/i,
  );
  assert.match(skill, /After sending the credential decision message, stop until the user answers/i);
  assert.match(skill, /do not create directories, scaffold files, draft implementation plans/i);
  assert.match(
    skill,
    /https:\/\/platform\.openai\.com\/settings\/organization\/api-keys/,
  );
  assert.match(skill, /verify/i);
  assert.doesNotMatch(skill, /create_encrypted_openai_api_key/);
  assert.match(skill, /Never claim .* mint or retrieve keys automatically/i);
  assert.match(skill, /Never inspect credentials with commands that can print secret values/i);
});

test("troubleshooting skill classifies concrete OpenAI API failures", () => {
  const skill = read("skills/openai-api-troubleshooting/SKILL.md");

  assert.match(skill, /blocked access to api\.openai\.com/i);
  assert.match(skill, /401 invalid_api_key/i);
  assert.match(skill, /429 insufficient_quota/i);
  assert.match(skill, /429 rate_limit_exceeded/i);
  assert.match(skill, /403 model_not_found/i);
  assert.match(skill, /billing/);
  assert.match(skill, /limits/);
  assert.match(skill, /do not stop at generic "create a fresh key" advice/i);
});

test("ChatGPT Apps submission skill has import-file output contract", () => {
  const skill = read("skills/chatgpt-app-submission/SKILL.md");

  assert.match(skill, /chatgpt-app-submission\.json/);
  assert.match(skill, /positive and negative test cases/i);
  assert.match(skill, /readOnlyHint/);
  assert.match(skill, /openWorldHint/);
  assert.match(skill, /destructiveHint/);
  assert.match(skill, /outputSchema warnings/i);
  assert.match(skill, /Sensitive data solicitation/i);
});

test("implementation skills defer to the credential gate before API-backed work", () => {
  const files = [
    "skills/agents-sdk/SKILL.md",
    "skills/build-chatgpt-app/SKILL.md",
  ];

  for (const relativePath of files) {
    const skill = read(relativePath);
    assert.match(skill, /openai-platform-api-key/);
    assert.match(skill, /before/i);
  }
});

test("README documents GitHub installation, verification, plugin contents, and local validation", () => {
  const readme = read("README.md");

  assert.match(readme, /This plugin is the Cursor-facing bundle for OpenAI developer workflows/);
  assert.match(readme, /\.cursor-plugin\/plugin\.json/);
  assert.match(readme, /skills\/openai-docs/);
  assert.match(readme, /Install from GitHub in Cursor/);
  assert.match(readme, /\/add-plugin https:\/\/github\.com\/openai\/openai-developers-for-cursor\.git/);
  assert.match(readme, /^## Verify$/m);
  assert.match(readme, /what is the newest OpenAI model\?/);
  assert.match(readme, /OPENAI_API_KEY/);
  assert.match(readme, /npm test/);
});

test("Cursor package does not leak Claude or Codex-specific language", () => {
  const files = [
    "README.md",
    "skills/openai-docs/SKILL.md",
    "skills/openai-platform-api-key/SKILL.md",
    "skills/openai-api-troubleshooting/SKILL.md",
    "skills/agents-sdk/SKILL.md",
    "skills/build-chatgpt-app/SKILL.md",
    "skills/chatgpt-app-submission/SKILL.md",
  ];

  for (const relativePath of files) {
    const contents = read(relativePath);
    assert.doesNotMatch(contents, /Claude Code|Codex/);
  }
});
