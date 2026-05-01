const { Supplier } = require('../models');
const { Op } = require('sequelize');

/**
 * 📦 GET ALL SUPPLIERS
 */
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC']
      ]
    })

    res.json(suppliers)
  } catch (err) {
    console.error('getAllSuppliers error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Возращает всех глобальных поставщиков + поставщиков пользователя
exports.getAllUserSuppliers = async (req, res) => {
  try {
    const userId = req.user.id; // предполагаем, что protect middleware это кладёт

    const suppliers = await Supplier.findAll({
      where: {
        [Op.or]: [
          { isGlobal: true },
          { createdBy: userId }
        ]
      },
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC']
      ]
    });

    res.json(suppliers);
  } catch (err) {
    console.error('getAllSuppliers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * ➕ CREATE SUPPLIER
 */
exports.createSupplier = async (req, res) => {
  try {
    const { name, site, parser, note, logo, sortOrder, isGlobal } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    // проверка на дубликат
    const existing = await Supplier.findOne({
      where: { name }
    })

    if (existing) {
      return res.status(400).json({ message: 'Supplier already exists' })
    }

    const supplier = await Supplier.create({
      name,
      site: site || null,
      parser: parser || null, 
      note: note || null,
      logo: logo || null,
      isGlobal: isGlobal || false,
      sortOrder: sortOrder ?? 10,
      createdBy: req.user?.id || null
    })

    res.json(supplier)

  } catch (err) {
    console.error('createSupplier error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}


/**
 * ✏️ UPDATE SUPPLIER
 */
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params

    const supplier = await Supplier.findByPk(id)

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }

    const { name, site, parser, note, logo, sortOrder, allowed, isGlobal } = req.body

    // если меняем name — проверяем дубликаты
    if (name && name !== supplier.name) {
      const exists = await Supplier.findOne({ where: { name } })

      if (exists) {
        return res.status(400).json({ message: 'Supplier name already exists' })
      }
    }

    await supplier.update({
      name: name ?? supplier.name,
      site: site ?? supplier.site,
      parser: parser ?? supplier.parser,
      note: note ?? supplier.note,
      logo: logo ?? supplier.logo,
      isGlobal: isGlobal ?? supplier.isGlobal,
      sortOrder: sortOrder ?? supplier.sortOrder,
      allowed: allowed ?? supplier.allowed
    })

    res.json(supplier)

  } catch (err) {
    console.error('updateSupplier error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}


/**
 * ❌ DELETE SUPPLIER
 */
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params

    const supplier = await Supplier.findByPk(id)

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }

    // защита от удаления, если есть материалы
    const materialsCount = await supplier.countMaterials()

    if (materialsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete supplier with materials'
      })
    }

    await supplier.destroy()

    res.json({ success: true })

  } catch (err) {
    console.error('deleteSupplier error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}