import { ConnectDb, Connectmysql } from "./db/db.js";

import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({
    path: "./.env"
})

const Port = process.env.PORT || 20000;

// Connect to both databases
ConnectDb()
    .then(() => {
        console.log("MongoDB connected successfully");
        return Connectmysql();
    })
    .then(() => {
        console.log("MySQL connected successfully");
        app.listen(Port, () => {
            console.log(`Server is running at port ${Port}`);
        });
    })
    .catch((err) => {
        console.log("Database connection failed:", err);
    });
