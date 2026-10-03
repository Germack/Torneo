-- Esquema de Base de Datos para TorneoSUD en Neon PostgreSQL

CREATE TABLE IF NOT EXISTS tournaments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  edition VARCHAR(100),
  category VARCHAR(100),
  season VARCHAR(50),
  status VARCHAR(50) DEFAULT 'En Curso',
  start_date DATE,
  end_date DATE,
  venue VARCHAR(255),
  organizer VARCHAR(255),
  prize TEXT,
  rules TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  short_name VARCHAR(10) NOT NULL,
  color VARCHAR(30),
  secondary_color VARCHAR(30),
  shield VARCHAR(20),
  stadium VARCHAR(150),
  representative VARCHAR(150),
  coach VARCHAR(150),
  founded VARCHAR(20),
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  dorsal INT NOT NULL,
  position VARCHAR(10) NOT NULL,
  team_id VARCHAR(50) REFERENCES teams(id) ON DELETE CASCADE,
  age INT,
  status VARCHAR(50) DEFAULT 'Habilitado',
  goals INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  matches_played INT DEFAULT 0,
  avatar TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(50) PRIMARY KEY,
  matchday INT NOT NULL,
  home_team_id VARCHAR(50) REFERENCES teams(id),
  away_team_id VARCHAR(50) REFERENCES teams(id),
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  match_date DATE,
  match_time VARCHAR(20),
  stadium VARCHAR(150),
  referee VARCHAR(150),
  status VARCHAR(50) DEFAULT 'Programado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_incidents (
  id SERIAL PRIMARY KEY,
  match_id VARCHAR(50) REFERENCES matches(id) ON DELETE CASCADE,
  minute INT NOT NULL,
  type VARCHAR(30) NOT NULL,
  player_name VARCHAR(150) NOT NULL,
  team_id VARCHAR(50) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS requests (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  team_id VARCHAR(50) REFERENCES teams(id) ON DELETE SET NULL,
  team_name VARCHAR(150),
  applicant_id VARCHAR(50),
  applicant_name VARCHAR(150),
  applicant_role VARCHAR(50),
  status VARCHAR(30) DEFAULT 'PENDIENTE',
  description TEXT,
  proposed_player JSONB,
  resolution_note TEXT,
  resolved_by VARCHAR(150),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  -- Datos personales
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash TEXT,
  phone VARCHAR(30),
  birth_date DATE,
  cedula_miembro VARCHAR(20),
  barrio VARCHAR(100),
  -- Para menores de edad (16-17 años)
  guardian_name VARCHAR(150),
  guardian_phone VARCHAR(30),
  -- Campos legacy (compatibilidad)
  name VARCHAR(150),
  -- Rol y estado
  role VARCHAR(50) NOT NULL DEFAULT 'REPRESENTANTE',
  approval_status VARCHAR(30) DEFAULT 'APROBADO',
  -- Vinculación al equipo
  team_id VARCHAR(50),
  team_name VARCHAR(150),
  avatar TEXT,
  title VARCHAR(150),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

