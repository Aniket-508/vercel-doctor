"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { LINK } from "@/constants/links";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { SectionContainer, SectionContent, SectionFiller, SectionHelper } from "./section-layout";

const useDynamicDate = () => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
};

export const PreFooter = () => {
  const dynamicDate = useDynamicDate();

  return (
    <>
      <SectionFiller className="max-md:border-t-0" />
      <SectionContainer>
        <SectionHelper className="border-b">[READY TO SAVE MONEY?]</SectionHelper>
        <SectionContent className="overflow-hidden bg-linear-to-b from-fd-muted/40 to-fd-muted/80 dark:from-fd-muted/20 dark:to-fd-muted/40 flex flex-col items-center gap-8 px-4 md:px-12 text-center py-24">
          <h2 className="text-3xl font-pixel font-bold text-balance tracking-tight text-fd-foreground sm:text-4xl md:text-6xl">
            Better billing <br />
            by {dynamicDate}
            <span className="animate-[pulse-dot_1s_steps(1)_infinite]">.</span>
          </h2>

          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/docs">
                Get started
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={LINK.GITHUB} target="_blank" rel="noopener noreferrer">
                <GithubIcon />
                View on GitHub
              </a>
            </Button>
          </div>
        </SectionContent>
      </SectionContainer>
    </>
  );
};
