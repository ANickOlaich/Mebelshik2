module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    site: {
      type: DataTypes.STRING,
      allowNull: true
    },

    parser: {
      type: DataTypes.STRING,
      allowNull: true
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },

    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },

    allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    tableName: 'suppliers',
    timestamps: true
  });

  Supplier.associate = (models) => {
    Supplier.hasMany(models.Material, {
      foreignKey: 'supplierId',
      as: 'materials'
    });

    Supplier.hasMany(models.UserClass, {
      foreignKey: 'supplierId',
      as: 'userClasses'
    });

    Supplier.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return Supplier;
};