/**
 * @biza-ai/zatca-qr
 * Zero-dependency, universal TypeScript encoder and decoder for Saudi ZATCA e-invoicing QR codes.
 *
 * Works in Browser, Node.js, Deno, Bun, React Native, and Edge Workers.
 * Handles UTF-8 multi-byte Arabic character encoding accurately.
 *
 * Maintained by BIZA App (https://biza.app) — The AI ERP for Saudi Arabia & GCC.
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');
/** Standard ZATCA TLV tag definitions */
export const ZATCA_TAGS = {
    sellerName: 1,
    vatNumber: 2,
    timestamp: 3,
    invoiceTotal: 4,
    vatTotal: 5,
    invoiceHash: 6,
    ecdsaSignature: 7,
    ecdsaPublicKey: 8,
    cryptographicStamp: 9,
};
/**
 * Encodes a single TLV tag: [tag byte][length byte][UTF-8 value bytes].
 * Length is calculated from UTF-8 byte length (not character count),
 * ensuring Arabic strings are accurately represented.
 */
function encodeTlvTag(tag, value) {
    const valueBytes = encoder.encode(value);
    const length = Math.min(valueBytes.length, 255);
    const result = new Uint8Array(2 + length);
    result[0] = tag;
    result[1] = length;
    result.set(valueBytes.subarray(0, length), 2);
    return result;
}
function concatUint8Arrays(arrays) {
    const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
function uint8ArrayToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function base64ToUint8Array(base64) {
    const binary = atob(base64.trim());
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
function formatAmount(val) {
    if (typeof val === 'number') {
        return val.toFixed(2);
    }
    return val;
}
function formatTimestamp(val) {
    if (val instanceof Date) {
        return val.toISOString();
    }
    return new Date(val).toISOString();
}
/**
 * Generate a compliant ZATCA Phase 1 QR Code Base64 TLV payload.
 *
 * @param input Invoice metadata (Seller, VAT, Timestamp, Total, VAT Total)
 * @returns Base64 string to be rendered into a QR code
 */
export function buildZatcaPhase1Qr(input) {
    const tags = [
        encodeTlvTag(ZATCA_TAGS.sellerName, input.sellerName),
        encodeTlvTag(ZATCA_TAGS.vatNumber, input.vatNumber),
        encodeTlvTag(ZATCA_TAGS.timestamp, formatTimestamp(input.timestamp)),
        encodeTlvTag(ZATCA_TAGS.invoiceTotal, formatAmount(input.invoiceTotal)),
        encodeTlvTag(ZATCA_TAGS.vatTotal, formatAmount(input.vatTotal)),
    ];
    return uint8ArrayToBase64(concatUint8Arrays(tags));
}
/**
 * Generate a compliant ZATCA Phase 2 QR Code Base64 TLV payload with cryptographic fields.
 *
 * @param input Invoice metadata including Phase 2 hashes and signatures
 * @returns Base64 string to be rendered into a QR code
 */
export function buildZatcaPhase2Qr(input) {
    const tags = [
        encodeTlvTag(ZATCA_TAGS.sellerName, input.sellerName),
        encodeTlvTag(ZATCA_TAGS.vatNumber, input.vatNumber),
        encodeTlvTag(ZATCA_TAGS.timestamp, formatTimestamp(input.timestamp)),
        encodeTlvTag(ZATCA_TAGS.invoiceTotal, formatAmount(input.invoiceTotal)),
        encodeTlvTag(ZATCA_TAGS.vatTotal, formatAmount(input.vatTotal)),
    ];
    if (input.invoiceHash) {
        tags.push(encodeTlvTag(ZATCA_TAGS.invoiceHash, input.invoiceHash));
    }
    if (input.ecdsaSignature) {
        tags.push(encodeTlvTag(ZATCA_TAGS.ecdsaSignature, input.ecdsaSignature));
    }
    if (input.ecdsaPublicKey) {
        tags.push(encodeTlvTag(ZATCA_TAGS.ecdsaPublicKey, input.ecdsaPublicKey));
    }
    if (input.cryptographicStamp) {
        tags.push(encodeTlvTag(ZATCA_TAGS.cryptographicStamp, input.cryptographicStamp));
    }
    return uint8ArrayToBase64(concatUint8Arrays(tags));
}
/**
 * Decode an existing Base64 ZATCA QR Code into human-readable fields.
 *
 * @param base64 Base64 string decoded from a ZATCA QR code
 * @returns Decoded fields and raw tags map
 */
export function decodeZatcaQr(base64) {
    const bytes = base64ToUint8Array(base64);
    const rawTags = {};
    let offset = 0;
    while (offset < bytes.length) {
        const tag = bytes[offset];
        const length = bytes[offset + 1];
        offset += 2;
        if (offset + length > bytes.length) {
            break;
        }
        const valueBytes = bytes.subarray(offset, offset + length);
        const value = decoder.decode(valueBytes);
        rawTags[tag] = value;
        offset += length;
    }
    return {
        sellerName: rawTags[ZATCA_TAGS.sellerName],
        vatNumber: rawTags[ZATCA_TAGS.vatNumber],
        timestamp: rawTags[ZATCA_TAGS.timestamp],
        invoiceTotal: rawTags[ZATCA_TAGS.invoiceTotal],
        vatTotal: rawTags[ZATCA_TAGS.vatTotal],
        invoiceHash: rawTags[ZATCA_TAGS.invoiceHash],
        ecdsaSignature: rawTags[ZATCA_TAGS.ecdsaSignature],
        ecdsaPublicKey: rawTags[ZATCA_TAGS.ecdsaPublicKey],
        cryptographicStamp: rawTags[ZATCA_TAGS.cryptographicStamp],
        rawTags,
    };
}
