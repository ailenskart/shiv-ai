import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shiv.ai"),
  title: {
    default: "Shiv.ai — Universal Spiritual Wisdom Library",
    template: "%s | Shiv.ai",
  },
  description:
    "The world's largest AI-powered spiritual knowledge library. Ask anything about Shiva, the Bhagavad Gita, the Vedas, Buddhism, Christianity, Islam, Jainism, Sikhism, Judaism, and Taoism — all in one place.",
  keywords: [
    "Shiva", "Bhagavad Gita", "Vedas", "Hindu philosophy", "Shaivism",
    "Buddhism", "Christianity", "Quran", "Islam", "Jainism", "Sikhism",
    "Torah", "Judaism", "Tao Te Ching", "AI spiritual knowledge",
  ],
  openGraph: {
    title: "Shiv.ai — Universal Spiritual Wisdom Library",
    description:
      "AI-powered library covering 11 spiritual traditions: Shiva, Gita, Vedas, Buddha, Christianity, Quran, Jain, Sikh, Torah, Tao, and more.",
    url: "https://shiv.ai",
    siteName: "Shiv.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shiv.ai — Universal Spiritual Wisdom Library",
    description:
      "AI-powered library covering 11 spiritual traditions, all in one place.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
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
