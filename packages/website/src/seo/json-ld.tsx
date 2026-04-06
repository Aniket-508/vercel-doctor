import { LINK } from "@/constants/links";
import { SITE } from "@/constants/site";
import { i18n } from "@/i18n/config";

const LOCALE_TO_BCP47: Record<string, string> = {
  en: "en-US",
  "pt-br": "pt-BR",
  zh: "zh-Hans",
};

const JsonLdScript = ({ data }: { data: Record<string, unknown> }) => (
  <script
    // oxlint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
);

const WebsiteJsonLd = () => {
  const inLanguage = i18n.languages.map(
    (locale) => LOCALE_TO_BCP47[locale] ?? locale,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: SITE.DESCRIPTION.LONG,
    inLanguage,
    name: SITE.NAME,
    url: SITE.URL,
  };

  return <JsonLdScript data={jsonLd} />;
};

const SoftwareSourceCodeJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    author: {
      "@type": "Person",
      name: SITE.AUTHOR.NAME,
      url: LINK.TWITTER,
    },
    codeRepository: LINK.GITHUB,
    dateModified: new Date().toISOString().split("T")[0],
    description: SITE.DESCRIPTION.LONG,
    isAccessibleForFree: true,
    keywords: SITE.KEYWORDS,
    license: LINK.LICENSE,
    maintainer: {
      "@type": "Person",
      name: SITE.AUTHOR.NAME,
      url: LINK.PORTFOLIO,
    },
    name: SITE.NAME,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    programmingLanguage: ["TypeScript", "React", "JavaScript"],
    runtimePlatform: "Node.js",
    url: SITE.URL,
  };

  return <JsonLdScript data={jsonLd} />;
};

const OrganizationJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    founder: {
      "@type": "Person",
      name: SITE.AUTHOR.NAME,
      url: LINK.PORTFOLIO,
    },
    logo: `${SITE.URL}${SITE.OG_IMAGE}`,
    name: SITE.NAME,
    sameAs: [LINK.GITHUB, LINK.TWITTER, LINK.PORTFOLIO],
    url: SITE.URL,
  };

  return <JsonLdScript data={jsonLd} />;
};

const FAQJsonLd = () => {
  const faqs = [
    {
      answer: `${SITE.NAME} is an open-source tool for Next.js projects that identifies patterns increasing your Vercel costs, such as long function durations, uncached routes, and unnecessary invocations.`,
      question: "What is Vercel Doctor?",
    },
    {
      answer:
        "You can run it via npx: `npx -y vercel-doctor@latest .`. Use `--verbose` for detailed reports.",
      question: "How do I use Vercel Doctor?",
    },
    {
      answer: `Yes, ${SITE.NAME} is completely free and open-source under the MIT license.`,
      question: "Is Vercel Doctor free?",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
      name: faq.question,
    })),
  };

  return <JsonLdScript data={jsonLd} />;
};

const JsonLdScripts = () => (
  <>
    <WebsiteJsonLd />
    <SoftwareSourceCodeJsonLd />
    <OrganizationJsonLd />
    <FAQJsonLd />
  </>
);

export {
  JsonLdScripts,
  WebsiteJsonLd,
  SoftwareSourceCodeJsonLd,
  OrganizationJsonLd,
  FAQJsonLd,
};
