import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "고1 영어 모의고사 단어장",
  description: "고1 영어 모의고사 단어 학습 앱",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-blue-600 dark:text-blue-400">
              고1 영어 단어장
            </a>
            <a
              href="/wrong-notes"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              오답노트
            </a>
          </div>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
