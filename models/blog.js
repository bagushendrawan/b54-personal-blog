'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  blog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    desc: DataTypes.STRING,
    file: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    iconsArray: DataTypes.ARRAY(DataTypes.STRING),
    start: DataTypes.DATEONLY,
    end: DataTypes.DATEONLY,
    duration: DataTypes.STRING,
    authorID: {
      type: DataTypes.INTEGER,
      references: 'users', // nama table
      referencesKey: 'id' // nama kolom users.id
}
  }, {
    sequelize,
    modelName: 'blog',
  });
  return blog;
};