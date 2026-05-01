'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Visit extends Model {
    static associate(models) {
      Visit.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'SET NULL'
      })
    }
  }

  Visit.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // 🌐 путь страницы
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true
    },

    // 🔗 откуда пришёл
    referrer: {
      type: DataTypes.STRING,
      allowNull: true,
      index: true
    },

    // 🌍 IP пользователя
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
      index: true
    },

    // 👤 user-agent (браузер/устройство)
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // 🧑 пользователь (если авторизован)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      index: true
    },

    // 🆕 сессия (ОЧЕНЬ важно для аналитики)
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      index: true
    },

    // 📱 устройство (desktop/mobile/tablet)
    deviceType: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // ⏱ время на странице (если будешь считать)
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'Visit',
    tableName: 'visits',
    timestamps: true,
    underscored: true
  })

  return Visit
}