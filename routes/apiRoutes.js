const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const supplierController = require('../controllers/supplierController');

// Защита — только admin (добавь middleware isAdmin если есть)
router.get('/users', userController.getUsers);
router.delete('/users/:id', userController.deleteUser);
router.put('/users/:id', userController.updateUser);   // ← новое

// Поставщики
router.get('/suppliers',protect, supplierController.getSuppliers);
router.post('/suppliers', protect, supplierController.addSupplier);

module.exports = router;