const sharp = require('sharp');
const helmetSrc = 'C:/Users/Admin/.gemini/antigravity/brain/7229b9dc-3a0b-4a84-b070-e086c374349b/knight_helmet_icon_1788506501884.jpg';

async function fixHelmet() {
  const { data, info } = await sharp(helmetSrc).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);

  // BFS from borders to find background pixels
  const queue = [];
  function isPixelNeutral(x, y) {
    const idx = (y * w + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return diff < 15 && (r > 160 || (r > 130 && (x < 150 || x > 850 || y < 50 || y > 890)));
  }

  for (let x = 0; x < w; x++) {
    queue.push([x, 0], [x, h - 1]);
    visited[0 * w + x] = 1;
    visited[(h - 1) * w + x] = 1;
  }
  for (let y = 0; y < h; y++) {
    queue.push([0, y], [w - 1, y]);
    visited[y * w + 0] = 1;
    visited[y * w + (w - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    const idx = cy * w + cx;
    if (isPixelNeutral(cx, cy)) {
      isBg[idx] = 1;
      const neighbors = [
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  const rgbaBuffer = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * info.channels;
      const outIdx = (y * w + x) * 4;
      rgbaBuffer[outIdx] = data[idx];
      rgbaBuffer[outIdx + 1] = data[idx + 1];
      rgbaBuffer[outIdx + 2] = data[idx + 2];
      rgbaBuffer[outIdx + 3] = isBg[y * w + x] ? 0 : 255;
    }
  }

  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgbaBuffer[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  await sharp(rgbaBuffer, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .toFile('d:/Project/catan-online/public/assets/icons/knight-helmet.png');

  console.log('Saved perfect knight-helmet.png');
}
fixHelmet();
