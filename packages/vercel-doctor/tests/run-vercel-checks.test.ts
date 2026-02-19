import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { PUBLIC_STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES } from "../src/constants.js";
import { runVercelChecks } from "../src/utils/run-vercel-checks.js";

const testProjectDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "vercel-doctor-vercel-checks-"));

const writeTestFile = (relativeFilePath: string, fileContent: string | Buffer): void => {
  const absoluteFilePath = path.join(testProjectDirectory, relativeFilePath);
  fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
  fs.writeFileSync(absoluteFilePath, fileContent);
};

writeTestFile(
  "package.json",
  JSON.stringify({
    name: "vercel-checks-fixture",
    dependencies: {
      react: "^19.0.0",
      next: "^15.0.0",
    },
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
  Buffer.alloc(PUBLIC_STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES + 1),
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
  "app/navigation/page.tsx",
  `
import Link from "next/link";

export default function NavigationPage() {
  return <Link href="/dashboard" prefetch={false}>Dashboard</Link>;
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

afterAll(() => {
  fs.rmSync(testProjectDirectory, { recursive: true, force: true });
});

describe("runVercelChecks", () => {
  it("reports Vercel-focused optimization diagnostics", () => {
    const diagnostics = runVercelChecks(testProjectDirectory);
    const reportedRules = new Set(diagnostics.map((diagnostic) => diagnostic.rule));

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
    expect(reportedRules).toContain("vercel-link-prefetch-disabled");
    expect(reportedRules).toContain("vercel-image-unoptimized-prop");
    expect(reportedRules).toContain("vercel-image-global-unoptimized");
    expect(reportedRules).toContain("vercel-image-remote-pattern-too-broad");
    expect(reportedRules).toContain("vercel-sequential-database-await");
  });

  it("respects includePaths filtering", () => {
    const diagnostics = runVercelChecks(testProjectDirectory, {
      includePaths: ["app/page.tsx"],
    });
    const reportedRules = new Set(diagnostics.map((diagnostic) => diagnostic.rule));

    expect(reportedRules).toContain("vercel-no-force-dynamic");
    expect(reportedRules).toContain("vercel-no-no-store-fetch");
    expect(reportedRules).not.toContain("vercel-consider-bun-runtime");
    expect(reportedRules).not.toContain("vercel-avoid-platform-cron");
    expect(diagnostics.every((diagnostic) => diagnostic.filePath === "app/page.tsx")).toBe(true);
  });
});
