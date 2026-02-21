import { Copy } from "lucide-react";
import { SectionContainer, SectionContent } from "./section-layout";
import { COMMAND } from "@/constants/command";
import { DEMO_VIDEO_URL } from "@/constants/demo";

export const Demo = () => (
  <SectionContainer>
    <SectionContent className="relative overflow-hidden bg-linear-to-b from-fd-muted/40 to-fd-muted/80 dark:from-fd-muted/20 dark:to-fd-muted/40">
      <div className="flex flex-col items-center gap-10 px-6 py-16 md:py-24">
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

        <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-fd-border shadow-2xl">
          <video src={DEMO_VIDEO_URL} autoPlay loop muted playsInline className="w-full" />
        </div>
      </div>
    </SectionContent>
  </SectionContainer>
);
