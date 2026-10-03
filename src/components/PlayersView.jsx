import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  ShieldAlert, 
  Edit3, 
  Lock, 
  X, 
  Save, 
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  User
} from 'lucide-react';
import { ROLES } from '../data/initialData';
import { api } from '../services/api';

export function PlayersView({ 
  players, 
  setPlayers, 
  teams, 
  matches, // Added to dynamically compute stats
  currentRole, 
  addToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [viewingPlayer, setViewingPlayer] = useState(null);

  // Permissions:
  // Admin and Comite have permission to edit player data
  const canEditPlayer = currentRole === ROLES.ADMIN || currentRole === ROLES.COMITE;
  // Only Admin has permission to delete players
  const canDeletePlayer = currentRole === ROLES.ADMIN;

  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });

  // Dynamically compute stats from matches
  const getPlayerStats = (player) => {
    let goals = 0;
    let yellowCards = 0;
    let redCards = 0;
    
    if (matches && matches.length > 0) {
      matches.forEach(m => {
        if (!m.incidents) return;
        m.incidents.forEach(inc => {
          // Check by ID if present, otherwise fallback to exact name match for legacy data
          if (inc.playerId === player.id || (!inc.playerId && inc.player === player.name)) {
            if (inc.type === 'GOL') goals++;
            if (inc.type === 'AMARILLA') yellowCards++;
            if (inc.type === 'ROJA') redCards++;
          }
        });
      });
    }

    return { 
      // If we found dynamic stats, use them. For matchesPlayed we keep the static one or calculate if needed.
      goals: goals > 0 ? goals : player.goals, 
      yellowCards: yellowCards > 0 ? yellowCards : player.yellowCards, 
      redCards: redCards > 0 ? redCards : player.redCards 
    };
  };

  const playersWithStats = players.map(p => ({
    ...p,
    ...getPlayerStats(p)
  }));

  // Top scorers (sorted by goals DESC, and strictly filtering valid teams)
  const topScorers = [...playersWithStats]
    .filter(p => teamMap[p.teamId]) // Ensure team exists
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  // Filtered players
  const filteredPlayers = playersWithStats.filter(player => {
    // Validar con los datos de los equipos: el jugador solo se muestra si su equipo existe
    if (!teamMap[player.teamId]) return false;

    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (player.dorsal && String(player.dorsal).includes(searchQuery));
    const matchesTeam = selectedTeamFilter === 'ALL' || player.teamId === selectedTeamFilter;
    const matchesPosition = selectedPositionFilter === 'ALL' || player.position === selectedPositionFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || player.status === selectedStatusFilter;

    return matchesSearch && matchesTeam && matchesPosition && matchesStatus;
  });

  const handleOpenEdit = (player) => {
    if (!canEditPlayer) {
      addToast({
        type: 'error',
        title: 'Permiso Denegado',
        message: 'El rol Representante/Jugador solo tiene permisos de visualización sobre las fichas de los jugadores.'
      });
      return;
    }
    setEditingPlayer({ ...player });
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!canEditPlayer || !editingPlayer) return;

    try {
      const res = await api.updatePlayer(editingPlayer.id, editingPlayer, currentRole);
      if (res.error) throw new Error(res.error);
      
      const updatedPlayer = res.player;
      setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
      setEditingPlayer(null);
      addToast({
        type: 'success',
        title: 'Jugador Actualizado',
        message: `La ficha de ${updatedPlayer.name} fue guardada exitosamente por ${currentRole === ROLES.ADMIN ? 'el Administrador' : 'el Comité'}.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Error al actualizar jugador'
      });
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!canDeletePlayer) return;
    if (window.confirm(`¿Estás seguro de eliminar permanentemente al jugador "${playerName}"? Esta acción no se puede deshacer.`)) {
      try {
        await api.deletePlayer(playerId, currentRole);
        setPlayers(prev => prev.filter(p => p.id !== playerId));
        addToast({
          type: 'success',
          title: 'Jugador Eliminado',
          message: `El jugador ${playerName} ha sido eliminado del sistema.`
        });
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Error',
          message: err.message || 'Error al eliminar jugador'
        });
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Users size={22} color="#10b981" />
            Nómina de Jugadores & Tabla de Goleadores
          </h2>
          <p className="section-desc">
            Consulta estadísticas individuales, tarjetas y estados de habilitación. {canEditPlayer ? 'Puedes editar dorsales, posiciones y aplicar sanciones.' : 'Modo lectura para Representante.'}
          </p>
        </div>
      </div>

      {/* Top Scorers Spotlight & Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Top Scorers Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <Award size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Líderes de Goleo (Bota de Oro)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topScorers.map((scorer, i) => {
              const team = teamMap[scorer.teamId];
              return (
                <div key={scorer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      background: i === 0 ? 'var(--gold-trophy)' : 'rgba(255,255,255,0.1)', 
                      color: i === 0 ? '#000' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      {i + 1}
                    </span>

                    <img 
                      src={scorer.avatar} 
                      alt={scorer.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                        {scorer.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        #{scorer.dorsal} • {team?.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--pitch-green-light)' }}>
                      ⚽ {scorer.goals}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      goles en {scorer.matchesPlayed} PJ
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disciplinary Summary Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <ShieldAlert size={20} color="#ef4444" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Control Disciplinario y Sanciones
            </h3>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Jugadores que requieren atención del Comité Disciplinario o se encuentran suspendidos:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {playersWithStats.filter(p => teamMap[p.teamId] && (p.status !== 'Habilitado' || p.yellowCards >= 2 || p.redCards >= 1)).map(p => {
              const team = teamMap[p.teamId];
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={p.avatar} 
                      alt={p.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                        {p.name} (#{p.dorsal})
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#f87171' }}>
                        {p.notes || `${team?.name}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className={`badge ${p.status === 'Suspendido' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      🟨 {p.yellowCards} | 🟥 {p.redCards}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Players Directory Filters */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '36px' }}
              placeholder="Buscar por nombre o dorsal..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Team filter */}
          <div>
            <select 
              className="form-select"
              value={selectedTeamFilter}
              onChange={e => setSelectedTeamFilter(e.target.value)}
            >
              <option value="ALL">Todos los Clubes</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Position filter */}
          <div>
            <select 
              className="form-select"
              value={selectedPositionFilter}
              onChange={e => setSelectedPositionFilter(e.target.value)}
            >
              <option value="ALL">Todas las Posiciones</option>
              <option value="POR">Portero (POR)</option>
              <option value="DEF">Defensa (DEF)</option>
              <option value="MED">Mediocampista (MED)</option>
              <option value="DEL">Delantero (DEL)</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select 
              className="form-select"
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Habilitado">Habilitado</option>
              <option value="Suspendido">Suspendido</option>
              <option value="En revisión">En revisión</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>Dorsal</th>
                <th>Jugador / Ficha</th>
                <th>Club</th>
                <th style={{ textAlign: 'center' }}>Posición</th>
                <th style={{ textAlign: 'center' }}>Edad</th>
                <th style={{ textAlign: 'center' }}>Goles</th>
                <th style={{ textAlign: 'center' }}>Tarjetas</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No se encontraron jugadores con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(player => {
                  const team = teamMap[player.teamId];
                  return (
                    <tr key={player.id}>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--pitch-green-light)', fontSize: '1.05rem' }}>
                        #{player.dorsal}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={player.avatar} 
                            alt={player.name}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{player.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{player.notes}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>{team?.shield}</span>
                          <span style={{ fontWeight: 600 }}>{team?.name}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-neutral">{player.position}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{player.age} años</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#34d399' }}>
                        ⚽ {player.goals}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#fbbf24', marginRight: '6px' }}>🟨 {player.yellowCards}</span>
                        <span style={{ color: '#f87171' }}>🟥 {player.redCards}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          player.status === 'Habilitado' ? 'badge-success' : 
                          player.status === 'Suspendido' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {player.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => setViewingPlayer(player)}
                            title="Ver detalles del jugador"
                            style={{ padding: '6px' }}
                          >
                            <Eye size={14} />
                          </button>

                          {canEditPlayer && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(player)}
                              title="Editar jugador"
                              style={{ padding: '6px' }}
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                          
                          {canDeletePlayer && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              title="Eliminar jugador"
                              style={{ padding: '6px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Player Modal (Admin and Comité only) */}
      {editingPlayer && (
        <div className="modal-overlay" onClick={() => setEditingPlayer(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Edit3 size={20} color="#10b981" />
                Editar Ficha del Jugador
              </div>
              <button className="modal-close-btn" onClick={() => setEditingPlayer(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlayer}>
              <div className="modal-body">
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.08)', 
                  border: '1px solid rgba(59, 130, 246, 0.25)', 
                  borderRadius: '8px', 
                  padding: '10px 14px', 
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  color: '#93c5fd'
                }}>
                  Editando como <strong>{currentRole === ROLES.ADMIN ? 'Administrador' : 'Comité (Permiso de editar jugador)'}</strong>.
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre del Jugador</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editingPlayer.name}
                    onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Número de Camiseta / Dorsal</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="99"
                      className="form-input"
                      value={editingPlayer.dorsal}
                      onChange={e => setEditingPlayer({ ...editingPlayer, dorsal: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Posición en Cancha</label>
                    <select 
                      className="form-select"
                      value={editingPlayer.position}
                      onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                    >
                      <option value="POR">Portero (POR)</option>
                      <option value="DEF">Defensa (DEF)</option>
                      <option value="MED">Mediocampista (MED)</option>
                      <option value="DEL">Delantero (DEL)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Estado Disciplinario</label>
                    <select 
                      className="form-select"
                      value={editingPlayer.status}
                      onChange={e => setEditingPlayer({ ...editingPlayer, status: e.target.value })}
                    >
                      <option value="Habilitado">Habilitado</option>
                      <option value="Suspendido">Suspendido (Sanción)</option>
                      <option value="En revisión">En revisión disciplinaria</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Edad</label>
                    <input 
                      type="number" 
                      min="15" 
                      max="50"
                      className="form-input"
                      value={editingPlayer.age}
                      onChange={e => setEditingPlayer({ ...editingPlayer, age: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Tarjetas Amarillas Acumuladas</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="10"
                      className="form-input"
                      value={editingPlayer.yellowCards}
                      onChange={e => setEditingPlayer({ ...editingPlayer, yellowCards: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tarjetas Rojas Directas</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="5"
                      className="form-input"
                      value={editingPlayer.redCards}
                      onChange={e => setEditingPlayer({ ...editingPlayer, redCards: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Goles Marcados en el Torneo</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="50"
                    className="form-input"
                    value={editingPlayer.goals}
                    onChange={e => setEditingPlayer({ ...editingPlayer, goals: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Observaciones y Dictamen Médico / Disciplinario</label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    value={editingPlayer.notes || ''}
                    onChange={e => setEditingPlayer({ ...editingPlayer, notes: e.target.value })}
                    placeholder="Detalles sobre su sanción, habilitación o aptitud física..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setEditingPlayer(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Player Modal */}
      {viewingPlayer && (
        <div className="modal-overlay" onClick={() => setViewingPlayer(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <User size={20} color="#10b981" />
                Ficha del Jugador
              </div>
              <button className="modal-close-btn" onClick={() => setViewingPlayer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <img 
                  src={viewingPlayer.avatar} 
                  alt={viewingPlayer.name}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-subtle)' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>{viewingPlayer.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span className="badge badge-neutral">Dorsal #{viewingPlayer.dorsal}</span>
                    <span className="badge badge-info">{viewingPlayer.position}</span>
                    <span className={`badge ${viewingPlayer.status === 'Habilitado' ? 'badge-success' : 'badge-danger'}`}>
                      {viewingPlayer.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Club</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{teamMap[viewingPlayer.teamId]?.name || 'Sin Equipo'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Edad</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{viewingPlayer.age} años</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Goles Marcados</div>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>⚽ {viewingPlayer.goals}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tarjetas (A/R)</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>🟨 {viewingPlayer.yellowCards} / 🟥 {viewingPlayer.redCards}</div>
                </div>
              </div>

              {viewingPlayer.notes && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Notas / Observaciones</div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{viewingPlayer.notes}</div>
                </div>
              )}

              {/* Conditional rendering for minors */}
              {viewingPlayer.age < 18 && canEditPlayer && (
                <div style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#60a5fa', fontWeight: 600 }}>
                    <ShieldAlert size={16} />
                    Información de Contacto para Menores (Solo Admin/Comité)
                  </div>
                  <div className="form-grid-2">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nombre del Padre/Tutor</div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{viewingPlayer.guardianName || 'No registrado'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teléfono</div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{viewingPlayer.guardianPhone || 'No registrado'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setViewingPlayer(null)}>
                Cerrar
              </button>
              {canEditPlayer && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setViewingPlayer(null);
                    handleOpenEdit(viewingPlayer);
                  }}
                >
                  <Edit3 size={16} />
                  Editar Jugador
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
