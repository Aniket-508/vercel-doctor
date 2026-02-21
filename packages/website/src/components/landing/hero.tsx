import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { LINK } from "./constants";

export const Hero = () => (
  <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
    <div className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-muted/60 px-4 py-1.5 text-sm font-mono text-fd-muted-foreground">
      <span className="text-fd-foreground">$</span>
      npx skills add vercel-doctor
    </div>

    <h1 className="text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl md:text-6xl">
      Stop racking up
      <br />
      Vercel costs
    </h1>

    <p className="max-w-xl text-lg text-fd-muted-foreground">
      A specialized health check tool for Next.js projects on Vercel. Find and fix issues that drive
      up your bill — function duration, caching, image optimization, and more.
    </p>

    <div className="flex items-center gap-4">
      <Link
        href="/docs"
        className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-6 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
      >
        Fix your costs
        <ArrowRight className="size-4" />
      </Link>
      <a
        href={LINK.GITHUB}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-fd-border px-6 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
      >
        <Github className="size-4" />
        GitHub
      </a>
    </div>
  </section>
);
