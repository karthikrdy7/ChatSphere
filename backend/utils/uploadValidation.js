const crypto = require('node:crypto');

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/bmp',
  'image/tiff',
  'application/pdf',
  'audio/mpeg',
  'audio/webm',
  'audio/ogg',
  'audio/ogg; codecs=opus',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/aac',
  'audio/flac',
]);

function createSafeStoredName() {
  return crypto.randomUUID();
}

function isAllowedDeclaredMimeType(mimeType) {
  const normalizedMimeType = mimeType.split(';', 1)[0].trim();
  return ALLOWED_MIME_TYPES.has(normalizedMimeType);
}

async function getAllowedUploadMimeType(filePath, messageType) {
  const { fileTypeFromFile } = await import('file-type');
  const detectedType = await fileTypeFromFile(filePath);
  const mimeType = detectedType?.mime;
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) return null;

  const categoryMatches = messageType === 'image'
    ? mimeType.startsWith('image/')
    : messageType === 'document'
      ? mimeType === 'application/pdf'
      : messageType === 'voice'
        ? mimeType.startsWith('audio/')
        : false;

  return categoryMatches ? mimeType : null;
}

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  createSafeStoredName,
  getAllowedUploadMimeType,
  isAllowedDeclaredMimeType,
};
