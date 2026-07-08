import * as Sequelize from 'sequelize';
const { Model, DataTypes } = Sequelize;
import { sequelize } from './db.js';

class Order extends Model {
  declare id: number;
  declare userId: number;
  declare planName: string;
  declare amount: number;
  declare dailyIncome: number;
  declare totalIncome: number;
  declare duration: number; // days
  declare startDate: Date;
  declare endDate: Date;
  declare status: 'active' | 'inactive';
  declare lastIncomeDate: Date | null;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    planName: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    dailyIncome: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    totalIncome: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false }, // 45 days
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    lastIncomeDate: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
  }
);

export default Order;