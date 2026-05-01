const { Feedback, User } = require('../models')
const { Op } = require('sequelize')

/**
 * ➕ Создание отзыва
 */
exports.createFeedback = async (req, res) => {
  try {
    const { message, page, type } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Сообщение пустое' })
    }

    const feedback = await Feedback.create({
      message: message.trim(),
      page: page || null,
      type: type || 'feedback',
      userId: req.user.id
    })

    res.json(feedback)

  } catch (err) {
    console.error('createFeedback error:', err)
    res.status(500).json({ message: 'Ошибка создания отзыва' })
  }
}

/**
 * ✏️ Редактирование (только владелец или админ)
 */
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params
    const { message, status, type } = req.body

    const feedback = await Feedback.findByPk(id)

    if (!feedback) {
      return res.status(404).json({ message: 'Не найдено' })
    }

    const isOwner = feedback.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Нет доступа' })
    }

    await feedback.update({
      message: message ?? feedback.message,
      status: isAdmin ? (status ?? feedback.status) : feedback.status,
      type: type ?? feedback.type
    })

    res.json(feedback)

  } catch (err) {
    console.error('updateFeedback error:', err)
    res.status(500).json({ message: 'Ошибка обновления' })
  }
}

/**
 * ❌ Удаление (владелец или админ)
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params

    const feedback = await Feedback.findByPk(id)

    if (!feedback) {
      return res.status(404).json({ message: 'Не найдено' })
    }

    const isOwner = feedback.userId === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Нет доступа' })
    }

    await feedback.destroy()

    res.json({ success: true })

  } catch (err) {
    console.error('deleteFeedback error:', err)
    res.status(500).json({ message: 'Ошибка удаления' })
  }
}

/**
 * 📄 Отзывы для конкретной страницы
 * /api/feedback?page=/editor
 */
exports.getFeedbackByPage = async (req, res) => {
  try {
    const { page } = req.query

    if (!page) {
      return res.status(400).json({ message: 'Не указана страница' })
    }

    const feedbacks = await Feedback.findAll({
      where: {
        page
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(feedbacks)

  } catch (err) {
    console.error('getFeedbackByPage error:', err)
    res.status(500).json({ message: 'Ошибка получения отзывов' })
  }
}

/**
 * 🛠 Все отзывы (админка)
 * с пагинацией и фильтрами
 */
exports.getAllFeedback = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      status,
      type,
      search
    } = req.query

    page = Number(page)
    limit = Number(limit)

    const where = {}

    if (status) where.status = status
    if (type) where.type = type

    if (search) {
      where.message = {
        [Op.like]: `%${search}%`
      }
    }

    const { count, rows } = await Feedback.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    })

    res.json({
      data: rows,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      }
    })

  } catch (err) {
    console.error('getAllFeedback error:', err)
    res.status(500).json({ message: 'Ошибка получения списка' })
  }
}