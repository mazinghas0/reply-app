import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { posts } from "../posts";

const BASE_URL = "https://reply-app-sepia.vercel.app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — 리플라이 블로그`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: "리플라이",
      publishedTime: post.publishedAt,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

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
          <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">블로그</Link>
        </div>
      </header>

      {/* 본문 */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-3 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            <span>·</span>
            <span>{post.readingTime} 읽기</span>
          </div>
        </div>

        <div className="space-y-10">
          {post.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-white mb-4">{section.heading}</h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-line">
                {section.content.split("\n\n").map((paragraph, j) => {
                  const lines = paragraph.split("\n");
                  return (
                    <div key={j} className="mb-4">
                      {lines.map((line, k) => {
                        // **bold** 처리
                        const parts = line.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={k} className={line.startsWith("- ") ? "pl-4" : ""}>
                            {parts.map((part, m) =>
                              m % 2 === 1 ? (
                                <strong key={m} className="text-slate-200 font-semibold">{part}</strong>
                              ) : (
                                <span key={m}>{part}</span>
                              )
                            )}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 text-center">
          <p className="text-white font-semibold mb-2">답장 고민, AI에게 맡겨 보세요</p>
          <p className="text-slate-400 text-sm mb-5">받은 메시지를 붙여넣으면 톤별 답장 3개를 바로 만들어 줍니다</p>
          <Link
            href="/app"
            className="inline-block px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors"
          >
            리플라이로 답장 만들기
          </Link>
        </div>

        {/* 다른 글 */}
        <div className="mt-12 pt-8 border-t border-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-500 mb-4">다른 글 읽기</h3>
          <div className="space-y-3">
            {posts
              .filter((p) => p.slug !== post.slug)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block text-sm text-slate-400 hover:text-teal-400 transition-colors"
                >
                  {p.title}
                </Link>
              ))}
          </div>
        </div>
      </article>

      {/* 푸터 */}
      <footer className="px-4 py-8 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] text-slate-700">&copy; 2026 Kevin AI Corp &middot; 리플라이</p>
        </div>
      </footer>
    </main>
  );
}
