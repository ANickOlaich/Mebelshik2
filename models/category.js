'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Post, {
        foreignKey: 'categoryId',
        as: 'posts'
      });

      // 🔥 опционально: иерархия (родитель/дочерние)
      Category.belongsTo(models.Category, {
        foreignKey: 'parentId',
        as: 'parent'
      });

      Category.hasMany(models.Category, {
        foreignKey: 'parentId',
        as: 'children'
      });
    }
  }

  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // SEO
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },

    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // 🔥 доп. поля
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['parent_id'] },
      { fields: ['is_active'] },
      { fields: ['sort_order'] }
    ]
  });

  return Category;
};