'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },

      preview: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      preview_image: {
        type: Sequelize.STRING,
        allowNull: true
      },

      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      seo_title: {
        type: Sequelize.STRING,
        allowNull: true
      },

      seo_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      seo_keywords: {
        type: Sequelize.STRING,
        allowNull: true
      },

      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // индексы
    await queryInterface.addIndex('posts', ['slug'], { unique: true });
    await queryInterface.addIndex('posts', ['category_id']);
    await queryInterface.addIndex('posts', ['is_published']);
    await queryInterface.addIndex('posts', ['is_featured']);
    await queryInterface.addIndex('posts', ['published_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  }
};