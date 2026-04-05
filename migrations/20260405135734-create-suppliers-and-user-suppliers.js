'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Таблица поставщиков
    await queryInterface.createTable('suppliers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: { type: Sequelize.STRING, allowNull: false },
      site: { type: Sequelize.STRING, allowNull: true },
      note: { type: Sequelize.TEXT, allowNull: true },
      isPrintable: { type: Sequelize.BOOLEAN, defaultValue: true },
      sortOrder: { type: Sequelize.INTEGER, defaultValue: 10 },
      logo: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // Связующая таблица
    await queryInterface.createTable('user_suppliers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      supplierId: { type: Sequelize.INTEGER, allowNull: false },
      key: { type: Sequelize.STRING, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // Уникальные индексы с явными именами
    await queryInterface.addIndex('user_suppliers', ['userId', 'key'], {
      unique: true,
      name: 'user_suppliers_userId_key_unique'
    });

    await queryInterface.addIndex('user_suppliers', ['userId', 'supplierId'], {
      unique: true,
      name: 'user_suppliers_userId_supplierId_unique'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_suppliers');
    await queryInterface.dropTable('suppliers');
  }
};