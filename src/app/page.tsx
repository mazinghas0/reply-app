import type { Metadata } from "next";
import PricingSection from "./pricingSection";
import NavSection from "./sections/navSection";
import HeroSection from "./sections/heroSection";
import StepsSection from "./sections/stepsSection";
import AiCompareSection from "./sections/aiCompareSection";
import PersonaSection from "./sections/personaSection";
import FeaturesSection from "./sections/featuresSection";
import ReviewSection from "./sections/reviewSection";
import BeforeAfterSection from "./sections/beforeAfterSection";
import CtaSection from "./sections/ctaSection";
import FooterSection from "./sections/footerSection";

export const metadata: Metadata = {
  title: "리플라이 — 상사 카톡에 10분째 멈춰 있다면, AI가 대신 고민해 드릴게요",
  description:
    "썸 답장, 거래처 거절 메일, 사춘기 자녀 대화까지 — 관계와 상황만 고르면 말투까지 맞춘 답장 3개가 바로 나와요.",
  keywords: [
    "AI 답장",
    "답장 생성",
    "메시지 답장",
    "카톡 답장",
    "비즈니스 메시지",
    "답장 도우미",
    "거절 답장",
    "사과 답장",
    "사춘기 자녀 대화",
    "부모 자녀 대화",
    "감정 대화",
    "말투 코칭",
    "메시지 말하기",
    "답장 검토",
  ],
  openGraph: {
    title: "리플라이 — 상사 카톡에 10분째 멈춰 있다면, AI가 대신 고민해 드릴게요",
    description:
      "썸 답장, 거래처 거절 메일, 사춘기 자녀 대화까지 — 관계와 상황만 고르면 말투까지 맞춘 답장 3개가 바로 나와요.",
    type: "website",
    url: "https://aireply.co.kr",
    siteName: "리플라이",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "리플라이 — 상사 카톡에 10분째 멈춰 있다면, AI가 대신 고민해 드릴게요",
    description: "썸 답장, 거래처 메일, 사춘기 자녀 대화까지. 말투 고민은 리플라이에 맡기세요.",
  },
  alternates: {
    canonical: "https://aireply.co.kr",
  },
};

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col bg-slate-950 text-slate-100">
      <NavSection />
      <HeroSection />
      <StepsSection />
      <AiCompareSection />
      <PersonaSection />
      <FeaturesSection />
      <ReviewSection />
      <BeforeAfterSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
