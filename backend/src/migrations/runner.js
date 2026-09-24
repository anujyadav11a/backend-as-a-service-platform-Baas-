import 'dotenv/config';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = __dirname;
const CHANGELOG_COLLECTION = 'changelog';
const LOCK_COLLECTION = 'changelog_lock';
const LOCK_TTL = 300;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'frontier';

const CONNECTION_URI = MONGODB_URI.includes('mongodb+srv://') || MONGODB_URI.includes('mongodb://')
  ? `${MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`
  : MONGODB_URI;

async function getMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js') && f !== 'runner.js')
    .sort();

  const migrations = [];

  for (const file of files) {
    const migrationPath = pathToFileURL(path.join(MIGRATIONS_DIR, file)).href;
    const migrationModule = await import(migrationPath);
    const migration = migrationModule.default;

    migrations.push({
      fileName: file,
      id: file.split('-')[0],
      name: file.replace('.js', ''),
      up: migration.up,
      down: migration.down
    });
  }

  return migrations;
}

async function getAppliedMigrations(db) {
  try {
    const collection = db.collection(CHANGELOG_COLLECTION);
    const docs = await collection.find({}).sort({ appliedAt: 1 }).toArray();
    return docs.map(d => d.migrationId);
  } catch (error) {
    if (error.code === 26) {
      return [];
    }
    throw error;
  }
}

async function acquireLock(db) {
  const lockCollection = db.collection(LOCK_COLLECTION);
  const lockId = 'migration-lock';
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TTL * 1000);

  const insertResult = await lockCollection.findOneAndUpdate(
    { _id: lockId, expiresAt: { $lt: now } },
    {
      $set: { acquiredAt: now, expiresAt }
    },
    { upsert: true, returnDocument: 'after' }
  );

  if (insertResult && insertResult.expiresAt >= now && insertResult.acquiredAt.getTime() === now.getTime()) {
    return lockId;
  }

  const existingLock = await lockCollection.findOne({ _id: lockId });
  if (existingLock && existingLock.expiresAt > now) {
    throw new Error('Could not acquire migration lock - another migration may be running');
  }

  await lockCollection.findOneAndUpdate(
    { _id: lockId },
    { $set: { acquiredAt: now, expiresAt } },
    { upsert: true }
  );

  return lockId;
}

async function releaseLock(db, lockId) {
  await db.collection(LOCK_COLLECTION).deleteOne({ _id: lockId });
}

async function recordMigration(db, migrationId, fileName, direction) {
  const collection = db.collection(CHANGELOG_COLLECTION);
  await collection.insertOne({
    migrationId,
    fileName,
    direction,
    appliedAt: new Date(),
    checksum: crypto.createHash('sha256').update(fileName).digest('hex')
  });
}

async function removeMigrationRecord(db, migrationId) {
  await db.collection(CHANGELOG_COLLECTION).deleteOne({ migrationId });
}

async function runMigration(db, client, migration, direction) {
  console.log(`\n${direction === 'up' ? '⬆️' : '⬇️'} Running migration: ${migration.fileName} (${direction})`);

  const fn = direction === 'up' ? migration.up : migration.down;
  if (!fn) {
    throw new Error(`Migration ${migration.fileName} has no ${direction} function`);
  }

  await fn(db, client);

  if (direction === 'up') {
    await recordMigration(db, migration.id, migration.fileName, 'up');
  } else {
    await removeMigrationRecord(db, migration.id);
  }

  console.log(`✅ Completed: ${migration.fileName} (${direction})`);
}

async function migrateUp(db, client, migrations, appliedMigrations) {
  const pending = migrations.filter(m => !appliedMigrations.includes(m.id));

  if (pending.length === 0) {
    console.log('✅ No pending migrations');
    return;
  }

  console.log(`\n📦 Found ${pending.length} pending migration(s)`);

  for (const migration of pending) {
    await runMigration(db, client, migration, 'up');
  }

  console.log('\n🎉 All migrations completed successfully!');
}

async function migrateDown(db, client, migrations, appliedMigrations, steps = 1) {
  const toRollback = appliedMigrations.slice(-steps).reverse();

  if (toRollback.length === 0) {
    console.log('✅ No migrations to rollback');
    return;
  }

  console.log(`\n⚠️  Rolling back ${toRollback.length} migration(s)`);

  for (const migrationId of toRollback) {
    const migration = migrations.find(m => m.id === migrationId);
    if (!migration) {
      throw new Error(`Migration ${migrationId} not found in migration files`);
    }
    await runMigration(db, client, migration, 'down');
  }

  console.log('\n✅ Rollback completed');
}

async function showStatus(db, migrations, appliedMigrations) {
  console.log('\n📊 Migration Status');
  console.log('===================');

  for (const migration of migrations) {
    const applied = appliedMigrations.includes(migration.id);
    const status = applied ? '✅ Applied' : '⏳ Pending';
    console.log(`${status}  ${migration.fileName}`);
  }

  console.log(`\nTotal: ${migrations.length} | Applied: ${appliedMigrations.length} | Pending: ${migrations.length - appliedMigrations.length}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'up';
  const steps = parseInt(args[1]) || 1;

  console.log('🔧 MongoDB Migration Runner');
  console.log('============================');
  console.log(`Database: ${DB_NAME}`);
  console.log(`Command: ${command}`);

  const client = new MongoClient(CONNECTION_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);

    const lockId = await acquireLock(db);
    console.log('🔒 Acquired migration lock');

    try {
      const migrations = await getMigrations();
      const appliedMigrations = await getAppliedMigrations(db);

      switch (command) {
        case 'up':
        case 'migrate':
          await migrateUp(db, client, migrations, appliedMigrations);
          break;
        case 'down':
        case 'rollback':
          await migrateDown(db, client, migrations, appliedMigrations, steps);
          break;
        case 'status':
          await showStatus(db, migrations, appliedMigrations);
          break;
        default:
          console.error(`Unknown command: ${command}`);
          console.log('Usage: node runner.js [up|down|status] [steps]');
          process.exit(1);
      }
    } finally {
      await releaseLock(db, lockId);
      console.log('🔓 Released migration lock');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();