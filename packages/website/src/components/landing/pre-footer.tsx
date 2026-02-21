"use client";

import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { LINK } from "./constants";

const useDynamicDate = () => {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  return `${month} ${year}`;
};

export const PreFooter = () => {
  const dynamicDate = useDynamicDate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-fd-muted/40 to-fd-muted/80 dark:from-fd-muted/20 dark:to-fd-muted/40">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        <div className="flex items-center gap-2 text-sm text-fd-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
          </span>
          Live
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl md:text-5xl">
          Better billing by {dynamicDate}
        </h2>

        <div className="flex items-center gap-4">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-6 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
          <a
            href={LINK.GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-fd-border px-6 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
          >
            <Github className="size-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
};
