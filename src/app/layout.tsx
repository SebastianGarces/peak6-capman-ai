import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CapMan AI — Options Trading Education",
  description:
    "AI-powered gamified options trading education platform with real-time challenges and MTSS support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${sora.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a href="#main-content" className="skip-nav">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
