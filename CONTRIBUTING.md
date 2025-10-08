<!--
  CONTRIBUTING.md
  Guidelines for contributing to the @addon-core/inject-script project.
-->

# Contributing to @addon-core/inject-script

Thank you for taking the time to contribute! This document describes our workflow, quality gates, commit conventions, and release process. By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Table of Contents

1. Reporting Bugs
2. Suggesting Enhancements
3. Branching Model & Workflow
4. Development Setup
5. Quality Gates (Lint, Format, Types, Tests)
6. Commit Messages (Conventional Commits)
7. Submitting a Pull Request
8. Releases
9. Code of Conduct
10. Security
11. License

---

## Reporting Bugs

To file a clear, actionable bug report:

1. Search existing issues to avoid duplicates.
2. If not found, open a new issue and include:
   - Descriptive title and summary
   - Steps to reproduce (minimal repro if possible)
   - Expected vs. actual behavior
   - Environment details (OS, browser, Node.js/npm)
   - Relevant logs, stack traces, or screenshots

## Suggesting Enhancements

When proposing an enhancement:

1. Check open issues/PRs for similar ideas.
2. Open a new issue describing:
   - Motivation and use case
   - Proposed API/UX (code snippets welcome)
   - Alternatives considered and trade-offs

## Branching Model & Workflow

We use a simplified GitFlow:

- Default branch: `develop`
- Feature branches: `feature/<short-name>` cut from `develop`
- Regular work: open PRs into `develop`
- Releases: open a PR from `develop` to `main`
  - When the PR is merged, a release pipeline runs automatically on `main`
  - After publishing, `main` is synced back into `develop`

See the workflows in `.github/workflows/`:
- CI: `.github/workflows/ci.yml` (runs on pushes/PRs to `develop` and `feature/**`)
- Release: `.github/workflows/release.yml` (runs on push to `main` and on manual dispatch)

## Development Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:addon-stack/inject-script.git
   cd inject-script
   ```
2. Install dependencies (Node.js 20+ recommended):
   ```bash
   npm install
   ```
3. Useful scripts:
   - `npm run dev` — build in watch mode (tsup)
   - `npm run build` — production build (tsup)
   - `npm run format` — format with Biome
   - `npm run format:check` — check formatting only
   - `npm run lint` — Biome lint + format checks
   - `npm run lint:fix` — autofix safe issues
   - `npm run lint:fix:unsafe` — autofix including unsafe transforms
   - `npm run typecheck` — TypeScript type checking
   - `npm run test` — run tests (Jest)
   - `npm run test:ci` — CI-friendly tests with coverage
   - `npm run test:related` — run tests related to staged/changed files
   - `npm run release` — run release-it locally

## Quality Gates (Lint, Format, Types, Tests)

We treat code quality seriously and run multiple static checks locally and in CI:

- Biome (formatter + linter) — configured via `biome.json`
  - `npm run format` / `npm run lint`
- TypeScript type checks — `npm run typecheck`
- Unit tests (Jest) — `npm run test`
- Pre-commit automation (`lint-staged` via Husky pre-commit hook):
  - For `src/**/*.{js,jsx,ts,tsx,cjs,mjs}`: `biome check --write --unsafe` then `npm run test:related`
  - For `*.{json,css,scss,html}`: `biome format --write`
- CI mirrors this pipeline (lint → typecheck → test → build) and uploads coverage artifacts

Please ensure all commands above pass before opening a PR.

## Commit Messages (Conventional Commits)

All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <short summary>

[optional body]
[optional footer(s)]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Examples:
- `feat(core): add MV3 documentId targeting`
- `fix(v2): handle timeout cleanup`
- `docs: update README with API examples`

Enforcement:
- We use Husky + commitlint. The `commit-msg` hook runs commitlint and blocks non‑conforming messages.
- Config: `.commitlintrc.json` extends `@commitlint/config-conventional`.

Tip: for complex changes, prefer multiple small commits over one large commit.

## Submitting a Pull Request

1. Create a branch from `develop`:
   ```bash
   git checkout -b feature/<short-name>
   ```
2. Make your changes under `src/` and update docs/tests if needed.
3. Run quality gates locally:
   ```bash
   npm run lint && npm run typecheck && npm run test && npm run build
   ```
4. Commit using Conventional Commits. The Husky hook will validate your message.
5. Push and open a PR into `develop`.
6. PR checklist:
   - [ ] Lint, types, and tests pass in CI
   - [ ] Docs updated (README/CONTRIBUTING if applicable)
   - [ ] Linked related issues (e.g., `Closes #123`)
   - [ ] Clear description of changes and motivation

Maintainers perform release PRs from `develop` → `main` (see below).

## Releases

Releases are automated via GitHub Actions + `release-it`:

- Trigger: merge/push to `main` (or manual dispatch with inputs)
- Steps (see `.github/workflows/release.yml`):
  1. Run the full CI matrix
  2. Execute `release-it` in CI (`--ci`) with conventional changelog
  3. Create a Git tag and GitHub Release
  4. Publish to npm using `NPM_TOKEN` and selected dist-tag
  5. Sync `main` back into `develop`

Local dry-run is available via `npm run release` (requires proper credentials for a real publish).

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

## Security

If you discover a vulnerability, please follow our [Security Policy](SECURITY.md) and avoid disclosing publicly until fixed.

## License

By contributing, you agree that your contributions will be licensed under the project’s MIT License. See [LICENSE.md](LICENSE.md).
