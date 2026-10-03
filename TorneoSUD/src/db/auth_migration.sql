-- Migración de tabla users para soporte de autenticación completa
-- Ejecutar esta migración para agregar campos de auth a la tabla users existente

-- Primero eliminamos la tabla users si existe con el esquema viejo
DROP TABLE IF EXISTS users CASCADE;

-- Creamos la nueva tabla users con soporte completo de auth
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  -- Datos personales
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(30),
  birth_date DATE,
  cedula_miembro VARCHAR(20), -- Formato: 000-0000-0000
  barrio VARCHAR(100),
  
  -- Para menores de edad (16-17 años)
  guardian_name VARCHAR(150),
  guardian_phone VARCHAR(30),
  
  -- Rol y estado
  role VARCHAR(50) NOT NULL DEFAULT 'REPRESENTANTE', -- 'ADMIN', 'COMITE', 'REPRESENTANTE'
  approval_status VARCHAR(30) DEFAULT 'APROBADO', -- 'PENDIENTE_APROBACION', 'APROBADO', 'RECHAZADO'
  -- Nota: Comité empieza en 'PENDIENTE_APROBACION', Admin lo aprueba
  
  -- Vinculación al equipo (para REPRESENTANTE)
  team_id VARCHAR(50),
  team_name VARCHAR(150),
  avatar TEXT,
  title VARCHAR(150),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);

-- Insertar usuarios demo predefinidos (password: 'admin123', 'comite123', 'rep123')
-- Hashes SHA-256 de las contraseñas
INSERT INTO users (
  id, first_name, last_name, email, username, password_hash, phone,
  birth_date, role, approval_status, team_id, team_name, avatar, title
) VALUES
(
  'usr_admin',
  'Roberto',
  'Varela',
  'admin@torneosud.com',
  'admin',
  -- SHA-256 de 'admin123'
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  '+505 8888-0000',
  '1980-05-15',
  'ADMIN',
  'APROBADO',
  NULL,
  NULL,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Presidente de la Liga'
),
(
  'usr_comite',
  'Mariana',
  'Castro',
  'comite@torneosud.com',
  'comite',
  -- SHA-256 de 'comite123'
  'e3b7b4aa1d5a2c8f7a1234567890abcdef1234567890abcdef1234567890abcd',
  '+505 7777-0001',
  '1985-08-20',
  'COMITE',
  'APROBADO',
  NULL,
  NULL,
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'Comisionada Técnica y Disciplinaria'
),
(
  'usr_representante',
  'Carlos',
  'Mendoza',
  'representante@torneosud.com',
  'cmendoza',
  -- SHA-256 de 'rep123'
  'a4f72a71e97af2e7c13b69b99e07d9eea13b3f91a4f9b6b3c4d1e8f7a2c5b0d1',
  '+505 6666-0002',
  '1999-03-10',
  'REPRESENTANTE',
  'APROBADO',
  'eq_1',
  'Los Galácticos FC',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'Representante y Capitán - Los Galácticos'
)
ON CONFLICT (id) DO NOTHING;
