export const createAttributeRepository = (pool) => ({
  async create({ projectId, collectionId, databaseId, name, type, required }) {
    const sanitizedName = name.trim();
    const sanitizedType = type.trim().toUpperCase();
    const sanitizedCollectionId = collectionId.trim();
    const sanitizedProjectId = projectId.trim();
    const sanitizedDatabaseId = databaseId.trim();

    const [result] = await pool.promise().execute(
      'INSERT INTO attributes (collection_id, database_id, name, type, required, project_id) VALUES (?, ?, ?, ?, ?, ?)',
      [sanitizedCollectionId, sanitizedDatabaseId, sanitizedName, sanitizedProjectId, sanitizedType, required ? 1 : 0]
    );

    const [newAttributeRows] = await pool.promise().execute(
      'SELECT * FROM attributes WHERE id = ?',
      [result.insertId]
    );

    return { created: newAttributeRows[0] };
  },

  async findById(id, projectId) {
    const [rows] = await pool.promise().execute(
      'SELECT * FROM attributes WHERE id = ? AND project_id = ?',
      [id, projectId]
    );
    return rows[0] || null;
  },

  async findByCollectionId(collectionId, projectId) {
    const [rows] = await pool.promise().execute(
      'SELECT id, collection_id, database_id, name, type, required, project_id, created_at, updated_at FROM attributes WHERE collection_id = ? AND project_id = ? ORDER BY created_at ASC',
      [collectionId, projectId]
    );
    return rows;
  },

  async update(id, projectId, updates) {
    const [existingAttr] = await pool.promise().execute(
      'SELECT * FROM attributes WHERE id = ? AND project_id = ?',
      [id, projectId]
    );

    if (existingAttr.length === 0) {
      return { notFound: true };
    }

    const attribute = existingAttr[0];
    const values = [];
    const setClauses = [];

    if (updates.name !== undefined) {
      setClauses.push('`name` = ?');
      values.push(updates.name);
    }
    if (updates.type !== undefined) {
      setClauses.push('`type` = ?');
      values.push(updates.type);
    }
    if (updates.required !== undefined) {
      setClauses.push('`required` = ?');
      values.push(updates.required ? 1 : 0);
    }

    if (setClauses.length === 0) {
      return { noChanges: true };
    }

    values.push(id, projectId);

    await pool.promise().execute(
      `UPDATE attributes SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`,
      values
    );

    const [updatedAttr] = await pool.promise().execute(
      'SELECT * FROM attributes WHERE id = ?',
      [id]
    );

    return { updated: updatedAttr[0] };
  },

  async deleteById(id, projectId) {
    const [attributes] = await pool.promise().execute(
      'SELECT * FROM attributes WHERE id = ? AND project_id = ?',
      [id, projectId]
    );

    if (attributes.length === 0) {
      return { notFound: true };
    }

    const attribute = attributes[0];

    const [allAttributes] = await pool.promise().execute(
      'SELECT COUNT(*) as count FROM attributes WHERE collection_id = ?',
      [attribute.collection_id]
    );

    if (allAttributes[0].count === 1) {
      return { lastAttribute: true };
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        'DELETE FROM attributes WHERE id = ? AND project_id = ?',
        [id, projectId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { deleted: attribute };
  },

  async findByName(collectionId, name, excludeId) {
    let query = 'SELECT id FROM attributes WHERE name = ? AND collection_id = ?';
    const params = [name, collectionId];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await pool.promise().execute(query, params);
    return rows.length > 0;
  },

  async getAttributeCountByCollection(collectionId) {
    const [rows] = await pool.promise().execute(
      'SELECT COUNT(*) as count FROM attributes WHERE collection_id = ?',
      [collectionId]
    );
    return rows[0].count;
  },

  async findAllByCollectionId(collectionId) {
    const [rows] = await pool.promise().execute(
      'SELECT id, collection_id, database_id, name, type, required, project_id, created_at, updated_at FROM attributes WHERE collection_id = ? ORDER BY created_at ASC',
      [collectionId]
    );
    return rows;
  },

  async deleteAllByCollectionId(collectionId) {
    const [result] = await pool.promise().execute(
      'DELETE FROM attributes WHERE collection_id = ?',
      [collectionId]
    );
    return { deletedCount: result.affectedRows };
  },
});