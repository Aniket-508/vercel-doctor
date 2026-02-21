import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { LINK } from "@/constants/links";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { SectionContainer, SectionContent } from "./section-layout";

export const Hero = () => (
  <SectionContainer>
    <SectionContent className="border-t-0 flex flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
      <div className="inline-flex items-center gap-2 rounded-full border-x border-fd-border bg-fd-muted/60 px-4 py-1.5 text-xs font-mono text-fd-muted-foreground">
        <span className="text-fd-foreground">$</span>
        npx skills add vercel-doctor
      </div>

      <h1 className="text-4xl font-pixel font-bold tracking-tight text-fd-foreground sm:text-5xl md:text-6xl">
        Stop racking up
        <br />
        Vercel costs
      </h1>

      <p className="max-w-xl text-lg text-fd-muted-foreground">
        A specialized health check tool for Next.js projects on Vercel. Find and fix issues that
        drive up your bill — function duration, caching, image optimization, and more.
      </p>

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
    </SectionContent>
  </SectionContainer>
);
