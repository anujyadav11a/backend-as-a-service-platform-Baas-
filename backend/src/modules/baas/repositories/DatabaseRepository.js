export const createDatabaseRepository = (pool) => ({
  async create({ projectId, name }) {
    const sanitizedName = name.trim();
    const sanitizedProjectId = projectId;

    const [existingRows] = await pool.promise().execute(
      'SELECT id FROM databasess WHERE name = ? AND project_id = ?',
      [sanitizedName, sanitizedProjectId]
    );

    if (existingRows.length > 0) {
      return { exists: true };
    }

    const [result] = await pool.promise().execute(
      'INSERT INTO databasess (name, project_id) VALUES (?, ?)',
      [sanitizedName, sanitizedProjectId]
    );

    const [createdRows] = await pool.promise().execute(
      'SELECT * FROM databasess WHERE id = ?',
      [result.insertId]
    );

    return { created: createdRows[0] };
  },

  async findById(id) {
    const [rows] = await pool.promise().execute(
      'SELECT * FROM databasess WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByProjectId(projectId) {
    const [rows] = await pool.promise().execute(
      'SELECT id, name, project_id, created_at, updated_at FROM databasess WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return rows;
  },

  async deleteById(id, projectId) {
    const [checkRows] = await pool.promise().execute(
      'SELECT id, name, project_id FROM databasess WHERE id = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return { notFound: true };
    }

    const database = checkRows[0];

    if (database.project_id !== projectId) {
      return { forbidden: true };
    }

    await pool.promise().execute(
      'DELETE FROM databasess WHERE id = ?',
      [id]
    );

    return { deleted: database };
  },

  async existsByName(projectId, name) {
    const [rows] = await pool.promise().execute(
      'SELECT id FROM databasess WHERE name = ? AND project_id = ?',
      [name.trim(), projectId]
    );
    return rows.length > 0;
  },

  async findAllByProjectId(projectId) {
    const [rows] = await pool.promise().execute(
      'SELECT id, name, project_id FROM databasess WHERE project_id = ?',
      [projectId]
    );
    return rows;
  },

  async deleteAllByProjectId(projectId) {
    const [result] = await pool.promise().execute(
      'DELETE FROM databasess WHERE project_id = ?',
      [projectId]
    );
    return { deletedCount: result.affectedRows };
  },
});