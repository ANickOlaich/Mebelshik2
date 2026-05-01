const { Category } = require('../../models');
const { Op } = require('sequelize');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
};

// =========================
// CREATE
// =========================
exports.createCategory = async (req, res) => {
  try {
    let {
      name,
      slug,
      description,
      seoTitle,
      seoDescription,
      sortOrder,
      isActive,
      parentId
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    slug = slug || slugify(name);

    // уникальность slug
    let baseSlug = slug;
    let counter = 1;

    while (await Category.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const category = await Category.create({
      name,
      slug,
      description: description || null,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
      parentId: parentId || null
    });

    res.json(category);

  } catch (err) {
    console.error('createCategory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// GET ALL
// =========================
exports.getCategories = async (req, res) => {
  try {
    const {
      search,
      isActive,
      parentId,
      sortField = 'sort_order',
      sortDirection = 'asc'
    } = req.query;

    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (parentId !== undefined) {
      where.parentId = parentId || null;
    }

    const categories = await Category.findAll({
      where,
      order: [[sortField, sortDirection]]
    });

    res.json(categories);

  } catch (err) {
    console.error('getCategories error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// GET ONE
// =========================
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);

  } catch (err) {
    console.error('getCategory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// GET TREE
// =========================
exports.getCategoriesTree = async (req, res) => {
  try {
    const { isActive } = req.query;

    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const categories = await Category.findAll({
      where,
      order: [['sort_order', 'asc']]
    });

    // 🔥 превращаем в plain объекты
    const items = categories.map(c => c.get({ plain: true }));

    // 🔥 map для быстрого доступа
    const map = {};
    items.forEach(item => {
      item.children = [];
      map[item.id] = item;
    });

    const tree = [];

    items.forEach(item => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(item);
      } else {
        tree.push(item);
      }
    });

    res.json(tree);

  } catch (err) {
    console.error('getCategoriesTree error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// UPDATE
// =========================
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    let {
      name,
      slug,
      description,
      seoTitle,
      seoDescription,
      sortOrder,
      isActive,
      parentId
    } = req.body;

    // slug обновляем только если явно передали
    if (slug) {
      let baseSlug = slugify(slug);
      let newSlug = baseSlug;
      let counter = 1;

      while (await Category.findOne({
        where: {
          slug: newSlug,
          id: { [Op.ne]: id }
        }
      })) {
        newSlug = `${baseSlug}-${counter++}`;
      }

      slug = newSlug;
    }

    await category.update({
      name: name ?? category.name,
      slug: slug ?? category.slug,
      description: description ?? category.description,
      seoTitle: seoTitle ?? category.seoTitle,
      seoDescription: seoDescription ?? category.seoDescription,
      sortOrder: sortOrder ?? category.sortOrder,
      isActive: isActive ?? category.isActive,
      parentId: parentId ?? category.parentId
    });

    res.json(category);

  } catch (err) {
    console.error('updateCategory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// DELETE (soft)
// =========================
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // мягкое удаление
    await category.update({ isActive: false });

    res.json({ message: 'Category deactivated' });

  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};