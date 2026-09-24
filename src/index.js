import { ConnectDb, Connectmysql, mysqlPool } from "./shared/config/db.js";
import { validateEncryptionConfig } from "./shared/utils/cryptoUtils.js";
import config from "./shared/config/env.js";

import dotenv from 'dotenv';
import app from './app.js';
import { initAuthListeners } from './modules/auth/listeners/index.js';
import { initProjectListeners } from './modules/project/listeners/index.js';
import { initBaaSListeners } from './modules/baas/listeners/index.js';
import { initializeRepositories } from './modules/baas/repositories/factory.js';

dotenv.config({
    path: "./.env"
})

// Validate encryption configuration early
validateEncryptionConfig();

// Connect to both databases
ConnectDb()
    .then(() => {
        console.log("MongoDB connected successfully");
        return Connectmysql();
    })
    .then(() => {
        console.log("MySQL connected successfully");
        // Initialize repositories with mysql pool
        initializeRepositories(mysqlPool);
        // Initialize domain event listeners
        initAuthListeners();
        initProjectListeners();
        initBaaSListeners();

        app.listen(config.app.port, () => {
            console.log(`Server is running at port ${config.app.port}`);
        });
    })
    .catch((err) => {
        console.log("Database connection failed:", err);
        process.exit(1);
    });
