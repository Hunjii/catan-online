const sharp = require('sharp');
const path = require('path');

const outputDir = path.join(__dirname, '../public/assets');

async function generateIcon(name, svgContent) {
  const svg = `
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.6"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      ${svgContent}
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, `${name}.png`));
  console.log(`Generated ${name}.png`);
}

async function main() {
  // Wood
  await generateIcon('custom_icon_wood', `
    <g transform="translate(12, 16)">
      <rect x="0" y="10" width="36" height="14" rx="4" fill="#a06830" stroke="#3d2314" stroke-width="2"/>
      <ellipse cx="0" cy="17" rx="6" ry="7" fill="#deb887" stroke="#3d2314" stroke-width="2"/>
      <rect x="5" y="0" width="36" height="14" rx="4" fill="#8c5828" stroke="#3d2314" stroke-width="2"/>
      <ellipse cx="5" cy="7" rx="6" ry="7" fill="#deb887" stroke="#3d2314" stroke-width="2"/>
    </g>
  `);

  // Brick
  await generateIcon('custom_icon_brick', `
    <g transform="translate(10, 14)">
      <polygon points="0,10 18,0 38,0 20,10" fill="#f07e54" stroke="#2b0c05" stroke-width="1.5"/>
      <polygon points="0,10 20,10 20,24 0,24" fill="#c44c23" stroke="#2b0c05" stroke-width="1.5"/>
      <polygon points="20,10 38,0 38,14 20,24" fill="#8f3214" stroke="#2b0c05" stroke-width="1.5"/>
      <g transform="translate(6, 12)">
        <polygon points="0,10 18,0 38,0 20,10" fill="#d96841" stroke="#2b0c05" stroke-width="1.5"/>
        <polygon points="0,10 20,10 20,24 0,24" fill="#a83e1c" stroke="#2b0c05" stroke-width="1.5"/>
        <polygon points="20,10 38,0 38,14 20,24" fill="#78270e" stroke="#2b0c05" stroke-width="1.5"/>
      </g>
    </g>
  `);

  // Sheep
  await generateIcon('custom_icon_sheep', `
    <g transform="translate(32, 34)">
      <rect x="-16" y="10" width="5" height="12" rx="2" fill="#2d241e"/>
      <rect x="8" y="10" width="5" height="12" rx="2" fill="#2d241e"/>
      <circle cx="-10" cy="0" r="14" fill="#f8fafc" stroke="#2d241e" stroke-width="1.5"/>
      <circle cx="6" cy="0" r="14" fill="#ffffff" stroke="#2d241e" stroke-width="1.5"/>
      <circle cx="-2" cy="-6" r="14" fill="#ffffff" stroke="#2d241e" stroke-width="1.5"/>
      <g transform="translate(-18, -2)">
        <ellipse cx="0" cy="0" rx="9" ry="11" fill="#4a3e31" stroke="#17120c" stroke-width="1.5"/>
        <circle cx="-4" cy="-2" r="2" fill="#fef08a"/>
      </g>
    </g>
  `);

  // Wheat
  await generateIcon('custom_icon_wheat', `
    <g transform="translate(32, 32)">
      <path d="M 0 25 Q -3 0 0 -25" fill="none" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/>
      ${[-18, -8, 2, 12].map(y => `
        <g transform="translate(0, ${y})">
          <ellipse cx="-8" cy="-3" rx="8" ry="4" transform="rotate(-35, -8, -3)" fill="#fef08a" stroke="#854d0e" stroke-width="1.5"/>
          <ellipse cx="8" cy="-3" rx="8" ry="4" transform="rotate(35, 8, -3)" fill="#fef08a" stroke="#854d0e" stroke-width="1.5"/>
        </g>
      `).join('')}
      <ellipse cx="0" cy="-26" rx="4" ry="8" fill="#fef08a" stroke="#854d0e" stroke-width="1.5"/>
    </g>
  `);

  // Ore
  await generateIcon('custom_icon_ore', `
    <g transform="translate(32, 34)">
      <polygon points="-24,12 -16,-12 6,-22 24,-8 26,14 6,20 -14,18" fill="#64748b" stroke="#0f172a" stroke-width="2"/>
      <polygon points="-16,-12 6,-22 0,0 -14,4" fill="#94a3b8" stroke="#0f172a" stroke-width="1.5"/>
      <polygon points="6,-22 24,-8 12,2 0,0" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
      <polygon points="24,-8 26,14 6,20 12,2" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
    </g>
  `);
}

main().catch(console.error);
