const { Op } = require('sequelize')
const { Post } = require('../models')

const generateUniqueSlug = async (title, excludeId = null) => {
  let baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const where = { slug }

    if (excludeId) {
      where.id = { [Op.ne]: excludeId }
    }

    const exists = await Post.findOne({ where })

    if (!exists) break

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}