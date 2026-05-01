// services/parsers/viyar.js
const axios = require('axios');
const cheerio = require('cheerio');

async function parseImage(article, name = '') {
  try {
    const searchUrl = `https://viyar.ua/ua/search/?q=${encodeURIComponent(article)}`;

    const { data } = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'uk-UA,uk;q=0.9,ru;q=0.8,en;q=0.7',
        'Referer': 'https://viyar.ua/',
      }
    });

    const $ = cheerio.load(data);

    // Основной селектор, который ты показал
    let imageUrl = $('.vr-card-slider__img').first().attr('src');

    // Дополнительные fallback-селекторы
    if (!imageUrl) {
      imageUrl = 
        $('.product-card img').first().attr('src') ||
        $('.product-image img').first().attr('src') ||
        $('img[title*="фото"]').first().attr('src') ||
        $('meta[property="og:image"]').attr('content');
    }

    if (imageUrl) {
      // Приводим относительный путь к полному URL
      if (imageUrl.startsWith('/')) {
        imageUrl = 'https://viyar.ua' + imageUrl;
      }

      console.log(`[Viyar] ✓ Найдено изображение для ${article}`);
      return imageUrl;
    }

    console.log(`[Viyar] ✗ Изображение не найдено для артикула ${article}`);
    return null;

  } catch (err) {
    console.error(`[Viyar] Error for ${article}:`, err.message);
    return null;
  }
}

module.exports = { parseImage };