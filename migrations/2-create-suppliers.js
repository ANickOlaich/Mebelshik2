'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('suppliers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      site: {
        type: Sequelize.STRING,
        allowNull: true
      },

      parser: {
        type: Sequelize.STRING,
        allowNull: true
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },

      logo: {
        type: Sequelize.STRING,
        allowNull: true
      },

      allowed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      isGlobal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // ✔ Индексы для ускорения поиска
    await queryInterface.addIndex('suppliers', ['name']);
    await queryInterface.addIndex('suppliers', ['sortOrder']);
    await queryInterface.addIndex('suppliers', ['allowed']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('suppliers');
  }
};