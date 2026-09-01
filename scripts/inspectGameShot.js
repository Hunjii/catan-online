const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:/Users/Admin/.gemini/antigravity/brain/23c0704b-c882-460f-abad-c9627c804433/.user_uploaded/media_1788186437497.jpg';
const outputDir = path.join(__dirname, '../public/assets');

async function main() {
  const metadata = await sharp(inputPath).metadata();
  console.log('Main screenshot dimensions:', metadata.width, 'x', metadata.height);
}

main().catch(console.error);
