import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Award, 
  Edit3, 
  Lock, 
  CheckCircle, 
  FileText, 
  Users, 
  Zap,
  TrendingUp,
  X,
  Save
} from 'lucide-react';
import { ROLES, calculateStandings } from '../data/initialData';
import { api } from '../services/api';

export function TournamentView({ 
  tournament, 
  setTournament, 
  teams, 
  matches, 
  currentRole, 
  addToast,
  isEditModalOpen,
  setIsEditModalOpen 
}) {
  const [formData, setFormData] = useState({ ...tournament });

  // Can edit tournament: Administrador and Comité
  const canEditTournament = currentRole === ROLES.ADMIN || currentRole === ROLES.COMITE;

  const standings = calculateStandings(teams, matches);

  // Total stats
  const totalGoals = matches
    .filter(m => m.status === 'Finalizado')
    .reduce((acc, m) => acc + (Number(m.homeScore) || 0) + (Number(m.awayScore) || 0), 0);

  const completedMatches = matches.filter(m => m.status === 'Finalizado').length;

  const handleOpenEdit = () => {
    if (!canEditTournament) {
      addToast({
        type: 'error',
        title: 'Acceso Denegado',
        message: 'El rol Representante/Jugador solo tiene permisos de visualización en los datos del torneo.'
      });
      return;
    }
    setFormData({ ...tournament });
    setIsEditModalOpen(true);
  };

  const handleSaveTournament = async (e) => {
    e.preventDefault();
    if (!canEditTournament) return;

    try {
      const res = await api.updateTournament(formData, currentRole);
      if (res.error) throw new Error(res.error);

      setTournament(formData);
      setIsEditModalOpen(false);
      addToast({
        type: 'success',
        title: 'Torneo Actualizado',
        message: `Los datos del torneo fueron modificados por ${currentRole === ROLES.ADMIN ? 'el Administrador' : 'el Comité'}.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error al Guardar',
        message: err.message || 'Ocurrió un error al intentar guardar los datos del torneo.'
      });
    }
  };

  return (
    <div>
      {/* Hero Tournament Banner Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '45%',
          background: `linear-gradient(to left, rgba(16, 185, 129, 0.12), transparent)`,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-success">
                <span className="pulse-live" style={{ backgroundColor: '#10b981', marginRight: '4px' }}></span>
                {tournament.status}
              </span>
              <span className="badge badge-warning">
                <Award size={13} /> {tournament.category}
              </span>
              <span className="badge badge-neutral">
                {tournament.edition}
              </span>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '10px', color: '#fff' }}>
              {tournament.name}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.6 }}>
              {tournament.rules}
            </p>

            {/* Quick Details Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="#10b981" />
                <span>{tournament.venue}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="#3b82f6" />
                <span>{tournament.startDate} al {tournament.endDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={16} color="#f59e0b" />
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{tournament.prize}</span>
              </div>
            </div>
          </div>

          {/* Action button: Edit Tournament (Permiso: Admin y Comité) */}
          <div>
            {canEditTournament ? (
              <button 
                className="btn btn-primary" 
                onClick={handleOpenEdit}
                id="btn-edit-tournament"
              >
                <Edit3 size={16} />
                Editar Datos del Torneo
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled
                  title="Tu rol actual (Representante) no tiene permiso para editar datos del torneo"
                >
                  <Lock size={15} color="#94a3b8" />
                  Editar Torneo (Solo Admin / Comité)
                </button>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Modo solo lectura para Representante
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="metric-value">{teams.length}</div>
            <div className="metric-label">Clubes Inscritos</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="metric-value">{completedMatches} / {matches.length}</div>
            <div className="metric-label">Partidos Jugados</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Zap size={24} />
          </div>
          <div>
            <div className="metric-value">{totalGoals}</div>
            <div className="metric-label">Goles Marcados</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="metric-value">
              {completedMatches > 0 ? (totalGoals / completedMatches).toFixed(1) : '0'}
            </div>
            <div className="metric-label">Promedio Gol / Partido</div>
          </div>
        </div>
      </div>

      {/* Standings Table Section */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Trophy size={20} color="#f59e0b" />
              Tabla General de Posiciones
            </h2>
            <p className="section-desc">
              Puntos calculados en tiempo real a partir de los resultados oficiales de cada partido.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
              1° - 2°: Final Directa
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', marginLeft: '12px' }}>
              <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>
              3° - 4°: Liguilla Semifinal
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table" id="tabla-posiciones">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Pos</th>
                <th>Club / Equipo</th>
                <th style={{ textAlign: 'center' }}>PJ</th>
                <th style={{ textAlign: 'center' }}>PG</th>
                <th style={{ textAlign: 'center' }}>PE</th>
                <th style={{ textAlign: 'center' }}>PP</th>
                <th style={{ textAlign: 'center' }}>GF</th>
                <th style={{ textAlign: 'center' }}>GC</th>
                <th style={{ textAlign: 'center' }}>DG</th>
                <th style={{ textAlign: 'center', fontWeight: 800, color: 'var(--pitch-green-light)' }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((item, index) => {
                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
                return (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pos-rank ${rankClass}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{item.shield}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.shortName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.pj}</td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}>{item.pg}</td>
                    <td style={{ textAlign: 'center', color: '#fbbf24' }}>{item.pe}</td>
                    <td style={{ textAlign: 'center', color: '#f87171' }}>{item.pp}</td>
                    <td style={{ textAlign: 'center' }}>{item.gf}</td>
                    <td style={{ textAlign: 'center' }}>{item.gc}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: item.dg > 0 ? '#34d399' : item.dg < 0 ? '#f87171' : '#94a3b8' }}>
                      {item.dg > 0 ? `+${item.dg}` : item.dg}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, color: 'var(--pitch-green-light)' }}>
                      {item.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Tournament Modal (Only accessible by Admin and Comité) */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Edit3 size={20} color="#10b981" />
                Editar Datos del Torneo
              </div>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTournament}>
              <div className="modal-body">
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  border: '1px solid rgba(16, 185, 129, 0.2)', 
                  borderRadius: '8px', 
                  padding: '10px 14px', 
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  color: 'var(--pitch-green-light)'
                }}>
                  Estás editando como <strong>{currentRole === ROLES.ADMIN ? 'Administrador (Todos los permisos)' : 'Comité (Permiso de editar datos del torneo)'}</strong>.
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre Oficial del Torneo</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Edición</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.edition}
                      onChange={e => setFormData({ ...formData, edition: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Fecha de Inicio</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha de Finalización</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Sede / Complejo Deportivo</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.venue}
                      onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado del Torneo</label>
                    <select 
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Planificación">Planificación</option>
                      <option value="En Curso">En Curso</option>
                      <option value="Fase Eliminatoria">Fase Eliminatoria</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Premio Oficial</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.prize}
                    onChange={e => setFormData({ ...formData, prize: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reglamento y Normativa Disciplinaria</label>
                  <textarea 
                    className="form-textarea" 
                    rows={4}
                    value={formData.rules}
                    onChange={e => setFormData({ ...formData, rules: e.target.value })}
                  />
                  <div className="form-help">
                    Describe las condiciones de juego, tarjetas amarillas/rojas y criterios de desempate.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  Guardar Cambios del Torneo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
