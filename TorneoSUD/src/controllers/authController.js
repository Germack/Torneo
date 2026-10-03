// Controlador de autenticación para TorneoSUD
// Maneja registro, login y gestión de usuarios
// Usa crypto nativo de Node.js (sin dependencias externas)

import { createHash, randomBytes } from 'crypto';
import { query } from '../db/connection.js';

// Helper para hashear contraseñas con salt
function hashPassword(password, salt = null) {
  const useSalt = salt || randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + useSalt).digest('hex');
  return { hash: `${useSalt}:${hash}`, salt: useSalt };
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    // Compatibilidad con hashes legacy sin salt
    const legacyHash = createHash('sha256').update(password).digest('hex');
    return legacyHash === storedHash;
  }
  const { hash: newHash } = hashPassword(password, salt);
  const [, computedHash] = newHash.split(':');
  return computedHash === hash;
}

// Calcular edad a partir de fecha de nacimiento
function calcAge(birthDateStr) {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ============================================================
// POST /api/auth/register
// Crear nuevo usuario
// ============================================================
export async function registerUser(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      phone,
      birthDate,
      cedula,
      barrio,
      role, // 'REPRESENTANTE' o 'COMITE' (ADMIN solo puede crearse desde la BD)
      guardianName,
      guardianPhone,
    } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben completarse.' });
    }

    if (!['REPRESENTANTE', 'COMITE'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Solo se permite REPRESENTANTE o COMITE.' });
    }

    // Validar que username y email no estén en uso
    const existingEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const existingUsername = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUsername.rows.length > 0) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
    }

    // Validar edad (mínimo 16 años)
    if (birthDate) {
      const age = calcAge(birthDate);
      if (age < 16) {
        return res.status(400).json({ error: 'Debes tener al menos 16 años para registrarte.' });
      }
      // Si tiene entre 16 y 17 años, el tutor es obligatorio
      if (age < 18 && (!guardianName || !guardianPhone)) {
        return res.status(400).json({ error: 'Para menores de 18 años, el nombre y teléfono del tutor legal son obligatorios.' });
      }
    }

    // Hashear contraseña con salt
    const { hash: passwordHash } = hashPassword(password);

    // Determinar estado de aprobación
    // Comité requiere aprobación del admin; Representante se aprueba automáticamente
    const approvalStatus = role === 'COMITE' ? 'PENDIENTE_APROBACION' : 'APROBADO';

    // Generar ID único
    const userId = `usr_${Date.now()}_${randomBytes(4).toString('hex')}`;

    // Título por defecto según rol
    const title = role === 'COMITE' ? 'Miembro del Comité (Pendiente)' : 'Representante / Jugador';

    await query(`
      INSERT INTO users (
        id, first_name, last_name, name, email, username, password_hash,
        phone, birth_date, cedula_miembro, barrio, role, approval_status,
        guardian_name, guardian_phone, title
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16
      )
    `, [
      userId, firstName, lastName, `${firstName} ${lastName}`, email, username, passwordHash,
      phone || null, birthDate || null, cedula || null, barrio || null,
      role, approvalStatus,
      guardianName || null, guardianPhone || null, title
    ]);

    const message = role === 'COMITE'
      ? 'Usuario creado exitosamente. Tu cuenta como miembro del Comité está pendiente de aprobación por el Administrador.'
      : 'Usuario creado exitosamente. Ya puedes iniciar sesión.';

    return res.status(201).json({
      success: true,
      message,
      requiresApproval: role === 'COMITE',
      userId
    });

  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error interno del servidor al registrar usuario.', details: err.message });
  }
}

// ============================================================
// POST /api/auth/login
// Autenticar usuario (username o email + password)
// ============================================================
export async function loginUser(req, res) {
  try {
    const { identifier, password } = req.body; // identifier = username o email

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Credenciales incompletas.' });
    }

    // Buscar por username o email
    const result = await query(`
      SELECT id, first_name, last_name, email, username, password_hash,
             phone, role, approval_status, team_id, team_name, avatar, title, cedula_miembro, barrio
      FROM users
      WHERE email = $1 OR username = $1
      LIMIT 1
    `, [identifier]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Verificar estado de aprobación
    if (user.approval_status === 'PENDIENTE_APROBACION') {
      return res.status(403).json({
        error: 'Tu cuenta está pendiente de aprobación por el Administrador.',
        approvalStatus: 'PENDIENTE_APROBACION'
      });
    }

    if (user.approval_status === 'RECHAZADO') {
      return res.status(403).json({
        error: 'Tu cuenta ha sido rechazada. Contacta al administrador.',
        approvalStatus: 'RECHAZADO'
      });
    }

    // Actualizar último login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generar token simple (sin JWT - usando base64 + timestamp)
    const tokenPayload = JSON.stringify({
      userId: user.id,
      role: user.role,
      ts: Date.now()
    });
    const token = Buffer.from(tokenPayload).toString('base64');

    // Retornar datos del usuario (sin password_hash)
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
        approvalStatus: user.approval_status,
        teamId: user.team_id,
        teamName: user.team_name,
        avatar: user.avatar,
        title: user.title,
        cedula: user.cedula_miembro,
        barrio: user.barrio
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor al autenticar.', details: err.message });
  }
}

// ============================================================
// GET /api/auth/users
// Listar todos los usuarios (solo Admin)
// ============================================================
export async function getUsers(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el administrador puede ver la lista de usuarios.' });
    }

    const result = await query(`
      SELECT id, first_name, last_name, email, username, phone, role,
             approval_status, team_id, team_name, avatar, title,
             cedula_miembro, barrio, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);

    const users = result.rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      username: u.username,
      phone: u.phone,
      role: u.role,
      approvalStatus: u.approval_status,
      teamId: u.team_id,
      teamName: u.team_name,
      avatar: u.avatar,
      title: u.title,
      cedula: u.cedula_miembro,
      barrio: u.barrio,
      createdAt: u.created_at,
      lastLogin: u.last_login
    }));

    return res.json(users);

  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return res.status(500).json({ error: 'Error interno.', details: err.message });
  }
}

// ============================================================
// PUT /api/auth/users/:id/approve
// Aprobar o rechazar cuenta de usuario (solo Admin)
// ============================================================
export async function updateUserApproval(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el administrador puede aprobar usuarios.' });
    }

    const { id } = req.params;
    const { approvalStatus, role } = req.body;

    if (!['APROBADO', 'RECHAZADO', 'PENDIENTE_APROBACION'].includes(approvalStatus)) {
      return res.status(400).json({ error: 'Estado de aprobación inválido.' });
    }

    let titleUpdate = null;
    if (approvalStatus === 'APROBADO' && role === 'COMITE') {
      titleUpdate = 'Miembro del Comité Técnico';
    }

    await query(`
      UPDATE users SET approval_status = $1, title = COALESCE($2, title)
      WHERE id = $3
    `, [approvalStatus, titleUpdate, id]);

    return res.json({ success: true, message: `Usuario ${approvalStatus === 'APROBADO' ? 'aprobado' : 'rechazado'} exitosamente.` });

  } catch (err) {
    console.error('Error al aprobar usuario:', err);
    return res.status(500).json({ error: 'Error interno.', details: err.message });
  }
}

// ============================================================
// PUT /api/auth/users/:id/role
// Cambiar rol de usuario (solo Admin)
// ============================================================
export async function updateUserRole(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el administrador puede cambiar roles.' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'COMITE', 'REPRESENTANTE'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido.' });
    }

    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);

    return res.json({ success: true, message: 'Rol actualizado exitosamente.' });

  } catch (err) {
    console.error('Error al cambiar rol:', err);
    return res.status(500).json({ error: 'Error interno.', details: err.message });
  }
}

// ============================================================
// POST /api/auth/migrate
// Ejecutar migración de tabla users (para agregar campos de auth)
// ============================================================
export async function migrateUsersTable(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el administrador puede ejecutar migraciones.' });
    }

    // Agregar columnas faltantes si no existen
    const alterations = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS cedula_miembro VARCHAR(20)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS barrio VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(150)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(30)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) DEFAULT 'APROBADO'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
      `CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status)`,
    ];

    for (const sql of alterations) {
      try { await query(sql); } catch (e) { /* ignorar si ya existe */ }
    }

    return res.json({ success: true, message: 'Migración completada.' });

  } catch (err) {
    console.error('Error en migración:', err);
    return res.status(500).json({ error: 'Error en migración.', details: err.message });
  }
}
