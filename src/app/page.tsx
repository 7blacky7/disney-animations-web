import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  HeroSection,
  FeaturesSection,
  QuizShowcaseSection,
  StatsSection,
  CTASection,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <QuizShowcaseSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
