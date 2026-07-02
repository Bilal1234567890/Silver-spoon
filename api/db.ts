import 'mysql2';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
console.log('🔍 DATABASE_URL:', dbUrl.replace(/:[^:@]*@/, ':****@'));

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
    connectTimeout: 60000, // 60 seconds
  },
  logging: false,
});

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