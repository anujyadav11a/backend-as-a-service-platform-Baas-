import crypto from 'crypto';
import bcrypt from 'bcrypt';

const COLLECTIONS = [
  'users',
  'projects',
  'tenantusers',
  'tenantidentities',
  'identities',
  'tenantsessions',
  'consolesessions'
];

function generateSecureRandom(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export default {
  async up(db, client) {
    await createUsersCollection(db);
    await createProjectsCollection(db);
    await createTenantUsersCollection(db);
    await createTenantIdentitiesCollection(db);
    await createIdentitiesCollection(db);
    await createTenantSessionsCollection(db);
    await createConsoleSessionsCollection(db);
    await seedAdminUser(db);

    console.log('✅ Initial schema migration completed successfully');
  },

  async down(db, client) {
    console.warn('⚠️  Rolling back initial schema - dropping all collections');
    console.warn('⚠️  This is a DESTRUCTIVE operation - only for development!');

    for (const collectionName of COLLECTIONS) {
      try {
        await db.collection(collectionName).drop();
        console.log(`Dropped collection: ${collectionName}`);
      } catch (error) {
        if (error.code !== 26) {
          console.warn(`Could not drop ${collectionName}:`, error.message);
        }
      }
    }
  }
};

async function createUsersCollection(db) {
  const collectionName = 'users';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    console.log(`Collection ${collectionName} already exists, skipping creation`);
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          _id: { bsonType: 'objectId' },
          name: { bsonType: 'string', minLength: 1 },
          email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
          password: { bsonType: 'string', minLength: 6 },
          role: {
            bsonType: 'string',
            enum: ['admin', 'user']
          },
          refreshtoken: { bsonType: ['string', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  await db.collection(collectionName).createIndexes([
    { key: { email: 1 }, unique: true, name: 'idx_email_unique' },
    { key: { role: 1 }, name: 'idx_role' },
    { key: { createdAt: -1 }, name: 'idx_created_at_desc' }
  ]);

  console.log(`✅ Created collection: ${collectionName} with validation and indexes`);
}

async function createProjectsCollection(db) {
  const collectionName = 'projects';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    console.log(`Collection ${collectionName} already exists, skipping creation`);
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'owner_id'],
        properties: {
          _id: { bsonType: 'objectId' },
          name: { bsonType: 'string', minLength: 2, maxLength: 100 },
          description: { bsonType: ['string', 'null'], maxLength: 500 },
          owner_id: { bsonType: 'objectId' },
          project_id: { bsonType: 'string', minLength: 8, maxLength: 8 },
          api_key: { bsonType: 'string', minLength: 32, maxLength: 32 },
          status: {
            bsonType: 'string',
            enum: ['active', 'suspended', 'deleted']
          },
          config: {
            bsonType: 'object',
            properties: {
              max_databases: { bsonType: 'int', minimum: 1 },
              max_tables_per_db: { bsonType: 'int', minimum: 1 },
              max_documents_per_table: { bsonType: 'int', minimum: 1 },
              cors_origins: {
                bsonType: 'array',
                items: { bsonType: 'string' }
              }
            }
          },
          usage_stats: {
            bsonType: 'object',
            properties: {
              api_requests_count: { bsonType: 'long', minimum: 0 },
              storage_used_mb: { bsonType: 'double', minimum: 0 }
            }
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  await db.collection(collectionName).createIndexes([
    { key: { owner_id: 1, status: 1 }, name: 'idx_owner_status' },
    { key: { createdAt: -1 }, name: 'idx_created_at_desc' },
    { key: { owner_id: 1, name: 1 }, unique: true, partialFilterExpression: { status: { $ne: 'deleted' } }, name: 'idx_owner_name_unique_active' },
    { key: { project_id: 1 }, unique: true, name: 'idx_project_id_unique' },
    { key: { api_key: 1 }, unique: true, name: 'idx_api_key_unique' },
    { key: { status: 1 }, name: 'idx_status' }
  ]);

  console.log(`✅ Created collection: ${collectionName} with validation and indexes`);
}

async function createTenantUsersCollection(db) {
  const collectionName = 'tenantusers';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    console.log(`Collection ${collectionName} already exists, skipping creation`);
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'email', 'password', 'project_id'],
        properties: {
          _id: { bsonType: 'objectId' },
          username: { bsonType: 'string', minLength: 3, maxLength: 30 },
          email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
          password: { bsonType: 'string', minLength: 6 },
          project_id: { bsonType: 'string' },
          status: {
            bsonType: 'string',
            enum: ['active', 'inactive', 'suspended']
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  await db.collection(collectionName).createIndexes([
    { key: { project_id: 1, email: 1 }, unique: true, name: 'idx_project_email_unique' },
    { key: { project_id: 1, username: 1 }, unique: true, name: 'idx_project_username_unique' },
    { key: { project_id: 1, status: 1 }, name: 'idx_project_status' },
    { key: { project_id: 1 }, name: 'idx_project_id' },
    { key: { createdAt: -1 }, name: 'idx_created_at_desc' }
  ]);

  console.log(`✅ Created collection: ${collectionName} with validation and indexes`);
}

async function createTenantIdentitiesCollection(db) {
  const collectionName = 'tenantidentities';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    console.log(`Collection ${collectionName} already exists, skipping creation`);
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'provider', 'provider_id', 'provider_email'],
        properties: {
          _id: { bsonType: 'objectId' },
          user_id: { bsonType: 'objectId' },
          provider: {
            bsonType: 'string',
            enum: ['google', 'github', 'microsoft', 'facebook', 'linkedin']
          },
          provider_id: { bsonType: 'string' },
          provider_email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
          provider_name: { bsonType: ['string', 'null'] },
          refresh_token: { bsonType: ['string', 'null'] },
          expires_at: { bsonType: ['date', 'null'] },
          scope: { bsonType: 'array', items: { bsonType: 'string' } },
          is_active: { bsonType: 'bool' },
          is_primary: { bsonType: 'bool' },
          last_used: { bsonType: 'date' },
          provider_data: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  await db.collection(collectionName).createIndexes([
    { key: { provider: 1, provider_id: 1 }, unique: true, name: 'idx_provider_provider_id_unique' },
    { key: { user_id: 1, provider: 1 }, name: 'idx_user_provider' },
    { key: { user_id: 1, is_primary: 1 }, name: 'idx_user_primary' },
    { key: { expires_at: 1 }, name: 'idx_expires_at', expireAfterSeconds: 0 },
    { key: { is_active: 1 }, name: 'idx_is_active' }
  ]);

  console.log(`✅ Created collection: ${collectionName} with validation and indexes`);
}

async function createIdentitiesCollection(db) {
  const collectionName = 'identities';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    console.log(`Collection ${collectionName} already exists, skipping creation`);
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'provider', 'provider_id', 'provider_email'],
        properties: {
          _id: { bsonType: 'objectId' },
          user_id: { bsonType: 'objectId' },
          provider: {
            bsonType: 'string',
            enum: ['google', 'github', 'microsoft', 'facebook', 'linkedin']
          },
          provider_id: { bsonType: 'string' },
          provider_email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
          provider_name: { bsonType: ['string', 'null'] },
          refresh_token: { bsonType: ['string', 'null'] },
          expires_at: { bsonType: ['date', 'null'] },
          scope: { bsonType: 'array', items: { bsonType: 'string' } },
          is_active: { bsonType: 'bool' },
          is_primary: { bsonType: 'bool' },
          last_used: { bsonType: 'date' },
          provider_data: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  await db.collection(collectionName).createIndexes([
    { key: { provider: 1, provider_id: 1 }, unique: true, name: 'idx_provider_provider_id_unique' },
    { key: { user_id: 1, provider: 1 }, name: 'idx_user_provider' },
    { key: { user_id: 1, is_primary: 1 }, name: 'idx_user_primary' },
    { key: { expires_at: 1 }, name: 'idx_expires_at', expireAfterSeconds: 0 },
    { key: { is_active: 1 }, name: 'idx_is_active' }
  ]);

  console.log(`✅ Created collection: ${collectionName} with validation and indexes`);
}

async function createTenantSessionsCollection(db) {
  const collectionName = 'tenantsessions';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    console.log(`Collection ${collectionName} already exists, skipping creation`);
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'project_id', 'refresh_token', 'expires_at'],
        properties: {
          _id: { bsonType: 'objectId' },
          user_id: { bsonType: 'objectId' },
          project_id: { bsonType: 'string' },
          refresh_token: { bsonType: 'string' },
          device_info: {
            bsonType: 'object',
            properties: {
              user_agent: { bsonType: ['string', 'null'], maxLength: 500 },
              browser: { bsonType: ['string', 'null'], maxLength: 100 },
              os: { bsonType: ['string', 'null'], maxLength: 100 },
              device_type: {
                bsonType: 'string',
                enum: ['desktop', 'mobile', 'tablet', 'unknown']
              }
            }
          },
          location: {
            bsonType: 'object',
            properties: {
              ip_address: { bsonType: 'string' },
              country: { bsonType: ['string', 'null'], maxLength: 100 },
              city: { bsonType: ['string', 'null'], maxLength: 100 },
              timezone: { bsonType: ['string', 'null'], maxLength: 50 }
            }
          },
          status: {
            bsonType: 'string',
            enum: ['active', 'expired', 'revoked', 'suspicious']
          },
          login_time: { bsonType: 'date' },
          last_activity: { bsonType: 'date' },
          expires_at: { bsonType: 'date' },
          logout_time: { bsonType: ['date', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  await db.collection(collectionName).createIndexes([
    { key: { user_id: 1, status: 1 }, name: 'idx_user_status' },
    { key: { project_id: 1 }, name: 'idx_project_id' },
    { key: { refresh_token: 1 }, unique: true, name: 'idx_refresh_token_unique' },
    { key: { expires_at: 1 }, name: 'idx_expires_at_ttl', expireAfterSeconds: 0 },
    { key: { last_activity: 1 }, name: 'idx_last_activity' },
    { key: { status: 1 }, name: 'idx_status' },
    { key: { login_time: -1 }, name: 'idx_login_time_desc' }
  ]);

  console.log(`✅ Created collection: ${collectionName} with validation and TTL indexes`);
}

async function createConsoleSessionsCollection(db) {
  const collectionName = 'consolesessions';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length > 0) {
    console.log(`Collection ${collectionName} already exists, skipping creation`);
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'session_token', 'refresh_token', 'ip_address', 'user_agent', 'expires_at'],
        properties: {
          _id: { bsonType: 'objectId' },
          user_id: { bsonType: 'objectId' },
          session_token: { bsonType: 'string' },
          refresh_token: { bsonType: 'string' },
          ip_address: { bsonType: 'string' },
          user_agent: { bsonType: 'string' },
          device_info: {
            bsonType: 'object',
            properties: {
              browser: { bsonType: ['string', 'null'] },
              os: { bsonType: ['string', 'null'] },
              device_type: {
                bsonType: 'string',
                enum: ['desktop', 'mobile', 'tablet', 'unknown']
              }
            }
          },
          location: {
            bsonType: 'object',
            properties: {
              country: { bsonType: ['string', 'null'] },
              city: { bsonType: ['string', 'null'] },
              timezone: { bsonType: ['string', 'null'] }
            }
          },
          is_active: { bsonType: 'bool' },
          last_activity: { bsonType: 'date' },
          expires_at: { bsonType: 'date' },
          login_method: {
            bsonType: 'string',
            enum: ['email_password', 'oauth', 'sso']
          },
          session_data: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  await db.collection(collectionName).createIndexes([
    { key: { user_id: 1, is_active: 1 }, name: 'idx_user_active' },
    { key: { session_token: 1 }, unique: true, name: 'idx_session_token_unique' },
    { key: { refresh_token: 1 }, unique: true, name: 'idx_refresh_token_unique' },
    { key: { expires_at: 1 }, name: 'idx_expires_at_ttl', expireAfterSeconds: 0 },
    { key: { last_activity: 1 }, name: 'idx_last_activity' },
    { key: { is_active: 1 }, name: 'idx_is_active' }
  ]);

  console.log(`✅ Created collection: ${collectionName} with validation and TTL indexes`);
}

async function seedAdminUser(db) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@frontier.local';
  const adminPassword = process.env.ADMIN_PASSWORD || generateSecureRandom(16);
  const adminName = process.env.ADMIN_NAME || 'Frontier Admin';

  const usersCollection = db.collection('users');

  const existingAdmin = await usersCollection.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    return;
  }

  const hashedPassword = await hashPassword(adminPassword);

  const adminUser = {
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    refreshtoken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await usersCollection.insertOne(adminUser);

  console.log(`✅ Seeded admin user: ${adminEmail}`);
  console.log(`   User ID: ${result.insertedId}`);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ⚠️  Save this password! It won't be shown again.`);
  } else {
    console.log(`   ⚠️  Admin password generated. Check deployment logs or env vars.`);
  }
}