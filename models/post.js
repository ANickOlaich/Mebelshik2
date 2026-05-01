'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'author'
      });

      Post.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
    }
  }

  Post.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },

    preview: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    previewImage: {
      type: DataTypes.STRING,
      allowNull: true
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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

    seoKeywords: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // 🔥 Новые поля
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['category_id'] },
      { fields: ['is_published'] },
      { fields: ['is_featured'] },
      { fields: ['published_at'] }
    ]
  });

  return Post;
};