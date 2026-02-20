# vercel-doctor

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
