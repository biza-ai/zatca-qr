# @biza-ai/zatca-qr

[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/@biza-ai/zatca-qr)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![ZATCA Phase 2 Compliant](https://img.shields.io/badge/ZATCA-Phase%201%20%26%202%20Compliant-emerald.svg)](https://biza.app/features/zatca-e-invoicing/)
[![Online Validator](https://img.shields.io/badge/Live%20Tool-ZATCA%20QR%20Validator-teal.svg)](https://biza.app/tools/zatca-validator)

> **Zero-dependency, universal TypeScript library to encode and decode Saudi ZATCA e-invoicing Phase 1 & Phase 2 TLV QR codes.**
> 
> Maintained by [**BIZA App**](https://biza.app) — The AI ERP & Cloud Accounting platform for Saudi Arabia & the GCC.
>
> 🚀 **Visual QR Validator:** You can test and inspect your ZATCA QR codes online using the free [**BIZA ZATCA QR Validator**](https://biza.app/tools/zatca-validator) (also available in [العربية](https://biza.app/ar/tools/zatca-validator)).

---

## Why `@biza-ai/zatca-qr`?

Most existing ZATCA QR libraries on NPM have two critical flaws:

1. **Browser / Edge incompatibility:** They depend on Node's native `Buffer`. When imported in modern browsers, React/Vite, Next.js App Router, React Native, or Cloudflare Workers, they crash with `ReferenceError: Buffer is not defined`.
2. **The Arabic UTF-8 Length Bug:** ZATCA specifies that the TLV length byte must be the **byte length** of the value, not the character count. In UTF-8, Arabic characters occupy 2 bytes each. Libraries calculating `.length` generate malformed QR codes that are rejected by the official ZATCA compliance validator.

`@biza-ai/zatca-qr` uses standard web primitives (`TextEncoder`, `TextDecoder`, `Uint8Array`, and `btoa`) to work universally in **any JavaScript/TypeScript runtime with zero dependencies**.

---

## When Does Your App Generate the QR vs. ZATCA?

A common question among developers implementing Phase 2 is: *Doesn't ZATCA generate the QR code?*

The answer depends on the invoice type:

| Feature | Standard Tax Invoice (B2B) | Simplified Tax Invoice (B2C / POS) |
|---|---|---|
| **Regulatory Model** | **Clearance Model** (Real-time) | **Reporting Model** (Within 24 hours) |
| **Who Generates QR?** | **ZATCA Servers** generate & return it inside the cleared XML. | **Your App / POS MUST generate the QR locally** at checkout before printing. |
| **Library Usage** | Use `decodeZatcaQr()` to inspect, audit, and extract cryptographic stamps from ZATCA's returned QR. | Use `buildZatcaPhase2Qr()` to construct the compliant 9-tag TLV payload on the device. |

---

## Installation

```bash
npm install @biza-ai/zatca-qr
# or
pnpm add @biza-ai/zatca-qr
# or
bun add @biza-ai/zatca-qr
```

---

## Quickstart

### 1. Generate a ZATCA Phase 1 QR Code

```typescript
import { buildZatcaPhase1Qr } from '@biza-ai/zatca-qr';

const qrBase64 = buildZatcaPhase1Qr({
  sellerName: 'شركة بيزا لتقنية المعلومات', // Supports Arabic & English
  vatNumber: '310123456700003',              // 15-digit VAT number
  timestamp: new Date().toISOString(),         // ISO-8601 timestamp
  invoiceTotal: 1150.00,                      // Total with VAT
  vatTotal: 150.00,                           // Total VAT
});

console.log(qrBase64);
// Ready to pass to any standard QR code renderer (qrcode, react-qr-code, etc.)
```

### 2. Generate a ZATCA Phase 2 QR Code (Integration Phase)

Phase 2 requires additional cryptographic fields (Invoice Hash, ECDSA Signature, Public Key, and Cryptographic Stamp):

```typescript
import { buildZatcaPhase2Qr } from '@biza-ai/zatca-qr';

const phase2Qr = buildZatcaPhase2Qr({
  sellerName: 'BIZA App Saudi Arabia',
  vatNumber: '310123456700003',
  timestamp: '2026-09-20T10:00:00.000Z',
  invoiceTotal: '2300.00',
  vatTotal: '300.00',
  invoiceHash: 'NWZkYjA5ZTVhM2Rh...hash',
  ecdsaSignature: 'MEUCIQ...signature',
  ecdsaPublicKey: 'MFkwEw...publickey',
  cryptographicStamp: 'stamp...',
});
```

### 3. Decode & Inspect Any Existing ZATCA QR Code

Decode Base64 QR strings from printed invoices or receipts back into structured JSON:

```typescript
import { decodeZatcaQr } from '@biza-ai/zatca-qr';

const decoded = decodeZatcaQr(qrBase64String);

console.log(decoded.sellerName);    // "شركة بيزا لتقنية المعلومات"
console.log(decoded.vatNumber);     // "310123456700003"
console.log(decoded.invoiceTotal);  // "1150.00"
console.log(decoded.vatTotal);      // "150.00"
console.log(decoded.rawTags);       // { 1: "...", 2: "...", 3: "...", 4: "...", 5: "..." }
```

---

## Looking for a Complete ZATCA-Ready ERP?

Looking to avoid building and maintaining ZATCA Phase 2 clearance, XML generation, cryptographic onboarding, and double-entry accounting from scratch?

Check out [**BIZA App (biza.app)**](https://biza.app):
- **Full ZATCA Phase 2 Compliance:** Automatic clearance (B2B) and reporting (B2C) with the Fatoora portal.
- **AI-Powered:** Capture supplier invoices via camera/PDF OCR and manage orders with an intelligent conversational assistant.
- **Complete Suite:** General Ledger, Multi-Warehouse Inventory, Invoicing, POS, HR/WPS Payroll, and WhatsApp CRM.

👉 [**Explore BIZA App's ZATCA Features**](https://biza.app/features/zatca-e-invoicing/)

---

## License

MIT © [BIZA](https://biza.app)
