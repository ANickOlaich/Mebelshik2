const { UserClass, Supplier, Material } = require('../models')
const { Op } = require('sequelize')

/**
 * 📦 GET ALL USER CLASSES
 */
exports.getAllUserClasses = async (req, res) => {
  try {
    const classes = await UserClass.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          required: false,
          attributes: ['id', 'name', 'logo']
        }
      ],
      order: [['className', 'ASC']]
    })

    res.json(classes)
  } catch (err) {
    console.error('getAllUserClasses error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.saveUserClass = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      className,
      supplierId,
      supplierName,
      type
    } = req.body

    if (!className) {
      return res.status(400).json({ message: 'className is required' })
    }

    let finalSupplierId = null
    let customSupplierName = null

    /**
     * 🔹 1. если передали supplierId
     */
    if (supplierId) {
      const supplier = await Supplier.findByPk(supplierId)

      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' })
      }

      finalSupplierId = supplier.id
    }

    /**
     * 🔹 2. если передали supplierName (кастом)
     */
    if (!supplierId && supplierName) {
      const supplier = await Supplier.findOne({
        where: { name: supplierName }
      })

      if (supplier) {
        finalSupplierId = supplier.id
      } else {
        customSupplierName = supplierName
      }
    }

    /**
     * 🔹 3. UPSERT класса
     */
    const [record] = await UserClass.findOrCreate({
      where: {
        userId,
        className
      },
      defaults: {
        userId,
        className,
        supplierId: finalSupplierId,
        customSupplierName,
        type: type || 'Загальне'
      }
    })

    await record.update({
      supplierId: finalSupplierId,
      customSupplierName,
      type: type || record.type
    })

    res.json(record)

  } catch (err) {
    console.error('saveUserClass error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteUserClass = async (req, res) => {
  try {
    const { className } = req.params

    const deleted = await UserClass.destroy({
      where: {
        userId: req.user.id,
        className
      }
    })

    if (!deleted) {
      return res.status(404).json({ message: 'Class not found' })
    }

    res.json({ success: true })

  } catch (err) {
    console.error('deleteUserClass error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getMaterialsByClass = async (req, res) => {
  try {
    const userId = req.user.id
    const { className } = req.params

    const userClass = await UserClass.findOne({
      where: {
        userId,
        className
      }
    })

    if (!userClass) {
      return res.status(404).json({ message: 'Class not found' })
    }

    if (!userClass.supplierId) {
      return res.json({
        class: userClass,
        materials: []
      })
    }

    const materials = await Material.findAll({
      where: {
        supplierId: userClass.supplierId
      },
      order: [['name', 'ASC']]
    })

    res.json({
      class: userClass,
      materials
    })

  } catch (err) {
    console.error('getMaterialsByClass error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 НОВЫЙ КОНТРОЛЛЕР ДЛЯ МАССОВОГО СОЗДАНИЯ КЛАССОВ
exports.bulkCreateClasses = async (req, res) => {
  try {
    const userId = req.user.id
    const classes = req.body

    if (!Array.isArray(classes)) {
      return res.status(400).json({ message: 'Invalid payload' })
    }

    const results = []

    for (const classNameRaw of classes) {
      const className = String(classNameRaw || '').trim()

      if (!className) continue

      // 🔥 findOrCreate — ключевой момент
      const [record, created] = await UserClass.findOrCreate({
        where: {
          userId,
          className
        },
        defaults: {
          userId,
          className
        }
      })

      results.push({
        id: record.id,
        className: record.className,
        created
      })
    }

    return res.json({
      success: true,
      count: results.length,
      data: results
    })

  } catch (err) {
    console.error('bulkCreateClasses error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 НОВЫЙ КОНТРОЛЛЕР ДЛЯ ОБНОВЛЕНИЯ КЛАССА (ПРИВЯЗКА К ПОСТАВЩИКУ ИЛИ ИМЕНИ)
exports.updateUserClass = async (req, res) => {
  try {
    const userId = req.user.id
    const id = req.params.id

    const {
      supplierId,
      customSupplierName,
      type
    } = req.body

    const allowedTypes = [
      'Плитні матеріали',
      'Погонні матеріали',
      'Фурнітура',
      'Проче',
      'Загальне'
    ]

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Некорректный тип'
      })
    }

   

    // 🔍 найти запись пользователя
    const userClass = await UserClass.findOne({
      where: { id, userId }
    })

     if (type) {
      userClass.type = type
    }

    if (!userClass) {
      return res.status(404).json({
        message: 'Класс не найден'
      })
    }

    // 🔒 если указан supplierId — проверяем
    let supplier = null

    if (supplierId) {
      supplier = await Supplier.findByPk(supplierId)

      if (!supplier) {
        return res.status(404).json({
          message: 'Поставщик не найден'
        })
      }
    }

    // 🔥 логика приоритета:
    // либо supplierId, либо customSupplierName

    if (supplierId) {
      userClass.supplierId = supplierId
      userClass.customSupplierName = null
    } else if (customSupplierName) {
      userClass.supplierId = null
      userClass.customSupplierName = customSupplierName.trim()
    } else {
      // очистка
      userClass.supplierId = null
      userClass.customSupplierName = null
    }

    // если передали type — обновляем
    if (type) {
      userClass.type = type
    }

    await userClass.save()

    return res.json({
      success: true,
      data: userClass
    })

  } catch (err) {
    console.error('updateUserClass error:', err)
    res.status(500).json({
      message: 'Ошибка обновления'
    })
  }
}

//Массовое обновление классов

exports.bulkAll = async (req, res) => {
  const updates = req.body

  try {
    await Promise.all(
      updates.map(item =>
        UserClass.update(
          {
            supplierId: item.supplierId,
            customSupplierName: item.customSupplierName,
            type: item.type
          },
          { where: { id: item.id } }
        )
      )
    )

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Ошибка bulk update' })
  }
}