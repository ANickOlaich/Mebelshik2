// services/parsers/index.js
const fs = require('fs');
const path = require('path');
const { Supplier } = require('../../models')

const parsers = new Map();

// Автоматическая загрузка всех парсеров из папки
const parsersDir = __dirname;

fs.readdirSync(parsersDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .forEach(file => {
    const parserName = path.basename(file, '.js');
    const parserModule = require(`./${file}`);
    
    // Ожидаем, что каждый парсер экспортирует объект с методом parseImage
    if (parserModule.parseImage) {
      parsers.set(parserName.toLowerCase(), parserModule);
      console.log(`[Parser] Loaded: ${parserName}`);
    }
  });

/**
 * Основная функция парсинга изображения
 * @param {string} article - артикул
 * @param {number} supplierId - ID поставщика
 * @param {string} name - название материала (опционально)
 * @returns {Promise<string|null>} URL изображения или null
 */
async function parseSupplierImage(article, supplierId, name = '') {
  if (!article || !supplierId) return null;

  // Здесь можно сделать маппинг supplierId → название парсера
  // Пока используем простой способ — можно улучшить позже
  const supplierKey = await getSupplierKey(supplierId); // нужно реализовать

  const parser = parsers.get(supplierKey);

  if (!parser) {
    console.log(`[Parser] No parser found for supplier: ${supplierId} (${supplierKey})`);
    return null;
  }

  try {
    return await parser.parseImage(article, name);
  } catch (err) {
    console.error(`[Parser] Error in ${supplierKey} parser:`, err.message);
    return null;
  }
}

const supplierParserCache = new Map()

async function getSupplierKey(supplierId) {
  
  if (!supplierId) return 'default'

  // 🔥 cache first
  if (supplierParserCache.has(supplierId)) {
    return supplierParserCache.get(supplierId)
  }

  const supplier = await Supplier.findByPk(supplierId, {
    attributes: ['parser']
  })

  const parser = supplier?.parser || 'default'

  supplierParserCache.set(supplierId, parser)
  
  return parser
}

module.exports = {
  parseSupplierImage
};