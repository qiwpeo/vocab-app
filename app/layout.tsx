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
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-serif)" }}>
        <div className="crt-overlay" />
        <header className="sticky top-0 z-50" style={{ background: 'var(--beige-main)', borderBottom: '1px solid var(--beige-dark)' }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              {/* Rainbow apple-like badge */}
              <div className="relative w-5 h-6" style={{
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: 'linear-gradient(180deg, #63B548 0%, #63B548 16.6%, #F6C829 16.6%, #F6C829 33.3%, #E57D25 33.3%, #E57D25 50%, #D83335 50%, #D83335 66.6%, #9C4595 66.6%, #9C4595 83.3%, #468CCF 83.3%, #468CCF 100%)',
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              }}>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0.5 h-1.5 rounded-sm" style={{ background: '#5a3e28' }} />
              </div>
              <span className="text-lg tracking-tight" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--ink-black)' }}>
                Voca Mint
              </span>
            </a>
            <a
              href="/wrong-notes"
              className="text-sm flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}
            >
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
