import { mysqlPool } from "../../../shared/config/db.js";

export const DocumentRepository = {
  async create({ projectId, collectionId, data }) {
    const sanitizedCollectionId = collectionId.trim();
    const sanitizedProjectId = projectId.toString().trim();

    const documentId = "doc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);

    const [result] = await mysqlPool.promise().execute(
      "INSERT INTO documents (id, collection_id, data, project_id) VALUES (?, ?, ?, ?)",
      [documentId, sanitizedCollectionId, JSON.stringify(data), sanitizedProjectId]
    );

    const [documentRows] = await mysqlPool.promise().execute(
      "SELECT * FROM documents WHERE id = ?",
      [documentId]
    );

    return { created: documentRows[0] };
  },

  async findById(id, projectId) {
    const sanitizedDocumentId = id.trim();
    const sanitizedProjectId = projectId.toString().trim();

    const [rows] = await mysqlPool.promise().execute(
      "SELECT * FROM documents WHERE id = ? AND project_id = ?",
      [sanitizedDocumentId, sanitizedProjectId]
    );

    if (rows.length === 0) {
      return null;
    }

    const doc = rows[0];
    return {
      id: doc.id,
      collection_id: doc.collection_id,
      data: JSON.parse(doc.data),
      created_at: doc.created_at,
      project_id: doc.project_id
    };
  },

  async findByCollectionId(collectionId, projectId, { page = 1, limit = 10 }) {
    const sanitizedCollectionId = collectionId.trim();
    const sanitizedProjectId = projectId.toString().trim();
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const [rows] = await mysqlPool.promise().execute(
      "SELECT * FROM documents WHERE collection_id = ? AND project_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [sanitizedCollectionId, sanitizedProjectId, limitNumber, offset]
    );

    return rows.map(doc => ({
      id: doc.id,
      collection_id: doc.collection_id,
      data: JSON.parse(doc.data),
      created_at: doc.created_at,
      project_id: doc.project_id
    }));
  },

  async countByCollectionId(collectionId, projectId) {
    const sanitizedCollectionId = collectionId.trim();
    const sanitizedProjectId = projectId.toString().trim();

    const [rows] = await mysqlPool.promise().execute(
      "SELECT COUNT(*) as total FROM documents WHERE collection_id = ? AND project_id = ?",
      [sanitizedCollectionId, sanitizedProjectId]
    );

    return rows[0].total;
  },

  async findAllByCollectionId(collectionId, projectId) {
    const sanitizedCollectionId = collectionId.trim();
    const sanitizedProjectId = projectId.toString().trim();

    const [rows] = await mysqlPool.promise().execute(
      "SELECT * FROM documents WHERE collection_id = ? AND project_id = ?",
      [sanitizedCollectionId, sanitizedProjectId]
    );

    return rows.map(doc => ({
      id: doc.id,
      collection_id: doc.collection_id,
      data: JSON.parse(doc.data),
      created_at: doc.created_at,
      project_id: doc.project_id
    }));
  },

  async updateById(id, projectId, data) {
    const sanitizedDocumentId = id.trim();
    const sanitizedProjectId = projectId.toString().trim();

    const [existingDocRows] = await mysqlPool.promise().execute(
      "SELECT collection_id FROM documents WHERE id = ? AND project_id = ?",
      [sanitizedDocumentId, sanitizedProjectId]
    );

    if (existingDocRows.length === 0) {
      return { notFound: true };
    }

    const [result] = await mysqlPool.promise().execute(
      "UPDATE documents SET data = ? WHERE id = ? AND project_id = ?",
      [JSON.stringify(data), sanitizedDocumentId, sanitizedProjectId]
    );

    if (result.affectedRows === 0) {
      return { notFound: true };
    }

    const [updatedDocRows] = await mysqlPool.promise().execute(
      "SELECT * FROM documents WHERE id = ? AND project_id = ?",
      [sanitizedDocumentId, sanitizedProjectId]
    );

    return { updated: updatedDocRows[0] };
  },

  async deleteById(id, projectId) {
    const sanitizedDocumentId = id.trim();
    const sanitizedProjectId = projectId.toString().trim();

    const [result] = await mysqlPool.promise().execute(
      "DELETE FROM documents WHERE id = ? AND project_id = ?",
      [sanitizedDocumentId, sanitizedProjectId]
    );

    if (result.affectedRows === 0) {
      return { notFound: true };
    }

    return { deleted: true };
  },
};
