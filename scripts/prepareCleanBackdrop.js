const sharp = require('sharp');
const path = require('path');
const dir = path.join(__dirname, '../public/assets/profile');
const mockupPath = 'C:/Users/Admin/.gemini/antigravity/brain/91224a8a-e384-41ab-a54f-54fef61deab9/.user_uploaded/media_1788236857583.jpg';

async function main() {
  // Extract a clean piece of parchment texture from mockup:
  // (e.g. from x: 160, y: 510, width: 80, height: 20 or similar empty spot)
  // Let's create an SVG overlay with matching parchment color #edd8b5 and warm noise/vignette
  // To cover:
  // 1. Title bar (covered by title_banner.png)
  // 2. Settler name text (x: 100 to 320, y: 130 to 220 in backdrop coordinates)
  // 3. Customization text & avatar area (x: 95 to 540, y: 380 to 730 in backdrop coordinates)

  // Backdrop size is 636 x 846 (cropped from mockup at left: 64, top: 90)
  // Mockup coords to backdrop coords: x_bd = x_mock - 64, y_bd = y_mock - 90
  // Title bar in mockup: left: 152, top: 104, width: 334, height: 60 -> x_bd: 88, y_bd: 14
  // Settler Name in mockup: left: 160, top: 220, width: 230, height: 80 -> x_bd: 96, y_bd: 130
  // Customization header: left: 160, top: 480 -> x_bd: 96, y_bd: 390
  // Avatars area: left: 160, top: 515, width: 440, height: 95 -> x_bd: 96, y_bd: 425
  // Select color area: left: 160, top: 620, width: 440, height: 85 -> x_bd: 96, y_bd: 530
  // Tile set area: left: 160, top: 715, width: 440, height: 85 -> x_bd: 96, y_bd: 625
  // Bottom buttons area: left: 140, top: 810, width: 480, height: 65 -> x_bd: 76, y_bd: 720

  const svgCleanParchment = `
  <svg width="636" height="846">
    <defs>
      <!-- Warm parchment gradient matching the aged paper -->
      <linearGradient id="parchmentGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#edd8b5" />
        <stop offset="50%" stop-color="#e9d2ad" />
        <stop offset="100%" stop-color="#e3cb9f" />
      </linearGradient>
    </defs>
    <!-- Cover Settler name area so we can render dynamic Vietnamese name -->
    <rect x="96" y="125" width="220" height="90" fill="url(#parchmentGrad)" opacity="0.96" rx="4" />
    
    <!-- Cover Customization + Avatars + Colors + Tiles + Buttons area -->
    <!-- y: 388 to 780 -->
    <rect x="96" y="388" width="445" height="392" fill="url(#parchmentGrad)" opacity="0.97" rx="6" />
  </svg>
  `;

  // Overlay blank title banner at x: 88, y: 14
  const titleBanner = await sharp(path.join(dir, 'title_banner.png'))
    .resize(340, 62)
    .toBuffer();

  const cleanFrame = await sharp(path.join(dir, 'modal_full_backdrop.png'))
    .composite([
      { input: Buffer.from(svgCleanParchment), top: 0, left: 0 },
      { input: titleBanner, left: 148, top: 12 }
    ])
    .toFile(path.join(dir, 'modal_clean_template.png'));

  console.log('Saved modal_clean_template.png successfully!');
}

main().catch(console.error);
