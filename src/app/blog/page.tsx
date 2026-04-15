import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "답장 꿀팁 블로그 — 리플라이",
  description:
    "카톡 답장, 비즈니스 이메일, 거절 메시지까지. 상황별 답장 작성 팁과 예시를 모았습니다.",
  keywords: [
    "답장 팁",
    "메시지 작성법",
    "카톡 답장",
    "이메일 답장",
    "AI 답장",
  ],
  openGraph: {
    title: "답장 꿀팁 블로그 — 리플라이",
    description: "상황별 답장 작성 팁과 예시를 모았습니다.",
    type: "website",
    url: "https://aireply.co.kr/blog",
    siteName: "리플라이",
  },
  alternates: { canonical: "https://aireply.co.kr/blog" },
};

export default function BlogListPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300">
      {/* 헤더 */}
      <header className="px-4 py-6 border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-400">리플라이</span>
          </Link>
          <span className="text-slate-700 text-sm">/</span>
          <span className="text-sm text-slate-300">블로그</span>
          <Link
            href="/?intro=1#pricing"
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600/90 text-white hover:bg-teal-500 transition-colors"
          >
            요금제 보기
          </Link>
        </div>
      </header>

      {/* 목록 */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">답장 꿀팁 블로그</h1>
        <p className="text-slate-500 mb-10">상황별 답장 작성 팁과 예시를 모았습니다</p>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-5 rounded-2xl border border-slate-800/50 hover:border-teal-800/50 hover:bg-slate-900/30 transition-all group"
            >
              <h2 className="text-base font-semibold text-white group-hover:text-teal-400 transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{post.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                <span>·</span>
                <span>{post.readingTime} 읽기</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-4">답장 고민, AI에게 맡겨 보세요</p>
          <Link
            href="/app"
            className="inline-block px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors"
          >
            리플라이로 답장 만들기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="px-4 py-8 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] text-slate-700">&copy; 2026 Kevin AI Corp &middot; 리플라이</p>
        </div>
      </footer>
    </main>
  );
}
