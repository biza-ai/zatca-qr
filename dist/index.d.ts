/**
 * @biza-ai/zatca-qr
 * Zero-dependency, universal TypeScript encoder and decoder for Saudi ZATCA e-invoicing QR codes.
 *
 * Works in Browser, Node.js, Deno, Bun, React Native, and Edge Workers.
 * Handles UTF-8 multi-byte Arabic character encoding accurately.
 *
 * Maintained by BIZA App (https://biza.app) — The AI ERP for Saudi Arabia & GCC.
 */
/** Standard ZATCA TLV tag definitions */
export declare const ZATCA_TAGS: {
    readonly sellerName: 1;
    readonly vatNumber: 2;
    readonly timestamp: 3;
    readonly invoiceTotal: 4;
    readonly vatTotal: 5;
    readonly invoiceHash: 6;
    readonly ecdsaSignature: 7;
    readonly ecdsaPublicKey: 8;
    readonly cryptographicStamp: 9;
};
export interface ZatcaPhase1Input {
    /** Name of the seller (English or Arabic) */
    sellerName: string;
    /** 15-digit VAT registration number of the seller */
    vatNumber: string;
    /** Invoice generation timestamp (ISO-8601 string or Date object) */
    timestamp: string | Date;
    /** Total invoice amount including VAT (formatted to 2 decimal places) */
    invoiceTotal: number | string;
    /** Total VAT amount (formatted to 2 decimal places) */
    vatTotal: number | string;
}
export interface ZatcaPhase2Input extends ZatcaPhase1Input {
    /** SHA-256 hash of the invoice XML (Tag 6) */
    invoiceHash?: string;
    /** ECDSA cryptographic signature of the invoice hash (Tag 7) */
    ecdsaSignature?: string;
    /** Public key used to verify the signature (Tag 8) */
    ecdsaPublicKey?: string;
    /** Cryptographic stamp for clearance (Tag 9) */
    cryptographicStamp?: string;
}
export interface DecodedZatcaQr {
    sellerName?: string;
    vatNumber?: string;
    timestamp?: string;
    invoiceTotal?: string;
    vatTotal?: string;
    invoiceHash?: string;
    ecdsaSignature?: string;
    ecdsaPublicKey?: string;
    cryptographicStamp?: string;
    rawTags: Record<number, string>;
}
/**
 * Generate a compliant ZATCA Phase 1 QR Code Base64 TLV payload.
 *
 * @param input Invoice metadata (Seller, VAT, Timestamp, Total, VAT Total)
 * @returns Base64 string to be rendered into a QR code
 */
export declare function buildZatcaPhase1Qr(input: ZatcaPhase1Input): string;
/**
 * Generate a compliant ZATCA Phase 2 QR Code Base64 TLV payload with cryptographic fields.
 *
 * @param input Invoice metadata including Phase 2 hashes and signatures
 * @returns Base64 string to be rendered into a QR code
 */
export declare function buildZatcaPhase2Qr(input: ZatcaPhase2Input): string;
/**
 * Decode an existing Base64 ZATCA QR Code into human-readable fields.
 *
 * @param base64 Base64 string decoded from a ZATCA QR code
 * @returns Decoded fields and raw tags map
 */
export declare function decodeZatcaQr(base64: string): DecodedZatcaQr;
