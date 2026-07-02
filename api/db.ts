import 'mysql2';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 DB_USER:', process.env.DB_USER);
console.log('🔍 DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('🔍 DB_NAME:', process.env.DB_NAME);
console.log('🔍 DB_HOST:', process.env.DB_HOST);
console.log('🔍 DB_PORT:', process.env.DB_PORT || '3306');

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // SSL is required by Aiven – but this also works locally
      ssl: {
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error);
    process.exit(1);
  }
};

export { sequelize };