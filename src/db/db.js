import mongoose from 'mongoose';
import { DB_NAME } from '../constants/constant.js';
import mysql from 'mysql2';


const ConnectDb= async ()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Database connected successfully: ${connectionInstance.connection.host}`);


        
    } catch (error) {
        console.error("Error while connecting to database",error.message);
        process.exit(1);
    }
}

export {ConnectDb}

// Create MySQL connection pool
const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const Connectmysql = async () => {
    try {
        // Test the connection
        await mysqlPool.promise().execute('SELECT 1');
        console.log(`MySQL connection pool created - User: ${process.env.MYSQL_USER}, Database: ${process.env.MYSQL_DATABASE}`);
        return mysqlPool;
    } catch (error) {
        console.error("Error while connecting to MySQL database:", error.message);
        process.exit(1);
    }
}
   
        
    


export { Connectmysql, mysqlPool }

