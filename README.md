#  Fake Data Prevention with Conventional Cryptotools

> **System Security Project** 
> Project on preventing fake data using digital signatures, X.509 certificates, encryption, and JWT.

---

##  Overview

This project demonstrates how conventional cryptographic tools prevent fake data through:

| Tool | Algorithm | Security Property |
|------|-----------|-------------------|
| **Digital Signatures** | RSA-PSS (2048-bit), ECDSA P-256 | Integrity + Authenticity + Non-repudiation |
| **X.509 Certificates** | PKI / ASN.1 / sha256WithRSA | Identity binding + Chain of trust |
| **Encryption** | AES-256-GCM, RSA-OAEP | Confidentiality + Integrity (AEAD) |
| **JWT** | HS256, RS256 | Stateless auth + Tamper-evidence |

---

##  Project Structure

```
fake-data-prevention/
├── src/
│   ├── web/
│   │   ├── app.tsx                    # Main app + routing
│   │   ├── styles.css                 # Design system (dark cyber theme)
│   │   ├── components/
│   │   │   └── Layout.tsx             # Navigation + footer
│   │   └── pages/
│   │       ├── Home.tsx               # Landing page
│   │       ├── Signatures.tsx         # RSA-PSS + ECDSA live demo
│   │       ├── Certificates.tsx       # X.509 certificate parser
│   │       ├── Encryption.tsx         # AES-GCM + RSA-OAEP demo
│   │       ├── JWT.tsx                # JWT create/verify/tamper demo
│   │                 
│   └── api/                           # Hono API (Cloudflare Workers)
├── design.md                          # Design system documentation
├── package.json
├── vite.config.ts
└── README.md
```

---

##  Features

### Module 1 — Digital Signatures
- Generate RSA-PSS (2048-bit) or ECDSA (P-256) key pairs via **Web Crypto API**
- Sign arbitrary messages with private key
- Verify signature with public key
- **Tamper detection**: modify the message — verification fails immediately
- View exported public key (SPKI/PEM format)
- Full algorithm walkthrough (PSS padding, elliptic curve math)

### Module 2 — X.509 Certificates
- PKI chain of trust visualization (Root CA → Intermediate → End-entity)
- Parse and display certificate fields (subject, issuer, validity, extensions)
- Certificate validation pipeline explanation
- ASN.1 structure breakdown

### Module 3 — Encryption
- **AES-256-GCM**: Password-based encryption with PBKDF2 key derivation
  - Random 128-bit salt + 96-bit IV per encryption
  - GCM auth tag — modify ciphertext → decryption fails
  - Try wrong password to see decryption failure
- **RSA-OAEP (2048-bit)**: Asymmetric encrypt/decrypt
  - Generate key pair, encrypt with public, decrypt with private
  - Hybrid encryption explanation

### Module 4 — JWT
- Create signed JWTs with custom claims (sub, role, iss, exp)
- Signed with HS256 (HMAC-SHA256) via `jose` library
- Decode header/payload/signature with color coding
- **Tamper detection**: modify token body → signature verification fails
- Wrong secret → verification fails
- JWT attack vectors explained (alg:none, payload tampering, weak secrets)

---

##  Cryptographic Algorithms Used

```typescript
// Digital Signature — RSA-PSS
crypto.subtle.generateKey({ name: "RSA-PSS", modulusLength: 2048, hash: "SHA-256" }, ...)
crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, privateKey, data)

// Digital Signature — ECDSA P-256
crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, ...)
crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, data)

// Symmetric Encryption — AES-256-GCM
crypto.subtle.deriveKey({ name: "PBKDF2", iterations: 100_000, hash: "SHA-256" }, ...)
crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext)

// Asymmetric Encryption — RSA-OAEP
crypto.subtle.generateKey({ name: "RSA-OAEP", modulusLength: 2048, hash: "SHA-256" }, ...)
crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data)

// JWT — HS256
new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).sign(secret)
jwtVerify(token, secret)
```

---

##  Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | Frontend framework |
| TypeScript | Type safety |
| Web Crypto API | Native browser cryptography |
| [jose](https://github.com/panva/jose) | JWT library (IETF RFC 7519) |
| Tailwind CSS v4 | Styling |
| Hono | API server (Cloudflare Workers) |
| Wouter | Client-side routing |

---



## Author

**Elmira Serikova** — System Security, Bachelor's in Computer Science  
Course: System Security | Academic Year: 2025–2026

