import * as Sequelize from 'sequelize';
const { Model, DataTypes } = Sequelize;
import { sequelize } from './db.js';

class Admin extends Model {
  declare id: number;
  declare email: string;
  declare phone1: string;
  declare phone2: string;
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone1: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone2: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'admins',
    timestamps: true,
  }
);

export default Admin;