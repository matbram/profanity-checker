import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen"
        style={{
          background: '#09090b',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <nav className="border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-7 h-7 rounded-md bg-[#06b6d4] flex items-center justify-center text-white font-bold text-xs">
                PS
              </div>
              <span className="text-[15px] font-semibold text-[#fafafa] tracking-tight">
                ProfanityScreen
              </span>
            </a>
            <span className="text-xs text-[#71717a] hidden sm:block">
              AI-Powered Subtitle Analysis
            </span>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
