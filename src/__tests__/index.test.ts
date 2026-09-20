import { describe, it, expect } from 'vitest';
import { buildZatcaPhase1Qr, buildZatcaPhase2Qr, decodeZatcaQr } from '../index.js';

describe('ZATCA QR Code Generator & Decoder', () => {
  it('encodes and decodes English Phase 1 QR', () => {
    const input = {
      sellerName: 'BIZA Technologies Ltd',
      vatNumber: '310123456700003',
      timestamp: '2026-09-20T10:00:00.000Z',
      invoiceTotal: 1150.00,
      vatTotal: 150.00,
    };

    const qrBase64 = buildZatcaPhase1Qr(input);
    expect(typeof qrBase64).toBe('string');
    expect(qrBase64.length).toBeGreaterThan(0);

    const decoded = decodeZatcaQr(qrBase64);
    expect(decoded.sellerName).toBe(input.sellerName);
    expect(decoded.vatNumber).toBe(input.vatNumber);
    expect(decoded.timestamp).toBe(input.timestamp);
    expect(decoded.invoiceTotal).toBe('1150.00');
    expect(decoded.vatTotal).toBe('150.00');
  });

  it('accurately encodes multi-byte Arabic seller name', () => {
    const input = {
      sellerName: 'شركة بيزا لتقنية المعلومات',
      vatNumber: '310987654300003',
      timestamp: '2026-09-20T12:30:00.000Z',
      invoiceTotal: 575.50,
      vatTotal: 75.07,
    };

    const qrBase64 = buildZatcaPhase1Qr(input);
    const decoded = decodeZatcaQr(qrBase64);

    expect(decoded.sellerName).toBe('شركة بيزا لتقنية المعلومات');
    expect(decoded.vatNumber).toBe(input.vatNumber);
    expect(decoded.invoiceTotal).toBe('575.50');
    expect(decoded.vatTotal).toBe('75.07');
  });

  it('encodes Phase 2 cryptographic fields', () => {
    const input = {
      sellerName: 'BIZA App Saudi',
      vatNumber: '310111222300003',
      timestamp: '2026-09-20T14:00:00.000Z',
      invoiceTotal: 2300.00,
      vatTotal: 300.00,
      invoiceHash: 'NWZkYjA5ZTVhM2Rh...hash',
      ecdsaSignature: 'MEUCIQ...signature',
      ecdsaPublicKey: 'MFkwEw...publickey',
    };

    const qrBase64 = buildZatcaPhase2Qr(input);
    const decoded = decodeZatcaQr(qrBase64);

    expect(decoded.sellerName).toBe(input.sellerName);
    expect(decoded.invoiceHash).toBe(input.invoiceHash);
    expect(decoded.ecdsaSignature).toBe(input.ecdsaSignature);
    expect(decoded.ecdsaPublicKey).toBe(input.ecdsaPublicKey);
  });
});
