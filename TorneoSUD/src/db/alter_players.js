import { query } from './connection.js';

const alterTable = async () => {
  try {
    await query('ALTER TABLE players ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(150), ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(30);');
    console.log("Columnas agregadas");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
alterTable();
