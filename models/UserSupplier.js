module.exports = (sequelize, DataTypes) => {
  const UserSupplier = sequelize.define('UserSupplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'user_suppliers',
    timestamps: true
  });

  // Ассоциации
  UserSupplier.associate = (models) => {
    UserSupplier.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });
  };

  return UserSupplier;
};