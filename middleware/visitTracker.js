const { Visit } = require('../models')

const visitTracker = async (req, res, next) => {
  try {
    // ❗ логируем только API или страницы (по желанию)
    if (req.method !== 'GET') return next()

    const path = req.originalUrl

    await Visit.create({
      path,
      referrer: req.get('Referrer') || null,
      ip: req.clientIp || req.ip,
      userAgent: req.get('User-Agent') || null,
      userId: req.user?.id || null,
      sessionId: req.headers['x-session-id'] || null,
      deviceType: req.headers['x-device-type'] || null
    })

  } catch (err) {
    console.error('Visit middleware error:', err)
  }

  next()
}

module.exports = visitTracker