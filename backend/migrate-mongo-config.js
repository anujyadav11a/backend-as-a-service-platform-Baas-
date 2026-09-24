import 'dotenv/config';

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017",
    databaseName: process.env.DB_NAME || "frontier",
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  migrationsDir: "src/migrations",

  changelogCollectionName: "changelog",

  lockCollectionName: "changelog_lock",

  lockTtl: 300,

  migrationFileExtension: ".js",

  useFileHash: true,

  moduleSystem: 'esm',
};

export default config;