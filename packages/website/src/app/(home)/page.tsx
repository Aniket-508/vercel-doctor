import { DisclaimerBanner } from "@/components/landing/disclaimer-banner";
import { Hero } from "@/components/landing/hero";
import { Demo } from "@/components/landing/demo";
import { Testimonials } from "@/components/landing/testimonials";
import { Sponsors } from "@/components/landing/sponsors";
import { PreFooter } from "@/components/landing/pre-footer";
import { Footer } from "@/components/landing/footer";

const HomePage = () => (
  <>
    <DisclaimerBanner />
    <Hero />
    <Demo />
    <Testimonials />
    <Sponsors />
    <PreFooter />
    <Footer />
  </>
);

export default HomePage;
