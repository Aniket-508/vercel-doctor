"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { LINK } from "@/constants/links";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { SectionContainer, SectionFiller, SectionHelper } from "./section-layout";

const useDynamicDate = () => {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "short" });
  const year = now.getFullYear();
  return `${month} ${year}`;
};

export const PreFooter = () => {
  const dynamicDate = useDynamicDate();

  return (
    <>
      <SectionFiller />
      <SectionContainer>
        <SectionHelper className="border-b">[READY TO SAVE MONEY?]</SectionHelper>
        <div className="overflow-hidden bg-linear-to-b from-fd-muted/40 to-fd-muted/80 dark:from-fd-muted/20 dark:to-fd-muted/40">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
            <h2 className="text-3xl font-pixel font-bold text-balance tracking-tight text-fd-foreground sm:text-4xl md:text-6xl">
              Better billing <br />
              by {dynamicDate}
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
          </div>
        </div>
      </SectionContainer>
    </>
  );
};
