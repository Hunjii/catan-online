const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/Admin/.gemini/antigravity/brain/23c0704b-c882-460f-abad-c9627c804433/.user_uploaded/media_1788187395175.png';
const outputDir = path.join(__dirname, '../public/assets');

async function main() {
  const metadata = await sharp(inputPath).metadata();
  console.log('Image dimensions:', metadata.width, 'x', metadata.height);

  const W = metadata.width;
  const H = metadata.height;

  // Let's also create the whole resource bar as a background / sprite or crop individual cards
  // In the image, there are 6 cards roughly evenly spaced.
  // Card 1: Wood
  // Card 2: Brick
  // Card 3: Sheep
  // Card 4: Wheat
  // Card 5: Ore
  // Card 6: Catan Back Deck

  // Let's compute card bounding boxes based on the aspect ratio:
  // Card width is approx W * 0.155, height is almost full H (minus top/bottom margins).
  
  // Let's extract each card precisely:
  // Card 1 (Wood): left: 0.015 * W, top: 0.05 * H, width: 0.155 * W, height: 0.92 * H
  // Card 2 (Brick): left: 0.178 * W, top: 0.05 * H, width: 0.155 * W, height: 0.92 * H
  // Card 3 (Sheep): left: 0.340 * W, top: 0.05 * H, width: 0.155 * W, height: 0.92 * H
  // Card 4 (Wheat): left: 0.502 * W, top: 0.05 * H, width: 0.155 * W, height: 0.92 * H
  // Card 5 (Ore): left: 0.665 * W, top: 0.05 * H, width: 0.155 * W, height: 0.92 * H
  // Card 6 (Catan Back): left: 0.825 * W, top: 0.05 * H, width: 0.165 * W, height: 0.92 * H

  const cards = [
    { name: 'card_wood', leftRatio: 0.016, widthRatio: 0.153 },
    { name: 'card_brick', leftRatio: 0.178, widthRatio: 0.153 },
    { name: 'card_sheep', leftRatio: 0.340, widthRatio: 0.153 },
    { name: 'card_wheat', leftRatio: 0.502, widthRatio: 0.153 },
    { name: 'card_ore', leftRatio: 0.664, widthRatio: 0.153 },
    { name: 'card_catan_deck', leftRatio: 0.825, widthRatio: 0.165 },
  ];

  for (const card of cards) {
    const left = Math.round(card.leftRatio * W);
    const top = Math.round(0.04 * H);
    const width = Math.round(card.widthRatio * W);
    const height = Math.round(0.94 * H);

    const outPath = path.join(outputDir, `${card.name}.png`);
    await sharp(inputPath)
      .extract({ left, top, width, height })
      .toFile(outPath);
    console.log(`Saved ${card.name}.png (${width}x${height})`);
  }

  // Also save the full resource bar strip
  await sharp(inputPath)
    .toFile(path.join(outputDir, 'resource_hand_strip.png'));
  console.log('Saved resource_hand_strip.png');
}

main().catch(console.error);
