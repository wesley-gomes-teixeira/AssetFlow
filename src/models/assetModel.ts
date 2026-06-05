export {};
const pool = require("../config/db");

async function getAllAssets() {
  const result = await pool.query("SELECT * FROM assets ORDER BY id");
  return result.rows;
}

async function getAssetById(id: number) {
  const result = await pool.query("SELECT * FROM assets WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function createAsset(asset: { name: string; type: string; status: string; userId: number | null }) {
  const result = await pool.query(
    'INSERT INTO assets (name, type, status, "userId") VALUES ($1, $2, $3, $4) RETURNING *',
    [asset.name, asset.type, asset.status, asset.userId]
  );
  return result.rows[0];
}

async function updateAsset(id: number, updates: { name?: string; type?: string; status?: string; userId?: number | null }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex++;
  }
  if (updates.type !== undefined) {
    fields.push(`type = $${paramIndex}`);
    values.push(updates.type);
    paramIndex++;
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }
  if (updates.userId !== undefined) {
    fields.push(`"userId" = $${paramIndex}`);
    values.push(updates.userId);
    paramIndex++;
  }

  if (fields.length === 0) return null;

  values.push(id);
  const query = `UPDATE assets SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function deleteAsset(id: number) {
  const result = await pool.query("DELETE FROM assets WHERE id = $1 RETURNING *", [id]);
  return result.rows[0] || null;
}

async function getAssetsByUserId(userId: number) {
  const result = await pool.query('SELECT * FROM assets WHERE "userId" = $1 ORDER BY id', [userId]);
  return result.rows;
}

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetsByUserId
};
