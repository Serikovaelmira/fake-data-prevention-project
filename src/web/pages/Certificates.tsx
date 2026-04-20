import { useState } from "react";

// Sample certificate DER data (self-signed demo cert, base64 encoded)
// We'll parse a hardcoded PEM for demo purposes
const DEMO_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQDU+pQ4pHgSpDANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDDAls
b2NhbGhvc3QwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjAUMRIwEAYD
VQQDDAlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
o4qne60TB3wolLNMIEKs5P4mJEBQCBVpSBn9kFQmEemA1P4JW8AQPB5FhJD4NWLQ
kfYm3Q1l8lEV1hqAQfvCR+AHv+x3EiPmBLFJsmNaJGijz3YLNV98lh3YIFSh/fj/
-----END CERTIFICATE-----`;

// Simulated certificate fields (in real app you'd use a proper ASN.1 parser)
interface CertField {
  field: string;
  value: string;
  color?: string;
}

const DEMO_CERT_FIELDS: CertField[] = [
  { field: "Version", value: "v3 (0x2)" },
  { field: "Serial Number", value: "d4:fa:94:38:a4:78:12:a4" },
  { field: "Signature Algorithm", value: "sha256WithRSAEncryption" },
  { field: "Issuer", value: "CN=localhost, O=Demo CA, C=IT" },
  { field: "Subject", value: "CN=localhost, O=Demo CA, C=IT" },
  { field: "Not Before", value: "Jan 01 00:00:00 2024 GMT" },
  { field: "Not After", value: "Jan 01 00:00:00 2026 GMT", color: "oklch(0.82 0.2 60)" },
  { field: "Public Key Algorithm", value: "rsaEncryption (2048 bit)" },
  { field: "Key Usage", value: "Digital Signature, Key Encipherment" },
  { field: "Extended Key Usage", value: "TLS Web Server Authentication" },
  { field: "Basic Constraints", value: "CA:TRUE" },
  { field: "Subject Key Identifier", value: "4a:3b:8f:02:d1:7c:55:e4:9a:1b:3d:ff:0c:22:88:01" },
];

// PKI chain visualization data
const PKI_CHAIN = [
  { name: "Root CA", desc: "Self-signed root certificate. Trusted by OS/browser. Signs intermediate CAs.", level: 0, color: "oklch(0.82 0.2 60)" },
  { name: "Intermediate CA", desc: "Signed by Root CA. Signs end-entity certificates. Allows root to stay offline.", level: 1, color: "oklch(0.78 0.16 270)" },
  { name: "End-Entity (Server)", desc: "Your server certificate. Signed by Intermediate CA. Presented to clients.", level: 2, color: "oklch(0.82 0.18 195)" },
];

export default function Certificates() {
  const [showPem, setShowPem] = useState(false);
  const [parsedFields, setParsedFields] = useState<CertField[] | null>(null);
  const [verifyResult, setVerifyResult] = useState<"idle" | "valid" | "expired" | "invalid">("idle");
  const [customPem, setCustomPem] = useState(DEMO_CERT_PEM);

  function parseCertificate() {
    // In a browser environment, we simulate parsing with our demo data
    // In production you'd use a library like node-forge or pkijs
    if (!customPem.includes("BEGIN CERTIFICATE")) {
      setVerifyResult("invalid");
      setParsedFields(null);
      return;
    }
    setParsedFields(DEMO_CERT_FIELDS);
    setVerifyResult("expired"); // Demo cert is from 2024, so it's "expired" for demo
  }

  function resetCert() {
    setCustomPem(DEMO_CERT_PEM);
    setParsedFields(null);
    setVerifyResult("idle");
  }

  const statusColor = {
    idle: "oklch(0.55 0.03 220)",
    valid: "oklch(0.82 0.2 145)",
    expired: "oklch(0.82 0.2 60)",
    invalid: "oklch(0.65 0.22 25)",
  }[verifyResult];

  const statusMsg = {
    idle: "",
    valid: "✅ Certificate is VALID and trusted",
    expired: "⚠️ Certificate EXPIRED — not trusted for TLS. (Demo cert from 2024)",
    invalid: "❌ Invalid certificate format or structure",
  }[verifyResult];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-xs mono badge-info px-3 py-1 rounded-full">Module 02</span>
        <h1 className="text-3xl font-bold mt-3 mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.78 0.16 270)" }}>
          X.509 Certificates
        </h1>
        <p className="text-sm leading-relaxed max-w-3xl" style={{ color: "oklch(0.65 0.03 220)" }}>
          X.509 certificates bind a <strong style={{ color: "oklch(0.95 0 0)" }}>public key</strong> to a verified <strong style={{ color: "oklch(0.95 0 0)" }}>identity</strong>.
          They form the backbone of PKI (Public Key Infrastructure) — the trust system that underpins HTTPS, email signing, and code signing.
        </p>
      </div>

      {/* PKI Chain */}
      <div className="mb-8 p-6 rounded-lg border" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
        <h2 className="text-sm font-bold mb-5" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.78 0.16 270)" }}>
          // PKI Chain of Trust
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {PKI_CHAIN.map((node, i) => (
            <div key={node.name} className="flex md:flex-col items-center gap-4 flex-1">
              <div className="p-4 rounded-lg border text-center flex-1 w-full" style={{ background: "oklch(0.11 0.015 240)", borderColor: node.color + "55" }}>
                <div className="text-xs mono mb-1" style={{ color: node.color }}>Level {node.level}</div>
                <div className="text-sm font-bold mb-2" style={{ fontFamily: "'Space Mono', monospace", color: node.color }}>{node.name}</div>
                <div className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.03 220)" }}>{node.desc}</div>
              </div>
              {i < PKI_CHAIN.length - 1 && (
                <div className="text-xl md:rotate-90" style={{ color: "oklch(0.45 0.03 220)" }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Certificate structure */}
        <div className="p-5 rounded-lg border" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.28 0.05 210 / 40%)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.78 0.16 270)" }}>
            X.509 Certificate Structure
          </h3>
          <div className="space-y-2">
            {[
              { name: "tbsCertificate", fields: ["version", "serialNumber", "signature", "issuer", "validity", "subject", "subjectPublicKeyInfo", "extensions"], color: "oklch(0.82 0.18 195)" },
              { name: "signatureAlgorithm", fields: ["algorithm (e.g. sha256WithRSAEncryption)"], color: "oklch(0.82 0.2 145)" },
              { name: "signatureValue", fields: ["CA's signature over tbsCertificate"], color: "oklch(0.82 0.2 60)" },
            ].map((section) => (
              <div key={section.name} className="p-3 rounded border" style={{ borderColor: section.color + "44", background: section.color + "0a" }}>
                <div className="text-xs font-bold mono mb-1" style={{ color: section.color }}>{section.name}</div>
                <div className="flex flex-wrap gap-1">
                  {section.fields.map((f) => (
                    <span key={f} className="text-xs mono px-2 py-0.5 rounded" style={{ background: "oklch(0.09 0.01 240)", color: "oklch(0.65 0.03 220)" }}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Parser */}
        <div className="space-y-4">
          <div>
            <label className="text-xs mono mb-1 block" style={{ color: "oklch(0.55 0.03 220)" }}>PEM Certificate Input:</label>
            <textarea
              value={customPem}
              onChange={(e) => setCustomPem(e.target.value)}
              rows={6}
              className="w-full p-3 rounded text-xs mono resize-none border"
              style={{ background: "oklch(0.07 0.01 240)", color: "oklch(0.82 0.2 145)", borderColor: "oklch(0.28 0.05 210 / 50%)" }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={parseCertificate} className="px-4 py-2 rounded text-xs mono" style={{ background: "oklch(0.78 0.16 270 / 20%)", color: "oklch(0.78 0.16 270)", border: "1px solid oklch(0.78 0.16 270 / 50%)" }}>
              Parse Certificate
            </button>
            <button onClick={() => setShowPem(!showPem)} className="px-4 py-2 rounded text-xs mono" style={{ background: "transparent", color: "oklch(0.55 0.03 220)", border: "1px solid oklch(0.28 0.05 210 / 50%)" }}>
              {showPem ? "Hide PEM" : "Show Full PEM"}
            </button>
            <button onClick={resetCert} className="px-4 py-2 rounded text-xs mono" style={{ background: "transparent", color: "oklch(0.45 0.03 220)", border: "1px solid oklch(0.28 0.05 210 / 30%)" }}>
              Reset
            </button>
          </div>

          {verifyResult !== "idle" && (
            <div className="p-3 rounded text-sm mono text-center" style={{ background: statusColor + "15", border: `1px solid ${statusColor}40`, color: statusColor }}>
              {statusMsg}
            </div>
          )}
        </div>
      </div>

      {/* Parsed Fields */}
      {parsedFields && (
        <div className="rounded-lg border mb-6" style={{ borderColor: "oklch(0.78 0.16 270 / 40%)" }}>
          <div className="p-3 border-b" style={{ background: "oklch(0.13 0.02 240)", borderColor: "oklch(0.78 0.16 270 / 30%)" }}>
            <span className="text-sm mono font-bold" style={{ color: "oklch(0.78 0.16 270)" }}>Parsed Certificate Fields</span>
          </div>
          <div className="divide-y" style={{ borderColor: "oklch(0.28 0.05 210 / 20%)" }}>
            {parsedFields.map((field) => (
              <div key={field.field} className="flex px-4 py-2 text-xs" style={{ background: "oklch(0.11 0.015 240)" }}>
                <span className="mono w-48 flex-shrink-0" style={{ color: "oklch(0.55 0.03 220)" }}>{field.field}</span>
                <span className="mono" style={{ color: field.color || "oklch(0.85 0 0)" }}>{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code example */}
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot" style={{ background: "#ff5f57" }} />
          <span className="terminal-dot" style={{ background: "#febc2e" }} />
          <span className="terminal-dot" style={{ background: "#28c840" }} />
          <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>verify-cert.py — Python with cryptography library</span>
        </div>
        <div className="terminal-body">
          <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "oklch(0.75 0 0)" }}>{`from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.x509.oid import NameOID
from datetime import datetime, timezone

# Load certificate from PEM
with open("server.pem", "rb") as f:
    cert = x509.load_pem_x509_certificate(f.read(), default_backend())

# Extract fields
print("Subject:", cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value)
print("Issuer:", cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value)
print("Serial:", cert.serial_number)
print("Not Before:", cert.not_valid_before_utc)
print("Not After:", cert.not_valid_after_utc)

# Check expiry
now = datetime.now(timezone.utc)
is_valid = cert.not_valid_before_utc <= now <= cert.not_valid_after_utc
print("Valid:", is_valid)

# Verify signature against issuer's public key (CA)
issuer_public_key.verify(
    cert.signature,
    cert.tbs_certificate_bytes,
    padding.PKCS1v15(),
    cert.signature_hash_algorithm,
)`}</pre>
        </div>
      </div>
    </div>
  );
}
