module.exports = (sequelize, DataTypes) => {
  const UserClass = sequelize.define('UserClass', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    className: {
      type: DataTypes.STRING,
      allowNull: false
    },

    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    customSupplierName: {
      type: DataTypes.STRING,
      allowNull: true
    },
     type: {
      type: DataTypes.ENUM('Плитні матеріали', 'Погонні матеріали', 'Фурнітура', 'Проче', 'Загальне'),
      allowNull: false,
      defaultValue: 'Проче'
    },

  }, {
    tableName: 'user_classes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'className'],
        name: 'uc_user_class_unique'
      }
    ]
  });

  UserClass.associate = (models) => {
    UserClass.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });

    UserClass.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserClass;
};