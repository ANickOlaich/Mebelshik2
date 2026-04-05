const { Supplier, UserSupplier } = require('../models');

// Получить ВСЕ поставщики (для админа)
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json(suppliers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить поставщиков текущего пользователя
exports.getSuppliers = async (req, res) => {
  try {
    const userSuppliers = await UserSupplier.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Supplier,
          as: 'supplier'
        }
      ],
      order: [[ 'supplier', 'sortOrder', 'ASC' ]]
    });

    const result = userSuppliers.map(item => ({
      key: item.key,
      ...item.supplier.toJSON()
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Добавление поставщика (создаём Supplier + привязываем к пользователю)
// Добавление поставщика
exports.addSupplier = async (req, res) => {
  try {
    const { key, name, site = '', note = '', isPrintable = true, sortOrder = 10 } = req.body;

    if (!key || !name) {
      return res.status(400).json({ message: 'Ключ и название обязательны' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    // 1. Проверяем, есть ли уже у этого пользователя такой ключ
    const existing = await UserSupplier.findOne({
      where: { 
        userId: req.user.id,
        key: key 
      }
    });

    if (existing) {
      return res.status(409).json({ 
        message: `Ключ "${key}" уже используется у этого пользователя` 
      });
    }

    // 2. Создаём или находим поставщика
    let supplier = await Supplier.findOne({ where: { name } });

    if (!supplier) {
      supplier = await Supplier.create({
        name,
        site,
        note,
        isPrintable,
        sortOrder
      });
    }

    // 3. Привязываем поставщика к пользователю
    const userSupplier = await UserSupplier.create({
      userId: req.user.id,
      supplierId: supplier.id,
      key
    });

    res.status(201).json({
      key: userSupplier.key,
      ...supplier.toJSON()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка добавления поставщика' });
  }
};

// Обновить ключ поставщика у пользователя
exports.updateSupplierKey = async (req, res) => {
  try {
    const { key } = req.body;

    const userSupplier = await UserSupplier.findOne({
      where: {
        userId: req.user.id,
        key: req.params.key
      }
    });

    if (!userSupplier) {
      return res.status(404).json({ message: 'Связь не найдена' });
    }

    await userSupplier.update({ key });
    res.json({ message: 'Ключ обновлён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления' });
  }
};

// Админское удаление поставщика (полное удаление из базы)
exports.deleteSupplierAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Удаляем сначала все связи с пользователями
    await UserSupplier.destroy({
      where: { supplierId: id }
    });

    // Затем удаляем самого поставщика
    const deleted = await Supplier.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Поставщик не найден' });
    }

    res.json({ message: 'Поставщик полностью удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка удаления поставщика' });
  }
};

// Удалить поставщика у пользователя
exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await UserSupplier.destroy({
      where: {
        userId: req.user.id,
        id: req.params.key
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Поставщик не найден' });
    }

    res.json({ message: 'Поставщик удалён у пользователя' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления' });
  }
};