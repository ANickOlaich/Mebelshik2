'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      path: {
        type: Sequelize.STRING,
        allowNull: false
      },

      referrer: {
        type: Sequelize.STRING,
        allowNull: true
      },

      ip: {
        type: Sequelize.STRING,
        allowNull: true
      },

      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      // 🆕 сессия пользователя
      session_id: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // 🆕 тип устройства
      device_type: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // 🆕 время на странице (секунды)
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // 🚀 ИНДЕКСЫ (очень важно для аналитики)

    await queryInterface.addIndex('visits', ['path'])
    await queryInterface.addIndex('visits', ['ip'])
    await queryInterface.addIndex('visits', ['user_id'])
    await queryInterface.addIndex('visits', ['session_id'])
    await queryInterface.addIndex('visits', ['created_at'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('visits')
  }
}