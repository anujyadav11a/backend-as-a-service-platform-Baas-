import { mysqlPool } from '../../../shared/config/db.js';
import { v4 as uuidv4 } from "uuid";

export const CollectionRepository = {
  async create({ projectId, databaseId, name }) {
    const sanitizedName = name.trim();
    const sanitizedProjectId = projectId;
    const sanitizedDatabaseId = parseInt(databaseId);

    const [existingRows] = await mysqlPool.promise().execute(
      'SELECT id FROM collections WHERE name = ? AND database_id = ?',
      [sanitizedName, sanitizedDatabaseId]
    );

    if (existingRows.length > 0) {
      return { exists: true };
    }

    const collectionId = uuidv4();

    await mysqlPool.promise().execute(
      'INSERT INTO collections (id, database_id, name, project_id) VALUES (?, ?, ?, ?)',
      [collectionId, sanitizedDatabaseId, sanitizedName, sanitizedProjectId]
    );

    const [createdRows] = await mysqlPool.promise().execute(
      'SELECT * FROM collections WHERE id = ?',
      [collectionId]
    );

    return { created: createdRows[0] };
  },

  async findById(id, projectId) {
    const [rows] = await mysqlPool.promise().execute(
      'SELECT id, database_id, name, project_id, created_at, updated_at FROM collections WHERE id = ? AND project_id = ?',
      [id, projectId]
    );
    return rows[0] || null;
  },

  async findByDatabaseId(databaseId, projectId) {
    const [rows] = await mysqlPool.promise().execute(
      'SELECT id, database_id, name, project_id, created_at, updated_at FROM collections WHERE database_id = ? AND project_id = ? ORDER BY created_at DESC',
      [databaseId, projectId]
    );
    return rows;
  },

  async deleteById(id, projectId) {
    const [checkRows] = await mysqlPool.promise().execute(
      'SELECT id, name, database_id, project_id FROM collections WHERE id = ? AND project_id = ?',
      [id, projectId]
    );

    if (checkRows.length === 0) {
      return { notFound: true };
    }

    const collection = checkRows[0];

    await mysqlPool.promise().execute(
      'DELETE FROM collections WHERE id = ?',
      [id]
    );

    return { deleted: collection };
  },

  async existsByName(databaseId, name) {
    const [rows] = await mysqlPool.promise().execute(
      'SELECT id FROM collections WHERE name = ? AND database_id = ?',
      [name.trim(), databaseId]
    );
    return rows.length > 0;
  },
};
