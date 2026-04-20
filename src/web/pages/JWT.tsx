import { useState } from "react";
import { SignJWT, jwtVerify, decodeJwt, decodeProtectedHeader } from "jose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  try { return JSON.stringify(JSON.parse(atob(base64)), null, 2); }
  catch { return atob(base64); }
}

async function createHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ClaimsState {
  sub: string;
  role: string;
  iss: string;
  expMinutes: string;
}

export default function JWT() {
  const [claims, setClaims] = useState<ClaimsState>({ sub: "alice@example.com", role: "admin", iss: "auth.example.com", expMinutes: "60" });
  const [secret, setSecret] = useState("super-secret-key-for-hs256-demo");
  const [token, setToken] = useState("");
  const [parts, setParts] = useState<{ header: string; payload: string; signature: string } | null>(null);
  const [verifyToken, setVerifyToken] = useState("");
  const [verifySecret, setVerifySecret] = useState("super-secret-key-for-hs256-demo");
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; payload?: Record<string, unknown>; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const key = await createHmacKey(secret);
      const jwt = await new SignJWT({ sub: claims.sub, role: claims.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer(claims.iss)
        .setIssuedAt()
        .setExpirationTime(`${claims.expMinutes}m`)
        .sign(key);

      setToken(jwt);
      setVerifyToken(jwt);
      const [h, p, s] = jwt.split(".");
      setParts({ header: base64urlDecode(h), payload: base64urlDecode(p), signature: s });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleVerify() {
    setLoading(true);
    try {
      const key = await createHmacKey(verifySecret);
      const { payload } = await jwtVerify(verifyToken, key);
      setVerifyResult({ valid: true, payload: payload as Record<string, unknown> });
    } catch (e: unknown) {
      const err = e as Error;
      setVerifyResult({ valid: false, error: err.message });
    }
    setLoading(false);
  }

  function decodeParts() {
    if (!verifyToken) return;
    const [h, p, s] = verifyToken.split(".");
    if (!h || !p || !s) return;
    setParts({ header: base64urlDecode(h), payload: base64urlDecode(p), signature: s });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-xs mono badge-info px-3 py-1 rounded-full">Module 04</span>
        <h1 className="text-3xl font-bold mt-3 mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.2 60)" }}>
          JSON Web Tokens
        </h1>
        <p className="text-sm leading-relaxed max-w-3xl" style={{ color: "oklch(0.65 0.03 220)" }}>
          JWT (RFC 7519) is a compact, URL-safe token for transmitting claims between parties. Each token is{" "}
          <strong style={{ color: "oklch(0.95 0 0)" }}>signed</strong> — any modification to the payload invalidates the signature.
          Commonly used in <strong style={{ color: "oklch(0.82 0.2 60)" }}>authentication</strong> and{" "}
          <strong style={{ color: "oklch(0.82 0.2 60)" }}>authorization</strong> flows.
        </p>
      </div>

      {/* Structure diagram */}
      <div className="mb-8 p-5 rounded-lg border" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
        <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.2 60)" }}>JWT Structure</h3>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="px-3 py-2 rounded text-xs mono font-bold" style={{ background: "oklch(0.82 0.18 195 / 20%)", color: "oklch(0.82 0.18 195)", border: "1px solid oklch(0.82 0.18 195 / 40%)" }}>
            HEADER
          </div>
          <span style={{ color: "oklch(0.55 0.03 220)" }}>.</span>
          <div className="px-3 py-2 rounded text-xs mono font-bold" style={{ background: "oklch(0.82 0.2 145 / 20%)", color: "oklch(0.82 0.2 145)", border: "1px solid oklch(0.82 0.2 145 / 40%)" }}>
            PAYLOAD
          </div>
          <span style={{ color: "oklch(0.55 0.03 220)" }}>.</span>
          <div className="px-3 py-2 rounded text-xs mono font-bold" style={{ background: "oklch(0.82 0.2 60 / 20%)", color: "oklch(0.82 0.2 60)", border: "1px solid oklch(0.82 0.2 60 / 40%)" }}>
            SIGNATURE
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded" style={{ background: "oklch(0.82 0.18 195 / 8%)", border: "1px solid oklch(0.82 0.18 195 / 20%)" }}>
            <div className="font-bold mono mb-1" style={{ color: "oklch(0.82 0.18 195)" }}>Header</div>
            <div style={{ color: "oklch(0.65 0.03 220)" }}>Base64URL(JSON)<br/>Contains: <code className="mono">alg</code>, <code className="mono">typ</code><br/>e.g. <code className="mono">{`{"alg":"HS256","typ":"JWT"}`}</code></div>
          </div>
          <div className="p-3 rounded" style={{ background: "oklch(0.82 0.2 145 / 8%)", border: "1px solid oklch(0.82 0.2 145 / 20%)" }}>
            <div className="font-bold mono mb-1" style={{ color: "oklch(0.82 0.2 145)" }}>Payload (Claims)</div>
            <div style={{ color: "oklch(0.65 0.03 220)" }}>Base64URL(JSON)<br/>Registered: <code className="mono">iss</code>, <code className="mono">sub</code>, <code className="mono">exp</code>, <code className="mono">iat</code><br/>Custom: any JSON fields</div>
          </div>
          <div className="p-3 rounded" style={{ background: "oklch(0.82 0.2 60 / 8%)", border: "1px solid oklch(0.82 0.2 60 / 20%)" }}>
            <div className="font-bold mono mb-1" style={{ color: "oklch(0.82 0.2 60)" }}>Signature</div>
            <div style={{ color: "oklch(0.65 0.03 220)" }}>HMAC-SHA256(<br/>&nbsp;&nbsp;base64url(header) + "." +<br/>&nbsp;&nbsp;base64url(payload),<br/>&nbsp;&nbsp;secret<br/>)</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Create JWT */}
        <div className="rounded-lg border p-5" style={{ background: "oklch(0.11 0.02 240)", borderColor: "oklch(0.82 0.2 60 / 30%)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.2 60)" }}>
            // 1. Create & Sign JWT
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(claims).map(([key, val]) => (
                <div key={key}>
                  <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>{key}:</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setClaims({ ...claims, [key]: e.target.value })}
                    className="w-full p-2 rounded text-xs mono border"
                    style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.85 0 0)", borderColor: "oklch(0.28 0.05 210 / 50%)" }}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>Signing Secret (HS256):</label>
              <input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} className="w-full p-2 rounded text-xs mono border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.82 0.2 60)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
            </div>
            <button onClick={handleCreate} disabled={loading} className="w-full py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.2 60 / 20%)", color: "oklch(0.82 0.2 60)", border: "1px solid oklch(0.82 0.2 60 / 50%)" }}>
              {loading ? "Signing..." : "Sign JWT →"}
            </button>
          </div>

          {token && (
            <div className="mt-4 terminal">
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: "#ff5f57" }} />
                <span className="terminal-dot" style={{ background: "#febc2e" }} />
                <span className="terminal-dot" style={{ background: "#28c840" }} />
                <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>token.jwt</span>
              </div>
              <div className="terminal-body">
                <p className="text-xs break-all leading-relaxed">
                  <span style={{ color: "oklch(0.82 0.18 195)" }}>{token.split(".")[0]}</span>
                  <span style={{ color: "oklch(0.55 0.03 220)" }}>.</span>
                  <span style={{ color: "oklch(0.82 0.2 145)" }}>{token.split(".")[1]}</span>
                  <span style={{ color: "oklch(0.55 0.03 220)" }}>.</span>
                  <span style={{ color: "oklch(0.82 0.2 60)" }}>{token.split(".")[2]}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Verify JWT */}
        <div className="rounded-lg border p-5" style={{ background: "oklch(0.11 0.02 240)", borderColor: "oklch(0.82 0.18 195 / 30%)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
            // 2. Verify & Decode JWT
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>
                JWT to verify: <span style={{ color: "oklch(0.65 0.22 25)" }}>(modify payload to test tamper detection)</span>
              </label>
              <textarea value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} rows={5} className="w-full p-2 rounded text-xs mono resize-none border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.75 0 0)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
            </div>
            <div>
              <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>
                Verification Secret: <span style={{ color: "oklch(0.82 0.2 60)" }}>(try wrong secret)</span>
              </label>
              <input type="text" value={verifySecret} onChange={(e) => setVerifySecret(e.target.value)} className="w-full p-2 rounded text-xs mono border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.82 0.18 195)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleVerify} disabled={loading || !verifyToken} className="flex-1 py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.18 195 / 20%)", color: "oklch(0.82 0.18 195)", border: "1px solid oklch(0.82 0.18 195 / 50%)" }}>
                Verify Signature
              </button>
              <button onClick={decodeParts} disabled={!verifyToken} className="flex-1 py-2 rounded text-xs mono" style={{ background: "transparent", color: "oklch(0.55 0.03 220)", border: "1px solid oklch(0.28 0.05 210 / 40%)" }}>
                Decode (no verify)
              </button>
            </div>
          </div>

          {verifyResult && (
            <div className="mt-4 p-3 rounded border" style={{ background: verifyResult.valid ? "oklch(0.82 0.2 145 / 10%)" : "oklch(0.65 0.22 25 / 10%)", borderColor: verifyResult.valid ? "oklch(0.82 0.2 145 / 40%)" : "oklch(0.65 0.22 25 / 40%)" }}>
              <div className="text-sm mono font-bold mb-2" style={{ color: verifyResult.valid ? "oklch(0.82 0.2 145)" : "oklch(0.65 0.22 25)" }}>
                {verifyResult.valid ? "✅ VALID — Signature verified" : "❌ INVALID — " + verifyResult.error}
              </div>
              {verifyResult.valid && verifyResult.payload && (
                <pre className="text-xs" style={{ color: "oklch(0.75 0 0)" }}>
                  {JSON.stringify(verifyResult.payload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Decoded parts */}
      {parts && (
        <div className="mb-6 grid md:grid-cols-3 gap-4">
          {[
            { label: "Header", data: parts.header, color: "oklch(0.82 0.18 195)" },
            { label: "Payload", data: parts.payload, color: "oklch(0.82 0.2 145)" },
            { label: "Signature", data: parts.signature, color: "oklch(0.82 0.2 60)" },
          ].map((p) => (
            <div key={p.label} className="terminal">
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: "#ff5f57" }} />
                <span className="terminal-dot" style={{ background: "#febc2e" }} />
                <span className="terminal-dot" style={{ background: "#28c840" }} />
                <span className="text-xs font-bold" style={{ color: p.color }}>{p.label}</span>
              </div>
              <div className="terminal-body">
                <pre className="text-xs break-all whitespace-pre-wrap" style={{ color: p.color }}>{p.data}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Common attacks */}
      <div className="mb-6 p-5 rounded-lg border" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.65 0.22 25 / 30%)" }}>
        <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.65 0.22 25)" }}>
          ⚠️ JWT Attack Vectors
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Algorithm Confusion (alg:none)", desc: 'Attacker sets alg to "none" and removes signature. Server must reject unsigned tokens.', fix: "Always validate alg header. Reject alg:none." },
            { title: "Payload Tampering", desc: "Base64URL-decode payload, modify claims (e.g. role:user→admin), re-encode, keep old signature. Verification fails.", fix: "Signature verification catches any payload modification." },
            { title: "Weak Secret", desc: "HS256 with short or guessable secrets can be brute-forced offline.", fix: "Use at least 256-bit random secrets or RS256/ES256." },
          ].map((a) => (
            <div key={a.title} className="p-3 rounded border" style={{ background: "oklch(0.65 0.22 25 / 5%)", borderColor: "oklch(0.65 0.22 25 / 20%)" }}>
              <div className="text-xs font-bold mono mb-1" style={{ color: "oklch(0.65 0.22 25)" }}>{a.title}</div>
              <p className="text-xs mb-2" style={{ color: "oklch(0.55 0.03 220)" }}>{a.desc}</p>
              <div className="text-xs mono" style={{ color: "oklch(0.82 0.2 145)" }}>✓ {a.fix}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Code */}
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot" style={{ background: "#ff5f57" }} />
          <span className="terminal-dot" style={{ background: "#febc2e" }} />
          <span className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>jwt-demo.ts — using 'jose' library</span>
        </div>
        <div className="terminal-body">
          <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "oklch(0.75 0 0)" }}>{`import { SignJWT, jwtVerify } from 'jose';

// Sign a JWT with HS256
const secret = new TextEncoder().encode('your-256-bit-secret');

const jwt = await new SignJWT({ sub: 'alice', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuer('auth.example.com')
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(secret);

console.log(jwt);
// eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGljZSIsInJvbGUiOiJhZG1pbiJ9.signature

// Verify and decode
try {
  const { payload } = await jwtVerify(jwt, secret, {
    issuer: 'auth.example.com',
  });
  console.log(payload.sub);  // 'alice'
  console.log(payload.role); // 'admin'
} catch (err) {
  // JWTExpired, JWSSignatureVerificationFailed, etc.
  console.error('Invalid token:', err.code);
}`}</pre>
        </div>
      </div>
    </div>
  );
}
