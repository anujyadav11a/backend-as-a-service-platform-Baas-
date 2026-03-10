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

const Connectmysql = async () => {
    try {
        // Create connection using environment variables
        const connection = mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT || 3306
        });

        // Promisify the connection
        const connectAsync = () => {
            return new Promise((resolve, reject) => {
                connection.connect((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(connection);
                    }
                });
            });
        };

        await connectAsync();
        console.log(`MySQL connection successful - User: ${process.env.MYSQL_USER}, Database: ${process.env.MYSQL_DATABASE}`);
        return connection;

    } catch (error) {
        console.error("Error while connecting to MySQL database:", error.message);
        process.exit(1);
    }
}
   
        
    


export { Connectmysql }

