import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const representativePrompts = [
  {
    prompt: "what is the newest OpenAI model?",
    expectedSkill: "openai-docs",
    requiredPatterns: [/newest model/i, /OpenAI products, APIs, models, or SDKs/i],
  },
  {
    prompt: "write a small Responses API example in TypeScript",
    expectedSkill: "openai-docs",
    requiredPatterns: [/Responses API/i, /build\/coding requests/i],
  },
  {
    prompt: "help me set up OPENAI_API_KEY for this repo",
    expectedSkill: "openai-platform-api-key",
    requiredPatterns: [/OPENAI_API_KEY/, /Platform API keys/i],
  },
  {
    prompt: "my OpenAI API request returns 401 invalid_api_key",
    expectedSkill: "openai-api-troubleshooting",
    requiredPatterns: [/401/, /invalid_api_key/],
  },
  {
    prompt: "build an Agents SDK workflow with tracing",
    expectedSkill: "agents-sdk",
    requiredPatterns: [/Agents SDK/i, /build, adapt, run, or evaluate/i],
  },
  {
    prompt: "prepare a ChatGPT Apps submission test plan",
    expectedSkill: "chatgpt-app-submission",
    requiredPatterns: [/ChatGPT Apps/i, /test cases/i],
  },
];

function readPluginSkill(skillName) {
  return fs.readFileSync(
    path.join(repoRoot, "skills", skillName, "SKILL.md"),
    "utf8",
  );
}

test("plugin package contains Cursor-loadable components", () => {
  assert.ok(fs.existsSync(path.join(repoRoot, ".cursor-plugin/plugin.json")));
  assert.ok(fs.existsSync(path.join(repoRoot, "mcp.json")));
  assert.ok(fs.existsSync(path.join(repoRoot, "skills/openai-docs/SKILL.md")));
  assert.ok(
    fs.existsSync(
      path.join(repoRoot, "skills/openai-platform-api-key/SKILL.md"),
    ),
  );
});

test("representative prompts are covered by exact Cursor skill trigger language", () => {
  for (const { prompt, expectedSkill, requiredPatterns } of representativePrompts) {
    const skill = readPluginSkill(expectedSkill);

    for (const pattern of requiredPatterns) {
      assert.match(
        skill,
        pattern,
        `${expectedSkill} should cover representative prompt: ${prompt}`,
      );
    }
  }
});
