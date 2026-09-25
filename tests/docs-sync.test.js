const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { syncDocumentation, resolveDocumentationPaths, normalizeChangedFiles } = require('../docs-sync.js');

function withTempRepo(testFn) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-sync-'));

  try {
    testFn(tempRoot);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

test('syncDocumentation updates mapped docs and ignores unrelated files', () => {
  withTempRepo((repoRoot) => {
    const srcDir = path.join(repoRoot, 'src');
    const docsDir = path.join(repoRoot, 'docs');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(docsDir, { recursive: true });

    const sourceFile = path.join(srcDir, 'feature.js');
    const docFile = path.join(docsDir, 'feature.md');
    const unrelatedDoc = path.join(docsDir, 'unrelated.md');

    fs.writeFileSync(sourceFile, 'const token = "ghp_1234567890";\n');
    fs.writeFileSync(docFile, '# Feature\n\nOld docs\n');
    fs.writeFileSync(unrelatedDoc, '# Unrelated\n\nShould remain\n');

    const configPath = path.join(repoRoot, 'docs-map.json');
    fs.writeFileSync(configPath, JSON.stringify({
      'src/feature.js': ['docs/feature.md']
    }, null, 2));

    const result = syncDocumentation([sourceFile], {
      repoRoot,
      configPath,
      outputMode: 'overwrite'
    });

    assert.equal(result.status, 'SUCCESS');
    assert.deepEqual(result.updatedDocs, [docFile]);
    const updated = fs.readFileSync(docFile, 'utf8');
    assert.match(updated, /# Feature/);
    assert.doesNotMatch(updated, /ghp_1234567890/);
    const untouched = fs.readFileSync(unrelatedDoc, 'utf8');
    assert.equal(untouched, '# Unrelated\n\nShould remain\n');
  });
});

test('syncDocumentation returns NOT_FOUND when no mapping exists', () => {
  withTempRepo((repoRoot) => {
    const configPath = path.join(repoRoot, 'docs-map.json');
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));

    const sourceFile = path.join(repoRoot, 'src', 'missing.js');
    fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
    fs.writeFileSync(sourceFile, 'module.exports = {}');

    const result = syncDocumentation([sourceFile], { repoRoot, configPath });

    assert.equal(result.status, 'NOT_FOUND');
    assert.equal(result.updatedDocs.length, 0);
  });
});

test('resolveDocumentationPaths supports multiple mapped docs and deduplicates entries', () => {
  const fileA = 'src/alpha.js';
  const fileB = 'src/beta.js';
  const config = {
    'src/alpha.js': ['docs/alpha.md', 'docs/shared.md'],
    'src/beta.js': ['docs/shared.md', 'docs/beta.md']
  };

  const resolved = resolveDocumentationPaths([fileA, fileB], config);
  assert.deepEqual(resolved, ['docs/alpha.md', 'docs/shared.md', 'docs/beta.md']);
});

test('normalizeChangedFiles preserves repo-relative src paths and removes duplicates', () => {
  const files = [
    '/tmp/repo/src/feature.js',
    'src/feature.js',
    'src/feature.js',
    'docs/feature.md'
  ];

  const normalized = normalizeChangedFiles(files, '/tmp/repo');
  assert.deepEqual(normalized, ['src/feature.js']);
});
