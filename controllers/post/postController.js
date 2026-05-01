const { Post, Category, User } = require('../../models');
const { Op } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slug')

// =========================
// slug helper
// =========================
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');


// =========================
// CREATE POST
// =========================
exports.createPost = async (req, res) => {
  try {
    let {
      title,
      slug,
      content,
      preview,
      previewImage,
      categoryId,
      isPublished,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    slug = slug || slugify(title);

    // уникальность slug
    let baseSlug = slug;
    let counter = 1;

    while (await Post.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const publishedAt =
      isPublished ? new Date() : null;

    const post = await Post.create({
      title,
      slug,
      content: content || null,
      preview: preview || null,
      previewImage: previewImage || null,
      categoryId: categoryId || null,
      isPublished: !!isPublished,
      isFeatured: !!isFeatured,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || preview,
      seoKeywords: seoKeywords || null,
      publishedAt,
      createdBy: req.user?.id || null
    });

    res.json(post);

  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// GET ALL POSTS (admin)
// =========================
exports.getPosts = async (req, res) => {
  try {
    const {
      search,
      categoryId,
      isPublished,
      isFeatured,
      page = 1,
      perPage = 20
    } = req.query;

    const where = {};

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    const offset = (page - 1) * perPage;

    const { rows, count } = await Post.findAndCountAll({
      where,
      limit: +perPage,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    res.json({
      items: rows,
      total: count
    });

  } catch (err) {
    console.error('getPosts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// GET SINGLE POST (by slug)
// =========================
exports.getPost = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);

  } catch (err) {
    console.error('getPost error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// UPDATE POST
// =========================
exports.updatePost = async (req, res) => {
  console.log('BODY:', req.body);
console.log('CONTENT:', req.body.content);
console.log('TYPE:', typeof req.body.content);
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let {
      title,
      slug,
      content,
      preview,
      previewImage,
      categoryId,
      isPublished,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    // slug update (optional)
    if (slug || title) {
      let base = slugify(slug || title || post.title);
      let newSlug = base;
      let counter = 1;

      while (await Post.findOne({
        where: {
          slug: newSlug,
          id: { [Op.ne]: id }
        }
      })) {
        newSlug = `${base}-${counter++}`;
      }

      slug = newSlug;
    }

    // publishedAt logic
    let publishedAt = post.publishedAt;

    if (isPublished && !post.isPublished) {
      publishedAt = new Date();
    }

    await post.update({
      title: title ?? post.title,
      slug: slug ?? post.slug,
      content: content ?? post.content,
      preview: preview ?? post.preview,
      previewImage: previewImage ?? post.previewImage,
      categoryId: categoryId ?? post.categoryId,
      isPublished: isPublished ?? post.isPublished,
      isFeatured: isFeatured ?? post.isFeatured,
      seoTitle: seoTitle ?? post.seoTitle,
      seoDescription: seoDescription ?? post.seoDescription,
      seoKeywords: seoKeywords ?? post.seoKeywords,
      publishedAt
    });

    res.json(post);

  } catch (err) {
    console.error('updatePost error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// DELETE POST
// =========================
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted' });

  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// INCREMENT VIEWS
// =========================
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    await Post.increment('viewsCount', {
      where: { id }
    });

    res.json({ success: true });

  } catch (err) {
    console.error('incrementViews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================
// FEATURED POSTS (home)
// =========================
exports.getFeaturedPosts = async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 10)
    const offset = (page - 1) * limit

    const categoryId = req.query.categoryId

    const where = {
      isPublished: true,
      isFeatured: true
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const { rows, count } = await Post.findAndCountAll({
      where,
      order: [['publishedAt', 'DESC']], // проверь имя поля в модели!
      limit,
      offset,
      include: [
        { model: Category, as: 'category' }
      ]
    })

    res.json({
      items: rows,
      total: count,
      page,
      limit
    })

  } catch (err) {
    console.error('getFeaturedPosts error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}