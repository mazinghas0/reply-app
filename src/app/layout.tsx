import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist } from "next/font/google";
import CookieBanner from "./cookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "리플라이 — AI 답장 도우미",
  description: "받은 메시지를 붙여넣으면 AI가 답장 3개를 만들어 드립니다",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "리플라이",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const inner = (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('reply-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()` }} />
        {children}
        <CookieBanner />
      </body>
    </html>
  );

  if (clerkEnabled) {
    return <ClerkProvider signInUrl="/sign-in" signInFallbackRedirectUrl="/app" localization={koKR}>{inner}</ClerkProvider>;
  }

  return inner;
}
