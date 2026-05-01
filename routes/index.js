module.exports = (app) => {
  // === API РОУТЫ ===
  app.use('/api/auth', require('./authRoutes'));
  app.use('/api', require('./apiRoutes'));

};