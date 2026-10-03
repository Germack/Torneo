import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { query } from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: '*', // Permitir peticiones desde el frontend de React (localhost:5173) y cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Root / Dashboard informativo
app.get('/', async (req, res) => {
  try {
    const dbTest = await query('SELECT NOW() as server_time, current_database() as db_name;');
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>TorneoSUD API | Neon PostgreSQL</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Outfit', sans-serif; background: #0a0f1d; color: #f8fafc; padding: 40px; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; background: #121a2f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h1 { color: #10b981; font-size: 2rem; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
          .badge { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; border: 1px solid rgba(16, 185, 129, 0.3); }
          .endpoint-list { list-style: none; padding: 0; margin-top: 20px; }
          .endpoint-item { background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; font-family: monospace; font-size: 0.9rem; }
          .method-get { color: #60a5fa; font-weight: bold; }
          .method-post { color: #34d399; font-weight: bold; }
          .method-put { color: #fbbf24; font-weight: bold; }
          a { color: #38bdf8; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚽ TorneoSUD API <span class="badge">En Línea</span></h1>
          <p>Servidor backend conectado exitosamente a <strong>Neon Serverless PostgreSQL</strong> (${dbTest.rows[0].db_name}).</p>
          <p style="font-size: 0.85rem; color: #94a3b8;">Hora del servidor Neon: ${dbTest.rows[0].server_time}</p>
          
          <h3 style="margin-top: 24px;">Endpoints REST Disponibles:</h3>
          <ul class="endpoint-list">
            <li class="endpoint-item"><span><span class="method-get">GET</span> /api/health</span> <span>Estado del servicio</span></li>
            <li class="endpoint-item"><span><span class="method-get">GET</span> <a href="/api/tournament">/api/tournament</a></span> <span>Datos del torneo</span></li>
            <li class="endpoint-item"><span><span class="method-put">PUT</span> /api/tournament</span> <span>Editar torneo (Admin/Comité)</span></li>
            <li class="endpoint-item"><span><span class="method-get">GET</span> <a href="/api/teams">/api/teams</a></span> <span>Listado de clubes</span></li>
            <li class="endpoint-item"><span><span class="method-post">POST</span> /api/teams</span> <span>Crear club (Admin)</span></li>
            <li class="endpoint-item"><span><span class="method-get">GET</span> <a href="/api/players">/api/players</a></span> <span>Plantel de jugadores</span></li>
            <li class="endpoint-item"><span><span class="method-put">PUT</span> /api/players/:id</span> <span>Editar jugador (Admin/Comité)</span></li>
            <li class="endpoint-item"><span><span class="method-get">GET</span> <a href="/api/matches">/api/matches</a></span> <span>Calendario y actas</span></li>
            <li class="endpoint-item"><span><span class="method-put">PUT</span> /api/matches/:id</span> <span>Editar partido (Admin/Comité)</span></li>
            <li class="endpoint-item"><span><span class="method-get">GET</span> <a href="/api/requests">/api/requests</a></span> <span>Solicitudes de equipos</span></li>
            <li class="endpoint-item"><span><span class="method-post">POST</span> /api/requests</span> <span>Crear solicitud (Representante)</span></li>
            <li class="endpoint-item"><span><span class="method-put">PUT</span> /api/requests/:id/resolve</span> <span>Dictamen (Admin/Comité)</span></li>
          </ul>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).json({ error: 'Error conectando con Neon', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor TorneoSUD corriendo en: http://localhost:${PORT}`);
  console.log(`💾 Base de datos: Neon PostgreSQL (morning-rice-16295130)`);
  console.log(`=======================================================`);
});
