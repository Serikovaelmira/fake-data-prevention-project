import { useState } from "react";

// ─── AES-GCM helpers ─────────────────────────────────────────────────────────

async function aesEncrypt(plaintext: string, password: string) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));

  const result = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(ciphertext), 28);
  return btoa(String.fromCharCode(...result));
}

async function aesDecrypt(ciphertextB64: string, password: string) {
  const enc = new TextEncoder();
  const data = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);

  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

// ─── RSA-OAEP helpers ─────────────────────────────────────────────────────────

async function generateRSAEncryptKeyPair() {
  return crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  ) as Promise<CryptoKeyPair>;
}

async function rsaEncrypt(publicKey: CryptoKey, message: string) {
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
}

async function rsaDecrypt(privateKey: CryptoKey, ciphertextB64: string) {
  const data = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const plaintext = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, data);
  return new TextDecoder().decode(plaintext);
}

// ─── Component ────────────────────────────────────────────────────────────────

type Mode = "AES-GCM" | "RSA-OAEP";

export default function Encryption() {
  const [mode, setMode] = useState<Mode>("AES-GCM");

  // AES state
  const [aesMsg, setAesMsg] = useState("Top secret message: the attack is at dawn.");
  const [aesPassword, setAesPassword] = useState("mysecretpassword123");
  const [aesCiphertext, setAesCiphertext] = useState("");
  const [aesDecrypted, setAesDecrypted] = useState("");
  const [aesDecryptPwd, setAesDecryptPwd] = useState("mysecretpassword123");
  const [aesDecryptInput, setAesDecryptInput] = useState("");
  const [aesError, setAesError] = useState("");

  // RSA state
  const [rsaMsg, setRsaMsg] = useState("Confidential: patient data record #4821");
  const [rsaKeyPair, setRsaKeyPair] = useState<CryptoKeyPair | null>(null);
  const [rsaCiphertext, setRsaCiphertext] = useState("");
  const [rsaDecrypted, setRsaDecrypted] = useState("");
  const [rsaLoading, setRsaLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  // AES actions
  async function handleAesEncrypt() {
    setLoading(true); setAesError("");
    try {
      const ct = await aesEncrypt(aesMsg, aesPassword);
      setAesCiphertext(ct); setAesDecryptInput(ct); setAesDecrypted("");
    } catch (e) { setAesError(String(e)); }
    setLoading(false);
  }

  async function handleAesDecrypt() {
    setLoading(true); setAesError("");
    try {
      const pt = await aesDecrypt(aesDecryptInput, aesDecryptPwd);
      setAesDecrypted(pt);
    } catch (e) {
      setAesError("Decryption failed — wrong password or corrupted data.");
      setAesDecrypted("");
    }
    setLoading(false);
  }

  // RSA actions
  async function handleRsaGenerate() {
    setRsaLoading(true); setRsaCiphertext(""); setRsaDecrypted("");
    const kp = await generateRSAEncryptKeyPair();
    setRsaKeyPair(kp);
    setRsaLoading(false);
  }

  async function handleRsaEncrypt() {
    if (!rsaKeyPair) return;
    setRsaLoading(true);
    const ct = await rsaEncrypt(rsaKeyPair.publicKey, rsaMsg);
    setRsaCiphertext(ct);
    setRsaLoading(false);
  }

  async function handleRsaDecrypt() {
    if (!rsaKeyPair || !rsaCiphertext) return;
    setRsaLoading(true);
    try {
      const pt = await rsaDecrypt(rsaKeyPair.privateKey, rsaCiphertext);
      setRsaDecrypted(pt);
    } catch (e) { setRsaDecrypted("Decryption failed"); }
    setRsaLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-xs mono badge-info px-3 py-1 rounded-full">Module 03</span>
        <h1 className="text-3xl font-bold mt-3 mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.2 145)" }}>
          Encryption
        </h1>
        <p className="text-sm leading-relaxed max-w-3xl" style={{ color: "oklch(0.65 0.03 220)" }}>
          Encryption transforms plaintext into unreadable ciphertext, preventing unauthorized access.{" "}
          <strong style={{ color: "oklch(0.95 0 0)" }}>Symmetric</strong> (AES-GCM) uses one key for both encrypt/decrypt.{" "}
          <strong style={{ color: "oklch(0.95 0 0)" }}>Asymmetric</strong> (RSA-OAEP) uses a public key to encrypt, private key to decrypt.
        </p>
      </div>

      {/* Comparison table */}
      <div className="mb-8 overflow-x-auto rounded-lg border" style={{ borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "oklch(0.13 0.02 240)" }}>
              <th className="px-4 py-3 text-left mono" style={{ color: "oklch(0.55 0.03 220)" }}>Property</th>
              <th className="px-4 py-3 text-left mono" style={{ color: "oklch(0.82 0.2 145)" }}>AES-GCM (Symmetric)</th>
              <th className="px-4 py-3 text-left mono" style={{ color: "oklch(0.82 0.18 195)" }}>RSA-OAEP (Asymmetric)</th>
            </tr>
          </thead>
          <tbody style={{ background: "oklch(0.11 0.015 240)" }}>
            {[
              ["Key type", "Single shared secret key", "Public key (encrypt) + Private key (decrypt)"],
              ["Key size", "128 / 192 / 256 bits", "2048 / 3072 / 4096 bits"],
              ["Speed", "Very fast (hardware accelerated)", "Slow (math-intensive)"],
              ["Use case", "Bulk data encryption, file/disk encryption", "Key exchange, small data, asymmetric scenarios"],
              ["Authentication", "GCM mode provides auth tag (AEAD)", "Separate signature needed"],
              ["Key distribution", "Shared key must be exchanged securely", "Public key freely distributed"],
            ].map(([prop, aes, rsa]) => (
              <tr key={prop} className="border-t" style={{ borderColor: "oklch(0.28 0.05 210 / 20%)" }}>
                <td className="px-4 py-2 mono font-bold" style={{ color: "oklch(0.65 0.03 220)" }}>{prop}</td>
                <td className="px-4 py-2 mono" style={{ color: "oklch(0.75 0 0)" }}>{aes}</td>
                <td className="px-4 py-2 mono" style={{ color: "oklch(0.75 0 0)" }}>{rsa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mode selector */}
      <div className="flex gap-3 mb-6">
        {(["AES-GCM", "RSA-OAEP"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-4 py-2 rounded text-xs mono transition-all"
            style={{
              background: mode === m ? "oklch(0.82 0.2 145 / 20%)" : "transparent",
              color: mode === m ? "oklch(0.82 0.2 145)" : "oklch(0.55 0.03 220)",
              border: `1px solid ${mode === m ? "oklch(0.82 0.2 145 / 60%)" : "oklch(0.28 0.05 210 / 40%)"}`,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* AES Demo */}
      {mode === "AES-GCM" && (
        <div className="rounded-lg border p-6 mb-6" style={{ background: "oklch(0.11 0.02 240)", borderColor: "oklch(0.82 0.2 145 / 30%)" }}>
          <h2 className="text-base font-bold mb-5" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.2 145)" }}>
            // AES-256-GCM Live Demo
          </h2>
          <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.03 220)" }}>
            Password is derived to a 256-bit key via PBKDF2 (100,000 iterations, SHA-256). A random 96-bit IV and 128-bit salt are prepended to the ciphertext. GCM mode provides an authentication tag — any tampering fails decryption.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>Plaintext:</label>
                <textarea value={aesMsg} onChange={(e) => setAesMsg(e.target.value)} rows={3} className="w-full p-3 rounded text-xs mono resize-none border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.85 0 0)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
              </div>
              <div>
                <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>Encryption Password:</label>
                <input type="text" value={aesPassword} onChange={(e) => setAesPassword(e.target.value)} className="w-full p-3 rounded text-xs mono border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.82 0.2 145)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
              </div>
              <button onClick={handleAesEncrypt} disabled={loading} className="px-4 py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.2 145 / 20%)", color: "oklch(0.82 0.2 145)", border: "1px solid oklch(0.82 0.2 145 / 50%)" }}>
                {loading ? "Encrypting..." : "🔒 Encrypt"}
              </button>
              {aesCiphertext && (
                <div className="terminal">
                  <div className="terminal-header"><span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>ciphertext.b64 (salt+iv+ciphertext)</span></div>
                  <div className="terminal-body"><pre className="text-xs break-all whitespace-pre-wrap" style={{ color: "oklch(0.82 0.2 145)" }}>{aesCiphertext}</pre></div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>Ciphertext to decrypt: <span style={{ color: "oklch(0.82 0.2 60)" }}>(modify to test auth tag failure)</span></label>
                <textarea value={aesDecryptInput} onChange={(e) => setAesDecryptInput(e.target.value)} rows={3} className="w-full p-3 rounded text-xs mono resize-none border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.85 0 0)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
              </div>
              <div>
                <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>Decryption Password: <span style={{ color: "oklch(0.82 0.2 60)" }}>(try wrong password)</span></label>
                <input type="text" value={aesDecryptPwd} onChange={(e) => setAesDecryptPwd(e.target.value)} className="w-full p-3 rounded text-xs mono border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.82 0.18 195)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
              </div>
              <button onClick={handleAesDecrypt} disabled={loading || !aesDecryptInput} className="px-4 py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.18 195 / 20%)", color: "oklch(0.82 0.18 195)", border: "1px solid oklch(0.82 0.18 195 / 50%)", opacity: !aesDecryptInput ? 0.4 : 1 }}>
                {loading ? "Decrypting..." : "🔓 Decrypt"}
              </button>
              {aesDecrypted && (
                <div className="p-3 rounded border" style={{ background: "oklch(0.82 0.2 145 / 10%)", borderColor: "oklch(0.82 0.2 145 / 30%)" }}>
                  <div className="text-xs mono mb-1" style={{ color: "oklch(0.55 0.03 220)" }}>Decrypted plaintext:</div>
                  <div className="text-sm" style={{ color: "oklch(0.82 0.2 145)" }}>{aesDecrypted}</div>
                </div>
              )}
              {aesError && (
                <div className="p-3 rounded border" style={{ background: "oklch(0.65 0.22 25 / 10%)", borderColor: "oklch(0.65 0.22 25 / 30%)" }}>
                  <div className="text-xs mono" style={{ color: "oklch(0.65 0.22 25)" }}>❌ {aesError}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RSA Demo */}
      {mode === "RSA-OAEP" && (
        <div className="rounded-lg border p-6 mb-6" style={{ background: "oklch(0.11 0.02 240)", borderColor: "oklch(0.82 0.18 195 / 30%)" }}>
          <h2 className="text-base font-bold mb-5" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
            // RSA-OAEP (2048-bit) Live Demo
          </h2>
          <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.03 220)" }}>
            RSA-OAEP with SHA-256. The public key encrypts data; only the corresponding private key can decrypt. Used in practice to encrypt symmetric keys (hybrid encryption).
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>Plaintext (max ~190 bytes for 2048-bit RSA):</label>
                <textarea value={rsaMsg} onChange={(e) => setRsaMsg(e.target.value)} rows={3} className="w-full p-3 rounded text-xs mono resize-none border" style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.85 0 0)", borderColor: "oklch(0.28 0.05 210 / 50%)" }} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleRsaGenerate} disabled={rsaLoading} className="px-3 py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.2 145 / 20%)", color: "oklch(0.82 0.2 145)", border: "1px solid oklch(0.82 0.2 145 / 50%)" }}>
                  {rsaLoading ? "..." : "1. Generate Keys"}
                </button>
                <button onClick={handleRsaEncrypt} disabled={rsaLoading || !rsaKeyPair} className="px-3 py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.18 195 / 20%)", color: "oklch(0.82 0.18 195)", border: "1px solid oklch(0.82 0.18 195 / 50%)", opacity: !rsaKeyPair ? 0.4 : 1 }}>
                  {rsaLoading ? "..." : "2. Encrypt"}
                </button>
              </div>
              {rsaKeyPair && <div className="p-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.2 145 / 10%)", color: "oklch(0.82 0.2 145)" }}>✓ RSA-2048 key pair generated</div>}
              {rsaCiphertext && (
                <div className="terminal">
                  <div className="terminal-header"><span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>rsa_ciphertext.b64</span></div>
                  <div className="terminal-body"><pre className="text-xs break-all whitespace-pre-wrap" style={{ color: "oklch(0.82 0.18 195)" }}>{rsaCiphertext}</pre></div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <button onClick={handleRsaDecrypt} disabled={rsaLoading || !rsaCiphertext} className="px-4 py-2 rounded text-xs mono" style={{ background: "oklch(0.82 0.2 60 / 20%)", color: "oklch(0.82 0.2 60)", border: "1px solid oklch(0.82 0.2 60 / 50%)", opacity: !rsaCiphertext ? 0.4 : 1 }}>
                3. Decrypt with Private Key
              </button>
              {rsaDecrypted && (
                <div className="p-3 rounded border" style={{ background: "oklch(0.82 0.2 145 / 10%)", borderColor: "oklch(0.82 0.2 145 / 30%)" }}>
                  <div className="text-xs mono mb-1" style={{ color: "oklch(0.55 0.03 220)" }}>Decrypted:</div>
                  <div className="text-sm" style={{ color: "oklch(0.82 0.2 145)" }}>{rsaDecrypted}</div>
                </div>
              )}
              <div className="p-4 rounded border mt-4" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
                <div className="text-xs font-bold mono mb-2" style={{ color: "oklch(0.82 0.2 60)" }}>Hybrid Encryption (Real World)</div>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.03 220)" }}>
                  RSA alone is too slow for large data. In practice:<br />
                  1. Generate random AES-256 key<br />
                  2. Encrypt data with AES-GCM<br />
                  3. Encrypt AES key with RSA-OAEP<br />
                  4. Send: RSA_encrypted(AES_key) + AES_encrypted(data)<br />
                  This is how TLS and PGP work.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code */}
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot" style={{ background: "#ff5f57" }} />
          <span className="terminal-dot" style={{ background: "#febc2e" }} />
          <span className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>encryption.ts — Web Crypto API</span>
        </div>
        <div className="terminal-body">
          <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "oklch(0.75 0 0)" }}>{`// AES-256-GCM Encryption (AEAD — Authenticated Encryption)
async function aesGcmEncrypt(plaintext: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  // Derive key from password using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, ["encrypt", "decrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, // IV must be unique per encryption
    key,
    new TextEncoder().encode(plaintext)
  );
  // GCM appends a 128-bit authentication tag automatically
  // Any modification to ciphertext → decryption fails
  return { salt, iv, ciphertext }; // store all three
}`}</pre>
        </div>
      </div>
    </div>
  );
}
