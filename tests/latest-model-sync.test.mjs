import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsSkillDir = path.join(repoRoot, "skills/openai-docs");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("package and manifest versions stay aligned", () => {
  const packageJson = JSON.parse(read("package.json"));
  const manifest = JSON.parse(read(".cursor-plugin/plugin.json"));

  assert.equal(packageJson.version, "0.2.0");
  assert.equal(manifest.version, packageJson.version);
});

test("docs skill ships current-model resolver and fallback references", () => {
  const expected = [
    "skills/openai-docs/scripts/resolve-latest-model-info",
    "skills/openai-docs/scripts/resolve-latest-model-info.cjs",
    "skills/openai-docs/references/prompting-guide.md",
    "skills/openai-docs/references/upgrade-guide.md",
    "skills/openai-docs/references/upgrading-to-gpt-5p6-sol.md",
  ];

  for (const relativePath of expected) {
    assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), relativePath);
  }

  const skill = read("skills/openai-docs/SKILL.md");
  assert.match(skill, /First action for latest-model work/i);
  assert.match(skill, /Pure model-selection question/i);
  assert.match(skill, /preserve that target/i);
  assert.match(skill, /Treat the resolver's migration and prompting URLs as opaque/i);
  assert.match(skill, /only a title or no substantive body/i);
  assert.match(skill, /If no compatible Node\.js runtime is available/i);
  assert.match(skill, /latestModelInfo/);
  assert.match(skill, /return bounded uncertainty/i);
  assert.match(skill, /Do not infer the latest model from bundled static data/i);
  assert.doesNotMatch(skill, /references\/latest-model\.md/);
  assert.match(skill, /Leave historical docs, examples, eval baselines, fixtures/i);
  assert.match(skill, /## Validation/);
  assert.doesNotMatch(skill, /load_workspace_dependencies|Codex/);

  const wrapper = read("skills/openai-docs/scripts/resolve-latest-model-info");
  assert.doesNotMatch(wrapper, /codex-runtimes|load_workspace_dependencies/);
});

test("resolver preserves exact guide URLs from a local latest-model fixture", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cursor-latest-model-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const fixturePath = path.join(tempDir, "latest-model.md");
  fs.writeFileSync(
    fixturePath,
    [
      "# Latest model",
      "",
      "latestModelInfo:",
      "  model: gpt-9.1",
      "  migrationGuide: /api/docs/guides/migrate-gpt-9-1.md?edition=test",
      "  promptingGuide: /api/docs/guides/model-guidance?model=gpt-9.1#prompting-best-practices",
      "",
    ].join("\n"),
  );

  const resolver = path.join(docsSkillDir, "scripts/resolve-latest-model-info.cjs");
  const stdout = execFileSync(
    process.execPath,
    [resolver, "--source", fixturePath, "--base-url", "https://docs.example.test/base/"],
    { encoding: "utf8" },
  );

  assert.deepEqual(JSON.parse(stdout), {
    model: "gpt-9.1",
    modelSlug: "gpt-9p1",
    migrationGuideUrl:
      "https://docs.example.test/api/docs/guides/migrate-gpt-9-1.md?edition=test",
    promptingGuideUrl:
      "https://docs.example.test/api/docs/guides/model-guidance?model=gpt-9.1#prompting-best-practices",
  });
});

test(
  "POSIX wrapper accepts an explicit Node runtime with a local fixture",
  { skip: process.platform === "win32" },
  (t) => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "cursor-latest-wrapper-"),
    );
    t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

    const fixturePath = path.join(tempDir, "latest-model.md");
    fs.writeFileSync(
      fixturePath,
      "<!-- latestModelInfo\nmodel: gpt-8.0\nmigrationGuide: /migrate.md\npromptingGuide: /prompt.md\n-->\n",
    );

    const wrapper = path.join(docsSkillDir, "scripts/resolve-latest-model-info");
    const stdout = execFileSync(
      "sh",
      [
        wrapper,
        "--source",
        fixturePath,
        "--base-url",
        "https://docs.example.test",
      ],
      { encoding: "utf8", env: { ...process.env, NODE: process.execPath } },
    );

    const result = JSON.parse(stdout);
    assert.equal(result.model, "gpt-8.0");
    assert.equal(
      result.migrationGuideUrl,
      "https://docs.example.test/migrate.md",
    );
    assert.equal(
      result.promptingGuideUrl,
      "https://docs.example.test/prompt.md",
    );
  },
);
