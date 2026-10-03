import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';
import { pool, query } from './connection.js';

// Helper: genera hash salado para contraseñas (salt:sha256(password+salt))
function makePasswordHash(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrationsAndSeed() {
  console.log('--- Iniciando Migración y Carga de Datos en Neon PostgreSQL ---');

  // 1. Ejecutar Schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await query(schemaSql);
  console.log('✓ Tablas creadas / verificadas en Neon');

  // 2. Limpiar datos existentes (respetando llaves foráneas)
  await query('TRUNCATE match_incidents, requests, players, matches, teams, tournaments, users CASCADE;');
  console.log('✓ Tablas vaciadas para carga limpia');

  // 3. Insertar Torneo
  const tournamentSql = `
    INSERT INTO tournaments (
      id, name, edition, category, season, status, start_date, end_date, venue, organizer, prize, rules, banner_url
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    );
  `;
  await query(tournamentSql, [
    'trn_2026_1',
    'Copa de Campeones Metropolitana 2026',
    'X Edición Oficial - Clausura',
    'Primera División Libre',
    '2026-I',
    'En Curso',
    '2026-03-01',
    '2026-06-28',
    'Complejo Deportivo Central & Estadio Olímpico',
    'Asociación Metropolitana de Fútbol',
    '$5,000 USD + Trofeo Dorado y Medallas de Honor',
    'Partidos de 2 tiempos de 45 minutos. Máximo 5 cambios en 3 ventanas. Dos tarjetas amarillas acumulan suspensión de un partido. Tarjeta roja directa genera mínimo un partido de sanción y revisión del comité.',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80'
  ]);
  console.log('✓ Torneo insertado');

  // 4. Insertar Equipos
  const teams = [
    ['eq_1', 'Los Galácticos FC', 'GAL', '#06b6d4', '#0891b2', '⚡', 'Arena Galáctica (Césped Natural)', 'Carlos Mendoza', 'Marcelo Bielsa Jr.', '2018', 'Zona Norte'],
    ['eq_2', 'Real Titanes', 'TIT', '#f59e0b', '#d97706', '🛡️', 'Coliseo Titán (Sintético FIFA)', 'Andrés Silva', 'Javier Aguirre G.', '2015', 'Distrito Central'],
    ['eq_3', 'Rayo Metropolitano', 'RAY', '#ef4444', '#b91c1c', '⚡', 'Estadio El Rayo (Césped Natural)', 'Diego Fernández', 'Jorge Sampaoli V.', '2019', 'Zona Poniente'],
    ['eq_4', 'Huracán del Norte', 'HUR', '#8b5cf6', '#6d28d9', '🌪️', 'Campo Los Vientos', 'Martín Gómez', 'Gabriel Milito S.', '2017', 'Altos del Norte'],
    ['eq_5', 'Sporting Centenario', 'SPO', '#10b981', '#047857', '🌟', 'Parque Centenario', 'Roberto Morales', 'Gustavo Alfaro M.', '2012', 'Sur Tradicional'],
    ['eq_6', 'Furia Roja CF', 'FUR', '#e11d48', '#9f1239', '🔥', 'Estadio El Volcán', 'Javier Paredes', 'Ernesto Valverde R.', '2020', 'Valle Oriente']
  ];

  for (const t of teams) {
    await query(`
      INSERT INTO teams (id, name, short_name, color, secondary_color, shield, stadium, representative, coach, founded, city)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
    `, t);
  }
  console.log(`✓ ${teams.length} equipos insertados`);

  // 5. Insertar Jugadores
  const players = [
    ['jug_1', 'Carlos Mendoza', 10, 'MED', 'eq_1', 27, 'Habilitado', 7, 1, 0, 4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Capitán y volante creativo del equipo.'],
    ['jug_2', 'Mateo Benítez', 9, 'DEL', 'eq_1', 24, 'Habilitado', 6, 2, 0, 4, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Delantero centro de área, goleador veloz.'],
    ['jug_3', 'Esteban Rivas', 1, 'POR', 'eq_1', 29, 'Habilitado', 0, 0, 0, 4, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'Portero titular con 2 vallas invictas.'],
    ['jug_4', 'Luciano Correa', 4, 'DEF', 'eq_1', 26, 'Suspendido', 1, 3, 1, 3, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'Suspendido por tarjeta roja directa en fecha 3.'],
    ['jug_5', 'Rodrigo De Paulis', 7, 'DEL', 'eq_2', 25, 'Habilitado', 8, 1, 0, 4, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'Líder actual de la tabla de goleo.'],
    ['jug_6', 'Hugo Santamaría', 5, 'DEF', 'eq_2', 28, 'Habilitado', 0, 2, 0, 4, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 'Defensa central líder en intercepciones.'],
    ['jug_7', 'Ignacio Barreto', 1, 'POR', 'eq_2', 31, 'Habilitado', 0, 0, 0, 4, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 'Capitán de Real Titanes.'],
    ['jug_8', 'Felipe Albarrán', 11, 'DEL', 'eq_3', 23, 'Habilitado', 5, 0, 0, 4, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'Extremo izquierdo veloz y habilidoso.'],
    ['jug_9', 'Samuel Obregón', 8, 'MED', 'eq_3', 26, 'En revisión', 2, 2, 0, 3, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', 'En revisión médica y disciplinaria por informe arbitral.'],
    ['jug_10', 'Bruno Quinteros', 9, 'DEL', 'eq_4', 28, 'Habilitado', 4, 1, 0, 4, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'Delantero potente de juego aéreo.'],
    ['jug_11', 'Tomás Villalba', 6, 'DEF', 'eq_4', 25, 'Habilitado', 1, 1, 0, 4, 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80', 'Lateral derecho con gran proyección ofensiva.'],
    ['jug_12', 'Joaquín Navarrete', 10, 'MED', 'eq_5', 30, 'Habilitado', 3, 2, 0, 4, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80', 'Veterano creador de juego y especialista en tiros libres.'],
    ['jug_13', 'Darío Valenzuela', 9, 'DEL', 'eq_6', 22, 'Habilitado', 4, 1, 0, 4, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Joven promesa del torneo.']
  ];

  for (const p of players) {
    await query(`
      INSERT INTO players (id, name, dorsal, position, team_id, age, status, goals, yellow_cards, red_cards, matches_played, avatar, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
    `, p);
  }
  console.log(`✓ ${players.length} jugadores insertados`);

  // 6. Insertar Partidos
  const matches = [
    ['mat_1', 1, 'eq_1', 'eq_2', 3, 2, '2026-03-07', '16:00', 'Estadio Olímpico - Cancha 1', 'Fernando Guerrero R.', 'Finalizado'],
    ['mat_2', 1, 'eq_3', 'eq_4', 1, 1, '2026-03-07', '18:30', 'Complejo Deportivo - Cancha Norte', 'César Arturo Ramos', 'Finalizado'],
    ['mat_3', 1, 'eq_5', 'eq_6', 2, 0, '2026-03-08', '10:00', 'Parque Centenario - Cancha A', 'Marco Antonio Ortiz', 'Finalizado'],
    ['mat_4', 2, 'eq_2', 'eq_3', 4, 1, '2026-03-14', '16:00', 'Coliseo Titán', 'Luis Enrique Santander', 'Finalizado'],
    ['mat_5', 2, 'eq_4', 'eq_5', 2, 2, '2026-03-14', '18:15', 'Campo Los Vientos', 'Diego Montaño', 'Finalizado'],
    ['mat_6', 2, 'eq_6', 'eq_1', 1, 3, '2026-03-15', '11:00', 'Estadio El Volcán', 'Adonai Escobedo', 'Finalizado'],
    ['mat_7', 3, 'eq_1', 'eq_4', 2, 1, '2026-03-21', '16:00', 'Arena Galáctica', 'Fernando Hernández', 'Finalizado'],
    ['mat_8', 3, 'eq_2', 'eq_6', 3, 1, '2026-03-21', '18:30', 'Coliseo Titán', 'Erick Yair Miranda', 'Finalizado'],
    ['mat_9', 3, 'eq_3', 'eq_5', 0, 0, '2026-03-22', '12:00', 'Estadio El Rayo', 'Víctor Cáceres', 'Programado'],
    ['mat_10', 4, 'eq_5', 'eq_1', 0, 0, '2026-03-28', '16:00', 'Parque Centenario', 'Por designar', 'Programado'],
    ['mat_11', 4, 'eq_6', 'eq_3', 0, 0, '2026-03-28', '18:30', 'Estadio El Volcán', 'Por designar', 'Programado'],
    ['mat_12', 4, 'eq_4', 'eq_2', 0, 0, '2026-03-29', '11:00', 'Campo Los Vientos', 'Por designar', 'Programado']
  ];

  for (const m of matches) {
    await query(`
      INSERT INTO matches (id, matchday, home_team_id, away_team_id, home_score, away_score, match_date, match_time, stadium, referee, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
    `, m);
  }
  console.log(`✓ ${matches.length} partidos insertados`);

  // 7. Insertar Incidencias de partidos
  const incidents = [
    ['mat_1', 14, 'GOL', 'Mateo Benítez', 'eq_1'],
    ['mat_1', 38, 'GOL', 'Rodrigo De Paulis', 'eq_2'],
    ['mat_1', 55, 'GOL', 'Carlos Mendoza', 'eq_1'],
    ['mat_1', 72, 'GOL', 'Rodrigo De Paulis', 'eq_2'],
    ['mat_1', 88, 'GOL', 'Carlos Mendoza', 'eq_1'],
    ['mat_1', 41, 'AMARILLA', 'Luciano Correa', 'eq_1'],
    ['mat_2', 22, 'GOL', 'Felipe Albarrán', 'eq_3'],
    ['mat_2', 65, 'GOL', 'Bruno Quinteros', 'eq_4'],
    ['mat_2', 79, 'AMARILLA', 'Samuel Obregón', 'eq_3'],
    ['mat_3', 30, 'GOL', 'Joaquín Navarrete', 'eq_5'],
    ['mat_3', 78, 'GOL', 'Joaquín Navarrete', 'eq_5'],
    ['mat_4', 10, 'GOL', 'Rodrigo De Paulis', 'eq_2'],
    ['mat_4', 25, 'GOL', 'Rodrigo De Paulis', 'eq_2'],
    ['mat_4', 50, 'GOL', 'Rodrigo De Paulis', 'eq_2'],
    ['mat_4', 63, 'GOL', 'Samuel Obregón', 'eq_3'],
    ['mat_4', 82, 'GOL', 'Hugo Santamaría', 'eq_2'],
    ['mat_7', 20, 'GOL', 'Carlos Mendoza', 'eq_1'],
    ['mat_7', 54, 'GOL', 'Bruno Quinteros', 'eq_4'],
    ['mat_7', 83, 'GOL', 'Mateo Benítez', 'eq_1'],
    ['mat_7', 89, 'ROJA', 'Luciano Correa', 'eq_1']
  ];

  for (const inc of incidents) {
    await query(`
      INSERT INTO match_incidents (match_id, minute, type, player_name, team_id)
      VALUES ($1, $2, $3, $4, $5);
    `, inc);
  }
  console.log(`✓ ${incidents.length} incidencias insertadas`);

  // 8. Insertar Solicitudes
  const requests = [
    [
      'sol_1',
      'Inscripción de refuerzo: Javier "Chicharito" Morales',
      'INSCRIPCION_JUGADOR',
      'eq_1',
      'Los Galácticos FC',
      'usr_representante',
      'Carlos Mendoza',
      'REPRESENTANTE',
      'APROBADA',
      'Solicito la inscripción formal del jugador Javier Morales como mediocampista ofensivo, adjuntando certificado médico y copia de identificación vigente para la Jornada 4 en adelante.',
      JSON.stringify({ name: 'Javier Morales', dorsal: 14, position: 'MED', age: 26 }),
      'Aprobada por el Comité Técnico en sesión ordinaria. Jugador debidamente federado y habilitado para jugar.',
      'Prof. Mariana Castro (Comité)',
      new Date('2026-03-19T14:15:00Z')
    ],
    [
      'sol_2',
      'Reprogramación de partido Jornada 4 vs Sporting Centenario',
      'CAMBIO_HORARIO',
      'eq_1',
      'Los Galácticos FC',
      'usr_representante',
      'Carlos Mendoza',
      'REPRESENTANTE',
      'PENDIENTE',
      'Por motivos de compromiso universitario de 5 jugadores clave el sábado por la tarde, solicitamos formalmente que el partido programado para el sábado 28 a las 16:00 se mueva al domingo 29 a las 10:00 AM en la misma sede.',
      null,
      '',
      '',
      null
    ],
    [
      'sol_3',
      'Apelación a sanción de 2 partidos de Luciano Correa',
      'APELACION_SANCION',
      'eq_1',
      'Los Galácticos FC',
      'usr_representante',
      'Carlos Mendoza',
      'REPRESENTANTE',
      'PENDIENTE',
      'Presentamos video del minuto 89 del partido contra Huracán del Norte donde se evidencia que el contacto no fue con fuerza desmedida sino una disputa limpia de balón.',
      null,
      '',
      '',
      null
    ]
  ];

  for (const r of requests) {
    await query(`
      INSERT INTO requests (
        id, title, type, team_id, team_name, applicant_id, applicant_name, applicant_role, status, description, proposed_player, resolution_note, resolved_by, resolved_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
    `, r);
  }
  console.log(`✓ ${requests.length} solicitudes insertadas`);

  // 9. Insertar Usuarios demo con credenciales de autenticación
  // Contraseñas: admin=admin123, comite=comite123, representante=rep123
  const usersData = [
    {
      id: 'usr_admin',
      firstName: 'Roberto', lastName: 'Varela',
      email: 'admin@torneosud.com', username: 'admin',
      password: 'admin123', phone: '+505 8888-0000',
      birthDate: '1980-05-15', role: 'ADMIN',
      approvalStatus: 'APROBADO',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Presidente de la Liga'
    },
    {
      id: 'usr_comite',
      firstName: 'Mariana', lastName: 'Castro',
      email: 'comite@torneosud.com', username: 'comite',
      password: 'comite123', phone: '+505 7777-0001',
      birthDate: '1985-08-20', role: 'COMITE',
      approvalStatus: 'APROBADO',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: 'Comisionada Técnica y Disciplinaria'
    },
    {
      id: 'usr_representante',
      firstName: 'Carlos', lastName: 'Mendoza',
      email: 'representante@torneosud.com', username: 'cmendoza',
      password: 'rep123', phone: '+505 6666-0002',
      birthDate: '1999-03-10', role: 'REPRESENTANTE',
      approvalStatus: 'APROBADO', teamId: 'eq_1', teamName: 'Los Galácticos FC',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      title: 'Representante y Capitán - Los Galácticos'
    }
  ];

  for (const u of usersData) {
    const passwordHash = makePasswordHash(u.password);
    await query(`
      INSERT INTO users (
        id, first_name, last_name, name, email, username, password_hash,
        phone, birth_date, role, approval_status, team_id, team_name, avatar, title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO NOTHING;
    `, [
      u.id, u.firstName, u.lastName, `${u.firstName} ${u.lastName}`,
      u.email, u.username, passwordHash,
      u.phone, u.birthDate, u.role, u.approvalStatus,
      u.teamId || null, u.teamName || null, u.avatar, u.title
    ]);
  }
  console.log(`✓ ${usersData.length} usuarios con credenciales insertados`);

  console.log('--- ¡Base de Datos en Neon Inicializada y Sembrada con Éxito! ---');
}

// Si se ejecuta directamente con node src/db/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runMigrationsAndSeed()
    .then(() => pool.end())
    .catch(err => {
      console.error('Error durante la migración:', err);
      pool.end();
      process.exit(1);
    });
}
