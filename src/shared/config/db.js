import mongoose from 'mongoose';
import { DB_NAME } from '../constants/constant.js';
import mysql from 'mysql2';
import config from './env.js';


const ConnectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${config.mongodb.uri}/${config.mongodb.dbName}`);
        console.log(`Database connected successfully: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error while connecting to database", error.message);
        throw error;
    }
};

export { ConnectDb };

// Create MySQL connection pool
const mysqlPool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const Connectmysql = async () => {
    try {
        // Test the connection
        await mysqlPool.promise().execute('SELECT 1');
        console.log(`MySQL connection pool created - User: ${config.mysql.user}, Database: ${config.mysql.database}`);
        return mysqlPool;
    } catch (error) {
        console.error("Error while connecting to MySQL database:", error.message);
        throw error;
    }
};

export { Connectmysql, mysqlPool };

