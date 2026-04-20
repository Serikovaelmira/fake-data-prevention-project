export default function Report() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-xs mono badge-info px-3 py-1 rounded-full">Academic Report</span>
        <h1 className="text-3xl font-bold mt-3 mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
          Research Report
        </h1>
        <p className="text-xs mono" style={{ color: "oklch(0.45 0.03 220)" }}>
          Fake Data Prevention with Conventional Cryptotools — System Security, 2026
        </p>
      </div>

      {sections.map((s, i) => (
        <div key={s.title} className="mb-10 pb-10 border-b" style={{ borderColor: "oklch(0.28 0.05 210 / 30%)" }}>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
            {i + 1}. {s.title}
          </h2>
          {s.content.map((block, j) => {
            if (block.type === "p") return (
              <p key={j} className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.75 0 0)" }} dangerouslySetInnerHTML={{ __html: block.text ?? "" }} />
            );
            if (block.type === "h3") return (
              <h3 key={j} className="text-sm font-bold mt-5 mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.2 145)" }}>{block.text}</h3>
            );
            if (block.type === "ul") return (
              <ul key={j} className="list-none space-y-1 mb-4 pl-3">
                {block.items?.map((item, k) => (
                  <li key={k} className="text-sm" style={{ color: "oklch(0.65 0.03 220)" }}>
                    <span style={{ color: "oklch(0.82 0.18 195)" }}>→ </span>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            );
            if (block.type === "code") return (
              <div key={j} className="terminal mb-4">
                <div className="terminal-header"><span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>{block.lang}</span></div>
                <div className="terminal-body"><pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "oklch(0.75 0 0)" }}>{block.text}</pre></div>
              </div>
            );
            if (block.type === "table") return (
              <div key={j} className="mb-4 overflow-x-auto rounded border" style={{ borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "oklch(0.13 0.02 240)" }}>
                      {block.headers?.map((h, k) => <th key={k} className="px-4 py-2 text-left mono" style={{ color: "oklch(0.82 0.18 195)" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows?.map((row, k) => (
                      <tr key={k} className="border-t" style={{ borderColor: "oklch(0.28 0.05 210 / 20%)", background: "oklch(0.11 0.015 240)" }}>
                        {row.map((cell, l) => <td key={l} className="px-4 py-2 mono" style={{ color: "oklch(0.75 0 0)" }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            return null;
          })}
        </div>
      ))}

      {/* References */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.82 0.18 195)" }}>
          References
        </h2>
        <ol className="space-y-2">
          {references.map((ref, i) => (
            <li key={i} className="text-xs mono" style={{ color: "oklch(0.55 0.03 220)" }}>
              [{i + 1}] {ref}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ─── Report Content ───────────────────────────────────────────────────────────

const sections = [
  {
    title: "Abstract",
    content: [
      { type: "p", text: "The proliferation of digital systems has made fake data — forged documents, manipulated records, spoofed identities — a primary threat to information security. Conventional cryptographic tools, specifically <strong style='color:oklch(0.82 0.18 195)'>digital signatures</strong>, <strong style='color:oklch(0.78 0.16 270)'>X.509 certificates</strong>, <strong style='color:oklch(0.82 0.2 145)'>encryption algorithms</strong>, and <strong style='color:oklch(0.82 0.2 60)'>JSON Web Tokens (JWT)</strong>, provide mathematically proven mechanisms to ensure data integrity, authenticity, and non-repudiation. This report presents a comprehensive technical analysis of these tools, their algorithms, real-world implementations, security considerations, and limitations." },
    ],
  },
  {
    title: "Introduction",
    content: [
      { type: "p", text: "In an era of pervasive digital communication, the ability to verify the authenticity and integrity of data is fundamental to security. Fake data attacks — including data tampering, identity spoofing, and forged documents — exploit the absence of cryptographic verification. The stakes include financial fraud, medical record falsification, legal document forgery, and API manipulation." },
      { type: "p", text: "Conventional cryptography offers a mature set of tools to combat these threats. Unlike AI-based detection (which is probabilistic), cryptographic verification is <em>deterministic</em>: a valid signature either verifies or it doesn't. This property makes cryptographic tools the gold standard for data authenticity guarantees." },
      { type: "h3", text: "1.1 Threat Model" },
      { type: "ul", items: ["<strong>Integrity attacks</strong>: Modifying data in transit or at rest (MITM, database injection)", "<strong>Authenticity attacks</strong>: Impersonating legitimate senders or issuers", "<strong>Replay attacks</strong>: Re-submitting previously valid signed messages", "<strong>Repudiation</strong>: Denying authorship of signed communications"] },
    ],
  },
  {
    title: "Digital Signatures",
    content: [
      { type: "p", text: "A digital signature scheme consists of three algorithms: <strong>KeyGen</strong>, <strong>Sign</strong>, and <strong>Verify</strong>. The security guarantee is <em>existential unforgeability under chosen message attack (EUF-CMA)</em>: an adversary cannot forge a valid signature without the private key, even after observing many signed messages." },
      { type: "h3", text: "2.1 RSA-PSS (PKCS #1 v2.1)" },
      { type: "p", text: "RSA-PSS (Probabilistic Signature Scheme) improves on PKCS#1 v1.5 by incorporating randomized padding (MGF1), providing provable security. Key generation produces modulus n = p·q where p, q are large primes, public exponent e, and private exponent d = e⁻¹ mod φ(n)." },
      { type: "code", lang: "RSA-PSS Signing Algorithm", text: `Sign(privKey, message):
  1. H = SHA-256(message)
  2. EM = EMSA-PSS-Encode(H, emBits, saltLen=32)
     - Generate random salt (32 bytes)
     - M' = 0x0000000000000000 || H || salt
     - H' = SHA-256(M')
     - PS = zero string of length emLen - sLen - hLen - 2
     - DB = PS || 0x01 || salt
     - dbMask = MGF1(H', emLen - hLen - 1)
     - maskedDB = DB XOR dbMask
     - EM = maskedDB || H' || 0xBC
  3. m = OS2IP(EM)
  4. s = RSASP1(privKey, m) = m^d mod n
  5. return Signature S = I2OSP(s)

Verify(pubKey, message, S):
  1. m = OS2IP(S)
  2. EM = RSAVP1(pubKey, m) = m^e mod n
  3. return EMSA-PSS-Verify(message, EM)` },
      { type: "h3", text: "2.2 ECDSA (P-256)" },
      { type: "p", text: "ECDSA over the NIST P-256 curve provides equivalent security to 3072-bit RSA with much smaller key sizes (256 bits), making it preferred for performance-sensitive applications (TLS 1.3, mobile, IoT)." },
      { type: "code", lang: "ECDSA Signing (P-256, SHA-256)", text: `Parameters: curve P-256, generator G, order n
Private key: d (integer in [1, n-1])
Public key:  Q = d·G (point on curve)

Sign(d, message):
  1. H = SHA-256(message)   // 32-byte hash
  2. e = leftmost bits of H (= H, since |H| = |n|)
  3. repeat:
       k = random in [1, n-1]   // CRITICAL: never reuse k
       (x1, y1) = k·G
       r = x1 mod n; if r == 0: retry
       s = k⁻¹ · (e + r·d) mod n; if s == 0: retry
  4. Signature = (r, s)

Verify(Q, message, (r, s)):
  1. H = SHA-256(message); e = H
  2. w = s⁻¹ mod n
  3. u1 = e·w mod n;  u2 = r·w mod n
  4. (x1, y1) = u1·G + u2·Q
  5. Valid iff r ≡ x1 (mod n)` },
    ],
  },
  {
    title: "X.509 Certificates and PKI",
    content: [
      { type: "p", text: "An X.509 certificate (RFC 5280) is a data structure that binds a public key to an identity, signed by a Certificate Authority (CA). The PKI (Public Key Infrastructure) establishes a hierarchical chain of trust from a trusted Root CA down to end-entity certificates." },
      { type: "h3", text: "3.1 Certificate Fields (ASN.1 Structure)" },
      { type: "table", headers: ["Field", "OID", "Purpose"], rows: [
        ["version", "–", "X.509v3 (mandatory for extensions)"],
        ["serialNumber", "–", "Unique integer assigned by CA"],
        ["signatureAlgorithm", "1.2.840.113549.1.1.11", "Algorithm used to sign TBS"],
        ["issuer", "2.5.4.3 (CN)", "Distinguished Name of signing CA"],
        ["validity", "–", "notBefore / notAfter timestamps"],
        ["subject", "2.5.4.3 (CN)", "Entity the certificate identifies"],
        ["subjectPublicKeyInfo", "–", "Algorithm + public key bits"],
        ["keyUsage", "2.5.29.15", "Permitted operations (sign, encrypt)"],
        ["subjectAltName", "2.5.29.17", "DNS names, IPs bound to cert"],
        ["basicConstraints", "2.5.29.19", "CA:TRUE/FALSE for CA certs"],
      ]},
      { type: "h3", text: "3.2 Certificate Validation Process" },
      { type: "ul", items: [
        "<strong>Chain building</strong>: Construct path from end-entity → intermediate CA(s) → Root CA",
        "<strong>Signature verification</strong>: Each certificate's signature verified using issuer's public key",
        "<strong>Validity period</strong>: Current time within notBefore and notAfter",
        "<strong>Revocation check</strong>: Query CRL (Certificate Revocation List) or OCSP (Online Certificate Status Protocol)",
        "<strong>Key usage</strong>: Certificate's keyUsage extension permits intended operation",
      ]},
    ],
  },
  {
    title: "Encryption — AES-GCM and RSA-OAEP",
    content: [
      { type: "h3", text: "4.1 AES-256-GCM (Authenticated Encryption)" },
      { type: "p", text: "AES-GCM (Galois/Counter Mode) is an AEAD (Authenticated Encryption with Associated Data) scheme combining AES-CTR encryption with GHASH authentication. It simultaneously provides confidentiality AND integrity — any modification to the ciphertext causes authentication tag verification to fail, making it a natural tool against fake data injection." },
      { type: "code", lang: "AES-GCM Encrypt/Decrypt Overview", text: `AES-256-GCM Parameters:
  - Key: 256 bits (from PBKDF2 or random)
  - IV (nonce): 96 bits (MUST be unique per key)
  - Auth Tag: 128 bits (appended to ciphertext)
  - Block size: 128 bits

Encrypt(K, IV, P, AAD):
  1. H = AES_K(0^128)            // Hash subkey
  2. J0 = IV || 0^31 || 1        // Counter block
  3. C = GCTR(K, inc(J0), P)    // CTR-mode encryption
  4. T = GHASH(H, AAD, C)       // Authentication tag
  return (C, T)

Decrypt(K, IV, C, T, AAD):
  1. T' = GHASH(H, AAD, C)
  2. if T' ≠ T: FAIL (data tampered/corrupted)
  3. P = GCTR(K, inc(J0), C)
  return P

// Any 1-bit flip in ciphertext → tag mismatch → rejection
// This is how we detect fake/injected data` },
      { type: "h3", text: "4.2 RSA-OAEP (Asymmetric Encryption)" },
      { type: "p", text: "RSA-OAEP (Optimal Asymmetric Encryption Padding, RFC 3447) adds probabilistic padding to RSA encryption, preventing chosen-ciphertext attacks (IND-CCA2 secure). In practice, RSA-OAEP is used to encrypt symmetric keys (hybrid encryption), not bulk data." },
    ],
  },
  {
    title: "JSON Web Tokens (JWT)",
    content: [
      { type: "p", text: "JWT (RFC 7519) is a compact token format for transmitting signed (and optionally encrypted) claims. A JWT consists of three Base64URL-encoded parts separated by dots: <code>header.payload.signature</code>. The signature ensures the payload has not been modified." },
      { type: "h3", text: "5.1 HS256 Signing Algorithm" },
      { type: "code", lang: "HS256 JWT Construction", text: `header  = Base64URL({"alg":"HS256","typ":"JWT"})
payload = Base64URL({"sub":"alice","role":"admin","exp":1735689600})
message = header + "." + payload

signature = HMAC-SHA256(secret_key, message)
JWT = message + "." + Base64URL(signature)

Verification:
  expected_sig = HMAC-SHA256(secret_key, header + "." + payload)
  if constant_time_compare(expected_sig, token_sig):
    check exp > now
    return payload
  else:
    raise SignatureVerificationFailed` },
      { type: "h3", text: "5.2 RS256 vs HS256" },
      { type: "table", headers: ["Property", "HS256", "RS256"], rows: [
        ["Algorithm", "HMAC-SHA256 (symmetric)", "RSA-SHA256 (asymmetric)"],
        ["Key type", "Shared secret", "RSA private/public key pair"],
        ["Who can verify", "Anyone with secret", "Anyone with public key"],
        ["Token issuer", "Must hold secret", "Signs with private key"],
        ["Best for", "Single-service auth", "Distributed microservices"],
        ["Security risk", "Secret exposure → all tokens forgeable", "Private key must be protected"],
      ]},
      { type: "h3", text: "5.3 Security Best Practices" },
      { type: "ul", items: [
        "Always validate the <code>alg</code> header — never accept <code>alg:none</code>",
        "Use RS256/ES256 for multi-service architectures (public key verification)",
        "Set short expiry (<code>exp</code>) — 15-60 minutes for access tokens",
        "Use refresh tokens stored in <code>HttpOnly</code> cookies to avoid XSS",
        "Validate all registered claims: <code>iss</code>, <code>aud</code>, <code>exp</code>, <code>nbf</code>",
        "HS256 secrets must be at least 256 bits (32 bytes) of random data",
      ]},
    ],
  },
  {
    title: "Comparison and Practical Applications",
    content: [
      { type: "table", headers: ["Tool", "Provides", "Prevents", "Use Case"], rows: [
        ["Digital Signature", "Integrity + Authenticity + Non-repudiation", "Data tampering, impersonation", "Document signing, software releases, email (S/MIME)"],
        ["X.509 Certificate", "Identity binding + Chain of trust", "Man-in-the-middle, impersonation", "TLS/HTTPS, code signing, email (S/MIME)"],
        ["AES-GCM Encryption", "Confidentiality + Integrity (AEAD)", "Eavesdropping, data injection", "File encryption, database fields, TLS record layer"],
        ["JWT (HS256/RS256)", "Stateless auth + Integrity", "Token forgery, payload tampering", "API authentication, session tokens, OAuth 2.0"],
      ]},
      { type: "h3", text: "6.1 Combined Usage: TLS 1.3 Example" },
      { type: "p", text: "Modern TLS 1.3 combines all four tools: X.509 certificates authenticate the server identity; ECDSA digital signatures verify the server's certificate chain; ECDH key exchange (with forward secrecy) establishes session keys; AES-256-GCM encrypts all application data with authentication. JWT further secures API-layer authorization on top of the TLS channel." },
    ],
  },
  {
    title: "Limitations and Conclusion",
    content: [
      { type: "h3", text: "7.1 Limitations" },
      { type: "ul", items: [
        "<strong>Key management</strong>: Security depends entirely on private key protection — HSM or secure enclaves required in production",
        "<strong>Quantum threat</strong>: RSA and ECDSA are broken by Shor's algorithm on quantum computers — NIST PQC standards (CRYSTALS-Dilithium, FALCON) are the post-quantum solution",
        "<strong>Implementation bugs</strong>: Heartbleed (OpenSSL), ECDSA nonce reuse (PS3 private key extraction) show that correct implementation is non-trivial",
        "<strong>PKI trust model</strong>: X.509 PKI relies on browser/OS trust stores — a compromised root CA can issue fake certificates (DigiNotar, 2011)",
        "<strong>JWT pitfalls</strong>: Algorithm confusion attacks, JKU header injection, and long-lived tokens require careful validation logic",
      ]},
      { type: "h3", text: "7.2 Conclusion" },
      { type: "p", text: "Conventional cryptographic tools provide a robust, mathematically grounded foundation for preventing fake data. Digital signatures guarantee message integrity and non-repudiation; X.509 certificates establish verifiable identities in a PKI hierarchy; AES-GCM provides authenticated encryption protecting against both eavesdropping and data injection; JWTs enable stateless authenticated authorization with tamper-evident claims. When properly implemented and combined, these tools form a comprehensive defense against the full spectrum of fake data attacks in modern distributed systems." },
    ],
  },
];

const references = [
  "NIST FIPS 186-5 (2023). Digital Signature Standard (DSS). National Institute of Standards and Technology.",
  "RFC 3447 (2003). Public-Key Cryptography Standards (PKCS) #1: RSA Cryptography Specifications Version 2.1.",
  "RFC 5280 (2008). Internet X.509 Public Key Infrastructure Certificate and CRL Profile.",
  "RFC 7519 (2015). JSON Web Token (JWT). IETF.",
  "RFC 7518 (2015). JSON Web Algorithms (JWA). IETF.",
  "NIST SP 800-57 Part 1 Rev. 5 (2020). Recommendation for Key Management.",
  "Bhargavan, K., et al. (2017). Verified Models and Reference Implementations for the TLS 1.3 Standard Candidate. IEEE S&P.",
  "NIST IR 8413 (2022). Status Report on the Third Round of the NIST Post-Quantum Cryptography Standardization Process.",
  "Pornin, T. (2011). Deterministic Usage of the Digital Signature Algorithm (DSA) and Elliptic Curve DSA. RFC 6979.",
  "Rescorla, E. (2018). The Transport Layer Security (TLS) Protocol Version 1.3. RFC 8446.",
  "Web Cryptography API. W3C Recommendation (2017). https://www.w3.org/TR/WebCryptoAPI/",
  "OWASP JWT Security Cheat Sheet (2024). https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html",
];
