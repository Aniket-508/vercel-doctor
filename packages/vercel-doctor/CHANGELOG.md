# vercel-doctor

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
