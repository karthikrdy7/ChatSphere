const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  MAX_UPLOAD_BYTES,
  createSafeStoredName,
  getAllowedUploadMimeType,
  isAllowedDeclaredMimeType,
} = require('../utils/uploadValidation');

const pngFixture = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082',
  'hex',
);

test('upload policy caps files at 5 MB and creates an unpredictable safe storage name', () => {
  assert.equal(MAX_UPLOAD_BYTES, 5 * 1024 * 1024);
  assert.match(createSafeStoredName(), /^[0-9a-f-]{36}$/);
  assert.notEqual(createSafeStoredName(), createSafeStoredName());
  assert.equal(isAllowedDeclaredMimeType('audio/webm;codecs=opus'), true);
  assert.equal(isAllowedDeclaredMimeType('application/msword'), false);
});

test('upload validation checks detected content and attachment category', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'chatsphere-upload-test-'));
  const pngPath = path.join(directory, 'test-image');
  const textPath = path.join(directory, 'fake-image');
  await fs.writeFile(pngPath, pngFixture);
  await fs.writeFile(textPath, 'not an image');
  t.after(() => fs.rm(directory, { recursive: true, force: true }));

  assert.equal(await getAllowedUploadMimeType(pngPath, 'image'), 'image/png');
  assert.equal(await getAllowedUploadMimeType(pngPath, 'document'), null);
  assert.equal(await getAllowedUploadMimeType(textPath, 'image'), null);
});
