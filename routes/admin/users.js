const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../../middleware/authMiddleware');
const userController = require('../../controllers/userController');


// Защита — только admin (добавь middleware isAdmin если есть)
router.get('/',protect, restrictTo('admin'), userController.getUsers);
router.delete('/:id', protect, restrictTo('admin'), userController.deleteUser);
router.put('/:id', protect, restrictTo('admin'),  userController.updateUser);   // ← новое

module.exports = router;