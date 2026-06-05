export {};
const pool = require("../config/db");

async function getAllTickets() {
  const result = await pool.query("SELECT * FROM tickets ORDER BY id");
  return result.rows;
}

async function getTicketById(id: number) {
  const result = await pool.query("SELECT * FROM tickets WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function createTicket(ticket: { title: string; description: string; status: string; assetId: number | null }) {
  const result = await pool.query(
    'INSERT INTO tickets (title, description, status, "assetId") VALUES ($1, $2, $3, $4) RETURNING *',
    [ticket.title, ticket.description, ticket.status, ticket.assetId]
  );
  return result.rows[0];
}

async function updateTicket(id: number, updates: { title?: string; description?: string; status?: string; assetId?: number | null }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex}`);
    values.push(updates.title);
    paramIndex++;
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    values.push(updates.description);
    paramIndex++;
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }
  if (updates.assetId !== undefined) {
    fields.push(`"assetId" = $${paramIndex}`);
    values.push(updates.assetId);
    paramIndex++;
  }

  if (fields.length === 0) return null;

  values.push(id);
  const query = `UPDATE tickets SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function deleteTicket(id: number) {
  const result = await pool.query("DELETE FROM tickets WHERE id = $1 RETURNING *", [id]);
  return result.rows[0] || null;
}

async function getTicketsByAssetId(assetId: number) {
  const result = await pool.query('SELECT * FROM tickets WHERE "assetId" = $1 ORDER BY id', [assetId]);
  return result.rows;
}

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketsByAssetId
};
