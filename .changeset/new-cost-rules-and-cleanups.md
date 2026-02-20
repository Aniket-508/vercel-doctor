---
"vercel-doctor": minor
---

- Add Link prefetch warning (`nextjs-link-prefetch-default`), next/image SVG unoptimized rule, and build suggestions (Turbopack cache, ISR, deploy archive for large projects)
- Remove duplicate Next.js ESLint rules (`nextjsNoImgElement`) and dead `OG_ROUTE_PATTERN`; unify static asset CDN threshold to 4KB
- Extract build optimization diagnostics, format small asset sizes in KB, and minor code cleanups
