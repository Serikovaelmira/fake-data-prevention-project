import { Link, useLocation } from "wouter";
import { useState } from "react";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/signatures", label: "Digital Signatures" },
  { path: "/certificates", label: "Certificates" },
  { path: "/encryption", label: "Encryption" },
  { path: "/jwt", label: "JWT" },
  { path: "/report", label: "Report" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "oklch(0.09 0.015 240 / 95%)", backdropFilter: "blur(12px)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/">
            <span className="font-bold text-sm tracking-wider cursor-pointer" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
              🔐 CRYPTO<span style={{ color: "oklch(0.82 0.2 145)" }}>SHIELD</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <span
                  className="px-3 py-1.5 rounded text-xs cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: location === link.path ? "oklch(0.82 0.18 195)" : "oklch(0.65 0.03 220)",
                    background: location === link.path ? "oklch(0.82 0.18 195 / 10%)" : "transparent",
                    borderBottom: location === link.path ? "1px solid oklch(0.82 0.18 195)" : "1px solid transparent",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-xs px-2 py-1 rounded border" style={{ color: "oklch(0.82 0.18 195)", borderColor: "oklch(0.82 0.18 195 / 40%)" }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-4 pb-3 flex flex-col gap-1" style={{ borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <span
                  className="block px-3 py-2 rounded text-xs cursor-pointer"
                  style={{ fontFamily: "'Space Mono', monospace", color: location === link.path ? "oklch(0.82 0.18 195)" : "oklch(0.65 0.03 220)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 text-center" style={{ borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
        <p className="text-xs mono" style={{ color: "oklch(0.45 0.03 220)" }}>
          System Security Project — Fake Data Prevention with Conventional Cryptotools &nbsp;|&nbsp; Elmira Serikova &nbsp;|&nbsp; 2026
        </p>
      </footer>
    </div>
  );
}
