import { ConnectDb, Connectmysql } from "./shared/config/db.js";
import { validateEncryptionConfig } from "./shared/utils/cryptoUtils.js";

import dotenv from 'dotenv';
import app from './app.js';
import { initAuthListeners } from './modules/auth/listeners/index.js';
import { initProjectListeners } from './modules/project/listeners/index.js';
import { initBaaSListeners } from './modules/baas/listeners/index.js';

dotenv.config({
    path: "./.env"
})

// Validate encryption configuration early
validateEncryptionConfig();

const Port = process.env.PORT || 20000;

// Connect to both databases
ConnectDb()
    .then(() => {
        console.log("MongoDB connected successfully");
        return Connectmysql();
    })
    .then(() => {
        console.log("MySQL connected successfully");
        // Initialize domain event listeners
        initAuthListeners();
        initProjectListeners();
        initBaaSListeners();

        app.listen(Port, () => {
            console.log(`Server is running at port ${Port}`);
        });
    })
    .catch((err) => {
        console.log("Database connection failed:", err);
    });
