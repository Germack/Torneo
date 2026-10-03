import { query } from '../db/connection.js';

export async function getMatches(req, res) {
  try {
    const { matchday, status } = req.query;
    let sql = 'SELECT * FROM matches WHERE 1=1';
    const params = [];

    if (matchday) {
      params.push(matchday);
      sql += ` AND matchday = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ' ORDER BY matchday ASC, match_date ASC, match_time ASC;';

    const matchesRes = await query(sql, params);
    const incidentsRes = await query('SELECT * FROM match_incidents ORDER BY minute ASC;');

    const incidentsByMatch = {};
    incidentsRes.rows.forEach(inc => {
      if (!incidentsByMatch[inc.match_id]) incidentsByMatch[inc.match_id] = [];
      incidentsByMatch[inc.match_id].push({
        id: inc.id,
        min: inc.minute,
        type: inc.type,
        player: inc.player_name,
        playerId: inc.player_id,
        teamId: inc.team_id
      });
    });

    const matches = matchesRes.rows.map(m => ({
      id: m.id,
      matchday: m.matchday,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeScore: m.home_score,
      awayScore: m.away_score,
      date: m.match_date ? m.match_date.toISOString().split('T')[0] : '',
      time: m.match_time,
      stadium: m.stadium,
      referee: m.referee,
      status: m.status,
      incidents: incidentsByMatch[m.id] || []
    }));

    res.json(matches);
  } catch (err) {
    console.error('Error al obtener partidos:', err);
    res.status(500).json({ error: 'Error al consultar partidos en Neon' });
  }
}

export async function createMatch(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el Administrador tiene permiso para programar nuevos partidos.' });
    }

    const { matchday, homeTeamId, awayTeamId, date, time, stadium, referee } = req.body;
    if (!matchday || !homeTeamId || !awayTeamId) {
      return res.status(400).json({ error: 'Jornada, equipo local y equipo visitante son obligatorios.' });
    }

    const id = `mat_${Date.now()}`;
    const insertSql = `
      INSERT INTO matches (id, matchday, home_team_id, away_team_id, home_score, away_score, match_date, match_time, stadium, referee, status)
      VALUES ($1, $2, $3, $4, 0, 0, $5, $6, $7, $8, 'Programado')
      RETURNING *;
    `;

    const result = await query(insertSql, [
      id, matchday, homeTeamId, awayTeamId, date || null, time || '16:00', stadium || 'Estadio Central', referee || 'Por designar'
    ]);

    const m = result.rows[0];
    res.status(201).json({
      message: 'Partido programado exitosamente en Neon',
      match: {
        id: m.id,
        matchday: m.matchday,
        homeTeamId: m.home_team_id,
        awayTeamId: m.away_team_id,
        homeScore: m.home_score,
        awayScore: m.away_score,
        date: m.match_date ? m.match_date.toISOString().split('T')[0] : '',
        time: m.match_time,
        stadium: m.stadium,
        referee: m.referee,
        status: m.status,
        incidents: []
      }
    });
  } catch (err) {
    console.error('Error al programar partido:', err);
    res.status(500).json({ error: 'Error al programar partido en Neon' });
  }
}

export async function updateMatch(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.headers['x-user-role'];
    if (userRole === 'REPRESENTANTE') {
      return res.status(403).json({ error: 'Permiso denegado. Solo Admin y Comité pueden editar datos de partidos.' });
    }

    const { homeScore, awayScore, status, matchday, date, time, stadium, referee, incidents } = req.body;

    const updateSql = `
      UPDATE matches
      SET 
        home_score = COALESCE($1, home_score),
        away_score = COALESCE($2, away_score),
        status = COALESCE($3, status),
        matchday = COALESCE($4, matchday),
        match_date = COALESCE($5, match_date),
        match_time = COALESCE($6, match_time),
        stadium = COALESCE($7, stadium),
        referee = COALESCE($8, referee)
      WHERE id = $9
      RETURNING *;
    `;

    const result = await query(updateSql, [
      homeScore, awayScore, status, matchday, date || null, time, stadium, referee, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    // Si vienen incidencias, actualizarlas
    if (Array.isArray(incidents)) {
      await query('DELETE FROM match_incidents WHERE match_id = $1;', [id]);
      for (const inc of incidents) {
        await query(`
          INSERT INTO match_incidents (match_id, minute, type, player_name, team_id, player_id)
          VALUES ($1, $2, $3, $4, $5, $6);
        `, [id, inc.min || 45, inc.type || 'GOL', inc.player || 'Jugador', inc.teamId, inc.playerId || null]);
      }
    }

    const m = result.rows[0];
    res.json({
      message: 'Datos del partido actualizados exitosamente en Neon',
      match: {
        id: m.id,
        homeScore: m.home_score,
        awayScore: m.away_score,
        status: m.status,
        stadium: m.stadium,
        referee: m.referee
      }
    });
  } catch (err) {
    console.error('Error al actualizar partido:', err);
    res.status(500).json({ error: 'Error al actualizar partido en Neon' });
  }
}

export async function deleteMatches(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Permiso denegado. Solo Admin puede borrar partidos masivamente.' });
    }

    const { matchday, all } = req.query;
    
    if (all === 'true') {
      await query('DELETE FROM match_incidents;');
      await query('DELETE FROM matches;');
      return res.json({ message: 'Todos los partidos han sido eliminados exitosamente.' });
    } else if (matchday) {
      await query('DELETE FROM match_incidents WHERE match_id IN (SELECT id FROM matches WHERE matchday = $1);', [matchday]);
      await query('DELETE FROM matches WHERE matchday = $1;', [matchday]);
      return res.json({ message: `Partidos de la jornada ${matchday} eliminados exitosamente.` });
    } else {
      return res.status(400).json({ error: 'Faltan parámetros: especifica all=true o matchday.' });
    }
  } catch (err) {
    console.error('Error al borrar partidos:', err);
    res.status(500).json({ error: 'Error al borrar partidos en Neon' });
  }
}
