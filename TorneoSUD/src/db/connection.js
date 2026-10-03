import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: No se encontró DATABASE_URL en el archivo .env");
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper para ejecutar consultas SQL
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('Consulta ejecutada:', { text: text.substring(0, 50), duration: `${duration}ms`, rows: res.rowCount });
  return res;
}
