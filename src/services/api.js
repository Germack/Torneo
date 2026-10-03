// Servicio API para conectar el Frontend React con el Backend TorneoSUD (Neon PostgreSQL)

const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
  // Estado del servidor
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  },

  // ============================================================
  // AUTENTICACIÓN
  // ============================================================
  login: async (identifier, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      return data;
    } catch (err) {
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar usuario');
      return data;
    } catch (err) {
      throw err;
    }
  },

  getUsers: async (userRole) => {
    const res = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: { 'x-user-role': userRole }
    });
    return await res.json();
  },

  approveUser: async (userId, approvalStatus, role, userRole) => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify({ approvalStatus, role })
    });
    return await res.json();
  },

  changeUserRole: async (userId, role, userRole) => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify({ role })
    });
    return await res.json();
  },

  // ============================================================
  // TORNEO
  // ============================================================
  getTournament: async () => {
    const res = await fetch(`${API_BASE_URL}/tournament`);
    return await res.json();
  },
  updateTournament: async (data, userRole) => {
    const res = await fetch(`${API_BASE_URL}/tournament`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // ============================================================
  // EQUIPOS
  // ============================================================
  getTeams: async () => {
    const res = await fetch(`${API_BASE_URL}/teams`);
    return await res.json();
  },
  createTeam: async (data, userRole) => {
    const res = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  updateTeam: async (id, data, userRole) => {
    const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  deleteTeam: async (id, userRole) => {
    const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': userRole
      }
    });
    return await res.json();
  },

  // ============================================================
  // JUGADORES
  // ============================================================
  getPlayers: async () => {
    const res = await fetch(`${API_BASE_URL}/players`);
    return await res.json();
  },
  createPlayer: async (data, userRole) => {
    const res = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  updatePlayer: async (id, data, userRole) => {
    const res = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  deletePlayer: async (id, userRole) => {
    const res = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': userRole
      }
    });
    return await res.json();
  },

  // ============================================================
  // PARTIDOS
  // ============================================================
  getMatches: async () => {
    const res = await fetch(`${API_BASE_URL}/matches`);
    return await res.json();
  },
  createMatch: async (data, userRole) => {
    const res = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  updateMatch: async (id, data, userRole) => {
    const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  deleteMatches: async (params, userRole) => {
    // params is an object like { all: true } or { matchday: 2 }
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/matches?${queryString}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': userRole
      }
    });
    return await res.json();
  },

  // ============================================================
  // SOLICITUDES
  // ============================================================
  getRequests: async () => {
    const res = await fetch(`${API_BASE_URL}/requests`);
    return await res.json();
  },
  createRequest: async (data) => {
    const res = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  resolveRequest: async (id, action, note, resolvedBy, userRole) => {
    const res = await fetch(`${API_BASE_URL}/requests/${id}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify({ action, note, resolvedBy })
    });
    return await res.json();
  },

  // Reiniciar base de datos en Neon
  resetDatabase: async () => {
    const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    return await res.json();
  }
};

