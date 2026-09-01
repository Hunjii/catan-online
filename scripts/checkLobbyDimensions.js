const sharp = require('sharp');
const path = require('path');

async function main() {
  const meta = await sharp(path.join(__dirname, '../public/assets/bg_lobby_tavern.jpg')).metadata();
  console.log('Lobby image resolution:', meta.width, 'x', meta.height);
}

main().catch(console.error);
