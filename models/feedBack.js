// models/Feedback.js
module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    page: {
      type: DataTypes.STRING,
      allowNull: true
    },

    type: {
      type: DataTypes.ENUM('feedback', 'bug', 'feature'),
      defaultValue: 'feedback'
    },

    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'done'),
      defaultValue: 'new'
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {
    tableName: 'feedbacks',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  })

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    })
  }

  return Feedback
}