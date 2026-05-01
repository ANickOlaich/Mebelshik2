const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_DIR = 'uploads/materials';

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Скачивает и оптимизирует изображение
 * @param {string} imageUrl - внешняя ссылка
 * @param {string} article - артикул
 * @returns {Promise<string|null>} - путь к сохранённому файлу
 */
async function downloadImage(imageUrl, article) {
  if (!imageUrl) return null;

  try {
    await ensureDir();

    // Скачиваем изображение
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const inputBuffer = Buffer.from(response.data);

    // Оптимизация через sharp
    const optimizedBuffer = await sharp(inputBuffer)
      .resize(600, 600, {    // максимальный размер 600x600
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({                // конвертируем в JPEG
        quality: 85,         // качество 85%
        progressive: true
      })
      .toBuffer();

    // Генерируем имя файла
    const filename = `${article}-${Date.now()}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Сохраняем оптимизированный файл
    await fs.writeFile(filepath, optimizedBuffer);

    console.log(`[Download] Оптимизировано и сохранено: ${filename} (${(optimizedBuffer.length / 1024).toFixed(1)} KB)`);

    return `/uploads/materials/${filename}`;

  } catch (err) {
    console.error(`[Download] Ошибка для ${article}:`, err.message);
    return null;
  }
}

module.exports = downloadImage;