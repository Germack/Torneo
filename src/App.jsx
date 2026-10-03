import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ROLES, 
  ROLE_INFO, 
  INITIAL_USERS, 
  INITIAL_TOURNAMENT, 
  INITIAL_TEAMS, 
  INITIAL_PLAYERS, 
  INITIAL_MATCHES, 
  INITIAL_REQUESTS 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { TournamentView } from './components/TournamentView';
import { MatchesView } from './components/MatchesView';
import { TeamsView } from './components/TeamsView';
import { PlayersView } from './components/PlayersView';
import { RequestsView } from './components/RequestsView';
import { UsersAdminView } from './components/UsersAdminView';
import { RoleMatrixModal } from './components/RoleMatrixModal';
import { ToastContainer } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { api } from './services/api';

export function App() {
  // ============================================================
  // AUTENTICACIÓN
  // ============================================================
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('copamaster_token');
  });

  const [sessionUser, setSessionUser] = useState(() => {
    const saved = localStorage.getItem('copamaster_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // ============================================================
  // ESTADO DE LA APP
  // ============================================================
  // sessionRole = rol real de la cuenta (nunca cambia durante la sesión)
  // viewRole    = rol que el Admin está previsualizando (sólo cosmético)
  const sessionRole = sessionUser?.role || localStorage.getItem('copamaster_role') || ROLES.ADMIN;

  // viewRole: si el admin está en modo preview, usa ese; si no, usa el rol real
  const [viewRole, setViewRole] = useState(() => {
    const saved = sessionStorage.getItem('copamaster_view_role');
    return saved || sessionRole;
  });

  // El rol efectivo para permisos siempre es el sessionRole
  // El rol efectivo para la VISTA es viewRole (que el admin puede cambiar)
  const isAdminPreviewMode = sessionRole === ROLES.ADMIN && viewRole !== ROLES.ADMIN;

  const [activeTab, setActiveTab] = useState('torneo');
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isEditTournamentModalOpen, setIsEditTournamentModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // Tournament Data with LocalStorage Persistence & Neon DB Sync
  const [tournament, setTournament] = useState(() => {
    const saved = localStorage.getItem('copamaster_tournament');
    return saved ? JSON.parse(saved) : INITIAL_TOURNAMENT;
  });

  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('copamaster_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('copamaster_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('copamaster_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('copamaster_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ============================================================
  // HEALTH CHECK + CARGAR DATOS DEL BACKEND
  // ============================================================
  useEffect(() => {
    async function initFromBackend() {
      const health = await api.checkHealth();
      if (health && health.status === 'OK') {
        setIsBackendOnline(true);
        try {
          const [tData, teData, pData, mData, rData] = await Promise.all([
            api.getTournament(),
            api.getTeams(),
            api.getPlayers(),
            api.getMatches(),
            api.getRequests()
          ]);

          if (tData && tData.id) setTournament(tData);
          if (Array.isArray(teData)) setTeams(teData);
          if (Array.isArray(pData)) setPlayers(pData);
          if (Array.isArray(mData)) setMatches(mData);
          if (Array.isArray(rData)) setRequests(rData);

          if (isLoggedIn) {
            addToast({
              type: 'success',
              title: 'Base de Datos Conectada',
              message: 'Sincronizado en tiempo real con Neon Serverless PostgreSQL.'
            });
          }
        } catch (e) {
          console.warn('Usando caché local:', e);
        }
      }
    }
    initFromBackend();
  }, []);

  // ============================================================
  // PERSISTENCIA EN LOCALSTORAGE
  // ============================================================
  useEffect(() => {
    localStorage.setItem('copamaster_role', sessionRole);
  }, [sessionRole]);


  useEffect(() => {
    localStorage.setItem('copamaster_tournament', JSON.stringify(tournament));
  }, [tournament]);

  useEffect(() => {
    localStorage.setItem('copamaster_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('copamaster_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('copamaster_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('copamaster_requests', JSON.stringify(requests));
  }, [requests]);

  // ============================================================
  // HANDLERS DE AUTENTICACIÓN
  // ============================================================
  const handleLogin = (user, token) => {
    setSessionUser(user);
    setIsLoggedIn(true);
    setViewRole(user.role);  // iniciar vista con el rol real
    sessionStorage.removeItem('copamaster_view_role');
    localStorage.setItem('copamaster_token', token);
    localStorage.setItem('copamaster_session_user', JSON.stringify(user));
    localStorage.setItem('copamaster_role', user.role);
    addToast({
      type: 'success',
      title: `¡Bienvenido, ${user.firstName || user.name}!`,
      message: `Has iniciado sesión como ${ROLE_INFO[user.role]?.name || user.role}.`
    });
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSessionUser(null);
    setViewRole(ROLES.ADMIN);
    sessionStorage.removeItem('copamaster_view_role');
    localStorage.removeItem('copamaster_token');
    localStorage.removeItem('copamaster_session_user');
  };

  // ============================================================
  // USUARIO ACTUAL
  // ============================================================
  const currentUser = sessionUser || INITIAL_USERS.find(u => u.role === sessionRole) || INITIAL_USERS[0];

  // El Admin puede previsualizar cómo se ve la app para otros roles
  // sin perder sus permisos reales
  const handleRoleChange = (newRole) => {
    if (sessionRole !== ROLES.ADMIN) return; // solo admin puede cambiar de vista
    setViewRole(newRole);
    sessionStorage.setItem('copamaster_view_role', newRole);
    const roleInfo = ROLE_INFO[newRole];
    if (newRole === ROLES.ADMIN) {
      addToast({ type: 'success', title: 'Vista Admin restaurada', message: 'Estás viendo la app con todos tus permisos de administrador.' });
      return;
    }
    addToast({
      type: 'info',
      title: `👁️ Previsualizando: ${roleInfo.name}`,
      message: `Ves la app como un ${roleInfo.shortTitle}. Tus permisos Admin siguen activos.`
    });
  };
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDIENTE').length;

  // ============================================================
  // RENDER
  // ============================================================

  // Si no está logueado, mostrar pantalla de login
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} isBackendOnline={isBackendOnline} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Admin Preview Mode Banner */}
      {isAdminPreviewMode && (
        <div className="admin-preview-banner">
          <span>👁️ Previsualizando vista de: <strong>{ROLE_INFO[viewRole]?.name}</strong></span>
          <span className="admin-preview-note">Tus permisos de Admin siguen activos</span>
          <button
            className="admin-preview-exit-btn"
            onClick={() => handleRoleChange(ROLES.ADMIN)}
          >
            ← Volver a Admin
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar 
        currentRole={viewRole}
        sessionRole={sessionRole}
        setCurrentRole={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMatrix={() => setIsMatrixOpen(true)}
        pendingRequestsCount={pendingRequestsCount}
        isBackendConnected={isBackendOnline}
        currentUser={currentUser}
        onLogout={handleLogout}
        isAdminPreviewMode={isAdminPreviewMode}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Dynamic Views — los componentes reciben viewRole para la UI */}
        {activeTab === 'torneo' && (
          <TournamentView 
            tournament={tournament}
            setTournament={setTournament}
            teams={teams}
            matches={matches}
            currentRole={viewRole}
            addToast={addToast}
            isEditModalOpen={isEditTournamentModalOpen}
            setIsEditModalOpen={setIsEditTournamentModalOpen}
          />
        )}

        {activeTab === 'partidos' && (
          <MatchesView 
            matches={matches}
            setMatches={setMatches}
            teams={teams}
            players={players}
            currentRole={viewRole}
            addToast={addToast}
          />
        )}

        {activeTab === 'equipos' && (
          <TeamsView 
            teams={teams}
            setTeams={setTeams}
            players={players}
            setPlayers={setPlayers} // Added to allow cascading deletes
            currentRole={viewRole}
            addToast={addToast}
          />
        )}

        {activeTab === 'jugadores' && (
          <PlayersView 
            players={players}
            setPlayers={setPlayers}
            teams={teams}
            matches={matches}
            currentRole={viewRole}
            addToast={addToast}
          />
        )}

        {activeTab === 'solicitudes' && (
          <RequestsView 
            requests={requests}
            setRequests={setRequests}
            teams={teams}
            players={players}
            setPlayers={setPlayers}
            currentRole={viewRole}
            currentUser={currentUser}
            addToast={addToast}
            isNewRequestModalOpen={isNewRequestModalOpen}
            setIsNewRequestModalOpen={setIsNewRequestModalOpen}
          />
        )}

        {activeTab === 'usuarios' && (
          <UsersAdminView 
            currentRole={viewRole}
            sessionRole={sessionRole}
            addToast={addToast}
          />
        )}
      </main>

      {/* Role Matrix Modal */}
      <RoleMatrixModal 
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
      />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
