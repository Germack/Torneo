import React, { useState } from 'react';
import { 
  Shield, 
  MapPin, 
  User, 
  Calendar, 
  Users, 
  Award, 
  ChevronRight,
  Plus,
  X,
  FileText,
  Trash2,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { ROLES } from '../data/initialData';
import { api } from '../services/api';

export function TeamsView({ 
  teams, 
  setTeams, 
  players, 
  setPlayers, // Added for cascading deletes
  currentRole, 
  addToast,
  onSelectPlayer 
}) {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [isNewPlayerModalOpen, setIsNewPlayerModalOpen] = useState(false);
  const [newPlayerAge, setNewPlayerAge] = useState(18);

  const canCreateTeam = currentRole === ROLES.ADMIN;
  const canEditTeam = currentRole === ROLES.ADMIN;
  const canDeleteTeam = currentRole === ROLES.ADMIN;

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!canDeleteTeam) return;
    if (window.confirm(`¿Estás seguro de eliminar el club "${teamName}"? Se borrarán también todos sus jugadores asociados. Esta acción no se puede deshacer.`)) {
      try {
        const res = await api.deleteTeam(teamId, currentRole);
        if (res.error) throw new Error(res.error);

        setTeams(prev => prev.filter(t => t.id !== teamId));
        setPlayers(prev => prev.filter(p => p.teamId !== teamId)); // Cascading delete
        
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null);
        }
        addToast({
          type: 'success',
          title: 'Club Eliminado',
          message: `El club ${teamName} y sus jugadores han sido eliminados exitosamente.`
        });
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Error',
          message: err.message || 'Error al eliminar el club'
        });
      }
    }
  };

  const getTeamPlayers = (teamId) => {
    return players.filter(p => p.teamId === teamId);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Shield size={22} color="#10b981" />
            Clubes y Equipos Participantes
          </h2>
          <p className="section-desc">
            Consulta los 6 clubes en competencia, sus directores técnicos, representantes y nómina de jugadores.
          </p>
        </div>

        {canCreateTeam && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsNewTeamModalOpen(true)}
          >
            <Plus size={16} />
            Inscribir Club (Admin)
          </button>
        )}
      </div>

      <div className="teams-grid">
        {/* Teams List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {teams.map(team => {
            const teamSquad = getTeamPlayers(team.id);
            const isSelected = selectedTeam?.id === team.id;

            return (
              <div 
                key={team.id}
                className="glass-card"
                onClick={() => setSelectedTeam(team)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--pitch-green)' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '12px', 
                    background: `linear-gradient(135deg, ${team.color} 0%, ${team.secondaryColor} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    {team.shield}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                      {team.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {teamSquad.length} jugadores • DT: {team.coach}
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} color={isSelected ? '#10b981' : '#64748b'} />
              </div>
            );
          })}
        </div>

        {/* Selected Team Details Card */}
        {selectedTeam && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '16px', 
                  background: `linear-gradient(135deg, ${selectedTeam.color} 0%, ${selectedTeam.secondaryColor} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                }}>
                  {selectedTeam.shield}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                    {selectedTeam.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span className="badge badge-neutral">Fundado en {selectedTeam.founded}</span>
                    <span className="badge badge-info">{selectedTeam.city}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {canEditTeam && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setIsEditTeamModalOpen(true)}
                    title="Editar Club (Solo Admin)"
                  >
                    <Edit3 size={16} />
                    Editar Club
                  </button>
                )}
                {canDeleteTeam && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteTeam(selectedTeam.id, selectedTeam.name)}
                    title="Eliminar Club (Solo Admin)"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* Team Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Director Técnico</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{selectedTeam.coach}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Representante Oficial</div>
                <div style={{ fontWeight: 700, color: '#10b981' }}>{selectedTeam.representative}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Estadio / Cancha Local</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{selectedTeam.stadium}</div>
              </div>
            </div>

            {/* Squad List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Users size={18} color="#10b981" />
                  Plantel de Jugadores Registrados ({getTeamPlayers(selectedTeam.id).length})
                </h4>
                {canCreateTeam && (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsNewPlayerModalOpen(true)}
                  >
                    <Plus size={14} />
                    Añadir Jugador
                  </button>
                )}
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>Dorsal</th>
                      <th>Jugador</th>
                      <th style={{ textAlign: 'center' }}>Posición</th>
                      <th style={{ textAlign: 'center' }}>Edad</th>
                      <th style={{ textAlign: 'center' }}>Goles</th>
                      <th style={{ textAlign: 'center' }}>Tarjetas</th>
                      <th style={{ textAlign: 'center' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTeamPlayers(selectedTeam.id).map(player => (
                      <tr key={player.id}>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--pitch-green-light)', fontSize: '1rem' }}>
                          #{player.dorsal}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img 
                              src={player.avatar} 
                              alt={player.name}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff' }}>{player.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{player.notes}</div>
                            </div>
                          </div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Team Modal (Admin only) */}
      {isNewTeamModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewTeamModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={20} color="#10b981" />
                Registrar Nuevo Club en el Torneo
              </div>
              <button className="modal-close-btn" onClick={() => setIsNewTeamModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={async e => {
              e.preventDefault();
              const f = e.target;
              const newClubData = {
                name: f.name.value,
                shortName: f.shortName.value.toUpperCase(),
                color: f.color.value,
                secondaryColor: f.color.value,
                shield: f.shield.value || '⚽',
                stadium: f.stadium.value,
                representative: f.representative.value,
                coach: f.coach.value,
                founded: f.founded.value,
                city: f.city.value
              };

              try {
                const res = await api.createTeam(newClubData, currentRole);
                if (res.error) throw new Error(res.error);
                
                const newClub = res.team;
                setTeams(prev => [...prev, newClub]);
                setSelectedTeam(newClub); // Auto-select the new team
                setIsNewTeamModalOpen(false);
                setIsNewPlayerModalOpen(true); // Open add player modal immediately
                addToast({
                  type: 'success',
                  title: 'Club Registrado',
                  message: `El club ${newClub.name} ha sido añadido. Ahora puedes registrar a sus jugadores.`
                });
              } catch (err) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: err.message || 'Error al inscribir club'
                });
              }
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del Club</label>
                  <input name="name" type="text" placeholder="Ej: Deportivo Huracán" className="form-input" required />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Siglas / Abreviatura (3 letras)</label>
                    <input name="shortName" maxLength={4} type="text" placeholder="HUR" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emoji / Escudo</label>
                    <input name="shield" type="text" defaultValue="⚽" className="form-input" />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Representante Oficial</label>
                    <input name="representative" type="text" placeholder="Nombre completo" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Director Técnico</label>
                    <input name="coach" type="text" placeholder="Nombre del DT" className="form-input" required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Estadio / Sede</label>
                    <input name="stadium" type="text" defaultValue="Cancha Municipal" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Distintivo</label>
                    <input name="color" type="color" defaultValue="#10b981" className="form-input" style={{ height: '42px', padding: '2px' }} />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Año de Fundación</label>
                    <input name="founded" type="text" defaultValue="2020" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ciudad / Distrito</label>
                    <input name="city" type="text" defaultValue="Ciudad Metropolitana" className="form-input" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewTeamModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Inscribir Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {isEditTeamModalOpen && selectedTeam && (
        <div className="modal-overlay" onClick={() => setIsEditTeamModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Edit3 size={20} color="#10b981" />
                Editar Club
              </div>
              <button className="modal-close-btn" onClick={() => setIsEditTeamModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={async e => {
              e.preventDefault();
              const f = e.target;
              const updateData = {
                name: f.name.value,
                shortName: f.shortName.value,
                color: f.color.value,
                secondaryColor: f.color.value, // We can derive secondary from primary as the form only asks for 1 color. Wait, let's keep it simple.
                shield: f.shield.value,
                stadium: f.stadium.value,
                representative: f.representative.value,
                coach: f.coach.value,
                founded: f.founded.value,
                city: f.city.value
              };

              try {
                const res = await api.updateTeam(selectedTeam.id, updateData, currentRole);
                if (res.error) throw new Error(res.error);
                
                const updatedTeam = res.team;
                setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
                setSelectedTeam(updatedTeam);
                setIsEditTeamModalOpen(false);
                addToast({
                  type: 'success',
                  title: 'Club Actualizado',
                  message: `Los datos del club ${updatedTeam.name} han sido modificados exitosamente.`
                });
              } catch (err) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: err.message || 'Ocurrió un error al intentar editar el club.'
                });
              }
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo del Club</label>
                  <input name="name" type="text" defaultValue={selectedTeam.name} className="form-input" required />
                </div>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Abreviatura (3 letras)</label>
                    <input name="shortName" type="text" defaultValue={selectedTeam.shortName} maxLength="3" className="form-input" required style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emoji / Icono del Escudo</label>
                    <input name="shield" type="text" defaultValue={selectedTeam.shield} className="form-input" />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Representante Oficial</label>
                    <input name="representative" type="text" defaultValue={selectedTeam.representative} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Director Técnico (DT)</label>
                    <input name="coach" type="text" defaultValue={selectedTeam.coach} className="form-input" />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Estadio / Sede</label>
                    <input name="stadium" type="text" defaultValue={selectedTeam.stadium} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Distintivo</label>
                    <input name="color" type="color" defaultValue={selectedTeam.color} className="form-input" style={{ height: '42px', padding: '2px' }} />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Año de Fundación</label>
                    <input name="founded" type="text" defaultValue={selectedTeam.founded} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ciudad / Distrito</label>
                    <input name="city" type="text" defaultValue={selectedTeam.city} className="form-input" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditTeamModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Player Modal (Admin only) */}
      {isNewPlayerModalOpen && selectedTeam && (
        <div className="modal-overlay" onClick={() => setIsNewPlayerModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <User size={20} color="#10b981" />
                Inscribir Jugador en {selectedTeam.name}
              </div>
              <button className="modal-close-btn" onClick={() => setIsNewPlayerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={async e => {
              e.preventDefault();
              const f = e.target;
              const newPlayerData = {
                name: f.name.value,
                dorsal: Number(f.dorsal.value),
                position: f.position.value,
                teamId: selectedTeam.id,
                age: Number(f.age.value),
                status: 'Habilitado',
                notes: f.notes.value,
                guardianName: newPlayerAge < 18 && f.guardianName ? f.guardianName.value : undefined,
                guardianPhone: newPlayerAge < 18 && f.guardianPhone ? f.guardianPhone.value : undefined,
              };

              try {
                const res = await api.createPlayer(newPlayerData, currentRole);
                if (res.error) throw new Error(res.error);
                
                const newPlayer = res.player;
                setPlayers(prev => [...prev, newPlayer]);
                setIsNewPlayerModalOpen(false);
                setNewPlayerAge(18); // Reset for next time
                addToast({
                  type: 'success',
                  title: 'Jugador Inscrito',
                  message: `El jugador ${newPlayer.name} ha sido añadido a ${selectedTeam.name}.`
                });
              } catch (err) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: err.message || 'Error al inscribir jugador'
                });
              }
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input name="name" type="text" placeholder="Ej: Lionel Messi" className="form-input" required />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Dorsal</label>
                    <input name="dorsal" type="number" min="1" max="99" placeholder="10" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Posición</label>
                    <select name="position" className="form-select" required>
                      <option value="POR">Portero (POR)</option>
                      <option value="DEF">Defensa (DEF)</option>
                      <option value="MED">Mediocampista (MED)</option>
                      <option value="DEL">Delantero (DEL)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Edad</label>
                    <input 
                      name="age" 
                      type="number" 
                      min="1" 
                      max="99" 
                      defaultValue="18"
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== "") {
                          setNewPlayerAge(Number(val));
                        } else {
                          setNewPlayerAge(18); // Default back if empty
                        }
                      }}
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notas / Observaciones</label>
                    <input name="notes" type="text" placeholder="Ej: Fichaje reciente" className="form-input" />
                  </div>
                </div>

                {newPlayerAge < 18 && (
                  <div style={{ padding: '15px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', marginBottom: '15px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--gold-trophy)', fontWeight: 600 }}>
                      <AlertTriangle size={16} />
                      Información requerida para menores de edad
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ color: '#fff' }}>Nombre del Padre/Tutor</label>
                        <input name="guardianName" type="text" className="form-input" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ color: '#fff' }}>Teléfono del Tutor</label>
                        <input name="guardianPhone" type="tel" className="form-input" required />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewPlayerModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Añadir Jugador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
