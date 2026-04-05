const { User } = require('../models');

// Получить всех пользователей
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }   // не возвращаем пароль
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить пользователя
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    await user.destroy();
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить пользователя
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    await user.update({ name, email, role });

    // Возвращаем обновлённого пользователя без пароля
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};