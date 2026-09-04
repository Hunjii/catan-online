const sharp = require('sharp');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254" viewBox="0 0 1254 1254">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2b1a0d"/>
      <stop offset="70%" stop-color="#160c05"/>
      <stop offset="100%" stop-color="#0a0502"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe196"/>
      <stop offset="35%" stop-color="#e5b54d"/>
      <stop offset="70%" stop-color="#b88226"/>
      <stop offset="100%" stop-color="#805411"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Outer Rounded Square Frame -->
  <rect x="77" y="77" width="1100" height="1100" rx="280" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="42" filter="url(#dropShadow)"/>
  <rect x="130" y="130" width="994" height="994" rx="230" fill="none" stroke="url(#goldGrad)" stroke-width="16" stroke-opacity="0.4"/>

  <!-- Menu Hamburger Lines -->
  <g fill="url(#goldGrad)" stroke="none">
    <rect x="340" y="380" width="574" height="86" rx="43" />
    <rect x="340" y="584" width="574" height="86" rx="43" />
    <rect x="340" y="788" width="574" height="86" rx="43" />
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/assets/ingame/ingame_action_menu_button.png')
  .then(() => console.log('Successfully generated ingame_action_menu_button.png'))
  .catch(err => console.error(err));
