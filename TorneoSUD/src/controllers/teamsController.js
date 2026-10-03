import { query } from '../db/connection.js';

export async function getTeams(req, res) {
  try {
    const result = await query('SELECT * FROM teams ORDER BY name ASC;');
    const teams = result.rows.map(t => ({
      id: t.id,
      name: t.name,
      shortName: t.short_name,
      color: t.color,
      secondaryColor: t.secondary_color,
      shield: t.shield,
      stadium: t.stadium,
      representative: t.representative,
      coach: t.coach,
      founded: t.founded,
      city: t.city
    }));
    res.json(teams);
  } catch (err) {
    console.error('Error al listar equipos:', err);
    res.status(500).json({ error: 'Error al consultar equipos' });
  }
}

export async function createTeam(req, res) {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el Administrador puede registrar nuevos equipos.' });
    }

    const { name, shortName, color, secondaryColor, shield, stadium, representative, coach, founded, city } = req.body;
    if (!name || !shortName) {
      return res.status(400).json({ error: 'El nombre y la abreviatura del equipo son obligatorios.' });
    }

    const id = `eq_${Date.now()}`;
    const insertSql = `
      INSERT INTO teams (id, name, short_name, color, secondary_color, shield, stadium, representative, coach, founded, city)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const result = await query(insertSql, [
      id, name, shortName.toUpperCase(), color || '#10b981', secondaryColor || color || '#047857',
      shield || '⚽', stadium || 'Cancha Local', representative || 'Por designar', coach || 'Por designar',
      founded || '2026', city || 'Sede Central'
    ]);

    const t = result.rows[0];
    res.status(201).json({
      message: 'Equipo registrado con éxito en Neon',
      team: {
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        color: t.color,
        secondaryColor: t.secondary_color,
        shield: t.shield,
        stadium: t.stadium,
        representative: t.representative,
        coach: t.coach,
        founded: t.founded,
        city: t.city
      }
    });
  } catch (err) {
    console.error('Error al crear equipo:', err);
    res.status(500).json({ error: 'Error al registrar equipo' });
  }
}

export async function deleteTeam(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el Administrador puede eliminar equipos.' });
    }

    const deleteSql = 'DELETE FROM teams WHERE id = $1 RETURNING id;';
    const result = await query(deleteSql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }

    res.json({ message: 'Equipo eliminado exitosamente junto con sus jugadores.' });
  } catch (err) {
    console.error('Error al eliminar equipo:', err);
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
}

export async function updateTeam(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.headers['x-user-role'];
    if (userRole && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo el Administrador puede modificar equipos.' });
    }

    const { name, shortName, color, secondaryColor, shield, stadium, representative, coach, founded, city } = req.body;
    if (!name || !shortName) {
      return res.status(400).json({ error: 'El nombre y la abreviatura del equipo son obligatorios.' });
    }

    const updateSql = `
      UPDATE teams 
      SET name = $1, short_name = $2, color = $3, secondary_color = $4, shield = $5, stadium = $6, representative = $7, coach = $8, founded = $9, city = $10
      WHERE id = $11
      RETURNING *;
    `;

    const result = await query(updateSql, [
      name, shortName.toUpperCase(), color, secondaryColor, shield, stadium, representative, coach, founded, city, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }

    const t = result.rows[0];
    res.json({
      message: 'Equipo modificado con éxito',
      team: {
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        color: t.color,
        secondaryColor: t.secondary_color,
        shield: t.shield,
        stadium: t.stadium,
        representative: t.representative,
        coach: t.coach,
        founded: t.founded,
        city: t.city
      }
    });
  } catch (err) {
    console.error('Error al modificar equipo:', err);
    res.status(500).json({ error: 'Error al modificar equipo' });
  }
}
