import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const { links: _omitLinksForDocs, ...docsLayoutOptions } = baseOptions();
  return (
    <DocsLayout tree={source.getPageTree()} {...docsLayoutOptions}>
      {children}
    </DocsLayout>
  );
}
