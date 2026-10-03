import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Edit2, 
  Lock, 
  Plus, 
  CheckCircle2, 
  X, 
  Save, 
  Trash2,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { ROLES } from '../data/initialData';
import { ScheduleBuilder } from './ScheduleBuilder';
import { api } from '../services/api';

export function MatchesView({ 
  matches, 
  setMatches, 
  teams, 
  players, 
  currentRole, 
  addToast 
}) {
  const [selectedRound, setSelectedRound] = useState('ALL');
  const [selectedMatchday, setSelectedMatchday] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingMatch, setEditingMatch] = useState(null);
  const [isScheduleBuilderOpen, setIsScheduleBuilderOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOption, setDeleteOption] = useState('ALL');
  const [deleteInputVal, setDeleteInputVal] = useState(1);

  // Permissions:
  // Admin and Comite can edit match data
  const canEditMatch = currentRole === ROLES.ADMIN || currentRole === ROLES.COMITE;
  // Only Admin can create or delete matches
  const canCreateMatch = currentRole === ROLES.ADMIN;

  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });

  // Calculations for Rounds (Vueltas)
  const N = teams.length;
  const matchdaysPerRound = N > 1 ? (N % 2 === 0 ? N - 1 : N) : 5;
  const maxMatchday = Math.max(...matches.map(m => m.matchday), 1);
  const totalRounds = Math.ceil(maxMatchday / matchdaysPerRound);
  
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  let availableMatchdays = [];
  if (selectedRound === 'ALL') {
    availableMatchdays = Array.from({ length: maxMatchday }, (_, i) => i + 1);
  } else {
    const r = Number(selectedRound);
    const start = (r - 1) * matchdaysPerRound + 1;
    const end = Math.min(r * matchdaysPerRound, maxMatchday);
    availableMatchdays = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Filter and Sort matches
  const filteredMatches = matches.filter(m => {
    // Round Filter
    if (selectedRound !== 'ALL') {
      const r = Number(selectedRound);
      const start = (r - 1) * matchdaysPerRound + 1;
      const end = r * matchdaysPerRound;
      if (m.matchday < start || m.matchday > end) return false;
    }
    // Matchday Filter
    if (selectedMatchday !== 'ALL' && m.matchday !== Number(selectedMatchday)) {
      return false;
    }
    // Status Filter
    if (statusFilter !== 'ALL' && m.status !== statusFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    // Primero ordenamos por jornada si estamos viendo múltiples jornadas (ej: seleccionamos toda la vuelta o ALL)
    if (a.matchday !== b.matchday) {
      return a.matchday - b.matchday;
    }

    // Luego ordenamos por fecha
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1; // Partidos sin fecha van al final
    if (!b.date) return -1;
    
    if (a.date !== b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    
    // Si la fecha es igual, ordenamos por hora
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  const handleOpenEdit = (match) => {
    if (!canEditMatch) {
      addToast({
        type: 'error',
        title: 'Permiso Denegado',
        message: 'Tu rol actual (Representante/Jugador) solo tiene permisos de visualización en los partidos.'
      });
      return;
    }
    setEditingMatch({
      ...match,
      incidents: match.incidents ? [...match.incidents] : []
    });
  };

  const handleDeleteMatchesSubmit = async () => {
    if (!canCreateMatch) return;
    try {
      let params = {};
      let message = '';
      if (deleteOption === 'ALL') {
        params = { all: true };
        message = 'Todos los partidos han sido borrados.';
        const res = await api.deleteMatches(params, currentRole);
        if (res.error) throw new Error(res.error);
        setMatches([]);
      } else if (deleteOption === 'MATCHDAY') {
        params = { matchday: deleteInputVal };
        message = `La jornada ${deleteInputVal} ha sido borrada.`;
        const res = await api.deleteMatches(params, currentRole);
        if (res.error) throw new Error(res.error);
        setMatches(prev => prev.filter(m => m.matchday !== Number(deleteInputVal)));
      } else if (deleteOption === 'ROUND') {
        const r = Number(deleteInputVal);
        const start = (r - 1) * matchdaysPerRound + 1;
        const end = Math.min(r * matchdaysPerRound, maxMatchday);
        
        for (let i = start; i <= end; i++) {
          await api.deleteMatches({ matchday: i }, currentRole);
        }
        setMatches(prev => prev.filter(m => m.matchday < start || m.matchday > end));
        message = `Vuelta ${r} (Jornadas ${start} a ${end}) borrada correctamente.`;
      }

      setShowDeleteModal(false);
      addToast({ type: 'success', title: 'Borrado Exitoso', message });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Error al borrar' });
    }
  };

  const handleSaveMatch = async (e) => {
    e.preventDefault();
    if (!canEditMatch || !editingMatch) return;

    try {
      const res = await api.updateMatch(editingMatch.id, editingMatch, currentRole);
      if (res.error) throw new Error(res.error);
      
      setMatches(prev => prev.map(m => m.id === editingMatch.id ? editingMatch : m));
      setEditingMatch(null);
      addToast({
        type: 'success',
        title: 'Partido Actualizado',
        message: `El marcador y detalles del partido fueron guardados exitosamente.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error al Guardar',
        message: err.message || 'Ocurrió un error al intentar guardar el partido en la base de datos.'
      });
    }
  };

  const handleAddIncident = (type) => {
    if (!editingMatch) return;
    const newIncident = {
      min: 45,
      type: type, // 'GOL', 'AMARILLA', 'ROJA'
      playerId: '', // Tracked by ID for stats
      player: '',   // Also tracked by name for legacy
      teamId: editingMatch.homeTeamId
    };

    const updatedIncidents = [...editingMatch.incidents, newIncident];
    
    // Auto-update score if it's a goal
    let newHomeScore = editingMatch.homeScore;
    let newAwayScore = editingMatch.awayScore;
    if (type === 'GOL') {
      newHomeScore = editingMatch.incidents.filter(i => i.type === 'GOL' && i.teamId === editingMatch.homeTeamId).length + 1;
    }

    setEditingMatch({
      ...editingMatch,
      incidents: updatedIncidents
    });
  };

  const handleRemoveIncident = (index) => {
    const updated = editingMatch.incidents.filter((_, i) => i !== index);
    setEditingMatch({
      ...editingMatch,
      incidents: updated
    });
  };

  // Suspension Logic
  const getPlayerSuspensionStatus = (playerId, teamId, currentMatchDate) => {
    // Consider matches before the current one chronologically where the team played
    const pastMatches = matches
      .filter(m => {
        if (m.status !== 'Finalizado') return false;
        if (m.homeTeamId !== teamId && m.awayTeamId !== teamId) return false;
        // Solo contar partidos que se jugaron ANTES que la fecha del partido actual
        if (!m.date || !currentMatchDate) return false;
        return new Date(m.date) < new Date(currentMatchDate);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let activeYellows = 0;
    let suspensionsLeft = 0;

    for (const match of pastMatches) {
      if (suspensionsLeft > 0) {
        suspensionsLeft--;
        continue;
      }

      const matchYellows = match.incidents?.filter(i => i.playerId === playerId && i.type === 'AMARILLA').length || 0;
      const matchReds = match.incidents?.filter(i => i.playerId === playerId && i.type === 'ROJA').length || 0;

      if (matchReds > 0) {
        suspensionsLeft += 2; // Direct red
      } else if (matchYellows >= 2) {
        suspensionsLeft += 1; // Double yellow
      } else if (matchYellows === 1) {
        activeYellows += 1;
        if (activeYellows === 2) {
          suspensionsLeft += 1; // 2 yellows in different matches
          activeYellows = 0;
        }
      }
    }

    return {
      isSuspended: suspensionsLeft > 0,
      suspensionsLeft,
      activeYellows
    };
  };

  return (
    <div>
      {/* Header and Controls */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Calendar size={22} color="#10b981" />
            Calendario Oficial de Partidos & Fixture
          </h2>
          <p className="section-desc">
            Consulta los resultados, fechas y actas de incidencias. {canEditMatch ? 'Puedes editar marcadores y datos de juego.' : 'Vista en modo lectura.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {canCreateMatch && !isScheduleBuilderOpen && (
            <>
              <button 
                className="btn btn-danger" 
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} />
                Borrar Datos
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsScheduleBuilderOpen(true)}
                id="btn-new-match"
              >
                <Plus size={16} />
                Programar Jornadas
              </button>
            </>
          )}
        </div>
      </div>

      {isScheduleBuilderOpen ? (
        <ScheduleBuilder 
          teams={teams} 
          existingMatches={matches}
          currentRole={currentRole}
          onClose={() => setIsScheduleBuilderOpen(false)}
          addToast={addToast}
          onMatchesCreated={(newMatches) => {
            setMatches(prev => [...prev, ...newMatches]);
          }}
        />
      ) : (
        <>
          {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '14px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Vuelta:</span>
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '4px 10px', fontSize: '0.85rem' }}
              value={selectedRound}
              onChange={e => {
                setSelectedRound(e.target.value);
                setSelectedMatchday('ALL'); // Reset matchday when changing round
              }}
            >
              <option value="ALL">Todas las Vueltas</option>
              {rounds.map(r => (
                <option key={r} value={r}>Vuelta {r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Jornada:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${selectedMatchday === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedMatchday('ALL')}
              >
                Todas
              </button>
              {availableMatchdays.map(j => (
                <button
                  key={j}
                  className={`btn btn-sm ${selectedMatchday === String(j) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedMatchday(String(j))}
                >
                  Jornada {j}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Estado:</span>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="Finalizado">Finalizados</option>
            <option value="Programado">Programados</option>
            <option value="En Vivo">En Vivo</option>
          </select>
        </div>
      </div>

      {/* Matches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredMatches.map(match => {
          const homeTeam = teamMap[match.homeTeamId] || { name: 'Local', shield: '⚽', shortName: 'LOC' };
          const awayTeam = teamMap[match.awayTeamId] || { name: 'Visita', shield: '⚽', shortName: 'VIS' };
          const isFinished = match.status === 'Finalizado';
          const isLive = match.status === 'En Vivo';

          return (
            <div key={match.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Match Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--pitch-green-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Jornada {match.matchday}
                  </span>

                  <div>
                    {isLive && (
                      <span className="badge badge-danger">
                        <span className="pulse-live"></span> En Vivo
                      </span>
                    )}
                    {isFinished && (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Finalizado
                      </span>
                    )}
                    {!isLive && !isFinished && (
                      <span className="badge badge-warning">
                        <Clock size={12} /> {match.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Scoreboard */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', marginBottom: '14px' }}>
                  {/* Home Team */}
                  <div style={{ flex: 1, textAlign: 'center', padding: '0 4px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{homeTeam.shield}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', lineHeight: 1.2, wordBreak: 'break-word' }}>
                      {homeTeam.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Local</div>
                  </div>

                  {/* Score */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px', flexShrink: 0 }}>
                    {isFinished || isLive ? (
                      <div style={{ 
                        fontSize: '1.6rem', 
                        fontWeight: 900, 
                        letterSpacing: '1px', 
                        color: '#fff',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '4px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                        whiteSpace: 'nowrap'
                      }}>
                        {match.homeScore} - {match.awayScore}
                      </div>
                    ) : (
                      <div style={{ 
                        fontSize: '0.95rem', 
                        fontWeight: 700, 
                        color: 'var(--gold-trophy)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        whiteSpace: 'nowrap'
                      }}>
                        {match.time}
                      </div>
                    )}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {match.date}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div style={{ flex: 1, textAlign: 'center', padding: '0 4px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{awayTeam.shield}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', lineHeight: 1.2, wordBreak: 'break-word' }}>
                      {awayTeam.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visitante</div>
                  </div>
                </div>

                {/* Match Details: Stadium & Referee */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.78rem', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <MapPin size={13} color="#10b981" />
                    <span>{match.stadium}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} color="#3b82f6" />
                    <span>Árbitro: <strong>{match.referee || 'Por designar'}</strong></span>
                  </div>
                </div>

                {/* Incidents preview */}
                {match.incidents && match.incidents.length > 0 && (
                  <div style={{ marginBottom: '14px', fontSize: '0.78rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      Incidencias del partido:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {match.incidents.map((inc, i) => (
                        <span 
                          key={i} 
                          className="badge" 
                          style={{ 
                            background: inc.type === 'GOL' ? 'rgba(16, 185, 129, 0.15)' : inc.type === 'ROJA' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: inc.type === 'GOL' ? '#34d399' : inc.type === 'ROJA' ? '#f87171' : '#fbbf24',
                            fontSize: '0.72rem'
                          }}
                        >
                          {inc.type === 'GOL' ? '⚽' : inc.type === 'ROJA' ? '🟥' : '🟨'} {inc.min}' {inc.player}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action: Edit Match Button */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                {canEditMatch ? (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(match)}
                  >
                    <Edit2 size={14} />
                    Editar Partido
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary btn-sm"
                    disabled
                    title="Representante/Jugador solo tiene permiso de lectura"
                  >
                    <Lock size={13} />
                    Solo Lectura
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Match Modal (Admin & Comité) */}
      {editingMatch && (
        <div className="modal-overlay" onClick={() => setEditingMatch(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Edit2 size={20} color="#10b981" />
                Editar Datos del Partido
              </div>
              <button className="modal-close-btn" onClick={() => setEditingMatch(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMatch}>
              <div className="modal-body">
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.08)', 
                  border: '1px solid rgba(59, 130, 246, 0.25)', 
                  borderRadius: '8px', 
                  padding: '10px 14px', 
                  marginBottom: '18px',
                  fontSize: '0.82rem',
                  color: '#93c5fd'
                }}>
                  Permiso activo de edición para <strong>{currentRole === ROLES.ADMIN ? 'Administrador' : 'Comité'}</strong>. Puedes modificar marcador, horario, árbitro e incidencias oficiales.
                </div>

                {/* Scoreboard Editor */}
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '8px' }}>
                        {teamMap[editingMatch.homeTeamId]?.name} (Local)
                      </div>
                      <label className="form-label">Goles Local</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="30"
                        className="form-input" 
                        style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 800 }}
                        value={editingMatch.homeScore}
                        onChange={e => setEditingMatch({ ...editingMatch, homeScore: Number(e.target.value) })}
                      />
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      VS
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '8px' }}>
                        {teamMap[editingMatch.awayTeamId]?.name} (Visita)
                      </div>
                      <label className="form-label">Goles Visitante</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="30"
                        className="form-input" 
                        style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 800 }}
                        value={editingMatch.awayScore}
                        onChange={e => setEditingMatch({ ...editingMatch, awayScore: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Estado del Partido</label>
                    <select 
                      className="form-select"
                      value={editingMatch.status}
                      onChange={e => setEditingMatch({ ...editingMatch, status: e.target.value })}
                    >
                      <option value="Programado">Programado</option>
                      <option value="En Vivo">En Vivo</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jornada</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30"
                      className="form-input"
                      value={editingMatch.matchday}
                      onChange={e => setEditingMatch({ ...editingMatch, matchday: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Fecha del Partido</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={editingMatch.date}
                      onChange={e => setEditingMatch({ ...editingMatch, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hora</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={editingMatch.time}
                      onChange={e => setEditingMatch({ ...editingMatch, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Sede / Cancha</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editingMatch.stadium}
                      onChange={e => setEditingMatch({ ...editingMatch, stadium: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Árbitro Central</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editingMatch.referee}
                      onChange={e => setEditingMatch({ ...editingMatch, referee: e.target.value })}
                    />
                  </div>
                </div>

                {/* Incidents Management */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Incidencias (Goles y Tarjetas)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-green"
                        onClick={() => handleAddIncident('GOL')}
                      >
                        + Gol
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleAddIncident('AMARILLA')}
                      >
                        + Amarilla
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleAddIncident('ROJA')}
                      >
                        + Roja
                      </button>
                    </div>
                  </div>

                  {editingMatch.incidents.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No hay incidencias registradas aún.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {editingMatch.incidents.map((inc, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>
                            {inc.type === 'GOL' ? '⚽' : inc.type === 'ROJA' ? '🟥' : '🟨'}
                          </span>

                          <input 
                            type="number" 
                            min="1" 
                            max="120"
                            style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', background: '#0a0f1d', border: '1px solid var(--border-subtle)', color: '#fff' }}
                            value={inc.min}
                            onChange={e => {
                              const updated = [...editingMatch.incidents];
                              updated[idx].min = Number(e.target.value);
                              setEditingMatch({ ...editingMatch, incidents: updated });
                            }}
                            title="Minuto"
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>min</span>

                          <select 
                            style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', background: '#0a0f1d', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.85rem' }}
                            value={inc.playerId || inc.player} // fallback to string for legacy data
                            onChange={e => {
                              const updated = [...editingMatch.incidents];
                              const selectedOpt = e.target.options[e.target.selectedIndex];
                              const selectedPlayerId = e.target.value;
                              
                              let newType = inc.type;
                              if (inc.type === 'AMARILLA' && selectedPlayerId) {
                                const existingYellows = editingMatch.incidents.filter((existingInc, existingIdx) => 
                                  existingIdx !== idx && existingInc.playerId === selectedPlayerId && existingInc.type === 'AMARILLA'
                                ).length;
                                
                                if (existingYellows >= 1) {
                                  newType = 'ROJA';
                                  addToast({ type: 'info', title: 'Doble Amarilla', message: 'El jugador ha recibido una segunda amarilla, se convierte automáticamente en ROJA.' });
                                }
                              }

                              updated[idx].playerId = selectedPlayerId;
                              updated[idx].player = selectedOpt.text; // Store text for backward compatibility
                              updated[idx].type = newType;
                              setEditingMatch({ ...editingMatch, incidents: updated });
                            }}
                          >
                            <option value="">-- Seleccionar Jugador --</option>
                            {players
                              .filter(p => p.teamId === inc.teamId)
                              .map(p => {
                                const status = getPlayerSuspensionStatus(p.id, p.teamId, editingMatch.date);
                                return (
                                  <option 
                                    key={p.id} 
                                    value={p.id}
                                    disabled={status.isSuspended && inc.playerId !== p.id}
                                  >
                                    {p.name} {status.isSuspended ? '(Suspendido)' : status.activeYellows === 1 ? '(1 Amarilla)' : ''}
                                  </option>
                                );
                              })
                            }
                            {/* If it's legacy data with no ID but it has a player string, show it as an option so it doesn't blank out */}
                            {!inc.playerId && inc.player && (
                              <option value={inc.player}>{inc.player}</option>
                            )}
                          </select>

                          <select 
                            style={{ padding: '4px 8px', borderRadius: '4px', background: '#0a0f1d', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.8rem' }}
                            value={inc.teamId}
                            onChange={e => {
                              const updated = [...editingMatch.incidents];
                              updated[idx].teamId = e.target.value;
                              // Reset player if team changes
                              updated[idx].playerId = '';
                              updated[idx].player = '';
                              setEditingMatch({ ...editingMatch, incidents: updated });
                            }}
                          >
                            <option value={editingMatch.homeTeamId}>{teamMap[editingMatch.homeTeamId]?.name}</option>
                            <option value={editingMatch.awayTeamId}>{teamMap[editingMatch.awayTeamId]?.name}</option>
                          </select>

                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                            onClick={() => handleRemoveIncident(idx)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setEditingMatch(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  Guardar Cambios del Partido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239,68,68,0.2)' }}>
              <div className="modal-title" style={{ color: '#ef4444' }}>
                <Trash2 size={20} color="#ef4444" />
                Borrar Partidos / Fixture
              </div>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
                ¿Qué datos del fixture deseas eliminar? Ten en cuenta que esto también borrará todas las incidencias (goles, tarjetas) asociadas a los partidos seleccionados.
              </p>
              
              <div className="form-group">
                <label className="form-label">Opción de borrado</label>
                <select 
                  className="form-select"
                  value={deleteOption}
                  onChange={e => setDeleteOption(e.target.value)}
                >
                  <option value="ALL">Todos los partidos del torneo</option>
                  <option value="ROUND">Por Vuelta Completa</option>
                  <option value="MATCHDAY">Por Jornada Específica</option>
                </select>
              </div>

              {deleteOption === 'ROUND' && (
                <div className="form-group">
                  <label className="form-label">Número de Vuelta a borrar</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={totalRounds}
                    className="form-input"
                    value={deleteInputVal}
                    onChange={e => setDeleteInputVal(e.target.value)}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Esto borrará todas las jornadas asociadas a la vuelta {deleteInputVal || 1}.
                  </div>
                </div>
              )}

              {deleteOption === 'MATCHDAY' && (
                <div className="form-group">
                  <label className="form-label">Número de Jornada a borrar</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={maxMatchday}
                    className="form-input"
                    value={deleteInputVal}
                    onChange={e => setDeleteInputVal(e.target.value)}
                  />
                </div>
              )}

              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                padding: '12px', 
                borderRadius: '8px', 
                display: 'flex', 
                gap: '12px',
                marginTop: '20px'
              }}>
                <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                  <strong>Advertencia:</strong> Esta acción es destructiva y permanente. Afectará las tablas de posiciones y estadísticas de los equipos y jugadores involucrados.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDeleteMatchesSubmit}>
                Confirmar Borrado
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
