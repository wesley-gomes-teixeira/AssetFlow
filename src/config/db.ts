export {};
const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.DB_HOST || process.env.PGHOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || process.env.PGPORT) || 5432,
      user: process.env.DB_USER || process.env.PGUSER || "postgres",
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || "postgres",
      database: process.env.DB_NAME || process.env.PGDATABASE || "assetflow"
    });

async function waitForDatabase(maxRetries = 15, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      console.log("✓ Banco de dados conectado com sucesso");
      return;
    } catch (error) {
      console.log(`Aguardando banco de dados (${attempt}/${maxRetries})...`);

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function initializeDatabase(): Promise<void> {
  await waitForDatabase();

  // Tabela de usuários
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL DEFAULT '',
      role VARCHAR(30) NOT NULL DEFAULT 'analyst'
    )
  `);

  // Tabela de ativos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      type VARCHAR(100) NOT NULL,
      status VARCHAR(100) NOT NULL,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Tabela de chamados
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(100) NOT NULL,
      "assetId" INTEGER REFERENCES assets(id) ON DELETE SET NULL
    )
  `);
}

module.exports = pool;
module.exports.initializeDatabase = initializeDatabase;
