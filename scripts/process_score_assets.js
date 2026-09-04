const sharp = require('sharp');
const frameSrc = 'C:/Users/Admin/.gemini/antigravity/brain/7229b9dc-3a0b-4a84-b070-e086c374349b/catan_player_score_card_frame_1788506541744.jpg';
const helmetSrc = 'C:/Users/Admin/.gemini/antigravity/brain/7229b9dc-3a0b-4a84-b070-e086c374349b/knight_helmet_icon_1788506501884.jpg';

async function cropSmooth() {
  const { data, info } = await sharp(frameSrc).raw().toBuffer({ resolveWithObject: true });
  let left = 0, right = 1023, top = 0, bottom = 1023;

  for (let x = 0; x < 512; x++) { if (data[(512 * 1024 + x) * 3] < 80) { left = x; break; } }
  for (let x = 1023; x >= 512; x--) { if (data[(512 * 1024 + x) * 3] < 80) { right = x; break; } }
  for (let y = 0; y < 512; y++) { if (data[(y * 1024 + 512) * 3] < 80) { top = y; break; } }
  for (let y = 1023; y >= 512; y--) { if (data[(y * 1024 + 512) * 3] < 80) { bottom = y; break; } }

  const inset = 4;
  const cardW = right - left + 1 - inset * 2;
  const cardH = bottom - top + 1 - inset * 2;
  const radius = 54;
  const svgMask = Buffer.from(`<svg width="${cardW}" height="${cardH}"><rect x="0" y="0" width="${cardW}" height="${cardH}" rx="${radius}" ry="${radius}" fill="white" /></svg>`);

 const cropped = await sharp(frameSrc).extract({ left: left + inset, top: top + inset, width: cardW, height: cardH }).png().toBuffer();
 await sharp(cropped).composite([{ input: svgMask, blend: 'dest-in' }]).png().toFile('d:/Project/catan-online/public/assets/ingame/ingame_score_card_frame.png');
 console.log('Saved clean ingame_score_card_frame.png');

 const { data: hData, info: hInfo } = await sharp(helmetSrc).raw().toBuffer({ resolveWithObject: true });
 const hWidth = hInfo.width;
 const hHeight = hInfo.height;
 const hRgbaBuffer = Buffer.alloc(hWidth * hHeight * 4);

 for (let y = 0; y < hHeight; y++) {
 for (let x = 0; x < hWidth; x++) {
 const idx = (y * hWidth + x) * hInfo.channels;
 const outIdx = (y * hWidth + x) * 4;
 const r = hData[idx];
 const g = hData[idx + 1];
 const b = hData[idx + 2];
 hRgbaBuffer[outIdx] = r;
 hRgbaBuffer[outIdx + 1] = g;
 hRgbaBuffer[outIdx + 2] = b;

 const diff1 = Math.abs(r - g);
 const diff2 = Math.abs(g - b);
 const diff3 = Math.abs(r - b);
 const isNeutral = diff1 < 12 && diff2 < 12 && diff3 < 12;

 if (isNeutral && (r > 160 || (r > 120 && (x < 190 || x > 810 || y < 60 || y > 890)))) {
 hRgbaBuffer[outIdx + 3] = 0;
 } else {
 hRgbaBuffer[outIdx + 3] = 255;
 }
 }
 }

 let hMinX = hWidth, hMaxX = 0, hMinY = hHeight, hMaxY = 0;
 for (let y = 0; y < hHeight; y++) {
 for (let x = 0; x < hWidth; x++) {
 if (hRgbaBuffer[(y * hWidth + x) * 4 + 3] > 0) {
 if (x < hMinX) hMinX = x;
 if (x > hMaxX) hMaxX = x;
 if (y < hMinY) hMinY = y;
 if (y > hMaxY) hMaxY = y;
 }
 }
 }

 await sharp(hRgbaBuffer, { raw: { width: hWidth, height: hHeight, channels: 4 } }).extract({ left: hMinX, top: hMinY, width: hMaxX - hMinX + 1, height: hMaxY - hMinY + 1 }).toFile('d:/Project/catan-online/public/assets/icons/knight-helmet.png');
 console.log('Saved clean knight-helmet.png');
}
cropSmooth();
