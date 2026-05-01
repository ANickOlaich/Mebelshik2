'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_classes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      className: {
        type: Sequelize.STRING,
        allowNull: false
      },

      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      customSupplierName: {
        type: Sequelize.STRING,
        allowNull: true
      },

      type: {
        type: Sequelize.ENUM(
          'Плитні матеріали',
          'Погонні матеріали',
          'Фурнітура',
          'Проче',
          'Загальне'
        ),
        allowNull: false,
        defaultValue: 'Проче'
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

    // ✔ уникальность класса в рамках пользователя
    await queryInterface.addConstraint('user_classes', {
      fields: ['userId', 'className'],
      type: 'unique',
      name: 'uc_user_class_unique'
    });

    // ✔ индексы
    await queryInterface.addIndex('user_classes', ['userId']);
    await queryInterface.addIndex('user_classes', ['supplierId']);
    await queryInterface.addIndex('user_classes', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_classes');
  }
};