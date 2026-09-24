export const createCollectionRepository = (pool) => ({
  async create({ projectId, databaseId, name }) {
    const sanitizedName = name.trim();
    const sanitizedProjectId = projectId;
    const sanitizedDatabaseId = parseInt(databaseId);

    const [existingRows] = await pool.promise().execute(
      'SELECT id FROM collections WHERE name = ? AND database_id = ?',
      [sanitizedName, sanitizedDatabaseId]
    );

    if (existingRows.length > 0) {
      return { exists: true };
    }

    const { v4: uuidv4 } = await import('uuid');
    const collectionId = uuidv4();

    await pool.promise().execute(
      'INSERT INTO collections (id, database_id, name, project_id) VALUES (?, ?, ?, ?)',
      [collectionId, sanitizedDatabaseId, sanitizedName, sanitizedProjectId]
    );

    const [createdRows] = await pool.promise().execute(
      'SELECT * FROM collections WHERE id = ?',
      [collectionId]
    );

    return { created: createdRows[0] };
  },

  async findById(id, projectId) {
    const [rows] = await pool.promise().execute(
      'SELECT id, database_id, name, project_id, created_at, updated_at FROM collections WHERE id = ? AND project_id = ?',
      [id, projectId]
    );
    return rows[0] || null;
  },

  async findByDatabaseId(databaseId, projectId) {
    const [rows] = await pool.promise().execute(
      'SELECT id, database_id, name, project_id, created_at, updated_at FROM collections WHERE database_id = ? AND project_id = ? ORDER BY created_at DESC',
      [databaseId, projectId]
    );
    return rows;
  },

  async deleteById(id, projectId) {
    const [checkRows] = await pool.promise().execute(
      'SELECT id, name, database_id, project_id FROM collections WHERE id = ? AND project_id = ?',
      [id, projectId]
    );

    if (checkRows.length === 0) {
      return { notFound: true };
    }

    const collection = checkRows[0];

    await pool.promise().execute(
      'DELETE FROM collections WHERE id = ?',
      [id]
    );

    return { deleted: collection };
  },

  async existsByName(databaseId, name) {
    const [rows] = await pool.promise().execute(
      'SELECT id FROM collections WHERE name = ? AND database_id = ?',
      [name.trim(), databaseId]
    );
    return rows.length > 0;
  },

  async findAllByDatabaseId(databaseId, projectId) {
    const [rows] = await pool.promise().execute(
      'SELECT id, database_id, name, project_id, created_at, updated_at FROM collections WHERE database_id = ? AND project_id = ? ORDER BY created_at DESC',
      [databaseId, projectId]
    );
    return rows;
  },

  async deleteAllByDatabaseId(databaseId, projectId) {
    const [result] = await pool.promise().execute(
      'DELETE FROM collections WHERE database_id = ? AND project_id = ?',
      [databaseId, projectId]
    );
    return { deletedCount: result.affectedRows };
  },
});