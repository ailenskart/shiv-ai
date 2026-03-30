import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shiv.ai \u2014 The World's Largest Shiva Knowledge Library",
  description: "Ask anything about Lord Shiva. Powered by the most comprehensive collection of Shaivite knowledge \u2014 scriptures, philosophy, mythology, temples, mantras, and traditions from across the world.",
  keywords: ["Shiva", "Lord Shiva", "Mahadev", "Shaivism", "Hindu philosophy", "Shiva AI", "Vedic knowledge"],
  openGraph: {
    title: "Shiv.ai \u2014 The World's Largest Shiva Knowledge Library",
    description: "Ask anything about Lord Shiva. The most comprehensive AI-powered Shaivite knowledge base ever created.",
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
