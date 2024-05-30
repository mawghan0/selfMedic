const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const useCloudSQL = process.env.USE_CLOUD_SQL === 'true';

const poolConfig = useCloudSQL ? {
    host: process.env.CLOUD_DB_HOST,
    user: process.env.CLOUD_DB_USER,
    password: process.env.CLOUD_DB_PASSWORD,
    database: process.env.CLOUD_DB_NAME,
    port: process.env.CLOUD_DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
} : {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(poolConfig);

const testDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        console.log('Database connection successful!');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
};

testDbConnection();

module.exports = pool;
