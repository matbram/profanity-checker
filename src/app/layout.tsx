import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "ProfanityScreen - Movie & TV Profanity Checker",
  description: "Find out exactly what profanity is in any movie or TV show before you watch. Powered by AI subtitle analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `}} />
      </head>
      <body
        className="antialiased min-h-screen"
        style={{
          background: 'var(--bg)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <nav className="border-b backdrop-blur-md sticky top-0 z-50" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--nav-bg)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: 'var(--accent)' }}>
                PS
              </div>
              <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                ProfanityScreen
              </span>
            </a>
            <div className="flex items-center gap-3">
              <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                AI-Powered Subtitle Analysis
              </span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
