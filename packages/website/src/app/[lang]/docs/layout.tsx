import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

const Layout = async ({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) => {
  const { lang } = await params;
  const { links: _omitLinksForDocs, ...docsLayoutOptions } = baseOptions(lang);

  return (
    <DocsLayout tree={source.getPageTree(lang)} {...docsLayoutOptions}>
      {children}
    </DocsLayout>
  );
};

export default Layout;
