const { Material, Supplier,User } = require('../models')
const { parseSupplierImage } = require('../services/parsers');
const downloadImage = require('../services/downloadImage');
const { Op } = require('sequelize')   // ← додайте цей рядок
const sequelize = require('sequelize')

const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../uploads/materials');

// Создаём папку, если её нет
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * 📦 GET ALL MATERIALS
 */
exports.getAllMaterials = async (req, res) => {
  console.log('getAllMaterials called with query:', req.query)  
  try {
    const {
      page = 1,
      perPage = 10,
      search = '',
      sortField = 'name',
      sortDirection = 'asc'
    } = req.query

    const offset = (page - 1) * perPage

   const where = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { article: { [Op.like]: `%${search}%` } }
          ]
        }
      : {}

    const { rows, count } = await Material.findAndCountAll({
      where,
      include: [
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'creator', attributes: ['id', 'username'] }
      ],
      limit: +perPage,
      offset,
      order: [[sortField, sortDirection.toUpperCase()]]
    })

    res.json({
      items: rows,
      total: count
    })
  } catch (err) {
    console.error('getAllMaterials error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

/**
 * ➕ CREATE MATERIAL
 */
exports.createMaterial = async (req, res) => {
  try {
    const {
      name,
      article,
      supplierId,
      type,
      site,
      image,
      isNew
    } = req.body

    if (!name || !article || !supplierId) {
      return res.status(400).json({
        message: 'name, article, supplierId are required'
      })
    }

    // проверка поставщика
const supplier = await Supplier.findByPk(supplierId)

if (!supplier) {
  return res.status(404).json({ message: 'Supplier not found' })
}

// проверка дубля артикула только если он есть
if (article) {
  const existing = await Material.findOne({
    where: {
      supplierId,
      article
    }
  })

  if (existing) {
    return res.status(400).json({
      message: 'Material with this article already exists for this supplier'
    })
  }
}

    const material = await Material.create({
      name,
      article,
      supplierId,
      type: type || 'Прочее',
      site: site || null,
      image: image || null,
      isNew: isNew ?? true,
      createdBy: req.user?.id || null
    })

    res.json(material)

  } catch (err) {
    console.error('createMaterial error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}


/**
 * ✏️ UPDATE MATERIAL
 */
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params

    const material = await Material.findByPk(id)

    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    const {
      name,
      site,
      image,
      isNew
    } = req.body

    // 🚫 ЖЁСТКО ФИКСИРУЕМ ПОЛЯ (нельзя менять)
    const article = material.article
    const supplierId = material.supplierId
    const type = material.type

    // ✏️ обновляем только разрешённые поля
    await material.update({
      name: name ?? material.name,
      site: site ?? material.site,
      image: image ?? material.image,
      isNew: isNew ?? material.isNew,

      // фиксированные поля (явно оставляем для читаемости)
      article,
      supplierId,
      type
    })

    return res.json(material)

  } catch (err) {
    console.error('updateMaterial error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}


/**
 * ❌ DELETE MATERIAL
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params

    const material = await Material.findByPk(id)

    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    await material.destroy()

    res.json({ success: true })

  } catch (err) {
    console.error('deleteMaterial error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 новый метод для массовой синхронизации материалов из Excel


exports.syncMaterials = async (req, res) => {
  try {
    const incoming = req.body || []

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.json([])
    }

    // 🧹 нормализация входных данных
    const cleanData = incoming.map(item => ({
      name: item['Наименование материала'] || '',
      article: item['Артикул'] || null,
      supplierId: item.supplierId || null,
      site: item.site || null,
      image: item.image || null,
      type: 'Проче',
      isNew: true,
      createdBy: req.user?.id || null
    }))

    console.log('cleanedData ',cleanData)

    // 📌 фильтруем только валидные записи
    const validItems = cleanData.filter(i =>
      i.article && i.name
    )

    console.log('valid', validItems)

    if (validItems.length === 0) {
      return res.json([])
    }

    // 🔍 ищем существующие материалы
    const articles = [...new Set(validItems.map(i => i.article))]

    const existingMaterials = await Material.findAll({
      where: { article: articles },
      attributes: ['id', 'article', 'isCountedInStats']
    })

    const existingMap = new Map(
      existingMaterials.map(m => [m.article, m])
    )

    // ➕ создаём новые материалы
    const toCreate = validItems.filter(
      i => !existingMap.has(i.article)
    )

    if (toCreate.length > 0) {
      await Material.bulkCreate(toCreate, {
        ignoreDuplicates: true
      })
    }

    // 🔄 обновляем список после вставки
    const allMaterials = await Material.findAll({
      where: { article: articles },
      attributes: ['id', 'article', 'isCountedInStats']
    })

    // 🔥 собираем ID для инкремента
    const idsToIncrement = allMaterials
      .filter(m => m.isCountedInStats)
      .map(m => m.id)

    // 📈 атомарный инкремент uses
    if (idsToIncrement.length > 0) {
      await Material.update(
        {
          uses: sequelize.literal('uses + 1')
        },
        {
          where: {
            id: idsToIncrement
          }
        }
      )
    }

    // 📤 возвращаем актуальные данные
    const fromDb = await Material.findAll({
      where: { article: articles }
    })

    return res.json(fromDb)

  } catch (err) {
    console.error('syncMaterials error:', err)
    return res.status(500).json({
      error: 'Ошибка синхронизации материалов'
    })
  }
}

//Обновление картинок
// POST /materials/fetch-images
exports.fetchImages = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json([]);
    }

    const results = [];

    for (const item of items) {
      const { article, supplierId, name } = item;
      if (!article || !supplierId) continue;

      let material = await Material.findOne({ where: { article, supplierId } });

      // Если картинка уже есть — пропускаем
      if (material?.image) {
        results.push({ article, image: material.image });
        continue;
      }

      // Парсим внешнюю ссылку
      const externalUrl = await parseSupplierImage(article, supplierId, name);

      if (externalUrl) {
        
        
        // Скачиваем и сохраняем локально
        const localPath = await downloadImage(externalUrl, article);

        if (localPath) {
          if (material) {
            material.image = localPath;
            await material.save();
          } else {
            material = await Material.create({
              name: name || '',
              article,
              supplierId,
              image: localPath,
              type: 'Проче',
              isNew: true
            });
          }
          results.push({ article, image: localPath });
        } else {
          results.push({ article, image: null });
        }
      } else {
        results.push({ article, image: null });
      }
    }

    res.json(results);

  } catch (err) {
    console.error('fetchImages error:', err);
    res.status(500).json({ error: 'Ошибка загрузки изображений' });
  }
};

exports.fetchImage = async (req, res) => {
  try {
    const { article, supplierId, name } = req.body;

    if (!article || !supplierId) {
      return res.status(400).json({
        message: 'article and supplierId are required'
      });
    }

    // ищем материал
    let material = await Material.findOne({
      where: { article, supplierId }
    });

    // если уже есть картинка — возвращаем сразу
    if (material?.image) {
      return res.json({
        article,
        image: material.image
      });
    }

    // парсинг внешнего источника
    const externalUrl = await parseSupplierImage(article, supplierId, name);

    if (!externalUrl) {
      return res.json({
        article,
        image: null
      });
    }

    // скачивание
    const localPath = await downloadImage(externalUrl, article);

    if (!localPath) {
      return res.json({
        article,
        image: null
      });
    }

    // сохранение в БД
    if (material) {
      material.image = localPath;
      await material.save();
    } else {
      material = await Material.create({
        name: name || '',
        article,
        supplierId,
        image: localPath,
        type: 'Проче',
        isNew: true
      });
    }

    return res.json({
      article,
      image: localPath
    });

  } catch (err) {
    console.error('fetchImage error:', err);

    return res.status(500).json({
      message: 'Ошибка загрузки изображения'
    });
  }
};

exports.updateImage = async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    const id = req.body?.id;
    const file = req.file;

    if (!id || !file) {
      return res.status(400).json({
        message: 'Missing data',
        body: req.body,
        file: req.file
      });
    }

    const material = await Material.findByPk(id);

    if (!material) {
      return res.status(404).json({ message: 'Not found' });
    }

    // удалить старый файл (если есть)
    if (material.image) {
      await deleteFile(material.image);
    }

    // 💥 ВАЖНО: нормализация пути
    const newPath = '/' + file.path.replace(/\\/g, '/');

    material.image = newPath;
    await material.save();

    return res.json({
      id: material.id,
      image: material.image
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteFile = async (filePath) => {
  try {
    if (!filePath) return;

    const fullPath = path.join(process.cwd(), filePath);

    await fs.promises.unlink(fullPath);
  } catch (err) {
    console.warn('File delete failed:', err.message);
  }
};

/**
 * 🔍 SEARCH MATERIALS
 * GET /api/materials/search?q=...
 */
exports.searchMaterials = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query

    if (!q || q.trim().length < 3) {
      return res.json([])
    }

    const search = q.trim()

    const materials = await Material.findAll({
      where: {
        [Op.or]: [
          { name:    { [Op.like]: `%${search}%` } },
          { article: { [Op.like]: `%${search}%` } }
        ]
      },
      include: [
        {
          model: Supplier,   // або models.Supplier якщо використовуєш sequelize
          as: 'supplier',
          attributes: ['id', 'name']   // тільки потрібні поля
        }
      ],
      limit: Number(limit),
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'article', 'supplierId', 'image'] // рекомендую явно вказувати
    })

    res.json(materials)

  } catch (err) {
    console.error('searchMaterials error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}