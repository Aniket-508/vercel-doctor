import { cn } from "@/lib/utils";

export const SectionContainer = ({ children, className }: React.ComponentProps<"section">) => (
  <section className={cn("relative w-full px-4 md:px-12", className)}>{children}</section>
);

export const SectionContent = ({ children, className }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "mx-auto max-w-(--fd-layout-width) border-t border-x border-fd-border",
      className,
    )}
  >
    {children}
  </div>
);

export const SectionHelper = ({ children, className }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "max-w-(--fd-layout-width) mx-auto px-4 md:px-12 -my-px border-t border-x border-fd-border",
      className,
    )}
  >
    <div className="flex items-center py-4 md:py-6 justify-between font-mono text-xs font-medium tracking-wider text-fd-muted-foreground md:text-sm">
      {children}
    </div>
  </div>
);

export const SectionFiller = () => (
  <div className="px-4 md:px-12">
    <div className="mx-auto max-w-(--fd-layout-width) border-t border-x border-fd-border">
      <div className="w-full h-24 md:h-28 lg:h-32" />
    </div>
  </div>
);
