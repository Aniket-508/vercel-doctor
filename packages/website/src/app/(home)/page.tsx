import { DisclaimerBanner } from "@/components/landing/disclaimer-banner";
import { Hero } from "@/components/landing/hero";
import { Testimonials } from "@/components/landing/testimonials";
import { PreFooter } from "@/components/landing/pre-footer";
import { Footer } from "@/components/landing/footer";

const HomePage = () => (
  <>
    <DisclaimerBanner />
    <Hero />
    <Testimonials />
    <PreFooter />
    <Footer />
  </>
);

export default HomePage;
