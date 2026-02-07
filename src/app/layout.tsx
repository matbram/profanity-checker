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
          background: '#0a0a0f',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <nav className="border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 no-underline">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white font-bold text-sm">
                PS
              </div>
              <span className="text-lg font-semibold text-[#e8e8f0]">
                ProfanityScreen
              </span>
            </a>
            <div className="text-sm text-[#6b7280]">
              AI-Powered Content Analysis
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
