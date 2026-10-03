import { Router } from 'express';
import { getTournament, updateTournament } from '../controllers/tournamentController.js';
import { getTeams, createTeam, deleteTeam, updateTeam } from '../controllers/teamsController.js';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../controllers/playersController.js';
import { getMatches, createMatch, updateMatch, deleteMatches } from '../controllers/matchesController.js';
import { getRequests, createRequest, resolveRequest } from '../controllers/requestsController.js';
import { runMigrationsAndSeed } from '../db/seed.js';
import {
  registerUser,
  loginUser,
  getUsers,
  updateUserApproval,
  updateUserRole,
  migrateUsersTable
} from '../controllers/authController.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'TorneoSUD Backend API',
    database: 'Neon PostgreSQL (Connected)',
    timestamp: new Date().toISOString()
  });
});

// Seed / Reset Database endpoint
router.post('/seed', async (req, res) => {
  try {
    await runMigrationsAndSeed();
    res.json({ message: 'Base de datos en Neon restablecida y sembrada con éxito' });
  } catch (err) {
    console.error('Error en seed:', err);
    res.status(500).json({ error: 'Error al reiniciar la base de datos' });
  }
});

// Roles info endpoint
router.get('/roles', (req, res) => {
  res.json({
    ADMIN: {
      name: 'Administrador',
      permissions: ['ALL_PERMISSIONS', 'edit_tournament', 'edit_matches', 'edit_players', 'create_matches', 'create_teams', 'create_requests', 'resolve_requests']
    },
    COMITE: {
      name: 'Comité Organizador / Disciplinario',
      permissions: ['view_all', 'edit_tournament', 'edit_matches', 'edit_players', 'create_requests', 'resolve_requests']
    },
    REPRESENTANTE: {
      name: 'Representante / Jugador',
      permissions: ['view_all', 'create_requests']
    }
  });
});

// --- Rutas del Torneo ---
router.get('/tournament', getTournament);
router.put('/tournament', updateTournament); // Admin y Comité

// --- Rutas de Equipos ---
router.get('/teams', getTeams);
router.post('/teams', createTeam); // Admin
router.put('/teams/:id', updateTeam); // Admin
router.delete('/teams/:id', deleteTeam); // Admin

// --- Rutas de Jugadores ---
router.get('/players', getPlayers);
router.post('/players', createPlayer); // Admin y Comité
router.put('/players/:id', updatePlayer); // Admin y Comité
router.delete('/players/:id', deletePlayer); // Admin

// --- Rutas de Partidos ---
router.get('/matches', getMatches);
router.post('/matches', createMatch); // Admin
router.put('/matches/:id', updateMatch); // Admin y Comité
router.delete('/matches', deleteMatches); // Admin

// --- Rutas de Solicitudes (Especial Representante / Jugador) ---
router.get('/requests', getRequests);
router.post('/requests', createRequest); // Representante, Comité, Admin
router.put('/requests/:id/resolve', resolveRequest); // Admin y Comité

// --- Rutas de Autenticación ---
router.post('/auth/register', registerUser);          // Crear nuevo usuario
router.post('/auth/login', loginUser);                // Iniciar sesión
router.get('/auth/users', getUsers);                  // Listar usuarios (Admin)
router.put('/auth/users/:id/approve', updateUserApproval); // Aprobar/rechazar (Admin)
router.put('/auth/users/:id/role', updateUserRole);   // Cambiar rol (Admin)
router.post('/auth/migrate', migrateUsersTable);      // Migración de tabla (Admin)

export default router;

