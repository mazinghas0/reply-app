import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "리플라이 — AI 답장 도우미",
  description: "받은 메시지를 붙여넣으면 AI가 답장 3개를 만들어 드립니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[family-name:var(--font-geist-sans)]">
        {children}
      </body>
    </html>
  );
}
