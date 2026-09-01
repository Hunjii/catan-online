const sharp = require('sharp');
const path = require('path');

async function main() {
  const assetsDir = path.join(__dirname, '../public/assets');
  const files = ['hex_forest.jpg', 'hex_fields.jpg', 'hex_mountains.jpg', 'hex_pasture.jpg', 'hex_hills.jpg'];

  for (const f of files) {
    const meta = await sharp(path.join(assetsDir, f)).metadata();
    console.log(f, meta.width, 'x', meta.height);
  }
}

main().catch(console.error);
