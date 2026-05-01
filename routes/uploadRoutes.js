const express = require('express');
const router = express.Router();
const createUploader = require('../utils/upload')
const uploadPostImage = createUploader('posts')
const uploadMaterialImage = createUploader('materials')

router.post('/post-image', uploadPostImage.any(), (req, res) => {
  const file = req.files?.[0]

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  return res.json({
    result: [
      {
        url: `/uploads/posts/${file.filename}`,
        name: file.originalname,
        size: file.size
      }
    ]
  })
})

router.post('/materials', uploadMaterialImage.any(), (req, res) => {
  const file = req.files?.[0]

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  return res.json({
    result: [
      {
        url: `/uploads/posts/${file.filename}`,
        name: file.originalname,
        size: file.size
      }
    ]
  })
})

// Загрузка изображений
router.post('/', uploadMaterialImage.single('image'), (req, res) => {
  res.json({
    url:`/uploads/${req.file.filename}`,
    name: req.file.originalname,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`
  })
})


module.exports = router;