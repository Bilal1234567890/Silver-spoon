import * as Sequelize from 'sequelize';
const { Model, DataTypes } = Sequelize;
import { sequelize } from './db.js';
import User from './User.js';

class Withdrawal extends Model {
  declare id: number;
  declare userId: number;
  declare amount: number;
  declare bankName: string;
  declare accountNumber: string;
  declare accountName: string;
  declare status: 'pending' | 'approved' | 'rejected';
}

Withdrawal.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    bankName: { type: DataTypes.STRING, allowNull: false },
    accountNumber: { type: DataTypes.STRING, allowNull: false },
    accountName: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  },
  {
    sequelize,
    tableName: 'withdrawals',
    timestamps: true,
  }
);

// Association
Withdrawal.belongsTo(User, { foreignKey: 'userId' });

export default Withdrawal;