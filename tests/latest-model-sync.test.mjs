import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("package and manifest versions stay aligned", () => {
  const packageJson = JSON.parse(read("package.json"));
  const manifest = JSON.parse(read(".cursor-plugin/plugin.json"));

  assert.equal(manifest.version, packageJson.version);
});

test("docs skill routes dynamic model requests through live metadata", () => {
  const skill = read("skills/openai-docs/SKILL.md");

  assert.match(
    skill,
    /https:\/\/developers\.openai\.com\/api\/docs\/guides\/latest-model\.md/,
  );
  assert.match(skill, /latestModelInfo/);
  assert.match(skill, /exact `migrationGuide` and `promptingGuide` paths/);
  assert.match(skill, /Treat the metadata values as opaque/i);
  assert.match(skill, /return bounded uncertainty/i);
});

test("docs skill preserves explicitly named model targets", () => {
  const skill = read("skills/openai-docs/SKILL.md");

  assert.match(
    skill,
    /https:\/\/developers\.openai\.com\/api\/docs\/guides\/latest-model\?model=<requested-model>/,
  );
  assert.match(skill, /latest-model\?model=gpt-5\.6/);
  assert.match(skill, /latest-model\?model=gpt-5\.3-codex/);
  assert.match(skill, /Do not replace the explicit target with the current model/i);
});

test("docs skill has no bundled model guidance or runtime resolver", () => {
  const skillDir = path.join(repoRoot, "skills/openai-docs");
  const skill = read("skills/openai-docs/SKILL.md");

  assert.equal(fs.existsSync(path.join(skillDir, "references")), false);
  assert.equal(fs.existsSync(path.join(skillDir, "scripts")), false);
  assert.doesNotMatch(skill, /model-guidance\?model=/);
  assert.doesNotMatch(skill, /resolve-latest-model-info/);
  assert.match(skill, /never use bundled model guidance as a fallback/i);
  assert.match(skill, /Missing credentials block only the live call/i);
  assert.match(skill, /Leave historical docs, examples, eval baselines, fixtures/i);
  assert.match(skill, /## Validation/);
  assert.doesNotMatch(skill, /load_workspace_dependencies|Codex/);
});
