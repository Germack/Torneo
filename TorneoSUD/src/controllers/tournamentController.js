import { query } from '../db/connection.js';

export async function getTournament(req, res) {
  try {
    const result = await query('SELECT * FROM tournaments LIMIT 1;');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró torneo configurado' });
    }
    const t = result.rows[0];
    res.json({
      id: t.id,
      name: t.name,
      edition: t.edition,
      category: t.category,
      season: t.season,
      status: t.status,
      startDate: t.start_date ? t.start_date.toISOString().split('T')[0] : '',
      endDate: t.end_date ? t.end_date.toISOString().split('T')[0] : '',
      venue: t.venue,
      organizer: t.organizer,
      prize: t.prize,
      rules: t.rules,
      bannerUrl: t.banner_url
    });
  } catch (err) {
    console.error('Error al obtener torneo:', err);
    res.status(500).json({ error: 'Error interno del servidor al consultar el torneo' });
  }
}

export async function updateTournament(req, res) {
  try {
    const { name, edition, category, season, status, startDate, endDate, venue, organizer, prize, rules } = req.body;

    // Verificar permisos en headers simulados (o permitir si viene especificado)
    const userRole = req.headers['x-user-role'];
    if (userRole === 'REPRESENTANTE') {
      return res.status(403).json({ error: 'El rol Representante no tiene permisos para modificar los datos del torneo.' });
    }

    const updateSql = `
      UPDATE tournaments 
      SET 
        name = COALESCE($1, name),
        edition = COALESCE($2, edition),
        category = COALESCE($3, category),
        season = COALESCE($4, season),
        status = COALESCE($5, status),
        start_date = COALESCE($6, start_date),
        end_date = COALESCE($7, end_date),
        venue = COALESCE($8, venue),
        organizer = COALESCE($9, organizer),
        prize = COALESCE($10, prize),
        rules = COALESCE($11, rules),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await query(updateSql, [
      name, edition, category, season, status, startDate || null, endDate || null, venue, organizer, prize, rules
    ]);

    const t = result.rows[0];
    res.json({
      message: 'Torneo actualizado exitosamente en Neon',
      tournament: {
        id: t.id,
        name: t.name,
        edition: t.edition,
        category: t.category,
        season: t.season,
        status: t.status,
        startDate: t.start_date ? t.start_date.toISOString().split('T')[0] : '',
        endDate: t.end_date ? t.end_date.toISOString().split('T')[0] : '',
        venue: t.venue,
        organizer: t.organizer,
        prize: t.prize,
        rules: t.rules
      }
    });
  } catch (err) {
    console.error('Error al actualizar torneo:', err);
    res.status(500).json({ error: 'Error al actualizar torneo en Neon' });
  }
}
