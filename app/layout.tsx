import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RaT Studios — Software with Personality",
  description: "RaT Studios builds thoughtful software products. Currently: StitchLogic, the iOS app for quilters.",
  openGraph: {
    title: "RaT Studios",
    description: "Software with personality. Currently building StitchLogic for quilters.",
    url: "https://ratstudios.ai",
    siteName: "RaT Studios",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className} style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <header style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }} className="sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold gradient-text">RaT Studios</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--color-slate)" }}>
              <Link href="/#products" className="hover:text-orange-500 transition">Products</Link>
              <Link href="/#about" className="hover:text-orange-500 transition">About</Link>
              <Link href="/#contact" className="hover:text-orange-500 transition">Contact</Link>
              <Link href="https://stitchlogic.app" target="_blank" rel="noopener noreferrer"
                className="gradient-bg text-white px-4 py-2 rounded-full hover:opacity-90 transition text-sm shadow-sm">
                StitchLogic →
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer style={{ background: "var(--color-dark)", color: "rgba(255,255,255,0.5)" }} className="py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
              <div>
                <p className="text-white font-bold text-lg mb-2">RaT Studios</p>
                <p className="text-sm">Software with personality.</p>
                <p className="text-sm">Wyoming LLC</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-3 text-sm">Products</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="https://stitchlogic.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">StitchLogic</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-3 text-sm">Company</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/#about" className="hover:text-white transition">About</Link></li>
                  <li><Link href="/#contact" className="hover:text-white transition">Contact</Link></li>
                  <li><Link href="https://stitchlogic.app/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="https://stitchlogic.app/terms" className="hover:text-white transition">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }} className="pt-6 text-xs text-center">
              © {new Date().getFullYear()} RaT Studios LLC. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
