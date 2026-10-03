import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  AlertCircle, 
  Check, 
  X, 
  ChevronRight,
  Send,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { ROLES } from '../data/initialData';

export function RequestsView({ 
  requests, 
  setRequests, 
  teams, 
  players, 
  setPlayers, 
  currentRole, 
  currentUser, 
  addToast,
  isNewRequestModalOpen,
  setIsNewRequestModalOpen 
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolvingRequest, setResolvingRequest] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('APROBADA'); // 'APROBADA' or 'RECHAZADA'
  const [resolutionComment, setResolutionComment] = useState('');

  // Form state for creating a new request
  const [newRequestType, setNewRequestType] = useState('INSCRIPCION_JUGADOR');
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [newRequestTeamId, setNewRequestTeamId] = useState(currentUser.teamId || teams[0]?.id);
  
  // Proposed player fields if type is INSCRIPCION_JUGADOR
  const [proposedPlayerName, setProposedPlayerName] = useState('');
  const [proposedPlayerDorsal, setProposedPlayerDorsal] = useState('17');
  const [proposedPlayerPosition, setProposedPlayerPosition] = useState('MED');
  const [proposedPlayerAge, setProposedPlayerAge] = useState('24');

  // Can resolve: Admin and Comite
  const canResolveRequest = currentRole === ROLES.ADMIN || currentRole === ROLES.COMITE;

  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDIENTE').length;

  const handleCreateRequest = (e) => {
    e.preventDefault();

    if (!newRequestTitle.trim() || !newRequestDescription.trim()) {
      alert('Por favor completa el título y la descripción de la solicitud.');
      return;
    }

    const team = teamMap[newRequestTeamId];

    let proposedPlayer = null;
    if (newRequestType === 'INSCRIPCION_JUGADOR') {
      if (!proposedPlayerName.trim()) {
        alert('Por favor ingresa el nombre del jugador a inscribir.');
        return;
      }
      proposedPlayer = {
        name: proposedPlayerName.trim(),
        dorsal: Number(proposedPlayerDorsal) || 99,
        position: proposedPlayerPosition,
        age: Number(proposedPlayerAge) || 20
      };
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReq = {
      id: `sol_${Date.now()}`,
      title: newRequestTitle.trim(),
      type: newRequestType,
      teamId: newRequestTeamId,
      teamName: team?.name || 'Club Registrado',
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantRole: currentRole,
      createdAt: formattedDate,
      status: 'PENDIENTE',
      description: newRequestDescription.trim(),
      proposedPlayer: proposedPlayer,
      resolutionNote: '',
      resolvedBy: '',
      resolvedAt: ''
    };

    setRequests(prev => [newReq, ...prev]);
    setIsNewRequestModalOpen(false);

    // Reset fields
    setNewRequestTitle('');
    setNewRequestDescription('');
    setProposedPlayerName('');

    addToast({
      type: 'success',
      title: '¡Solicitud Creada con Éxito!',
      message: `Tu solicitud "${newReq.title}" fue enviada al Comité y Administración para su revisión.`
    });
  };

  const handleOpenResolveModal = (req, action) => {
    if (!canResolveRequest) return;
    setResolvingRequest(req);
    setResolutionAction(action);
    setResolutionComment(
      action === 'APROBADA' 
        ? 'Solicitud revisada conforme al reglamento oficial. Dictamen favorable emitido.'
        : 'Solicitud no procedente debido a incompatibilidad con los plazos o requisitos del reglamento.'
    );
  };

  const handleSaveResolution = (e) => {
    e.preventDefault();
    if (!resolvingRequest || !canResolveRequest) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const resolverName = `${currentUser.name} (${currentRole === ROLES.ADMIN ? 'Admin' : 'Comité'})`;

    // If approved and was a player registration, automatically add the player to the roster!
    if (resolutionAction === 'APROBADA' && resolvingRequest.type === 'INSCRIPCION_JUGADOR' && resolvingRequest.proposedPlayer) {
      const p = resolvingRequest.proposedPlayer;
      const newPlayerObj = {
        id: `jug_${Date.now()}`,
        name: p.name,
        dorsal: p.dorsal,
        position: p.position,
        teamId: resolvingRequest.teamId,
        age: p.age,
        status: 'Habilitado',
        goals: 0,
        yellowCards: 0,
        redCards: 0,
        matchesPlayed: 0,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        notes: `Inscrito formalmente mediante solicitud #${resolvingRequest.id}`
      };
      setPlayers(prev => [...prev, newPlayerObj]);
    }

    setRequests(prev => prev.map(r => {
      if (r.id === resolvingRequest.id) {
        return {
          ...r,
          status: resolutionAction,
          resolutionNote: resolutionComment,
          resolvedBy: resolverName,
          resolvedAt: formattedDate
        };
      }
      return r;
    }));

    addToast({
      type: resolutionAction === 'APROBADA' ? 'success' : 'info',
      title: `Solicitud ${resolutionAction === 'APROBADA' ? 'Aprobada' : 'Rechazada'}`,
      message: `El dictamen oficial fue registrado por ${resolverName}.`
    });

    setResolvingRequest(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FileText size={22} color="#10b981" />
            Módulo de Solicitudes y Trámites Oficiales
          </h2>
          <p className="section-desc">
            {currentRole === ROLES.REPRESENTANTE 
              ? 'Tienes permiso para crear solicitudes oficiales (inscripción de jugadores, cambio de fechas, apelaciones).' 
              : 'Gestión y resolución de solicitudes remitidas por los representantes de los clubes.'}
          </p>
        </div>

        {/* Big Create Request button (Always accessible to Representante/Jugador, as well as Admin/Comite) */}
        <button 
          className="btn btn-primary" 
          onClick={() => setIsNewRequestModalOpen(true)}
          id="btn-create-request"
        >
          <PlusCircle size={17} />
          Nueva Solicitud Oficial
        </button>
      </div>

      {/* Role explanation banner for Requests */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Send size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                Permiso Activo: Creación de Solicitudes
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                {currentRole === ROLES.REPRESENTANTE ? (
                  <span>Puedes radicar solicitudes para tu club (<strong>{currentUser.teamName}</strong>) y hacer seguimiento de la respuesta del Comité.</span>
                ) : (
                  <span>Como <strong>{currentRole === ROLES.ADMIN ? 'Administrador' : 'Comité'}</strong>, tienes facultades para emitir dictámenes y resolver las peticiones.</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>
              <Clock size={13} /> {pendingCount} Pendientes de Dictamen
            </span>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterStatus('ALL')}
        >
          Todas ({requests.length})
        </button>
        <button 
          className={`btn btn-sm ${filterStatus === 'PENDIENTE' ? 'btn-gold' : 'btn-secondary'}`}
          onClick={() => setFilterStatus('PENDIENTE')}
        >
          Pendientes ({requests.filter(r => r.status === 'PENDIENTE').length})
        </button>
        <button 
          className={`btn btn-sm ${filterStatus === 'APROBADA' ? 'btn-outline-green' : 'btn-secondary'}`}
          onClick={() => setFilterStatus('APROBADA')}
        >
          Aprobadas ({requests.filter(r => r.status === 'APROBADA').length})
        </button>
        <button 
          className={`btn btn-sm ${filterStatus === 'RECHAZADA' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setFilterStatus('RECHAZADA')}
        >
          Rechazadas ({requests.filter(r => r.status === 'RECHAZADA').length})
        </button>
      </div>

      {/* Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRequests.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p>No hay solicitudes en esta categoría.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isPending = req.status === 'PENDIENTE';
            const isApproved = req.status === 'APROBADA';
            const isRejected = req.status === 'RECHAZADA';

            return (
              <div 
                key={req.id} 
                className="glass-card" 
                style={{ 
                  padding: '20px',
                  borderLeft: `4px solid ${isPending ? 'var(--warning)' : isApproved ? 'var(--pitch-green)' : 'var(--danger)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span className={`badge ${isPending ? 'badge-warning' : isApproved ? 'badge-success' : 'badge-danger'}`}>
                        {isPending && <Clock size={12} />}
                        {isApproved && <CheckCircle2 size={12} />}
                        {isRejected && <XCircle size={12} />}
                        {req.status}
                      </span>

                      <span className="badge badge-neutral">
                        {req.type === 'INSCRIPCION_JUGADOR' ? '🏃 Inscripción de Jugador' :
                         req.type === 'CAMBIO_HORARIO' ? '📅 Reprogramación' :
                         req.type === 'APELACION_SANCION' ? '⚖️ Apelación Disciplinaria' : '📋 Trámite General'}
                      </span>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Radicado #{req.id} • {req.createdAt}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {req.title}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Club: <strong style={{ color: 'var(--pitch-green-light)' }}>{req.teamName}</strong> • Solicitado por: <strong>{req.applicantName}</strong>
                    </div>
                  </div>

                  {/* Actions for Admin and Comité */}
                  {canResolveRequest && isPending && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline-green btn-sm"
                        onClick={() => handleOpenResolveModal(req, 'APROBADA')}
                      >
                        <Check size={14} /> Aprobar
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleOpenResolveModal(req, 'RECHAZADA')}
                      >
                        <X size={14} /> Rechazar
                      </button>
                    </div>
                  )}
                </div>

                {/* Description Body */}
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '14px 16px', borderRadius: '10px', marginBottom: '14px' }}>
                  {req.description}
                </p>

                {/* If there was a proposed player */}
                {req.proposedPlayer && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserPlus size={15} /> Jugador propuesto para inscripción:
                    </div>
                    <div style={{ color: '#fff' }}>
                      Nombre: <strong>{req.proposedPlayer.name}</strong> • Dorsal: <strong>#{req.proposedPlayer.dorsal}</strong> • Posición: <strong>{req.proposedPlayer.position}</strong> • Edad: <strong>{req.proposedPlayer.age} años</strong>
                    </div>
                  </div>
                )}

                {/* Resolution Note if resolved */}
                {req.resolutionNote && (
                  <div style={{ 
                    background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    borderRadius: '10px', 
                    padding: '12px 16px', 
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: 700, color: isApproved ? '#34d399' : '#f87171', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageSquare size={14} /> Dictamen Oficial ({req.resolvedBy} - {req.resolvedAt}):
                    </div>
                    <div style={{ color: '#e2e8f0' }}>
                      {req.resolutionNote}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Crear Nueva Solicitud (Representante / Jugador / Admin / Comité) */}
      {isNewRequestModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewRequestModalOpen(false)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <PlusCircle size={20} color="#10b981" />
                Crear Nueva Solicitud Oficial
              </div>
              <button className="modal-close-btn" onClick={() => setIsNewRequestModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="modal-body">
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                  borderRadius: '8px', 
                  padding: '10px 14px', 
                  marginBottom: '18px',
                  fontSize: '0.82rem',
                  color: 'var(--pitch-green-light)'
                }}>
                  Radicando como: <strong>{currentUser.name}</strong> ({currentRole === ROLES.REPRESENTANTE ? 'Representante Oficial' : currentRole}).
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Tipo de Solicitud</label>
                    <select 
                      className="form-select"
                      value={newRequestType}
                      onChange={e => setNewRequestType(e.target.value)}
                    >
                      <option value="INSCRIPCION_JUGADOR">Inscripción / Refuerzo de Jugador</option>
                      <option value="CAMBIO_HORARIO">Cambio de Horario o Reprogramación</option>
                      <option value="APELACION_SANCION">Apelación de Sanción Disciplinaria</option>
                      <option value="OTRO">Otro Trámite / Consulta Oficial</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Club / Equipo Solicitante</label>
                    <select 
                      className="form-select"
                      value={newRequestTeamId}
                      onChange={e => setNewRequestTeamId(e.target.value)}
                    >
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Título Breve del Asunto</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Ej: Inscripción de jugador Mateo Silva para la Jornada 4"
                    value={newRequestTitle}
                    onChange={e => setNewRequestTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Sub-form if type is INSCRIPCION_JUGADOR */}
                {newRequestType === 'INSCRIPCION_JUGADOR' && (
                  <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--pitch-green-light)', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserPlus size={16} /> Datos del Jugador a Inscribir:
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Nombre Completo</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Nombre y Apellidos"
                          value={proposedPlayerName}
                          onChange={e => setProposedPlayerName(e.target.value)}
                          required={newRequestType === 'INSCRIPCION_JUGADOR'}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Dorsal Deseado</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="99" 
                          className="form-input"
                          value={proposedPlayerDorsal}
                          onChange={e => setProposedPlayerDorsal(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Posición</label>
                        <select 
                          className="form-select"
                          value={proposedPlayerPosition}
                          onChange={e => setProposedPlayerPosition(e.target.value)}
                        >
                          <option value="POR">Portero (POR)</option>
                          <option value="DEF">Defensa (DEF)</option>
                          <option value="MED">Mediocampista (MED)</option>
                          <option value="DEL">Delantero (DEL)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Edad</label>
                        <input 
                          type="number" 
                          min="15" 
                          max="50" 
                          className="form-input"
                          value={proposedPlayerAge}
                          onChange={e => setProposedPlayerAge(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Fundamento y Justificación Detallada</label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    placeholder="Explica los motivos, artículos del reglamento aplicables o situaciones que motivan tu solicitud..."
                    value={newRequestDescription}
                    onChange={e => setNewRequestDescription(e.target.value)}
                    required
                  />
                  <div className="form-help">
                    La solicitud será evaluada en la próxima reunión del Comité Técnico y Disciplinario.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsNewRequestModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Send size={15} />
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolver Solicitud (Admin y Comité) */}
      {resolvingRequest && (
        <div className="modal-overlay" onClick={() => setResolvingRequest(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {resolutionAction === 'APROBADA' ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : (
                  <XCircle size={20} color="#ef4444" />
                )}
                Emitir Dictamen: {resolutionAction === 'APROBADA' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
              </div>
              <button className="modal-close-btn" onClick={() => setResolvingRequest(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveResolution}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Solicitud en revisión:</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{resolvingRequest.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pitch-green-light)' }}>Club: {resolvingRequest.teamName}</div>
                </div>

                {resolutionAction === 'APROBADA' && resolvingRequest.type === 'INSCRIPCION_JUGADOR' && resolvingRequest.proposedPlayer && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.82rem', color: '#a7f3d0' }}>
                    ⚡ <strong>Acción Automática:</strong> Al aprobar esta solicitud, el jugador <strong>{resolvingRequest.proposedPlayer.name}</strong> se incorporará inmediatamente a la nómina oficial del club.
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Resolución</label>
                  <select 
                    className="form-select"
                    value={resolutionAction}
                    onChange={e => setResolutionAction(e.target.value)}
                  >
                    <option value="APROBADA">Aprobada (Favorable)</option>
                    <option value="RECHAZADA">Rechazada (No procedente)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dictamen y Motivo Oficial</label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    value={resolutionComment}
                    onChange={e => setResolutionComment(e.target.value)}
                    required
                  />
                  <div className="form-help">
                    Este texto será visible para el representante del club.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setResolvingRequest(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`btn ${resolutionAction === 'APROBADA' ? 'btn-primary' : 'btn-danger'}`}
                >
                  Confirmar Dictamen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
