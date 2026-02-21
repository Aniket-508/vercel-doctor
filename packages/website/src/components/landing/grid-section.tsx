import { cn } from "@/lib/cn";

interface GridSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const GridSection = ({ children, className }: GridSectionProps) => (
  <section className={cn("relative w-full", className)}>
    <div className="mx-auto max-w-fd-container border-x border-fd-border">{children}</div>
  </section>
);
