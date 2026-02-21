"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, Copy } from "lucide-react";
import Link from "next/link";
import { LINK } from "@/constants/links";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { SectionContainer, SectionContent } from "./section-layout";
import { COMMAND, SKILLS_COMMAND } from "@/constants/command";

const SkillsCommand = () => {
  const [didCopy, setDidCopy] = useState(false);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(SKILLS_COMMAND);
    setDidCopy(true);
    setTimeout(() => setDidCopy(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copyCommand}
      className="cursor-copy inline-flex items-center gap-2 rounded-full border-x border-fd-border bg-fd-muted/60 px-4 py-1.5 text-xs font-mono text-fd-muted-foreground transition-colors hover:bg-fd-muted/80 hover:text-fd-foreground"
      aria-label="Copy command"
    >
      {didCopy ? (
        <span className="text-green-600 dark:text-green-400">Copied!</span>
      ) : (
        <>
          <span className="text-fd-foreground">$</span>
          {SKILLS_COMMAND}
        </>
      )}
    </button>
  );
};

const CommandBlock = () => (
  <div className="flex items-center gap-3 rounded-xl border border-fd-border bg-fd-background px-5 py-3 font-mono text-sm shadow-sm">
    <span className="text-fd-muted-foreground">$</span>
    <code className="text-fd-foreground">{COMMAND}</code>
    <button
      type="button"
      className="ml-2 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      aria-label="Copy command"
    >
      <Copy className="size-4" />
    </button>
  </div>
);

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        video.muted = true;
        video.play().catch(() => {});
      },
      { threshold: 0.25, rootMargin: "50px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <SectionContainer>
      <SectionContent className="border-t-0 flex flex-col gap-8 px-4 py-8 md:flex-row md:items-center md:gap-12 md:px-12 md:py-24">
        <div className="flex flex-col items-center gap-6 text-center md:w-1/2 md:items-start md:text-left">
          <SkillsCommand />

          <h1 className="text-4xl font-pixel font-bold tracking-tight text-fd-foreground sm:text-5xl md:text-6xl">
            Stop racking up
            <br />
            Vercel costs
          </h1>

          <p className="text-lg text-fd-muted-foreground">
            Let coding agents diagnose and fix your Vercel bill
          </p>

          <CommandBlock />

          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/docs">
                Fix your costs
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={LINK.GITHUB} target="_blank" rel="noopener noreferrer">
                <GithubIcon />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="aspect-video w-full overflow-hidden border border-fd-border bg-fd-muted/30 shadow-2xl">
            <video src={LINK.DEMO_VIDEO} autoPlay loop muted playsInline className="w-full" />
          </div>
        </div>
      </SectionContent>
    </SectionContainer>
  );
};
