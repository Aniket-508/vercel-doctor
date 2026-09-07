# vercel-doctor

## Unreleased

### Features

- Add optional Rslint (`@rslint/core`) detection and CLI/API integration, including JSON Lines diagnostics, diff scopes, hoisted installations, and process failure handling.

### Fixes

- Prevent shell injection through diff base refs; preserve untracked and unusual filenames, workspace-relative paths, and detached checkouts.
- Keep JSON and Markdown output free of progress text; preserve every workspace project in report exports and propagate write failures.
- Respect empty diff scopes and non-JSX source files, validate configuration values, and preserve project-specific options.
- Make lint scans read-only, isolate temporary configurations, retain parser errors, and reject failed or interrupted linter processes.
- Correct workspace pattern matching and framework inheritance, Next.js route detection, and Nuxt/SvelteKit configuration checks.
- Remove incorrect SVG optimization and SvelteKit anchor warnings; ignore generated framework output and type-only server imports.
- Require Node.js 22.17.0 or newer and align the GitHub Action runtime with the APIs used by the scanner.
- Fix action project selection and multiline scores, release gating and npm authentication, share query normalization, documentation aliases, and skill installation paths.

## 1.2.0

### Minor Changes

- de59946: Add Next.js version-aware cost guidance and rule help for Next.js 15 and 16+ projects.

  Add an additional AI prompt for planning a safe repository-wide `Promise.all` to `better-all` codemod with a review-and-test-first execution sequence.

## 1.1.1

### Patch Changes

- 1198c03: Improve reporting and internal maintainability.
  - add human-readable report output and AI fix prompt export support
  - include line and column details in generated report output
  - improve scan and report pipeline reliability
  - centralize rule metadata, severity handling, and shared constants
  - remove the unused `clean-react` test fixture

## 1.1.0

### Minor Changes

- 5cf15b1: - Add Link prefetch warning (`nextjs-link-prefetch-default`), next/image SVG unoptimized rule, and build suggestions (Turbopack cache, ISR, deploy archive for large projects)
  - Remove duplicate Next.js ESLint rules (`nextjsNoImgElement`) and dead `OG_ROUTE_PATTERN`; unify static asset CDN threshold to 4KB
  - Extract build optimization diagnostics, format small asset sizes in KB, and minor code cleanups

## 1.0.1

### Patch Changes

- ac9137f: Remove Ami-related options and copy from CLI docs and prompts

## 1.0.0

### Major Changes

- Release v1 – Vercel bill optimization focus
