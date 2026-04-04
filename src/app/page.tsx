import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  HeroSection,
  FeaturesSection,
  QuizShowcaseSection,
  StatsSection,
  CTASection,
} from "@/components/sections";
import { listPublicQuizzes } from "@/lib/actions/quiz";
import { PublicQuizSection } from "@/components/sections/PublicQuizSection";

// Force dynamic rendering + no-store cache to prevent bfcache
export const dynamic = "force-dynamic";

export default async function Home() {
  // Force dynamic rendering — prevents Next.js from caching this page
  await headers();
  const publicQuizzes = await listPublicQuizzes().catch(() => []);

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <QuizShowcaseSection />
        {publicQuizzes.length > 0 && (
          <PublicQuizSection quizzes={publicQuizzes} />
        )}
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
