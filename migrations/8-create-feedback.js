'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feedbacks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      page: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('feedback', 'bug', 'feature'),
        defaultValue: 'feedback'
      },
      status: {
        type: Sequelize.ENUM('new', 'in_progress', 'done'),
        defaultValue: 'new'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('feedbacks')
  }
};