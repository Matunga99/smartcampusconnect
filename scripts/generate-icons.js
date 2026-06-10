/**
 * Generates PWA icon PNGs from an SVG template.
 * Run: node scripts/generate-icons.js
 * Requires: npm install sharp (already in devDependencies after this script)
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = join(process.cwd(), 'public', 'icons');

mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background — indigo-600
  ctx.fillStyle = '#4f46e5';
  roundRect(ctx, 0, 0, size, size, size * 0.2);
  ctx.fill();

  // Inner white circle
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Letter "S" for SmartCampus
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.45)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SC', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  const filePath = join(outDir, `icon-${size}x${size}.png`);
  writeFileSync(filePath, buffer);
  console.log(`✓ Generated ${filePath}`);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
