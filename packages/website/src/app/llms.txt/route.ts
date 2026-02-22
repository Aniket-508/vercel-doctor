import { i18n } from "@/lib/i18n";
import { source } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const lines: string[] = [];
  lines.push("# Documentation");
  lines.push("");
  for (const page of source.getPages().filter((page) => page.locale === i18n.defaultLanguage)) {
    lines.push(`- [${page.data.title}](${page.url}): ${page.data.description}`);
  }
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown" },
  });
}
