const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.log(req.user);
    
    return res.status(403).json({ message: 'Доступ запрещён. Требуется роль admin' });
  }
  next();
};

module.exports = isAdmin;