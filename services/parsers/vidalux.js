// services/parsers/vidalux.js
const axios = require('axios');
const cheerio = require('cheerio');

async function parseImage(article) {
  try {
    const searchUrl = `https://vidalux.ua/search?controller=search&orderby=position&orderway=desc&search_query=${encodeURIComponent(article)}`;

    const { data } = await axios.get(searchUrl, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Accept-Language': 'uk-UA,uk;q=0.9,ru;q=0.8',
        'Referer': 'https://vidalux.ua/'
      }
    });

    const $ = cheerio.load(data);

    // Ищем все блоки товаров
    const products = $('.product-container');

    for (let i = 0; i < products.length; i++) {
      const product = $(products[i]);

      // Проверяем артикул в блоке
      const articleText = product.find('.features').text();

      if (articleText.includes(article)) {
        // Нашли нужный блок — берём картинку
        let imageUrl = product.find('.product-image-container img').first().attr('src');

        if (imageUrl) {
          if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
          if (!imageUrl.startsWith('http')) imageUrl = 'https://vidalux.ua' + imageUrl;

          console.log(`[Vidalux] ✓ Изображение найдено для ${article}`);
          return imageUrl;
        }
      }
    }

    console.log(`[Vidalux] ✗ Изображение не найдено для артикула ${article}`);
    return null;

  } catch (err) {
    console.error(`[Vidalux] Error for ${article}:`, err.message);
    return null;
  }
}

module.exports = { parseImage };