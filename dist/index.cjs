"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  ZATCA_TAGS: () => ZATCA_TAGS,
  buildZatcaPhase1Qr: () => buildZatcaPhase1Qr,
  buildZatcaPhase2Qr: () => buildZatcaPhase2Qr,
  decodeZatcaQr: () => decodeZatcaQr
});
module.exports = __toCommonJS(index_exports);
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
const ZATCA_TAGS = {
  sellerName: 1,
  vatNumber: 2,
  timestamp: 3,
  invoiceTotal: 4,
  vatTotal: 5,
  invoiceHash: 6,
  ecdsaSignature: 7,
  ecdsaPublicKey: 8,
  cryptographicStamp: 9
};
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
  let binary = "";
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
  if (typeof val === "number") {
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
function buildZatcaPhase1Qr(input) {
  const tags = [
    encodeTlvTag(ZATCA_TAGS.sellerName, input.sellerName),
    encodeTlvTag(ZATCA_TAGS.vatNumber, input.vatNumber),
    encodeTlvTag(ZATCA_TAGS.timestamp, formatTimestamp(input.timestamp)),
    encodeTlvTag(ZATCA_TAGS.invoiceTotal, formatAmount(input.invoiceTotal)),
    encodeTlvTag(ZATCA_TAGS.vatTotal, formatAmount(input.vatTotal))
  ];
  return uint8ArrayToBase64(concatUint8Arrays(tags));
}
function buildZatcaPhase2Qr(input) {
  const tags = [
    encodeTlvTag(ZATCA_TAGS.sellerName, input.sellerName),
    encodeTlvTag(ZATCA_TAGS.vatNumber, input.vatNumber),
    encodeTlvTag(ZATCA_TAGS.timestamp, formatTimestamp(input.timestamp)),
    encodeTlvTag(ZATCA_TAGS.invoiceTotal, formatAmount(input.invoiceTotal)),
    encodeTlvTag(ZATCA_TAGS.vatTotal, formatAmount(input.vatTotal))
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
function decodeZatcaQr(base64) {
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
    rawTags
  };
}
