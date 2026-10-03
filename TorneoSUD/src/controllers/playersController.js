import { query } from '../db/connection.js';

export async function getPlayers(req, res) {
  try {
    const { teamId, status, position } = req.query;
    let sql = 'SELECT * FROM players WHERE 1=1';
    const params = [];

    if (teamId) {
      params.push(teamId);
      sql += ` AND team_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    if (position) {
      params.push(position);
      sql += ` AND position = $${params.length}`;
    }

    sql += ' ORDER BY goals DESC, dorsal ASC;';

    const result = await query(sql, params);
    const players = result.rows.map(p => ({
      id: p.id,
      name: p.name,
      dorsal: p.dorsal,
      position: p.position,
      teamId: p.team_id,
      age: p.age,
      status: p.status,
      goals: p.goals,
      yellowCards: p.yellow_cards,
      redCards: p.red_cards,
      matchesPlayed: p.matches_played,
      avatar: p.avatar,
      notes: p.notes,
      guardianName: p.guardian_name,
      guardianPhone: p.guardian_phone
    }));

    res.json(players);
  } catch (err) {
    console.error('Error al obtener jugadores:', err);
    res.status(500).json({ error: 'Error al consultar jugadores en Neon' });
  }
}

export async function createPlayer(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole === 'REPRESENTANTE') {
      return res.status(403).json({ error: 'El representante debe radicar una solicitud formal para inscribir jugadores.' });
    }

    const { name, dorsal, position, teamId, age, status, notes, guardianName, guardianPhone } = req.body;
    if (!name || !dorsal || !position || !teamId) {
      return res.status(400).json({ error: 'Nombre, dorsal, posición y equipo son obligatorios.' });
    }

    const id = `jug_${Date.now()}`;
    const insertSql = `
      INSERT INTO players (id, name, dorsal, position, team_id, age, status, avatar, notes, guardian_name, guardian_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const result = await query(insertSql, [
      id, name, dorsal, position, teamId, age || 22, status || 'Habilitado',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      notes || 'Registrado por administración',
      guardianName || null,
      guardianPhone || null
    ]);

    const p = result.rows[0];
    res.status(201).json({
      message: 'Jugador creado exitosamente',
      player: {
        id: p.id,
        name: p.name,
        dorsal: p.dorsal,
        position: p.position,
        teamId: p.team_id,
        age: p.age,
        status: p.status,
        goals: p.goals,
        yellowCards: p.yellow_cards,
        redCards: p.red_cards,
        matchesPlayed: p.matches_played || 0,
        avatar: p.avatar,
        notes: p.notes,
        guardianName: p.guardian_name,
        guardianPhone: p.guardian_phone
      }
    });
  } catch (err) {
    console.error('Error al crear jugador:', err);
    res.status(500).json({ error: 'Error al registrar jugador' });
  }
}

export async function updatePlayer(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.headers['x-user-role'];
    if (userRole === 'REPRESENTANTE') {
      return res.status(403).json({ error: 'Permiso denegado. Solo Admin y Comité pueden editar jugadores.' });
    }

    const { name, dorsal, position, age, status, goals, yellowCards, redCards, notes, guardianName, guardianPhone } = req.body;

    const updateSql = `
      UPDATE players
      SET 
        name = COALESCE($1, name),
        dorsal = COALESCE($2, dorsal),
        position = COALESCE($3, position),
        age = COALESCE($4, age),
        status = COALESCE($5, status),
        goals = COALESCE($6, goals),
        yellow_cards = COALESCE($7, yellow_cards),
        red_cards = COALESCE($8, red_cards),
        notes = COALESCE($9, notes),
        guardian_name = COALESCE($10, guardian_name),
        guardian_phone = COALESCE($11, guardian_phone)
      WHERE id = $12
      RETURNING *;
    `;

    const result = await query(updateSql, [
      name, dorsal, position, age, status, goals, yellowCards, redCards, notes, guardianName, guardianPhone, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const p = result.rows[0];
    res.json({
      message: 'Ficha de jugador actualizada con éxito en Neon',
      player: {
        id: p.id,
        name: p.name,
        dorsal: p.dorsal,
        position: p.position,
        teamId: p.team_id,
        age: p.age,
        status: p.status,
        goals: p.goals,
        yellowCards: p.yellow_cards,
        redCards: p.red_cards,
        notes: p.notes,
        guardianName: p.guardian_name,
        guardianPhone: p.guardian_phone
      }
    });
  } catch (err) {
    console.error('Error al actualizar jugador:', err);
    res.status(500).json({ error: 'Error al actualizar jugador en Neon' });
  }
}

export async function deletePlayer(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el Administrador puede eliminar jugadores.' });
    }

    const deleteSql = 'DELETE FROM players WHERE id = $1 RETURNING id;';
    const result = await query(deleteSql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }

    res.json({ message: 'Jugador eliminado exitosamente.' });
  } catch (err) {
    console.error('Error al eliminar jugador:', err);
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
}
