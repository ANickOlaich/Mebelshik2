const requestLogger = (req, res, next) => {
  const start = Date.now()

  console.log(`\x1b[36m➡️ ${req.method} ${req.originalUrl}\x1b[0m`)

  res.on('finish', () => {
    const duration = Date.now() - start
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'

    console.log(`${color}⬅️ ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\x1b[0m`)
  })

  next()
}

module.exports = requestLogger