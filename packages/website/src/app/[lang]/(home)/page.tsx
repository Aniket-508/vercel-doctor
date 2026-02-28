import { DisclaimerBanner } from "@/components/landing/disclaimer-banner";
import { Hero } from "@/components/landing/hero";
import { Testimonials } from "@/components/landing/testimonials";
import { PreFooter } from "@/components/landing/pre-footer";
import { Footer } from "@/components/landing/footer";
import { i18n } from "@/lib/i18n";
import { getTranslation } from "@/translations";

export const generateStaticParams = () => i18n.languages.map((lang) => ({ lang }));

const HomePage = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;
  const translation = getTranslation(lang);

  return (
    <>
      <DisclaimerBanner translation={translation} />
      <Hero translation={translation} lang={lang} />
      <Testimonials translation={translation} />
      <PreFooter translation={translation} lang={lang} />
      <Footer translation={translation} />
    </>
  );
};

export default HomePage;
