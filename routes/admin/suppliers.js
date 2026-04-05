const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../../middleware/authMiddleware');
const supplierController = require('../../controllers/supplierController');

// Получить всех поставщиков (общий список)
router.get('/all', protect, restrictTo('admin'), supplierController.getAllSuppliers);
// Админское удаление (по id поставщика)
router.delete('/:id', protect, restrictTo('admin'), supplierController.deleteSupplierAdmin);

// Получить поставщиков текущего пользователя
router.get('/', supplierController.getSuppliers);
router.post('/', protect, restrictTo('admin'), supplierController.addSupplier);
router.put('/:key', protect, restrictTo('admin'), supplierController.updateSupplierKey);
//router.delete('/:key', protect, restrictTo('admin'), supplierController.deleteSupplier);

module.exports = router;