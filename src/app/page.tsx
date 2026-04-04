import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  HeroSection,
  FeaturesSection,
  QuizShowcaseSection,
  StatsSection,
  CTASection,
} from "@/components/sections";
import { listPublicQuizzes } from "@/lib/actions/quiz-actions";
import { PublicQuizSection } from "@/components/sections/PublicQuizSection";

export default async function Home() {
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
