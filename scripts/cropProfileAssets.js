const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const resourcePath = 'C:/Users/Admin/.gemini/antigravity/brain/91224a8a-e384-41ab-a54f-54fef61deab9/.user_uploaded/media_1788236898614.jpg';
const mockupPath = 'C:/Users/Admin/.gemini/antigravity/brain/91224a8a-e384-41ab-a54f-54fef61deab9/.user_uploaded/media_1788236857583.jpg';
const outDir = path.join(__dirname, '../public/assets/profile');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function extractAssets() {
  console.log('Starting asset extraction...');

  // 1. Full Modal Frame & Parchment Backdrop from Mockup (764 x 1024)
  await sharp(mockupPath)
    .extract({ left: 64, top: 90, width: 636, height: 846 })
    .toFile(path.join(outDir, 'modal_full_backdrop.png'));
  console.log('Saved modal_full_backdrop.png');

  // Also extract just the parchment background (inner area without wood frame)
  // for flexible layout if needed:
  await sharp(mockupPath)
    .extract({ left: 140, top: 180, width: 484, height: 650 })
    .toFile(path.join(outDir, 'parchment_bg.png'));

  // 2. Resource Sheet Assets (738 x 1024)
  // Title Placard:
  await sharp(resourcePath)
    .extract({ left: 88, top: 14, width: 284, height: 60 })
    .toFile(path.join(outDir, 'title_banner.png'));

  // Sheep badge circle:
  await sharp(resourcePath)
    .extract({ left: 247, top: 121, width: 60, height: 60 })
    .toFile(path.join(outDir, 'sheep_seal.png'));

  // Golden glowing hexagon frame:
  await sharp(resourcePath)
    .extract({ left: 350, top: 198, width: 104, height: 104 })
    .toFile(path.join(outDir, 'hex_frame_gold.png'));

  // Stone hexagon frame:
  await sharp(resourcePath)
    .extract({ left: 210, top: 200, width: 96, height: 96 })
    .toFile(path.join(outDir, 'hex_frame_stone.png'));

  // 4 Avatars from row:
  // Alexander:
  await sharp(resourcePath)
    .extract({ left: 202, top: 526, width: 96, height: 96 })
    .toFile(path.join(outDir, 'avatar_alexander.png'));

  // Elara:
  await sharp(resourcePath)
    .extract({ left: 368, top: 531, width: 78, height: 88 })
    .toFile(path.join(outDir, 'avatar_elara.png'));

  // Magnus:
  await sharp(resourcePath)
    .extract({ left: 522, top: 531, width: 78, height: 88 })
    .toFile(path.join(outDir, 'avatar_magnus.png'));

  // Lyra:
  await sharp(resourcePath)
    .extract({ left: 666, top: 531, width: 70, height: 88 })
    .toFile(path.join(outDir, 'avatar_lyra.png'));

  // Generate 4 big portraits for top-right hexagon
  for (const name of ['alexander', 'elara', 'magnus', 'lyra']) {
    if (name === 'alexander') {
      await sharp(mockupPath)
        .extract({ left: 422, top: 212, width: 174, height: 174 })
        .toFile(path.join(outDir, 'portrait_alexander_big.png'));
    } else {
      // Scale avatar image up to 174x174 with sharpening
      await sharp(path.join(outDir, 'avatar_' + name + '.png'))
        .resize(174, 174, { fit: 'contain', background: { r: 42, g: 32, b: 24, alpha: 1 } })
        .sharpen()
        .toFile(path.join(outDir, 'portrait_' + name + '_big.png'));
    }
    console.log('Created big portrait for ' + name);
  }

  // 6 Color Tiles from resource sheet:
  await sharp(resourcePath)
    .extract({ left: 130, top: 665, width: 55, height: 55 })
    .toFile(path.join(outDir, 'color_red.png'));

  await sharp(resourcePath)
    .extract({ left: 217, top: 665, width: 55, height: 55 })
    .toFile(path.join(outDir, 'color_blue.png'));

  await sharp(resourcePath)
    .extract({ left: 304, top: 665, width: 55, height: 55 })
    .toFile(path.join(outDir, 'color_green.png'));

  await sharp(resourcePath)
    .extract({ left: 390, top: 665, width: 55, height: 55 })
    .toFile(path.join(outDir, 'color_yellow.png'));

  await sharp(resourcePath)
    .extract({ left: 475, top: 665, width: 55, height: 55 })
    .toFile(path.join(outDir, 'color_orange.png'));

  await sharp(resourcePath)
    .extract({ left: 560, top: 665, width: 55, height: 55 })
    .toFile(path.join(outDir, 'color_brown.png'));

  // 4 Tile Set Styles:
  await sharp(resourcePath)
    .extract({ left: 125, top: 775, width: 110, height: 56 })
    .toFile(path.join(outDir, 'tile_classic.png'));

  await sharp(resourcePath)
    .extract({ left: 254, top: 775, width: 110, height: 56 })
    .toFile(path.join(outDir, 'tile_art_nouveau.png'));

  await sharp(resourcePath)
    .extract({ left: 382, top: 775, width: 110, height: 56 })
    .toFile(path.join(outDir, 'tile_viking.png'));

  await sharp(resourcePath)
    .extract({ left: 510, top: 775, width: 110, height: 56 })
    .toFile(path.join(outDir, 'tile_fantasy.png'));

  // Buttons at the bottom:
  await sharp(resourcePath)
    .extract({ left: 112, top: 868, width: 326, height: 60 })
    .toFile(path.join(outDir, 'btn_save_changes.png'));

  await sharp(resourcePath)
    .extract({ left: 450, top: 868, width: 180, height: 60 })
    .toFile(path.join(outDir, 'btn_reset.png'));

  await sharp(resourcePath)
    .extract({ left: 648, top: 874, width: 55, height: 52 })
    .toFile(path.join(outDir, 'btn_close_x.png'));

  console.log('All profile assets extracted successfully!');
}

extractAssets().catch(console.error);

