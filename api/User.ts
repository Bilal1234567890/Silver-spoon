import * as Sequelize from 'sequelize';
const { Model, DataTypes } = Sequelize;
import { sequelize } from './db.js';

class User extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare phone: string;
  declare password: string;
  declare balance: number;
  declare totalIncome: number;
  declare totalOrders: number;
  declare bonus: string | null;      // 'used' or null
  declare invest: number;            // total amount invested
  declare orders: number;            // number of orders
  declare referrals: number;         // number of referrals
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bonus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    invest: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    orders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    referrals: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;