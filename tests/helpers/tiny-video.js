// Generates a tiny, genuinely valid, browser-decodable .webm file for local-file
// load tests, using Chromium's own MediaRecorder — no ffmpeg or checked-in binary
// fixture required. The result is cached on disk so it's only generated once per
// test run.

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const CACHE_PATH = path.join(__dirname, '..', '.cache', 'tiny.webm');

async function generateTinyVideo() {
  if (fs.existsSync(CACHE_PATH)) {
    return CACHE_PATH;
  }
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const base64 = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const stopped = new Promise((resolve) => { recorder.onstop = resolve; });

    recorder.start();
    const start = Date.now();
    while (Date.now() - start < 300) {
      ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await new Promise((r) => setTimeout(r, 50));
    }
    recorder.stop();
    await stopped;

    const blob = new Blob(chunks, { type: 'video/webm' });
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  });
  await browser.close();

  fs.writeFileSync(CACHE_PATH, Buffer.from(base64, 'base64'));
  return CACHE_PATH;
}

module.exports = { generateTinyVideo };
