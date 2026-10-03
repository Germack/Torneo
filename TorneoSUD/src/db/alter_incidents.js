import { query } from './connection.js';
const alterTable = async () => {
  try {
    await query('ALTER TABLE match_incidents ADD COLUMN IF NOT EXISTS player_id VARCHAR(50);');
    console.log("Columna player_id agregada");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
alterTable();
