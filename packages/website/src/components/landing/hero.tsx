"use client";

import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { LINK } from "@/constants/links";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { SectionContainer, SectionContent } from "./section-layout";
import { SKILLS_COMMAND } from "@/constants/command";
import { PACKAGE_MANAGERS } from "@/constants/package-managers";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

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

const DEFAULT_PACKAGE_MANAGER = "npm";

const CommandBlock = () => {
  const [selectedPackageManager, setSelectedPackageManager] = useState(DEFAULT_PACKAGE_MANAGER);
  const [didCopy, setDidCopy] = useState(false);

  const activeManager = PACKAGE_MANAGERS.find(
    (packageManager) => packageManager.id === selectedPackageManager,
  );

  const copyCommand = async () => {
    if (!activeManager) return;
    await navigator.clipboard.writeText(activeManager.command);
    setDidCopy(true);
    setTimeout(() => setDidCopy(false), 2000);
  };

  return (
    <div className="relative flex w-full max-w-md items-center p-px">
      <div className="z-10 flex w-full items-center bg-fd-muted justify-between gap-2 rounded-md pl-4 pr-2 py-1">
        <button
          type="button"
          onClick={copyCommand}
          className="flex min-w-0 cursor-copy items-center gap-2"
        >
          <p className="shrink-0 select-none space-x-1 font-mono text-xs tracking-tighter sm:text-sm">
            <span>
              <span className="text-sky-500">git:</span>
              <span className="text-red-400">(main)</span>
            </span>
            <span className="italic text-amber-600">x</span>
          </p>
          <p className="relative inline truncate font-mono text-xs tracking-tight text-fd-foreground opacity-90 md:text-sm">
            {didCopy ? (
              <span className="text-green-600 dark:text-green-400">Copied!</span>
            ) : (
              activeManager?.command
            )}
          </p>
        </button>

        <Select value={selectedPackageManager} onValueChange={setSelectedPackageManager}>
          <SelectTrigger
            className="h-7 w-auto gap-1 rounded-md border-none bg-transparent pl-2 pr-1 shadow-none hover:bg-fd-foreground/5"
            aria-label="Select a package manager"
          >
            <span className="flex items-center">{activeManager?.icon}</span>
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            {PACKAGE_MANAGERS.map((packageManager) => (
              <SelectItem key={packageManager.id} value={packageManager.id}>
                {packageManager.icon}
                {packageManager.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const Hero = () => {
  return (
    <SectionContainer>
      <SectionContent className="border-t-0 flex flex-col gap-8 px-4 py-8 md:flex-row md:items-center md:gap-12 md:px-12 md:py-24">
        <div className="flex flex-col items-center gap-6 text-center md:w-1/2 md:items-start md:text-left">
          <SkillsCommand />

          <div className="space-y-2">
            <h1 className="text-4xl font-pixel font-bold tracking-tight text-fd-foreground sm:text-5xl md:text-6xl">
              Stop racking up
              <br />
              Vercel costs
            </h1>

            <p className="text-base sm:text-lg text-fd-muted-foreground">
              Let coding agents diagnose and fix your Vercel bill
            </p>
          </div>

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
