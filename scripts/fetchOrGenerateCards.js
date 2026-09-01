const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, '../public/assets');

// Helper to download a file from URL
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Programmatic High-Resolution Card Generator using Sharp & SVG Vector Illustration
async function generateCard(name, config) {
  const width = 300;
  const height = 420;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradients -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${config.bgTop}" />
        <stop offset="100%" stop-color="${config.bgBottom}" />
      </linearGradient>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#faedd0" />
        <stop offset="50%" stop-color="#e8cca4" />
        <stop offset="100%" stop-color="#c49b63" />
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
      <filter id="artGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Outer Card Frame (Cream Parchment Border) -->
    <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="22" fill="#fdf6e7" stroke="#5c3a21" stroke-width="4" />
    <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="16" fill="none" stroke="#d4b483" stroke-width="2" stroke-dasharray="6 3" />

    <!-- Corner Filigree Accents -->
    <path d="M 22 40 Q 22 22 40 22" fill="none" stroke="#bfa054" stroke-width="3" stroke-linecap="round" />
    <path d="M ${width - 22} 40 Q ${width - 22} 22 ${width - 40} 22" fill="none" stroke="#bfa054" stroke-width="3" stroke-linecap="round" />
    <path d="M 22 ${height - 40} Q 22 ${height - 22} 40 ${height - 22}" fill="none" stroke="#bfa054" stroke-width="3" stroke-linecap="round" />
    <path d="M ${width - 22} ${height - 40} Q ${width - 22} ${height - 22} ${width - 40} ${height - 22}" fill="none" stroke="#bfa054" stroke-width="3" stroke-linecap="round" />

    <!-- Inner Artwork Panel -->
    <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="12" fill="url(#bgGrad)" stroke="${config.accent}" stroke-width="3" />

    <!-- Card Artwork Content (SVG Artwork) -->
    <g filter="url(#artGlow)">
      ${config.artSvg}
    </g>

    <!-- Bottom Ribbon Label Frame -->
    <g transform="translate(${width / 2}, ${height - 60})">
      <path d="M -90 -16 L 90 -16 Q 105 -16 105 0 Q 105 16 90 16 L -90 16 Q -105 16 -105 0 Q -105 -16 -90 -16 Z" 
            fill="#fcf3df" stroke="#8c6239" stroke-width="2.5" />
      <text x="0" y="6" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="20" fill="#3d2314" letter-spacing="2">
        ${config.title}
      </text>
    </g>
  </svg>
  `;

  const dest = path.join(outputDir, `custom_${name}.png`);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(dest);
  console.log(`Generated custom_${name}.png`);
}

async function main() {
  // Generate 5 Custom High-End Vector Painted Cards from scratch!
  
  // 1. Wood Card (Logs on Meadow)
  await generateCard('card_wood', {
    title: 'GỖ RỪNG',
    bgTop: '#3a6327',
    bgBottom: '#1e3812',
    accent: '#5a8f3c',
    artSvg: `
      <!-- Ground texture -->
      <ellipse cx="150" cy="220" rx="100" ry="40" fill="#2d4f1d" opacity="0.8"/>
      <!-- Log 1 (Bottom Left) -->
      <g transform="translate(90, 190)">
        <rect x="0" y="0" width="80" height="35" rx="8" fill="#8c5828" stroke="#42250d" stroke-width="3"/>
        <ellipse cx="0" cy="17" rx="14" ry="17" fill="#deb887" stroke="#42250d" stroke-width="3"/>
        <circle cx="0" cy="17" r="8" fill="none" stroke="#8c5828" stroke-width="2"/>
        <circle cx="0" cy="17" r="3" fill="#42250d"/>
      </g>
      <!-- Log 2 (Bottom Right) -->
      <g transform="translate(130, 185)">
        <rect x="0" y="0" width="80" height="35" rx="8" fill="#8c5828" stroke="#42250d" stroke-width="3"/>
        <ellipse cx="80" cy="17" rx="14" ry="17" fill="#deb887" stroke="#42250d" stroke-width="3"/>
        <circle cx="80" cy="17" r="8" fill="none" stroke="#8c5828" stroke-width="2"/>
        <circle cx="80" cy="17" r="3" fill="#42250d"/>
      </g>
      <!-- Log 3 (Top Middle) -->
      <g transform="translate(110, 150)">
        <rect x="0" y="0" width="80" height="35" rx="8" fill="#a06830" stroke="#42250d" stroke-width="3"/>
        <ellipse cx="0" cy="17" rx="14" ry="17" fill="#e8c99b" stroke="#42250d" stroke-width="3"/>
        <circle cx="0" cy="17" r="8" fill="none" stroke="#a06830" stroke-width="2"/>
        <circle cx="0" cy="17" r="3" fill="#42250d"/>
      </g>
      <!-- Leaves / Grass Details -->
      <path d="M 60 215 Q 70 195 80 210" fill="none" stroke="#86efac" stroke-width="3"/>
      <path d="M 220 220 Q 230 195 240 215" fill="none" stroke="#86efac" stroke-width="3"/>
    `
  });

  // 2. Brick Card (Stacked Clay Bricks)
  await generateCard('card_brick', {
    title: 'GẠCH ĐẤT',
    bgTop: '#87321d',
    bgBottom: '#451509',
    accent: '#b8492d',
    artSvg: `
      <!-- Ground -->
      <ellipse cx="150" cy="230" rx="100" ry="35" fill="#381308" opacity="0.8"/>
      <!-- Bottom Layer Bricks -->
      <g transform="translate(85, 180)">
        <polygon points="0,20 35,0 75,0 40,20" fill="#d96841" stroke="#2b0c05" stroke-width="2.5"/>
        <polygon points="0,20 40,20 40,45 0,45" fill="#a83e1c" stroke="#2b0c05" stroke-width="2.5"/>
        <polygon points="40,20 75,0 75,25 40,45" fill="#78270e" stroke="#2b0c05" stroke-width="2.5"/>
      </g>
      <g transform="translate(145, 180)">
        <polygon points="0,20 35,0 75,0 40,20" fill="#d96841" stroke="#2b0c05" stroke-width="2.5"/>
        <polygon points="0,20 40,20 40,45 0,45" fill="#a83e1c" stroke="#2b0c05" stroke-width="2.5"/>
        <polygon points="40,20 75,0 75,25 40,45" fill="#78270e" stroke="#2b0c05" stroke-width="2.5"/>
      </g>
      <!-- Top Layer Bricks -->
      <g transform="translate(115, 140)">
        <polygon points="0,20 35,0 75,0 40,20" fill="#f07e54" stroke="#2b0c05" stroke-width="2.5"/>
        <polygon points="0,20 40,20 40,45 0,45" fill="#c44c23" stroke="#2b0c05" stroke-width="2.5"/>
        <polygon points="40,20 75,0 75,25 40,45" fill="#8f3214" stroke="#2b0c05" stroke-width="2.5"/>
      </g>
    `
  });

  // 3. Sheep Card (Fluffy White Sheep in Meadow)
  await generateCard('card_sheep', {
    title: 'CỪU ĐỒNG',
    bgTop: '#558231',
    bgBottom: '#274511',
    accent: '#7eb54e',
    artSvg: `
      <!-- Pasture Hills -->
      <ellipse cx="150" cy="225" rx="105" ry="38" fill="#325717" opacity="0.9"/>
      <!-- Sheep Body (Fluffy wool cloud) -->
      <g transform="translate(150, 175)">
        <!-- Legs -->
        <rect x="-35" y="25" width="10" height="30" rx="4" fill="#332a21" stroke="#17120c" stroke-width="2"/>
        <rect x="-15" y="28" width="10" height="28" rx="4" fill="#332a21" stroke="#17120c" stroke-width="2"/>
        <rect x="15" y="28" width="10" height="28" rx="4" fill="#332a21" stroke="#17120c" stroke-width="2"/>
        <rect x="30" y="25" width="10" height="30" rx="4" fill="#332a21" stroke="#17120c" stroke-width="2"/>
        <!-- Main Wool Cloud -->
        <circle cx="-25" cy="0" r="28" fill="#f8fafc" stroke="#332a21" stroke-width="2.5"/>
        <circle cx="0" cy="-10" r="32" fill="#ffffff" stroke="#332a21" stroke-width="2.5"/>
        <circle cx="25" cy="0" r="28" fill="#f1f5f9" stroke="#332a21" stroke-width="2.5"/>
        <circle cx="-10" cy="15" r="24" fill="#e2e8f0" stroke="#332a21" stroke-width="2.5"/>
        <circle cx="15" cy="15" r="24" fill="#e2e8f0" stroke="#332a21" stroke-width="2.5"/>
        <!-- Sheep Head (Left) -->
        <g transform="translate(-45, -5)">
          <ellipse cx="0" cy="0" rx="18" ry="22" fill="#4a3e31" stroke="#17120c" stroke-width="2.5"/>
          <!-- Ear -->
          <ellipse cx="10" cy="-14" rx="8" ry="14" transform="rotate(-35, 10, -14)" fill="#332a21" stroke="#17120c" stroke-width="2"/>
          <!-- Snout & Eye -->
          <circle cx="-8" cy="-4" r="3.5" fill="#fef08a"/>
          <circle cx="-8" cy="-4" r="1.5" fill="#000000"/>
          <ellipse cx="-12" cy="12" rx="5" ry="4" fill="#17120c"/>
        </g>
      </g>
    `
  });

  // 4. Wheat Card (Golden Wheat Sheaf)
  await generateCard('card_wheat', {
    title: 'LÚA MÌ',
    bgTop: '#ab791a',
    bgBottom: '#523706',
    accent: '#deb038',
    artSvg: `
      <!-- Golden aura glow -->
      <circle cx="150" cy="180" r="70" fill="#fef08a" opacity="0.25"/>
      <!-- Wheat Stalks Group -->
      <g transform="translate(150, 180)">
        <!-- Stalk line -->
        <path d="M 0 65 Q -5 0 0 -65" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
        <path d="M 0 65 Q -5 0 0 -65" fill="none" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
        <!-- Wheat Grains Pairs -->
        ${[-50, -35, -20, -5, 10, 25].map((y, i) => `
          <g transform="translate(0, ${y})">
            <!-- Left grain -->
            <ellipse cx="-18" cy="-6" rx="16" ry="9" transform="rotate(-35, -18, -6)" fill="#fef08a" stroke="#78350f" stroke-width="2.5"/>
            <path d="M -26 -14 L -40 -30" stroke="#ca8a04" stroke-width="2" stroke-linecap="round"/>
            <!-- Right grain -->
            <ellipse cx="18" cy="-6" rx="16" ry="9" transform="rotate(35, 18, -6)" fill="#fef08a" stroke="#78350f" stroke-width="2.5"/>
            <path d="M 26 -14 L 40 -30" stroke="#ca8a04" stroke-width="2" stroke-linecap="round"/>
          </g>
        `).join('')}
        <!-- Top Grain -->
        <ellipse cx="0" cy="-68" rx="9" ry="18" fill="#fef08a" stroke="#78350f" stroke-width="2.5"/>
        <path d="M 0 -80 L 0 -105" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    `
  });

  // 5. Ore Card (Mountain Rocks and Crystals)
  await generateCard('card_ore', {
    title: 'ĐÁ QUẶNG',
    bgTop: '#475569',
    bgBottom: '#0f172a',
    accent: '#94a3b8',
    artSvg: `
      <!-- Base Shadow -->
      <ellipse cx="150" cy="225" rx="100" ry="32" fill="#020617" opacity="0.9"/>
      <!-- Main Boulder -->
      <g transform="translate(130, 175)">
        <polygon points="-55,30 -40,-25 10,-50 60,-20 70,30 20,45 -35,42" fill="#64748b" stroke="#0f172a" stroke-width="3"/>
        <!-- Facets & Highlights -->
        <polygon points="-40,-25 10,-50 0,0 -35,10" fill="#94a3b8" stroke="#0f172a" stroke-width="2"/>
        <polygon points="10,-50 60,-20 30,5 0,0" fill="#cbd5e1" stroke="#0f172a" stroke-width="2"/>
        <polygon points="60,-20 70,30 20,45 30,5" fill="#475569" stroke="#0f172a" stroke-width="2"/>
        <polygon points="-55,30 -35,10 0,0 20,45 -35,42" fill="#334155" stroke="#0f172a" stroke-width="2"/>
      </g>
      <!-- Secondary Smaller Ore Rock -->
      <g transform="translate(195, 205)">
        <polygon points="-25,15 -18,-15 5,-25 30,-8 32,15 8,22" fill="#94a3b8" stroke="#0f172a" stroke-width="2.5"/>
        <polygon points="-18,-15 5,-25 15,-2 0,5" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.5"/>
        <polygon points="5,-25 30,-8 18,15 15,-2" fill="#64748b" stroke="#0f172a" stroke-width="1.5"/>
      </g>
    `
  });

  // 6. CATAN Dev Card Deck Back
  await generateCard('card_catan_deck', {
    title: 'PHÁT TRIỂN',
    bgTop: '#991b1b',
    bgBottom: '#450a0a',
    accent: '#fbbf24',
    artSvg: `
      <!-- Arched Sun Logo -->
      <g transform="translate(150, 160)">
        <circle cx="0" cy="0" r="55" fill="#fbbf24" stroke="#78350f" stroke-width="4"/>
        <path d="M -50 15 Q 0 -40 50 15 Z" fill="#b91c1c"/>
        <text x="0" y="38" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="26" fill="#fef08a" letter-spacing="3">
          CATAN
        </text>
      </g>
    `
  });
}

main().catch(console.error);
