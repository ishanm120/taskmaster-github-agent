# Changelog

## Unreleased

- Added a repository-local documentation synchronization utility that watches for changes under src/, resolves mapped documentation from docs-map.json, and updates only the associated docs.
- Added the default docs mapping for source files so documentation stays aligned with the repo’s source layout without writing unrelated files.
- Included secret redaction in generated documentation content to prevent repository secret values from being written into docs.
- Added focused regression tests covering the success path, NOT_FOUND behavior, deduplicated path normalization, and multi-mapping resolution.

### Verification

- PASS — `npm test` (4/4 assertions passing)
- PASS — `npm --prefix frontend run build` (Vite production build completed successfully)
- NOT_RUN — lint (`no lint script is defined in the repository manifests`)
