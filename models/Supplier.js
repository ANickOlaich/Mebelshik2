module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    site: { type: DataTypes.STRING, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true },
    isPrintable: { type: DataTypes.BOOLEAN, defaultValue: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 10 },
    logo: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'suppliers',
    timestamps: true
  });

  // Ассоциации
  Supplier.associate = (models) => {
    Supplier.hasMany(models.UserSupplier, {
      foreignKey: 'supplierId',
      as: 'userSuppliers'
    });
  };

  return Supplier;
};