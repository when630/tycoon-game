import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target directory: frontend/public/assets
const ASSETS_DIR = path.resolve(__dirname, '../frontend/public/assets');

async function compressImage(filePath) {
  try {
    const originalBuffer = await fs.promises.readFile(filePath);
    const originalSize = originalBuffer.length;

    // Compress
    const data = await sharp(originalBuffer)
      .png({
        quality: 80,
        compressionLevel: 9,
        palette: true, // Use palette-based compression (like distinct colors) if possible, great for pixel art/sprites
        effort: 10     // Max effort
      })
      .toBuffer();

    const newSize = data.length;
    const savings = originalSize - newSize;

    if (savings > 0) {
      await fs.promises.writeFile(filePath, data);
      console.log(`✅ Compressed ${path.basename(filePath)}: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB (Saved ${(savings / 1024).toFixed(1)}KB)`);
      return savings;
    } else {
      console.log(`⏩ Skipped ${path.basename(filePath)} (No savings)`);
      return 0;
    }
  } catch (error) {
    console.error(`❌ Error compressing ${path.basename(filePath)}:`, error);
    return 0;
  }
}

async function walkDir(dir) {
  let files = await fs.promises.readdir(dir);
  let totalSavings = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      totalSavings += await walkDir(filePath);
    } else if (file.toLowerCase().endsWith('.png')) {
      totalSavings += await compressImage(filePath);
    }
  }
  return totalSavings;
}

(async () => {
  console.log(`🚀 Starting compression in ${ASSETS_DIR}...`);
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }

  const totalSavings = await walkDir(ASSETS_DIR);
  console.log(`\n🎉 Compression Complete! Total space saved: ${(totalSavings / (1024 * 1024)).toFixed(2)} MB`);
})();
