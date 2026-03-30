import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shiv.ai — Shiva, Gita & Vedas Knowledge Library",
  description: "The world's largest AI-powered spiritual knowledge library. Ask anything about Lord Shiva, the Bhagavad Gita, and the Vedas. Powered by the most comprehensive collection of Hindu scriptures, philosophy, mythology, and traditions.",
  keywords: ["Shiva", "Bhagavad Gita", "Vedas", "Hindu philosophy", "Shaivism", "Krishna", "Upanishads", "AI knowledge"],
  openGraph: {
    title: "Shiv.ai — Shiva, Gita & Vedas Knowledge Library",
    description: "The world's largest AI-powered spiritual knowledge library covering Lord Shiva, Bhagavad Gita, and the Vedas.",
    url: "https://shiv.ai",
    siteName: "Shiv.ai",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
