'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('materials', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      article: {
        type: Sequelize.STRING,
        allowNull: true
      },

      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },

      site: {
        type: Sequelize.STRING,
        allowNull: true
      },

      image: {
        type: Sequelize.STRING,
        allowNull: true
      },

      isNew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      uses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      isCountedInStats: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    })

    // индексы
    await queryInterface.addIndex('materials', ['supplierId'])
    await queryInterface.addIndex('materials', ['article'])
    await queryInterface.addIndex('materials', ['isCountedInStats'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('materials')
  }
}