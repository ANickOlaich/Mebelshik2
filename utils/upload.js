const multer = require('multer')
const path = require('path')
const fs = require('fs')

function createUploader(folder) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', folder)

      // создаём папку если нет
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      cb(null, dir)
    },

    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, unique + path.extname(file.originalname))
    }
  })

  return multer({ storage })
}

module.exports = createUploader