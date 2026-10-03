import React from 'react';
import { 
  Trophy, 
  Calendar, 
  Shield, 
  Users, 
  FileText,
  HelpCircle,
  Award,
  UserCheck,
  LogOut,
  User
} from 'lucide-react';
import { ROLES, ROLE_INFO } from '../data/initialData';

export function Navbar({ 
  currentRole,      // viewRole — la vista actual (puede ser preview)
  sessionRole,      // rol real de la cuenta
  setCurrentRole, 
  activeTab, 
  setActiveTab, 
  onOpenMatrix, 
  pendingRequestsCount,
  isBackendConnected,
  currentUser,
  onLogout,
  isAdminPreviewMode
}) {
  const roleInfo = ROLE_INFO[currentRole] || ROLE_INFO[sessionRole];

  return (
    <header>
      <div className="navbar">
        <div className="navbar-inner">
          {/* Logo & Brand */}
          <div className="brand" onClick={() => setActiveTab('torneo')}>
            <div className="brand-icon">
              <Trophy size={24} />
            </div>
            <div>
              <div className="brand-title">Torneo Estaca Ilopango</div>
              <div className="brand-subtitle">Gestión Oficial de Torneo</div>
            </div>
          </div>

          {/* Quick Role Switcher - solo mostrar si es Admin */}
          {sessionRole === ROLES.ADMIN && (
            <div className={`role-switcher-container ${isAdminPreviewMode ? 'preview-mode' : ''}`}>
              <span className="role-switcher-label">
                {isAdminPreviewMode ? '👁️ Vista:' : 'Vista de rol:'}
              </span>

              <button 
                className={`role-btn ${currentRole === ROLES.ADMIN ? 'active-ADMIN' : ''}`}
                onClick={() => setCurrentRole(ROLES.ADMIN)}
                title="Administrador (Todos los permisos)"
              >
                <Award size={15} />
                <span>Admin</span>
              </button>

              <button 
                className={`role-btn ${currentRole === ROLES.COMITE ? 'active-COMITE' : ''}`}
                onClick={() => setCurrentRole(ROLES.COMITE)}
                title="Comité (Editar jugador, partido, torneo y ver todo)"
              >
                <Shield size={15} />
                <span>Comité</span>
              </button>

              <button 
                className={`role-btn ${currentRole === ROLES.REPRESENTANTE ? 'active-REPRESENTANTE' : ''}`}
                onClick={() => setCurrentRole(ROLES.REPRESENTANTE)}
                title="Representante / Jugador (Ver datos y crear solicitudes)"
              >
                <UserCheck size={15} />
                <span>Rep.</span>
              </button>
            </div>
          )}

          {/* User info + Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isBackendConnected && (
              <span className="badge badge-success" title="Conectado en vivo al backend TorneoSUD (Neon PostgreSQL)" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="pulse-live" style={{ backgroundColor: '#10b981' }}></span>
                Neon DB
              </span>
            )}

            {/* Usuario actual */}
            {currentUser && (
              <div className="navbar-user-chip" title={`${currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`} — ${roleInfo?.name}`}>
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="avatar" className="navbar-user-avatar" />
                ) : (
                  <div className="navbar-user-avatar-fallback">
                    <User size={14} />
                  </div>
                )}
                <span className="navbar-user-name">
                  {currentUser.firstName || (currentUser.name || '').split(' ')[0]}
                </span>
                <span className="navbar-user-role-dot" style={{ backgroundColor: roleInfo?.badgeColor }}></span>
              </div>
            )}

            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onOpenMatrix}
              title="Ver qué permisos tiene cada rol"
            >
              <HelpCircle size={15} />
            </button>

            {/* Cerrar sesión */}
            <button 
              className="btn btn-sm navbar-logout-btn"
              onClick={onLogout}
              title="Cerrar sesión"
            >
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs-wrapper">
        <nav className="nav-tabs" aria-label="Navegación principal">
          <button 
            className={`nav-tab-item ${activeTab === 'torneo' ? 'active' : ''}`}
            onClick={() => setActiveTab('torneo')}
          >
            <Trophy size={18} />
            <span>Torneo & Posiciones</span>
          </button>

          <button 
            className={`nav-tab-item ${activeTab === 'partidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('partidos')}
          >
            <Calendar size={18} />
            <span>Partidos & Fixture</span>
          </button>

          <button 
            className={`nav-tab-item ${activeTab === 'equipos' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipos')}
          >
            <Shield size={18} />
            <span>Equipos Participantes</span>
          </button>

          <button 
            className={`nav-tab-item ${activeTab === 'jugadores' ? 'active' : ''}`}
            onClick={() => setActiveTab('jugadores')}
          >
            <Users size={18} />
            <span>Jugadores & Goleadores</span>
          </button>

          <button 
            className={`nav-tab-item ${activeTab === 'solicitudes' ? 'active' : ''}`}
            onClick={() => setActiveTab('solicitudes')}
          >
            <FileText size={18} />
            <span>Solicitudes & Trámites</span>
            {pendingRequestsCount > 0 && (
              <span className="tab-badge highlight" title={`${pendingRequestsCount} solicitudes pendientes`}>
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {sessionRole === ROLES.ADMIN && (
            <button 
              className={`nav-tab-item ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('usuarios')}
            >
              <UserCheck size={18} />
              <span>Perfiles & Usuarios</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
