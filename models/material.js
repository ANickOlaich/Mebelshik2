module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    article: {
      type: DataTypes.STRING,
      allowNull: true
    },

    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    site: {
      type: DataTypes.STRING,
      allowNull: true
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true
    },

    isNew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    uses: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    // учитывать в статистике?
    isCountedInStats: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    type: {
      type: DataTypes.ENUM(
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
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    tableName: 'materials',
    timestamps: true,

    indexes: [
      {
        fields: ['supplierId']
      },
      {
        fields: ['article']
      },
      {
        fields: ['isCountedInStats']
      }
    ]
  })

  Material.associate = (models) => {
    Material.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    })

    Material.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    })
  }

  return Material
}