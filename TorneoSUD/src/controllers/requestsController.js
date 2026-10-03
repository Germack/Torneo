import { query } from '../db/connection.js';

export async function getRequests(req, res) {
  try {
    const { status, teamId } = req.query;
    let sql = 'SELECT * FROM requests WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    if (teamId) {
      params.push(teamId);
      sql += ` AND team_id = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC;';

    const result = await query(sql, params);
    const requests = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      teamId: r.team_id,
      teamName: r.team_name,
      applicantId: r.applicant_id,
      applicantName: r.applicant_name,
      applicantRole: r.applicant_role,
      status: r.status,
      description: r.description,
      proposedPlayer: r.proposed_player,
      resolutionNote: r.resolution_note || '',
      resolvedBy: r.resolved_by || '',
      resolvedAt: r.resolved_at ? r.resolved_at.toISOString() : '',
      createdAt: r.created_at ? r.created_at.toISOString() : ''
    }));

    res.json(requests);
  } catch (err) {
    console.error('Error al listar solicitudes:', err);
    res.status(500).json({ error: 'Error al consultar solicitudes en Neon' });
  }
}

export async function createRequest(req, res) {
  try {
    const { title, type, teamId, teamName, applicantId, applicantName, applicantRole, description, proposedPlayer } = req.body;

    if (!title || !type || !description) {
      return res.status(400).json({ error: 'El título, tipo y descripción son obligatorios.' });
    }

    const id = `sol_${Date.now()}`;
    const insertSql = `
      INSERT INTO requests (
        id, title, type, team_id, team_name, applicant_id, applicant_name, applicant_role, status, description, proposed_player
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDIENTE', $9, $10)
      RETURNING *;
    `;

    const result = await query(insertSql, [
      id,
      title,
      type,
      teamId || null,
      teamName || 'Club Participante',
      applicantId || 'usr_representante',
      applicantName || 'Representante Oficial',
      applicantRole || 'REPRESENTANTE',
      description,
      proposedPlayer ? JSON.stringify(proposedPlayer) : null
    ]);

    const r = result.rows[0];
    res.status(201).json({
      message: 'Solicitud radicada con éxito en Neon',
      request: {
        id: r.id,
        title: r.title,
        type: r.type,
        status: r.status,
        createdAt: r.created_at
      }
    });
  } catch (err) {
    console.error('Error al crear solicitud:', err);
    res.status(500).json({ error: 'Error al registrar solicitud en Neon' });
  }
}

export async function resolveRequest(req, res) {
  try {
    const { id } = req.params;
    const { action, note, resolvedBy } = req.body; // action: 'APROBADA' or 'RECHAZADA'
    const userRole = req.headers['x-user-role'];

    if (userRole === 'REPRESENTANTE') {
      return res.status(403).json({ error: 'El rol Representante no tiene facultades para emitir dictámenes ni resolver solicitudes.' });
    }

    if (!action || !['APROBADA', 'RECHAZADA'].includes(action)) {
      return res.status(400).json({ error: 'La acción debe ser APROBADA o RECHAZADA.' });
    }

    // 1. Obtener la solicitud
    const reqRes = await query('SELECT * FROM requests WHERE id = $1;', [id]);
    if (reqRes.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    const currentReq = reqRes.rows[0];

    // 2. Si se aprueba y es inscripción de jugador, agregarlo a la tabla players
    let playerCreated = null;
    if (action === 'APROBADA' && currentReq.type === 'INSCRIPCION_JUGADOR' && currentReq.proposed_player) {
      const pData = typeof currentReq.proposed_player === 'string' 
        ? JSON.parse(currentReq.proposed_player) 
        : currentReq.proposed_player;

      const newPlayerId = `jug_${Date.now()}`;
      await query(`
        INSERT INTO players (id, name, dorsal, position, team_id, age, status, avatar, notes)
        VALUES ($1, $2, $3, $4, $5, $6, 'Habilitado', $7, $8)
      `, [
        newPlayerId,
        pData.name,
        pData.dorsal || 99,
        pData.position || 'MED',
        currentReq.team_id,
        pData.age || 22,
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        `Inscrito automáticamente tras aprobación de solicitud #${id}`
      ]);
      playerCreated = pData.name;
    }

    // 3. Actualizar la solicitud
    const updateSql = `
      UPDATE requests
      SET 
        status = $1,
        resolution_note = $2,
        resolved_by = $3,
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;

    const updated = await query(updateSql, [
      action,
      note || 'Dictamen emitido conforme a reglamento',
      resolvedBy || (userRole === 'ADMIN' ? 'Administrador General' : 'Comité Técnico'),
      id
    ]);

    const r = updated.rows[0];
    res.json({
      message: `Solicitud ${action} exitosamente`,
      playerRegistered: playerCreated,
      request: {
        id: r.id,
        title: r.title,
        status: r.status,
        resolutionNote: r.resolution_note,
        resolvedBy: r.resolved_by,
        resolvedAt: r.resolved_at
      }
    });
  } catch (err) {
    console.error('Error al resolver solicitud:', err);
    res.status(500).json({ error: 'Error al emitir dictamen en Neon' });
  }
}
