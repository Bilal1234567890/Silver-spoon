import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Vercel sets this to 'production' automatically. 
// Locally, it will usually be 'development' or undefined.
const isProduction = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// 1. Determine Credentials based on Environment
// ---------------------------------------------------------------------------

// Local DB configuration
const localDbName = process.env.LOCAL_DB_NAME || 'silver'; // change to your local DB name
const localDbUser = process.env.LOCAL_DB_USER || 'root';
const localDbPassword = process.env.LOCAL_DB_PASSWORD || 'Mu123@#$';
const localDbHost = process.env.LOCAL_DB_HOST || '127.0.0.1';
const localDbPort = Number(process.env.LOCAL_DB_PORT) || 3306;

// Aiven DB configuration
const aivenDbName = process.env.DB_NAME as string;
const aivenDbUser = process.env.DB_USER as string;
const aivenDbPassword = process.env.DB_PASSWORD as string;
const aivenDbHost = process.env.DB_HOST as string;
const aivenDbPort = Number(process.env.DB_PORT) || 22564;

// Select which credentials to use
const dbName = isProduction ? aivenDbName : localDbName;
const dbUser = isProduction ? aivenDbUser : localDbUser;
const dbPassword = isProduction ? aivenDbPassword : localDbPassword;
const dbHost = isProduction ? aivenDbHost : localDbHost;
const dbPort = isProduction ? aivenDbPort : localDbPort;

// ---------------------------------------------------------------------------
// 2. Conditionally Apply SSL (Local doesn't need it, Aiven requires it)
// ---------------------------------------------------------------------------
const dialectOptions = isProduction
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_CA_CERT ? true : false,
        ca: process.env.DB_CA_CERT ? process.env.DB_CA_CERT.replace(/\\n/g, '\n') : undefined
      }
    }
  : {}; // Empty object for local dev (no SSL)


// ---------------------------------------------------------------------------
// 3. Initialize Sequelize
// ---------------------------------------------------------------------------
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  dialectOptions,
  pool: {
    max: isProduction ? 3 : 5, // Restrict cloud connections, allow more locally
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Turn on logging locally to see SQL queries, but disable in production for performance
  logging: isProduction ? false : console.log, 
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to ${isProduction ? 'Aiven (Cloud)' : 'Local MySQL'} database successfully on port ${dbPort}.`);

    // 🔥 Create tables if they don't exist (force: true drops & recreates – safe for fresh DB)
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced (created fresh).');

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default connectDB;