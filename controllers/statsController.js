const { Visit, Sequelize } = require('../models')
const { Op } = Sequelize
const sequelize = require('../models').sequelize

/**
 * ➕ TRACK VISIT
 */
exports.trackVisit = async (req, res) => {
  try {
    const { path, referrer, sessionId, deviceType } = req.body

    await Visit.create({
      path: path || '/',
      referrer: referrer || null,
      ip: req.clientIp || req.ip,
      userAgent: req.get('User-Agent') || null,
      userId: req.user?.id || null,
      sessionId: sessionId || null,
      deviceType: deviceType || null
    })

    res.json({ success: true })
  } catch (err) {
    console.error('trackVisit error:', err)
    res.status(500).json({ success: false })
  }
}

/**
 * 📄 ВСЕ ВИЗИТЫ (с пагинацией)
 */
exports.getAllVisits = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 50
    const offset = (page - 1) * limit

    const { rows, count } = await Visit.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit,
      offset
    })

    res.json({
      data: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching visits' })
  }
}

/**
 * 📅 ВИЗИТЫ ЗА ПОСЛЕДНИЕ N ДНЕЙ
 */
exports.getVisitsLastDays = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    const visits = await Visit.findAll({
      where: {
        created_at: {
          [Op.gte]: fromDate
        }
      },
      order: [['created_at', 'DESC']]
    })

    res.json(visits)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching visits by date' })
  }
}

/**
 * 📊 ОБЩАЯ СТАТИСТИКА
 */
exports.getStats = async (req, res) => {
  try {
    const totalVisits = await Visit.count()

    const uniqueUsers = await Visit.count({
      distinct: true,
      col: 'user_id',
      where: {
        user_id: { [Op.not]: null }
      }
    })

    const uniqueSessions = await Visit.count({
      distinct: true,
      col: 'session_id'
    })

    const uniqueIps = await Visit.count({
      distinct: true,
      col: 'ip'
    })

    res.json({
      totalVisits,
      uniqueUsers,
      uniqueSessions,
      uniqueIps
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching stats' })
  }
}

/**
 * 🔥 ТОП СТРАНИЦ
 */
exports.getTopPaths = async (req, res) => {
  try {
    const data = await Visit.findAll({
      attributes: [
        'path',
        [sequelize.fn('COUNT', sequelize.col('path')), 'count']
      ],
      group: ['path'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10
    })

    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching top paths' })
  }
}

/**
 * 🌐 ТОП РЕФЕРЕРОВ
 */
exports.getTopReferrers = async (req, res) => {
  try {
    const data = await Visit.findAll({
      attributes: [
        'referrer',
        [sequelize.fn('COUNT', sequelize.col('referrer')), 'count']
      ],
      group: ['referrer'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10
    })

    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching referrers' })
  }
}

/**
 * 📱 СТАТИСТИКА ПО УСТРОЙСТВАМ
 */
exports.getDeviceStats = async (req, res) => {
  try {
    const data = await Visit.findAll({
      attributes: [
        'device_type',
        [sequelize.fn('COUNT', sequelize.col('device_type')), 'count']
      ],
      group: ['device_type']
    })

    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching device stats' })
  }
}

/**
 * ⏱ ОБНОВЛЕНИЕ ВРЕМЕНИ НА СТРАНИЦЕ
 */
exports.updateDuration = async (req, res) => {
  try {
    const { id, duration } = req.body

    await Visit.update(
      { duration },
      { where: { id } }
    )

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error updating duration' })
  }
}