const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_CONFIG_PATH = 'docs-map.json';

function normalizeFilePath(filePath, repoRoot = process.cwd()) {
  if (!filePath) return null;

  const normalized = filePath.replace(/\\/g, '/');
  if (!normalized || normalized === '.') return null;

  if (path.isAbsolute(normalized)) {
    const relative = path.relative(repoRoot, normalized).replace(/\\/g, '/');
    if (!relative || relative.startsWith('..') || relative === '') {
      return null;
    }
    return relative.replace(/^\.\//, '');
  }

  return normalized.replace(/^\.\//, '').replace(/^\//, '');
}

function normalizeChangedFiles(changedFiles, repoRoot = process.cwd()) {
  const seen = new Set();
  const result = [];

  for (const entry of changedFiles || []) {
    const normalized = normalizeFilePath(entry, repoRoot);
    if (!normalized || !normalized.startsWith('src/')) {
      continue;
    }

    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result.sort();
}

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function globToRegex(pattern) {
  const normalized = pattern.replace(/\\/g, '/');
  const regexString = normalized
    .split('**')
    .map((segment) => segment.replace(/\*/g, '[^/]*'))
    .join('.*');

  return new RegExp(`^${regexString}$`);
}

function matchesPattern(pattern, value) {
  if (!pattern || !value) return false;

  if (pattern === value) return true;

  const normalizedPattern = pattern.replace(/\\/g, '/');
  const normalizedValue = value.replace(/\\/g, '/');

  if (normalizedPattern.includes('*')) {
    return globToRegex(normalizedPattern).test(normalizedValue);
  }

  return false;
}

function sanitizeContent(content) {
  if (typeof content !== 'string' || !content) return content;

  let sanitized = content;
  const replacements = [
    { regex: /(gh[pousr]_[A-Za-z0-9]{16,})/gi, replacement: '[REDACTED]' },
    { regex: /(AKIA[0-9A-Z]{16})/g, replacement: '[REDACTED]' },
    { regex: /(ASIA[0-9A-Z]{16})/g, replacement: '[REDACTED]' },
    { regex: /(sk_(live|test)_[A-Za-z0-9]+)/gi, replacement: '[REDACTED]' },
    { regex: /(password|secret|token|api[_-]?key|access[_-]?key)\s*[:=]\s*['\"]?[^\s'\";]+/gi, replacement: '$1=[REDACTED]' },
    { regex: /(aws_access_key_id|aws_secret_access_key)\s*[:=]\s*['\"]?[^\s'\";]+/gi, replacement: '$1=[REDACTED]' }
  ];

  for (const entry of replacements) {
    sanitized = sanitized.replace(entry.regex, entry.replacement);
  }

  return sanitized;
}

function readMappingConfig(configPath) {
  if (!configPath) return {};

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function resolveDocumentationPaths(changedFiles, config = {}) {
  if (!config || typeof config !== 'object') {
    return [];
  }

  const results = [];
  const seen = new Set();

  for (const sourcePath of changedFiles || []) {
    const exactPath = sourcePath.replace(/\\/g, '/');

    for (const [pattern, targets] of Object.entries(config)) {
      const mappingTargets = Array.isArray(targets) ? targets : [targets];
      if (!matchesPattern(pattern, exactPath)) {
        continue;
      }

      for (const target of mappingTargets) {
        const nextPath = String(target).replace(/\\/g, '/').replace(/^\//, '');
        if (!nextPath || seen.has(nextPath)) {
          continue;
        }

        seen.add(nextPath);
        results.push(nextPath);
      }
    }
  }

  return results;
}

function renderDocumentation(docPath, changedFiles, existingContent = '') {
  const fileName = path.basename(docPath, path.extname(docPath));
  const title = fileName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

  const updateSummary = changedFiles.length
    ? `Updated for changes in: ${changedFiles.join(', ')}`
    : 'Updated for source changes';

  const body = [
    `# ${title}`,
    '',
    updateSummary,
    ''
  ];

  if (existingContent && existingContent.trim()) {
    body.push(sanitizeContent(existingContent.trim()));
  }

  return `${body.join('\n')}\n`;
}

function syncDocumentation(changedFiles, options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const configPath = options.configPath
    ? path.resolve(repoRoot, options.configPath)
    : path.resolve(repoRoot, DEFAULT_CONFIG_PATH);
  const normalizedChangedFiles = normalizeChangedFiles(changedFiles, repoRoot);

  if (!normalizedChangedFiles.length) {
    return { status: 'NOT_FOUND', changedFiles: [], updatedDocs: [], configPath };
  }

  const config = options.mapping || readMappingConfig(configPath);
  const mappedDocs = resolveDocumentationPaths(normalizedChangedFiles, config);

  if (!mappedDocs.length) {
    return {
      status: 'NOT_FOUND',
      changedFiles: normalizedChangedFiles,
      updatedDocs: [],
      configPath
    };
  }

  const updatedDocs = [];

  for (const docRelativePath of mappedDocs) {
    const absoluteDocPath = path.join(repoRoot, docRelativePath);
    const directory = path.dirname(absoluteDocPath);

    fs.mkdirSync(directory, { recursive: true });

    const previousContent = fs.existsSync(absoluteDocPath)
      ? fs.readFileSync(absoluteDocPath, 'utf8')
      : '';

    const sanitizedPrevious = sanitizeContent(previousContent);
    const renderedContent = renderDocumentation(docRelativePath, normalizedChangedFiles, sanitizedPrevious);

    fs.writeFileSync(absoluteDocPath, renderedContent, 'utf8');
    updatedDocs.push(absoluteDocPath);
  }

  return {
    status: 'SUCCESS',
    changedFiles: normalizedChangedFiles,
    updatedDocs,
    configPath
  };
}

function parseArgs(argv) {
  const result = {
    repoRoot: process.cwd(),
    configPath: DEFAULT_CONFIG_PATH,
    changedFiles: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--repo-root') {
      result.repoRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--config') {
      result.configPath = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--file') {
      result.changedFiles.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith('--')) {
      continue;
    }

    result.changedFiles.push(arg);
  }

  return result;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = syncDocumentation(args.changedFiles, {
    repoRoot: args.repoRoot,
    configPath: args.configPath
  });

  if (result.status === 'NOT_FOUND') {
    console.log('NOT_FOUND');
    process.exit(0);
  }

  console.log(result.status);
  for (const doc of result.updatedDocs) {
    console.log(doc);
  }
}

module.exports = {
  normalizeChangedFiles,
  readMappingConfig,
  resolveDocumentationPaths,
  sanitizeContent,
  syncDocumentation,
  renderDocumentation,
  matchesPattern
};
