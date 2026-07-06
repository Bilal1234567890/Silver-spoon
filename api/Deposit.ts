import * as Sequelize from 'sequelize';
const { Model, DataTypes } = Sequelize;
import { sequelize } from './db.js';

class Deposit extends Model {
  declare id: number;
  declare userId: number;
  declare amount: number;
  declare type: 'deposit' | 'referral' | 'investment_return';
  declare description: string | null;
}

Deposit.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    type: { type: DataTypes.ENUM('deposit', 'referral', 'investment_return'), defaultValue: 'deposit' },
    description: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: 'deposits',
    timestamps: true,
  }
);

export default Deposit;