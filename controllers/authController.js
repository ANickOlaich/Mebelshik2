const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'role']
    }); 
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    } 
    res.json( user );
  } catch (error) {
    console.error('ME ERROR:', error)
    res.status(500).json({ message: 'Ошибка сервера', error: error.message })
  }
};

exports.register = async (req, res) => {
  try {
    console.log('REGISTER REQUEST BODY:', req.body);
    const { username, email, password, role } = req.body;

    // Проверяем, есть ли уже такой пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({ 
      message: 'Пользователь успешно зарегистрирован',
      userId: newUser.id 
    });
  } catch (error) {
  console.error('REGISTER ERROR:', error)
  res.status(500).json({ message: 'Ошибка сервера', error: error.message })
}
};

exports.login = async (req, res) => {
  try {
    console.log('REGISTER REQUEST BODY:', req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Успешный вход',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
  console.error('REGISTER ERROR:', error)
  res.status(500).json({ message: 'Ошибка сервера', error: error.message })
}
};