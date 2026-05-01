//apiRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo, optionalAuth } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const supplierController = require('../controllers/supplierController');
const materialController = require('../controllers/materialController');
const userClassController = require('../controllers/userClassController');
const statsController = require('../controllers/statsController');
const categoryController = require('../controllers/post/categoryController');
const postController = require('../controllers/post/postController');
const feedbackController = require('../controllers/feedbackController.js')

const createUploader = require('../utils/upload')
const uploadMaterialImage = createUploader('materials')



// Пользователи
router.get('/users',protect,restrictTo('admin'), userController.getUsers);
router.delete('/users/:id',protect,restrictTo('admin'), userController.deleteUser);
router.put('/users/:id', protect, restrictTo('admin'), userController.updateUser);   // ← новое

// Материалы
router.get('/materials', materialController.getAllMaterials)
router.post('/materials',protect, materialController.createMaterial)
router.get('/materials/search', materialController.searchMaterials)
router.post('/imageUpdate', protect, uploadMaterialImage.single('image'), materialController.updateImage);  //парсер картинки
router.put('/materials/:id', protect,restrictTo('admin'), materialController.updateMaterial)
router.delete('/materials/:id', protect, restrictTo('admin'), materialController.deleteMaterial)
router.post('/materials/sync', protect, materialController.syncMaterials) // 🔥 новый роут для синхронизации материалов
router.post('/materials/fetch-images', protect, materialController.fetchImages);  //парсер картинок
router.post('/materials/fetch-image', protect, materialController.fetchImage);  //парсер картинки


// Поставщики
router.get('/suppliers/all', supplierController.getAllSuppliers)
router.get('/suppliers/allOfUser',protect, supplierController.getAllUserSuppliers)
router.post('/suppliers',protect, supplierController.createSupplier)
router.put('/suppliers/:id', protect, restrictTo('admin'), supplierController.updateSupplier)
router.delete('/suppliers/:id', protect, restrictTo('admin'), supplierController.deleteSupplier)




//Классы и поставщики
router.get('/user-classes',protect, userClassController.getAllUserClasses)
router.post('/user-classes', protect, userClassController.saveUserClass)
router.put('/user-classes/bulkAll', protect, userClassController.bulkAll) // Массовое обновление классов
router.delete('/user-classes/:className', protect, userClassController.deleteUserClass)
router.get('/user-classes/:className/materials', protect, userClassController.getMaterialsByClass)
router.post('/user-classes/bulk', protect, userClassController.bulkCreateClasses) // 🔥 новый роут для массового создания классов
router.put('/user-classes/:id', protect, userClassController.updateUserClass) // 🔥 новый роут для обновления класса

//Публикации
router.get('/categories', categoryController.getCategories);
router.get('/categories/tree', categoryController.getCategoriesTree);
router.get('/categories/:id', categoryController.getCategory);

router.get('/posts', postController.getPosts);
router.get('/posts/featured', postController.getFeaturedPosts);
router.get('/posts/:slug', postController.getPost);
router.post('/posts/:id/view', postController.incrementViews);// views (можно дергать с фронта)
// ADMIN
router.post('/categories',protect,restrictTo('admin'),categoryController.createCategory);
router.put('/categories/:id',protect,restrictTo('admin'),categoryController.updateCategory);
router.delete('/categories/:id',protect,restrictTo('admin'),categoryController.deleteCategory);

router.post('/posts',protect,restrictTo('admin'),postController.createPost);
router.put('/posts/:id',protect,restrictTo('admin'),postController.updatePost);
router.delete('/posts/:id',protect,restrictTo('admin'),postController.deletePost);

//Статистика
router.post('/visit',optionalAuth, statsController.trackVisit);
router.post('/visits/track',optionalAuth, statsController.trackVisit);

//FeedBack
// создание
router.post('/feedback', protect, feedbackController.createFeedback)
// редактирование
router.put('/feedback/:id', protect,restrictTo('admin'), feedbackController.updateFeedback)
// удаление
router.delete('/feedback/:id', protect,restrictTo('admin'), feedbackController.deleteFeedback)
// отзывы для страницы
router.get('/feedback', feedbackController.getFeedbackByPage)
// админка
router.get('/feedback/all', protect,restrictTo('admin'), feedbackController.getAllFeedback)


router.use('/upload', require('./uploadRoutes.js'))

const fs = require('fs')
const path = require('path')

router.get('/gallery/image', (req, res) => {
  const dir = path.join(__dirname, '../uploads/posts')

  const files = fs.readdirSync(dir)

  const result = files.map(file => ({
    src: `/uploads/posts/${file}`,
    thumb: `/uploads/posts/${file}`,
    name: file
  }))

  res.json({ result })
})

module.exports = router;