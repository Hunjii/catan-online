const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:/Users/Admin/.gemini/antigravity/brain/23c0704b-c882-460f-abad-c9627c804433/.user_uploaded/media_1788186437497.jpg';
const outputDir = path.join(__dirname, '../public/assets');

async function main() {
  const assets = [
    // Avatars
    { name: 'avatar_hung_orig', left: 10, top: 96, width: 62, height: 62 },
    { name: 'avatar_mai_orig', left: 10, top: 147, width: 62, height: 62 },
    { name: 'avatar_nam_orig', left: 10, top: 226, width: 62, height: 62 },
    { name: 'avatar_linh_orig', left: 10, top: 306, width: 62, height: 62 },

    // Top Right Resource Icons
    { name: 'icon_res_wood', left: 896, top: 98, width: 36, height: 32 },
    { name: 'icon_res_brick', left: 896, top: 153, width: 36, height: 32 },
    { name: 'icon_res_sheep', left: 896, top: 206, width: 36, height: 32 },
    { name: 'icon_res_wheat', left: 896, top: 255, width: 36, height: 32 },
    { name: 'icon_res_ore', left: 896, top: 308, width: 36, height: 32 },

    // Dice Bowl Area
    { name: 'dice_bowl_orig', left: 865, top: 490, width: 145, height: 110 },
  ];

  for (const a of assets) {
    try {
      await sharp(inputPath)
        .extract({ left: a.left, top: a.top, width: a.width, height: a.height })
        .toFile(path.join(outputDir, `${a.name}.png`));
      console.log(`Saved ${a.name}.png`);
    } catch (e) {
      console.error(`Error saving ${a.name}:`, e.message);
    }
  }
}

main().catch(console.error);
