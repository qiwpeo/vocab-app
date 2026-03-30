import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "고1 영어 모의고사 단어장",
  description: "고1 영어 모의고사 단어 학습 앱",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f4f1e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">
        <div className="crt-overlay" />
        <header className="sticky top-0 z-50 bg-beige-main" style={{ borderBottom: '1px solid var(--beige-dark)' }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="logo-badge relative" style={{ width: 20, height: 26 }}>
                <div className="logo-badge-stem absolute -top-1.5 left-1/2 -translate-x-1/2" style={{ width: 3, height: 7 }} />
              </div>
              <span className="font-serif text-lg text-ink" style={{ fontWeight: 600 }}>
                Voca Mint
              </span>
            </a>
            <a href="/wrong-notes" className="font-mono text-sm text-beige-shadow hover:opacity-70 transition-opacity">
              [오답노트]
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
