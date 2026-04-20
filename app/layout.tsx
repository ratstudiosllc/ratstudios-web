import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RaT Studios — Software with Personality",
  description: "RaT Studios builds thoughtful software products including StitchLogic and AgAlmanac.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "RaT Studios",
    description: "Software with personality. Currently building StitchLogic and AgAlmanac.",
    url: "https://ratstudios.ai",
    siteName: "RaT Studios",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className} style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <main>{children}</main>
      </body>
    </html>
  );
}
