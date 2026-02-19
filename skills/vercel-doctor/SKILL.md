---
name: vercel-doctor
description: Find ways to cut your Vercel bill. Run after making changes to catch cost-heavy patterns early in Next.js projects.
version: 1.0.0
---

# Vercel Doctor

Scans your Next.js codebase for patterns that drive up your Vercel bill, focusing on compute duration, function invocations, and bandwidth optimization.

## Usage

```bash
npx -y vercel-doctor@latest . --verbose --diff
```

## Cost Optimization Scans

### 1. Compute Duration & Cold Starts

- **Dead Code Detection** — Removes unused files and exports to shrink bundles and speed up cold starts.
- **Bundle Size Optimization** — Detects barrel imports, full lodash imports, moment.js, and heavy libraries that should be dynamic.
- **Parallel Execution** — Identifies sequential `await` statements that can be run in parallel with `Promise.all()` to reduce function execution time.
- **Server Post-Processing** — Recommends using `after()` for non-blocking tasks to end the response (and billing) earlier.

### 2. Function Invocations & Execution

- **Next.js & Server Patterns** — Flags patterns that cause extra function invocations or longer execution, such as client-side fetching for server data or unprotected server actions.
- **Vercel Platform Checks** — Scans for SSG data fetching, edge runtime constraints, caching/revalidation config, and sequential database awaits.

### 3. Rendering & Bandwidth

- **Image Optimization** — Detects unoptimized images, missing sizes, and inefficient image handling.
- **Next.js Specific Metadata** — Ensures proper metadata and link usage to optimize rendering and crawling.

## Workflow

Run after making changes to catch cost-heavy patterns early. Focus on fixing issues that reduce function execution time and bundle size first.
