const axios = require('axios');
const cheerio = require('cheerio');

async function parseImage(article) {
  try {
    console.log('--------------------------VDM');
    console.log(article);

    const searchUrl = `https://vdm.ua/ua/index.php?route=product/search&search=${encodeURIComponent(article)}`;

    const { data } = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'uk-UA,uk;q=0.9,ru;q=0.8,en;q=0.7',
        'Referer': 'https://vdm.ua/'
      }
    });

    const $ = cheerio.load(data);

    let image = null;

    $('.product-layout').each((_, el) => {
      if (image) return; // берём только первый результат

      let img = $(el).find('.image img').attr('src');

      if (img && img.startsWith('/')) {
        img = 'https://vdm.ua' + img;
      }

      if (img) {
        image = img;
      }
    });

    if (image) {
      console.log(`[VDM] ✓ Найдено изображение для ${article}`);
      return image;
    }

    console.log(`[VDM] ✗ Ничего не найдено для ${article}`);
    return null;

  } catch (err) {
    console.error(`[VDM] Error for ${article}:`, err.message);
    return null;
  }
}

module.exports = { parseImage };