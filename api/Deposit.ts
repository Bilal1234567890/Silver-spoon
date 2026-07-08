import * as Sequelize from 'sequelize';
const { Model, DataTypes } = Sequelize;
import { sequelize } from './db.js';
import User from './User.js';

class Deposit extends Model {
  declare id: number;
  declare userId: number;
  declare amount: number;
  declare type: 'deposit' | 'referral' | 'investment_return' | 'daily_check';
  declare description: string | null;
  declare status: 'pending' | 'verified' | 'rejected';
  declare senderBank: string | null;
  declare senderAccountNumber: string | null;
  declare senderAccountName: string | null;
}

Deposit.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    type: {
      type: DataTypes.ENUM('deposit', 'referral', 'investment_return', 'daily_check'),
      defaultValue: 'deposit',
    },
    description: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    senderBank: { type: DataTypes.STRING, allowNull: true },
    senderAccountNumber: { type: DataTypes.STRING, allowNull: true },
    senderAccountName: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: 'deposits',
    timestamps: true,
  }
);

Deposit.belongsTo(User, { foreignKey: 'userId' });

export default Deposit;