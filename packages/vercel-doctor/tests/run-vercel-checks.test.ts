import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES } from "../src/constants.js";
import type { Diagnostic } from "../src/types.js";
import { runVercelChecks } from "../src/utils/run-vercel-checks.js";

const testProjectDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "vercel-doctor-vercel-checks-"),
);

const writeTestFile = (
  relativeFilePath: string,
  fileContent: string | Buffer,
): void => {
  const absoluteFilePath = path.join(testProjectDirectory, relativeFilePath);
  fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
  fs.writeFileSync(absoluteFilePath, fileContent);
};

const runFixtureChecks = (
  dependencies: Record<string, string | undefined>,
  files: Record<string, string>,
  includePaths?: string[],
): Diagnostic[] => {
  const fixtureDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "vercel-doctor-framework-checks-"),
  );
  try {
    fs.writeFileSync(
      path.join(fixtureDirectory, "package.json"),
      JSON.stringify({
        dependencies,
        name: "framework-checks-fixture",
        packageManager: "bun@1.2.0",
      }),
    );
    for (const [relativeFilePath, fileContent] of Object.entries(files)) {
      const absoluteFilePath = path.join(fixtureDirectory, relativeFilePath);
      fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
      fs.writeFileSync(absoluteFilePath, fileContent);
    }
    return runVercelChecks(fixtureDirectory, { includePaths });
  } finally {
    fs.rmSync(fixtureDirectory, { force: true, recursive: true });
  }
};

writeTestFile(
  "package.json",
  JSON.stringify({
    dependencies: {
      next: "^16.0.0",
      react: "^19.0.0",
    },
    name: "vercel-checks-fixture",
  }),
);

writeTestFile(
  "vercel.json",
  JSON.stringify({
    crons: [{ path: "/api/cron", schedule: "0 5 * * *" }],
  }),
);

writeTestFile(
  "next.config.ts",
  `
const nextConfig = {
  experimental: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
`,
);

writeTestFile(
  "public/hero-video.mp4",
  Buffer.alloc(STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES + 1),
);

writeTestFile(
  "app/page.tsx",
  `
export const dynamic = "force-dynamic";

export default async function Page() {
  const response = await fetch("https://example.com/api", { cache: "no-store" });
  const json = await response.json();
  return <pre>{JSON.stringify(json)}</pre>;
}
`,
);

writeTestFile(
  "app/gallery/page.tsx",
  `
import Image from "next/image";

export default function GalleryPage() {
  return <Image src="/hero.png" alt="Hero" width={1200} height={800} unoptimized />;
}
`,
);

writeTestFile(
  "app/logo/page.tsx",
  `
import Image from "next/image";

export default function LogoPage() {
  return <Image src="/icon.svg" alt="Logo" width={40} height={40} />;
}
`,
);

writeTestFile(
  "pages/dashboard.tsx",
  `
export async function getServerSideProps() {
  return { props: { now: Date.now() } };
}

export default function Dashboard() {
  return <div>dashboard</div>;
}
`,
);

writeTestFile(
  "pages/blog/[slug].tsx",
  `
export async function getStaticProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function BlogPost() {
  return <div>post</div>;
}
`,
);

writeTestFile(
  "app/api/orders/route.ts",
  `
export async function GET() {
  return Response.json({ ok: true });
}
`,
);

writeTestFile(
  "app/api/report/route.ts",
  `
const prisma = {
  post: { findFirst: async () => ({}) },
  comment: { findMany: async () => [] },
  user: { findMany: async () => [] },
};

export async function GET() {
  const post = await prisma.post.findFirst();
  const comments = await prisma.comment.findMany();
  const users = await prisma.user.findMany();
  return Response.json({
    post,
    comments,
    users,
  });
}
`,
);

writeTestFile(
  "app/api/edge/route.ts",
  `
import crypto from "node:crypto";

export const runtime = "edge";

export async function GET() {
  await fetch("https://example.com/a");
  await fetch("https://example.com/b");
  return Response.json({ ok: Boolean(crypto) });
}
`,
);

writeTestFile(
  "app/api/stats/route.ts",
  `
export async function GET() {
  return Response.json({ total: 10 });
}
`,
);

describe("vercel checks runner", () => {
  afterAll(() => {
    fs.rmSync(testProjectDirectory, { force: true, recursive: true });
  });

  describe(runVercelChecks, () => {
    it("reports Vercel-focused optimization diagnostics", () => {
      const diagnostics = runVercelChecks(testProjectDirectory);
      const reportedRules = new Set(
        diagnostics.map((diagnostic) => diagnostic.rule),
      );

      expect(reportedRules).toContain("vercel-large-static-asset");
      expect(reportedRules).toContain("vercel-no-force-dynamic");
      expect(reportedRules).toContain("vercel-no-no-store-fetch");
      expect(reportedRules).toContain("vercel-prefer-get-static-props");
      expect(reportedRules).toContain("vercel-edge-heavy-import");
      expect(reportedRules).toContain("vercel-edge-sequential-await");
      expect(reportedRules).toContain("vercel-missing-cache-policy");
      expect(reportedRules).toContain("vercel-consider-bun-runtime");
      expect(reportedRules).toContain("vercel-avoid-platform-cron");
      expect(reportedRules).toContain("vercel-consider-fluid-compute");
      expect(reportedRules).toContain("vercel-image-global-unoptimized");
      expect(reportedRules).toContain("vercel-image-remote-pattern-too-broad");
      expect(reportedRules).toContain("vercel-sequential-database-await");
      expect(reportedRules).toContain("vercel-suggest-turbopack-build-cache");
      expect(reportedRules).toContain("vercel-get-static-props-consider-isr");
    });

    it("respects includePaths filtering", () => {
      const diagnostics = runVercelChecks(testProjectDirectory, {
        includePaths: ["app/page.tsx"],
      });
      const reportedRules = new Set(
        diagnostics.map((diagnostic) => diagnostic.rule),
      );

      expect(reportedRules).toContain("vercel-no-force-dynamic");
      expect(reportedRules).toContain("vercel-no-no-store-fetch");
      expect(reportedRules).not.toContain("vercel-consider-bun-runtime");
      expect(reportedRules).not.toContain("vercel-avoid-platform-cron");
      expect(
        diagnostics.every(
          (diagnostic) => diagnostic.filePath === "app/page.tsx",
        ),
      ).toBeTruthy();
    });
  });
});

describe("framework check regressions", () => {
  it("accepts native SvelteKit anchors without navigation imports", () => {
    expect(
      runFixtureChecks(
        { "@sveltejs/kit": "^2.0.0" },
        {
          "src/routes/+page.svelte":
            '<a href="/about">About</a><a href="https://example.com">External</a>',
        },
      ),
    ).toStrictEqual([]);
  });

  it.each([
    {
      configContent: "export default defineNuxtConfig({ ssr: false });",
      configPath: "nuxt.config.ts",
      dependencies: { nuxt: "^4.0.0" },
      sourceContent: "<template><p>Hello</p></template>",
      sourcePath: "app/pages/index.vue",
    },
    {
      configContent:
        "import adapter from '@sveltejs/adapter-vercel'; export default { kit: { adapter: adapter() } };",
      configPath: "svelte.config.js",
      dependencies: { "@sveltejs/kit": "^2.0.0" },
      sourceContent: "<p>Hello</p>",
      sourcePath: "src/routes/+page.svelte",
    },
  ])(
    "only reports $configPath when included in the scan",
    ({
      dependencies,
      configPath,
      configContent,
      sourcePath,
      sourceContent,
    }) => {
      const files = {
        [configPath]: configContent,
        [sourcePath]: sourceContent,
        [`examples/${configPath}`]: "export default {};",
      };
      expect(runFixtureChecks(dependencies, files, [sourcePath])).toStrictEqual(
        [],
      );
      const configDiagnostics = runFixtureChecks(dependencies, files, [
        configPath,
      ]);
      expect(configDiagnostics).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ filePath: configPath }),
        ]),
      );
    },
  );

  it.each([
    {
      content: '<template><img src="/hero.png"></template>',
      dependencies: { nuxt: "^4.0.0" },
      generatedPath: ".nuxt/components/generated.vue",
    },
    {
      content: "await first(); await second();",
      dependencies: { nuxt: "^4.0.0" },
      generatedPath: ".output/server/api/generated.ts",
    },
    {
      content:
        "export const load = async () => { await first(); await second(); };",
      dependencies: { "@sveltejs/kit": "^2.0.0" },
      generatedPath: ".svelte-kit/generated/+page.ts",
    },
  ])(
    "ignores generated output at $generatedPath",
    ({ dependencies, generatedPath, content }) => {
      expect(
        runFixtureChecks(dependencies, { [generatedPath]: content }),
      ).toStrictEqual([]);
    },
  );

  it("checks and counts App Router handlers outside the api directory", () => {
    const routeContent =
      "export const GET = () => Response.json({ healthy: true });";
    const diagnostics = runFixtureChecks(
      { next: "^16.0.0" },
      {
        "app/(feeds)/rss/route.ts": routeContent,
        "app/route.ts": routeContent,
        "src/app/health/route.ts": routeContent,
      },
    );
    expect(
      diagnostics
        .filter(
          (diagnostic) => diagnostic.rule === "vercel-missing-cache-policy",
        )
        .map((diagnostic) => diagnostic.filePath)
        .toSorted(),
    ).toStrictEqual([
      "app/(feeds)/rss/route.ts",
      "app/route.ts",
      "src/app/health/route.ts",
    ]);
    expect(diagnostics).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "vercel-consider-fluid-compute" }),
      ]),
    );
  });

  it("recognizes force-static as an explicit GET response cache policy", () => {
    expect(
      runFixtureChecks(
        { next: "^16.0.0" },
        {
          "app/api/status/route.ts":
            'export const dynamic = "force-static"; export const GET = () => Response.json({ healthy: true });',
        },
      ),
    ).toStrictEqual([]);
  });

  it("does not warn about SVG images automatically bypassing optimization", () => {
    expect(
      runFixtureChecks(
        { next: "^16.0.0" },
        {
          "app/logo/page.tsx":
            'import Image from "next/image"; export default () => <Image src="/icon.svg" alt="Logo" width={40} height={40} />;',
        },
      ),
    ).toStrictEqual([]);
  });

  it("distinguishes server-only value imports from types and similarly named modules", () => {
    const diagnostics = runFixtureChecks(
      { "@sveltejs/kit": "^2.0.0" },
      {
        "src/routes/private/+page.server.ts":
          "import { secret } from '$lib/server/secrets'; export const load = () => secret;",
        "src/routes/public/+page.ts":
          "import { client } from '$lib/serverless'; export const load = () => client;",
        "src/routes/side-effect/+page.ts": "import '$lib/server/setup';",
        "src/routes/types/+page.ts":
          "import type { User } from '$lib/server/models'; import { type Role } from '$lib/server/models';",
        "src/routes/unsafe/+layout.ts":
          "import { type User, secret } from '$lib/server/secrets'; export const load = () => secret;",
      },
    );
    expect(
      diagnostics.map((diagnostic) => diagnostic.filePath).toSorted(),
    ).toStrictEqual([
      "src/routes/side-effect/+page.ts",
      "src/routes/unsafe/+layout.ts",
    ]);
    expect(
      diagnostics.every((diagnostic) => diagnostic.line === 1),
    ).toBeTruthy();
  });
});

describe("svelteKit prerender configuration", () => {
  it("does not mistake a load file for a prerender declaration", () => {
    const configContent =
      "import adapter from '@sveltejs/adapter-vercel'; export default { kit: { adapter: adapter({ split: true }) } };";
    const dependencies = { "@sveltejs/kit": "^2.0.0" };
    const files = {
      "src/routes/+page.ts":
        "export const load = () => ({ greeting: 'Hello' });",
      "svelte.config.js": configContent,
    };
    expect(
      runFixtureChecks(dependencies, files, ["svelte.config.js"]),
    ).toStrictEqual([
      expect.objectContaining({
        filePath: "svelte.config.js",
        rule: "vercel-missing-cache-policy",
      }),
    ]);
    expect(
      runFixtureChecks(
        dependencies,
        {
          ...files,
          "src/routes/+layout.ts": "export const prerender = true;",
        },
        ["svelte.config.js"],
      ),
    ).toStrictEqual([]);
  });
});
