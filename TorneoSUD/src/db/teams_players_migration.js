import { query } from './connection.js';

const runMigration = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS teams (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      short_name VARCHAR(10),
      color VARCHAR(20),
      secondary_color VARCHAR(20),
      shield TEXT,
      stadium VARCHAR(150),
      representative VARCHAR(150),
      coach VARCHAR(150),
      founded VARCHAR(10),
      city VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS players (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      dorsal INT,
      position VARCHAR(20),
      team_id VARCHAR(50) REFERENCES teams(id) ON DELETE CASCADE,
      age INT,
      status VARCHAR(50) DEFAULT 'Habilitado',
      goals INT DEFAULT 0,
      yellow_cards INT DEFAULT 0,
      red_cards INT DEFAULT 0,
      matches_played INT DEFAULT 0,
      avatar TEXT,
      notes TEXT,
      guardian_name VARCHAR(150),
      guardian_phone VARCHAR(30),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await query(sql);
    console.log("Migration executed successfully.");
    process.exit(0);
  } catch (e) {
    console.error("Migration failed", e);
    process.exit(1);
  }
};
runMigration();
