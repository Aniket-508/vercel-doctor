<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/vercel-doctor-readme-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/vercel-doctor-readme-logo-light.svg">
  <img alt="Vercel Doctor" src="./assets/vercel-doctor-readme-logo-light.svg" width="180" height="40">
</picture>

<p align="left">
  <a href="https://www.npmjs.com/package/vercel-doctor"><img src="https://img.shields.io/npm/v/vercel-doctor.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/vercel-doctor"><img src="https://img.shields.io/npm/dm/vercel-doctor.svg" alt="npm downloads" /></a>
  <a href="https://github.com/Aniket-508/vercel-doctor/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/vercel-doctor.svg" alt="license" /></a>
  <a href="https://github.com/Aniket-508/vercel-doctor/actions/workflows/ci.yml"><img src="https://github.com/Aniket-508/vercel-doctor/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

Reduce your Vercel bill with one command.

Scans your Next.js codebase for patterns that increase your Vercel bill — long function durations, uncached routes, unoptimized images, expensive cron jobs, and more — then outputs actionable diagnostics.

### [See it in action →](https://vercel-doctor.com)

https://github.com/user-attachments/assets/e03596de-4b68-4a3e-8623-51c765647b26

## How it works

Vercel Doctor detects your framework and project setup, then runs two analysis passes **in parallel**:

1. **Billing lint** — detects patterns that inflate your Vercel invoice:
   - **Function duration**: sequential `await`s, blocking `after()` calls, side effects in GET handlers
   - **Caching**: missing cache policies, `force-dynamic` / `no-store` overrides, SSR where SSG would work
   - **Image optimization**: unoptimized images, overly broad remote patterns, missing `sizes` prop
   - **Edge functions**: heavy imports, sequential awaits that burn CPU time
   - **Static assets**: large files that should be served from an external CDN
   - **Platform usage**: Vercel Cron vs. GitHub Actions / Cloudflare Workers, Fluid Compute, Bun runtime
2. **Dead code** — detects unused files, exports, types, and duplicates that slow cold starts.

Diagnostics are filtered through your config to produce actionable results.

## Install

Run this at your project root:

```bash
npx -y vercel-doctor@latest .
```

Use `--verbose` to see affected files and line numbers:

```bash
npx -y vercel-doctor@latest . --verbose
```

## Install for your coding agent

Teach your coding agent Vercel cost optimization rules:

```bash
curl -fsSL https://vercel-doctor.com/install-skill.sh | bash
```

Supports Cursor, Claude Code, Amp Code, Codex, Gemini CLI, OpenCode, Windsurf, and Antigravity.

## Options

```
Usage: vercel-doctor [directory] [options]

Options:
  -v, --version     display the version number
  --no-lint         skip linting
  --no-dead-code    skip dead code detection
  --verbose         show file details per rule
  --score           output only the score
  -y, --yes         skip prompts, scan all workspace projects
  --project <name>  select workspace project (comma-separated for multiple)
  --diff [base]     scan only files changed vs base branch
  --offline         skip telemetry (anonymous, not stored, only used to calculate score)
  --no-ami          skip Ami-related prompts
  --fix             open Ami to auto-fix all issues
  -h, --help        display help for command
```

## Configuration

Create a `vercel-doctor.config.json` in your project root to customize behavior:

```json
{
  "ignore": {
    "rules": ["vercel-doctor/nextjs-no-img-element", "knip/exports"],
    "files": ["src/generated/**"]
  }
}
```

You can also use the `"vercelDoctor"` key in your `package.json` instead:

```json
{
  "vercelDoctor": {
    "ignore": {
      "rules": ["vercel-doctor/nextjs-no-img-element"]
    }
  }
}
```

If both exist, `vercel-doctor.config.json` takes precedence.

### Config options

| Key            | Type                | Default | Description                                                                                                                        |
| -------------- | ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ignore.rules` | `string[]`          | `[]`    | Rules to suppress, using the `plugin/rule` format shown in diagnostic output (e.g. `vercel-doctor/async-parallel`, `knip/exports`) |
| `ignore.files` | `string[]`          | `[]`    | File paths to exclude, supports glob patterns (`src/generated/**`, `**/*.test.tsx`)                                                |
| `lint`         | `boolean`           | `true`  | Enable/disable lint checks (same as `--no-lint`)                                                                                   |
| `deadCode`     | `boolean`           | `true`  | Enable/disable dead code detection (same as `--no-dead-code`)                                                                      |
| `verbose`      | `boolean`           | `false` | Show file details per rule (same as `--verbose`)                                                                                   |
| `diff`         | `boolean \| string` | —       | Force diff mode (`true`) or pin a base branch (`"main"`). Set to `false` to disable auto-detection.                                |

CLI flags always override config values.

## Node.js API

You can also use Vercel Doctor programmatically:

```js
import { diagnose } from "vercel-doctor/api";

const result = await diagnose("./path/to/your/nextjs-project");

console.log(result.score); // { score: 82, label: "Good" } or null
console.log(result.diagnostics); // Array of Diagnostic objects
console.log(result.project); // Detected framework, React version, etc.
```

The `diagnose` function accepts an optional second argument:

```js
const result = await diagnose(".", {
  lint: true, // run lint checks (default: true)
  deadCode: true, // run dead code detection (default: true)
});
```

Each diagnostic has the following shape:

```ts
interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: "error" | "warning";
  message: string;
  help: string;
  line: number;
  column: number;
  category: string;
}
```

## Contributing

Want to contribute? Check out the codebase and submit a PR.

```bash
git clone https://github.com/Aniket-508/vercel-doctor
cd vercel-doctor
pnpm install
pnpm -r run build
```

Run locally:

```bash
node packages/vercel-doctor/dist/cli.js /path/to/your/nextjs-project
```

### License

[MIT](./LICENSE)
