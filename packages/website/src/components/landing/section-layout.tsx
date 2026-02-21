import { cn } from "@/lib/utils";

export const SectionContainer = ({ children, className }: React.ComponentProps<"section">) => (
  <section className={cn("relative w-full", className)}>
    <div className="mx-auto max-w-fd-container border-t border-x border-fd-border">{children}</div>
  </section>
);

export const SectionHelper = ({ children, className }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "max-w-fd-container mx-auto px-3 md:px-12 -my-px border-t border-x border-fd-border max-md:border-x-0",
      className,
    )}
  >
    <div className="flex items-center py-4 md:py-6 justify-between font-mono text-xs font-medium tracking-wider text-fd-muted-foreground md:text-sm">
      {children}
    </div>
  </div>
);

export const SectionFiller = () => (
  <div className="border-t border-x border-fd-border h-12 md:h-16 lg:h-24" />
);
