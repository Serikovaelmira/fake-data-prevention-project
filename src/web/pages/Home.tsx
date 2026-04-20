import { Link } from "wouter";

const topics = [
  {
    path: "/signatures",
    icon: "✍️",
    title: "Digital Signatures",
    desc: "RSA-PSS & ECDSA P-256 — sign messages, verify authenticity, detect tampering in real time.",
    algo: "RSA-PSS / ECDSA",
    color: "oklch(0.82 0.18 195)",
  },
  {
    path: "/certificates",
    icon: "📜",
    title: "X.509 Certificates",
    desc: "Parse certificate fields, understand PKI chain of trust, validate certificate integrity.",
    algo: "X.509 / PKI",
    color: "oklch(0.78 0.16 270)",
  },
  {
    path: "/encryption",
    icon: "🔒",
    title: "Encryption",
    desc: "AES-GCM symmetric encryption and RSA-OAEP asymmetric encryption — encrypt and decrypt data live.",
    algo: "AES-GCM / RSA-OAEP",
    color: "oklch(0.82 0.2 145)",
  },
  {
    path: "/jwt",
    icon: "🎫",
    title: "JSON Web Tokens",
    desc: "Create, sign, verify, and tamper with JWTs. Understand header/payload/signature structure.",
    algo: "HS256 / RS256",
    color: "oklch(0.82 0.2 60)",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-20 relative">
        <div className="inline-block mb-4 px-4 py-1 rounded-full text-xs mono badge-info">
          System Security Project
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Space Mono', monospace" }}>
          <span style={{ color: "oklch(0.95 0 0)" }}>Fake Data</span>
          <br />
          <span style={{ color: "oklch(0.82 0.18 195)" }} className="text-glow-cyan">Prevention</span>
          <br />
          <span style={{ color: "oklch(0.55 0.03 220)", fontSize: "0.55em" }}>with Conventional Cryptotools</span>
        </h1>
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-10" style={{ color: "oklch(0.65 0.03 220)", lineHeight: 1.8 }}>
          An interactive exploration of how <strong style={{ color: "oklch(0.82 0.18 195)" }}>digital signatures</strong>,{" "}
          <strong style={{ color: "oklch(0.78 0.16 270)" }}>X.509 certificates</strong>,{" "}
          <strong style={{ color: "oklch(0.82 0.2 145)" }}>encryption</strong>, and{" "}
          <strong style={{ color: "oklch(0.82 0.2 60)" }}>JSON Web Tokens</strong> protect data integrity and authenticity.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signatures">
            <button className="px-6 py-3 rounded text-sm font-bold cursor-pointer transition-all hover:scale-105" style={{ fontFamily: "'Space Mono', monospace", background: "oklch(0.82 0.18 195)", color: "oklch(0.09 0.015 240)" }}>
              Start Demo →
            </button>
          </Link>
          <a href="https://github.com/Serikovaelmira/fake-data-prevention-project" target="_blank" rel="noreferrer">
            <button className="px-6 py-3 rounded text-sm cursor-pointer transition-all border" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)", borderColor: "oklch(0.82 0.18 195 / 50%)", background: "transparent" }}>
              GitHub ↗
            </button>
          </a>
        </div>
      </div>

      {/* Topic Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        {topics.map((t) => (
          <Link key={t.path} href={t.path}>
            <div
              className="p-6 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
              style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = t.color + "66";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${t.color}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.05 210 / 40%)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{t.icon}</span>
                <span className="text-xs mono px-2 py-1 rounded" style={{ background: t.color + "22", color: t.color, border: `1px solid ${t.color}44` }}>
                  {t.algo}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Mono', monospace", color: t.color }}>
                {t.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.03 220)" }}>
                {t.desc}
              </p>
              <div className="mt-4 text-xs mono" style={{ color: t.color }}>
                Explore → 
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* How it works */}
      <div className="rounded-lg border p-8 mb-12" style={{ background: "oklch(0.11 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
        <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
          Why Cryptography Prevents Fake Data
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🔏", title: "Integrity", desc: "Any modification to data invalidates the cryptographic signature. Tampering is immediately detectable." },
            { icon: "🪪", title: "Authenticity", desc: "Digital certificates bind public keys to verified identities, ensuring data comes from a trusted source." },
            { icon: "🚫", title: "Non-repudiation", desc: "The private key owner cannot deny signing data — only they could have produced that signature." },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-bold mb-2 text-sm" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.85 0 0)" }}>
                {item.title}
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.03 220)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="text-center">
        <p className="text-xs mono mb-3" style={{ color: "oklch(0.45 0.03 220)" }}>Built with</p>
        <div className="flex flex-wrap justify-center gap-3">
          {["Web Crypto API", "jose (JWT)", "React + Vite", "TypeScript", "Tailwind CSS"].map((t) => (
            <span key={t} className="text-xs mono px-3 py-1 rounded border" style={{ color: "oklch(0.65 0.03 220)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
