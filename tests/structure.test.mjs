import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

test("Cursor package uses first-class plugin layout", () => {
  assert.ok(fs.existsSync(path.join(repoRoot, ".cursor-plugin/plugin.json")));
  assert.ok(fs.existsSync(path.join(repoRoot, "mcp.json")));
  assert.ok(fs.existsSync(path.join(repoRoot, "skills")));
  assert.ok(fs.existsSync(path.join(repoRoot, "assets/openai-platform.png")));
  assert.ok(!fs.existsSync(path.join(repoRoot, ".cursor")));
  assert.ok(!fs.existsSync(path.join(repoRoot, ".claude-plugin")));
  assert.ok(!fs.existsSync(path.join(repoRoot, "plugins/openai-developers")));
});

test("public release includes licensing and security policy files", () => {
  assert.ok(fs.existsSync(path.join(repoRoot, "LICENSE")));
  assert.ok(fs.existsSync(path.join(repoRoot, "SECURITY.md")));
  const license = fs.readFileSync(path.join(repoRoot, "LICENSE"), "utf8");
  assert.match(license, /Copyright \[yyyy\] \[name of copyright owner\]/);
  assert.doesNotMatch(license, /Copyright \d{4} OpenAI/);
});

test("plugin manifest exposes OpenAI Developers components", () => {
  const plugin = readJson(".cursor-plugin/plugin.json");

  assert.equal(plugin.name, "openai-developers");
  assert.equal(plugin.displayName, "OpenAI Developers");
  assert.equal(plugin.logo, "assets/openai-platform.png");
  assert.equal(
    plugin.repository,
    "https://github.com/openai/openai-developers-for-cursor",
  );
  assert.equal(plugin.skills, "./skills/");
  assert.equal(plugin.mcpServers, "./mcp.json");
});

test("local API key files are ignored by default", () => {
  const gitignore = read(".gitignore");

  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^\.env\.\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
});

test("all expected OpenAI developer skills are present", () => {
  const expected = [
    "skills/openai-docs/SKILL.md",
    "skills/openai-platform-api-key/SKILL.md",
    "skills/openai-api-troubleshooting/SKILL.md",
    "skills/agents-sdk/SKILL.md",
    "skills/build-chatgpt-app/SKILL.md",
    "skills/chatgpt-app-submission/SKILL.md",
  ];

  for (const relativePath of expected) {
    assert.ok(
      fs.existsSync(path.join(repoRoot, relativePath)),
      `${relativePath} should exist`,
    );
  }
});

test("all skills declare Cursor-required name frontmatter", () => {
  const skillNames = [
    "openai-docs",
    "openai-platform-api-key",
    "openai-api-troubleshooting",
    "agents-sdk",
    "build-chatgpt-app",
    "chatgpt-app-submission",
  ];

  for (const skillName of skillNames) {
    const skill = read(`skills/${skillName}/SKILL.md`);
    assert.match(skill, new RegExp(`^---\\nname: ${skillName}\\n`));
  }
});

test("Cursor MCP config points at the public OpenAI Docs MCP server", () => {
  const mcp = readJson("mcp.json");

  assert.deepEqual(mcp, {
    mcpServers: {
      openaiDeveloperDocs: {
        type: "http",
        url: "https://developers.openai.com/mcp",
      },
    },
  });
});
