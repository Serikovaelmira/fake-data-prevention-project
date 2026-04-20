import { useState } from "react";

// ─── Crypto helpers ───────────────────────────────────────────────────────────

async function generateRSAKeyPair() {
  return crypto.subtle.generateKey(
    { name: "RSA-PSS", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );
}

async function generateECKeyPair() {
  return crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
}

async function signRSA(privateKey: CryptoKey, message: string): Promise<string> {
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, privateKey, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verifyRSA(publicKey: CryptoKey, message: string, signatureB64: string): Promise<boolean> {
  const enc = new TextEncoder();
  const sig = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
  return crypto.subtle.verify({ name: "RSA-PSS", saltLength: 32 }, publicKey, sig, enc.encode(message));
}

async function signEC(privateKey: CryptoKey, message: string): Promise<string> {
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verifyEC(publicKey: CryptoKey, message: string, signatureB64: string): Promise<boolean> {
  const enc = new TextEncoder();
  const sig = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publicKey, sig, enc.encode(message));
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Algo = "RSA-PSS" | "ECDSA";

export default function Signatures() {
  const [algo, setAlgo] = useState<Algo>("RSA-PSS");
  const [message, setMessage] = useState("Hello, this is authentic data from Alice.");
  const [verifyMessage, setVerifyMessage] = useState("Hello, this is authentic data from Alice.");
  const [signature, setSignature] = useState("");
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (line: string) => setLog(prev => [...prev.slice(-20), line]);

  async function handleGenerate() {
    setLoading(true);
    setSignature(""); setPublicKeyPem(""); setVerifyResult(null);
    addLog(`[${new Date().toISOString()}] Generating ${algo} key pair...`);
    const kp = algo === "RSA-PSS" ? await generateRSAKeyPair() : await generateECKeyPair();
    setKeyPair(kp as CryptoKeyPair);
    const pem = await exportPublicKey((kp as CryptoKeyPair).publicKey);
    setPublicKeyPem(pem);
    addLog(`[OK] Key pair generated. Public key exported (SPKI/PEM).`);
    setLoading(false);
  }

  async function handleSign() {
    if (!keyPair) { addLog("[ERR] Generate key pair first."); return; }
    setLoading(true);
    addLog(`[${new Date().toISOString()}] Signing message with ${algo}...`);
    const sig = algo === "RSA-PSS"
      ? await signRSA(keyPair.privateKey, message)
      : await signEC(keyPair.privateKey, message);
    setSignature(sig);
    setVerifyMessage(message);
    addLog(`[OK] Signature generated (${sig.length} base64 chars).`);
    setLoading(false);
  }

  async function handleVerify() {
    if (!keyPair || !signature) { addLog("[ERR] Sign a message first."); return; }
    setLoading(true);
    addLog(`[${new Date().toISOString()}] Verifying signature for: "${verifyMessage.slice(0, 40)}..."`);
    const valid = algo === "RSA-PSS"
      ? await verifyRSA(keyPair.publicKey, verifyMessage, signature)
      : await verifyEC(keyPair.publicKey, verifyMessage, signature);
    setVerifyResult(valid);
    addLog(`[${valid ? "VALID ✓" : "INVALID ✗"}] Signature verification: ${valid ? "PASS" : "FAIL — data was tampered!"}`);
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-xs mono badge-info px-3 py-1 rounded-full">Module 01</span>
        <h1 className="text-3xl font-bold mt-3 mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
          Digital Signatures
        </h1>
        <p className="text-sm leading-relaxed max-w-3xl" style={{ color: "oklch(0.65 0.03 220)" }}>
          A digital signature is a cryptographic mechanism that proves <strong style={{ color: "oklch(0.95 0 0)" }}>integrity</strong> (data not altered) and{" "}
          <strong style={{ color: "oklch(0.95 0 0)" }}>authenticity</strong> (came from the stated sender). It is computed using the sender's{" "}
          <strong style={{ color: "oklch(0.82 0.18 195)" }}>private key</strong> and verified using their <strong style={{ color: "oklch(0.82 0.2 145)" }}>public key</strong>.
        </p>
      </div>

      {/* Theory */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-5 rounded-lg border" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>How RSA-PSS Works</h3>
          <ol className="text-xs space-y-2" style={{ color: "oklch(0.65 0.03 220)" }}>
            <li><span style={{ color: "oklch(0.82 0.18 195)" }}>1.</span> Hash the message: <code className="mono">h = SHA-256(msg)</code></li>
            <li><span style={{ color: "oklch(0.82 0.18 195)" }}>2.</span> Apply PSS padding to the hash</li>
            <li><span style={{ color: "oklch(0.82 0.18 195)" }}>3.</span> Encrypt with private key: <code className="mono">σ = d^e mod n</code></li>
            <li><span style={{ color: "oklch(0.82 0.18 195)" }}>4.</span> Verify: decrypt with public key, check PSS padding & hash</li>
          </ol>
        </div>
        <div className="p-5 rounded-lg border" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.2 145)" }}>How ECDSA Works</h3>
          <ol className="text-xs space-y-2" style={{ color: "oklch(0.65 0.03 220)" }}>
            <li><span style={{ color: "oklch(0.82 0.2 145)" }}>1.</span> Hash the message: <code className="mono">h = SHA-256(msg)</code></li>
            <li><span style={{ color: "oklch(0.82 0.2 145)" }}>2.</span> Generate random nonce <code className="mono">k</code>, compute point <code className="mono">R = k·G</code></li>
            <li><span style={{ color: "oklch(0.82 0.2 145)" }}>3.</span> Compute: <code className="mono">s = k⁻¹(h + r·privKey) mod n</code></li>
            <li><span style={{ color: "oklch(0.82 0.2 145)" }}>4.</span> Signature is <code className="mono">(r, s)</code>. Verify using public key point.</li>
          </ol>
        </div>
      </div>

      {/* Demo */}
      <div className="rounded-lg border p-6 mb-6" style={{ background: "oklch(0.11 0.02 240)", borderColor: "oklch(0.82 0.18 195 / 30%)" }}>
        <h2 className="text-base font-bold mb-5" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
          // Live Demo
        </h2>

        {/* Algo selector */}
        <div className="flex gap-3 mb-5">
          {(["RSA-PSS", "ECDSA"] as Algo[]).map((a) => (
            <button
              key={a}
              onClick={() => { setAlgo(a); setSignature(""); setVerifyResult(null); setKeyPair(null); setPublicKeyPem(""); }}
              className="px-4 py-2 rounded text-xs mono transition-all"
              style={{
                background: algo === a ? "oklch(0.82 0.18 195 / 20%)" : "transparent",
                color: algo === a ? "oklch(0.82 0.18 195)" : "oklch(0.55 0.03 220)",
                border: `1px solid ${algo === a ? "oklch(0.82 0.18 195 / 60%)" : "oklch(0.28 0.05 210 / 40%)"}`,
              }}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Sign */}
          <div className="space-y-4">
            <div>
              <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>Message to sign:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full p-3 rounded text-xs mono resize-none border"
                style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.85 0 0)", borderColor: "oklch(0.28 0.05 210 / 50%)", outline: "none" }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 rounded text-xs mono transition-all" style={{ background: "oklch(0.82 0.2 145 / 20%)", color: "oklch(0.82 0.2 145)", border: "1px solid oklch(0.82 0.2 145 / 50%)" }}>
                {loading ? "..." : "1. Generate Keys"}
              </button>
              <button onClick={handleSign} disabled={loading || !keyPair} className="px-4 py-2 rounded text-xs mono transition-all" style={{ background: "oklch(0.82 0.18 195 / 20%)", color: "oklch(0.82 0.18 195)", border: "1px solid oklch(0.82 0.18 195 / 50%)", opacity: !keyPair ? 0.4 : 1 }}>
                {loading ? "..." : "2. Sign"}
              </button>
            </div>

            {publicKeyPem && (
              <div className="terminal">
                <div className="terminal-header">
                  <span className="terminal-dot" style={{ background: "#ff5f57" }} />
                  <span className="terminal-dot" style={{ background: "#febc2e" }} />
                  <span className="terminal-dot" style={{ background: "#28c840" }} />
                  <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>public_key.pem</span>
                </div>
                <div className="terminal-body">
                  <pre className="text-xs whitespace-pre-wrap break-all" style={{ color: "oklch(0.82 0.2 145)" }}>{publicKeyPem}</pre>
                </div>
              </div>
            )}

            {signature && (
              <div className="terminal">
                <div className="terminal-header">
                  <span className="terminal-dot" style={{ background: "#ff5f57" }} />
                  <span className="terminal-dot" style={{ background: "#febc2e" }} />
                  <span className="terminal-dot" style={{ background: "#28c840" }} />
                  <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>signature.b64</span>
                </div>
                <div className="terminal-body">
                  <pre className="text-xs whitespace-pre-wrap break-all" style={{ color: "oklch(0.82 0.18 195)" }}>{signature}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Right: Verify */}
          <div className="space-y-4">
            <div>
              <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>
                Message to verify: <span style={{ color: "oklch(0.82 0.2 60)" }}>(try modifying to see tamper detection)</span>
              </label>
              <textarea
                value={verifyMessage}
                onChange={(e) => setVerifyMessage(e.target.value)}
                rows={3}
                className="w-full p-3 rounded text-xs mono resize-none border"
                style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.85 0 0)", borderColor: "oklch(0.28 0.05 210 / 50%)" }}
              />
            </div>
            <button onClick={handleVerify} disabled={loading || !signature} className="px-4 py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.2 60 / 20%)", color: "oklch(0.82 0.2 60)", border: "1px solid oklch(0.82 0.2 60 / 50%)", opacity: !signature ? 0.4 : 1 }}>
              3. Verify Signature
            </button>

            {verifyResult !== null && (
              <div className="p-4 rounded-lg text-center" style={{ background: verifyResult ? "oklch(0.82 0.2 145 / 10%)" : "oklch(0.65 0.22 25 / 10%)", border: `1px solid ${verifyResult ? "oklch(0.82 0.2 145 / 40%)" : "oklch(0.65 0.22 25 / 40%)"}` }}>
                <div className="text-2xl mb-1">{verifyResult ? "✅" : "❌"}</div>
                <div className="text-sm font-bold mono" style={{ color: verifyResult ? "oklch(0.82 0.2 145)" : "oklch(0.65 0.22 25)" }}>
                  {verifyResult ? "SIGNATURE VALID — Data authentic" : "SIGNATURE INVALID — Data was tampered!"}
                </div>
              </div>
            )}

            {/* Log */}
            <div className="terminal">
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: "#ff5f57" }} />
                <span className="terminal-dot" style={{ background: "#febc2e" }} />
                <span className="terminal-dot" style={{ background: "#28c840" }} />
                <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>crypto.log</span>
              </div>
              <div className="terminal-body space-y-1">
                {log.length === 0 ? (
                  <p className="text-xs" style={{ color: "oklch(0.45 0.03 220)" }}>$ _</p>
                ) : log.map((l, i) => (
                  <p key={i} className="text-xs" style={{ color: l.includes("VALID") ? "oklch(0.82 0.2 145)" : l.includes("INVALID") ? "oklch(0.65 0.22 25)" : l.includes("OK") ? "oklch(0.82 0.18 195)" : "oklch(0.55 0.03 220)" }}>
                    {l}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code snippet */}
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot" style={{ background: "#ff5f57" }} />
          <span className="terminal-dot" style={{ background: "#febc2e" }} />
          <span className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>signature-demo.ts — Source Code</span>
        </div>
        <div className="terminal-body">
          <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "oklch(0.75 0 0)" }}>{`// Generate RSA-PSS key pair (2048-bit)
const keyPair = await crypto.subtle.generateKey(
  { name: "RSA-PSS", modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256" },
  true, ["sign", "verify"]
);

// Sign message with private key
const signature = await crypto.subtle.sign(
  { name: "RSA-PSS", saltLength: 32 },
  keyPair.privateKey,
  new TextEncoder().encode(message)
);

// Verify signature with public key
const isValid = await crypto.subtle.verify(
  { name: "RSA-PSS", saltLength: 32 },
  keyPair.publicKey,
  signature,
  new TextEncoder().encode(message)
);
// isValid = false if message was modified`}</pre>
        </div>
      </div>
    </div>
  );
}
