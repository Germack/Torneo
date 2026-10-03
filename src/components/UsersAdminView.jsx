import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, XCircle, AlertCircle, Shield, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { ROLES, ROLE_INFO } from '../data/initialData';

export function UsersAdminView({ currentRole, sessionRole, addToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Solo el Admin real puede gestionar usuarios
  const isAdmin = sessionRole === ROLES.ADMIN;

  const fetchUsers = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await api.getUsers(sessionRole);
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        throw new Error(data.error || 'Error al obtener usuarios');
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const handleApprove = async (userId, role) => {
    try {
      const res = await api.approveUser(userId, 'APROBADO', role, sessionRole);
      if (res.error) throw new Error(res.error);
      
      addToast({ type: 'success', title: 'Usuario Aprobado', message: 'El usuario ya puede ingresar al sistema.' });
      fetchUsers();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleReject = async (userId, role) => {
    try {
      const res = await api.approveUser(userId, 'RECHAZADO', role, sessionRole);
      if (res.error) throw new Error(res.error);
      
      addToast({ type: 'success', title: 'Usuario Rechazado', message: 'Se ha denegado el acceso al usuario.' });
      fetchUsers();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  if (!isAdmin) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2>Acceso Denegado</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Solo los administradores del sistema pueden acceder a la gestión de perfiles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Users size={22} color="#ec4899" />
            Gestión de Usuarios y Perfiles
          </h2>
          <p className="section-desc">
            Aprueba, rechaza o revisa los perfiles de los usuarios registrados en el sistema.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchUsers}>
            Actualizar Lista
          </button>
        </div>
      </div>

      <div className="glass-card table-responsive" style={{ padding: '0' }}>
        <table className="custom-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Usuario / Nombre</th>
              <th>Contacto</th>
              <th>Rol / Cargo</th>
              <th>Club</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Cargando usuarios...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No hay usuarios registrados.</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.phone || 'N/A'}</div>
                  </td>
                  <td>
                    <span className="review-role" style={{ 
                      backgroundColor: ROLE_INFO[u.role]?.badgeColor ? `${ROLE_INFO[u.role].badgeColor}25` : '',
                      color: ROLE_INFO[u.role]?.badgeColor || '#fff',
                      border: `1px solid ${ROLE_INFO[u.role]?.badgeColor}40`
                    }}>
                      {ROLE_INFO[u.role]?.shortTitle || u.role}
                    </span>
                    {u.title && <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-muted)' }}>{u.title}</div>}
                  </td>
                  <td>
                    {u.teamName ? (
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.teamName}</span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sin Club / Organización</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {u.approvalStatus === 'PENDIENTE_APROBACION' && (
                      <span className="badge badge-warning">Pendiente</span>
                    )}
                    {u.approvalStatus === 'APROBADO' && (
                      <span className="badge badge-success">Aprobado</span>
                    )}
                    {u.approvalStatus === 'RECHAZADO' && (
                      <span className="badge badge-danger">Rechazado</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {u.approvalStatus === 'PENDIENTE_APROBACION' && (
                        <>
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(u.id, u.role)}
                            title="Aprobar Usuario"
                            style={{ padding: '4px 8px' }}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleReject(u.id, u.role)}
                            title="Rechazar Usuario"
                            style={{ padding: '4px 8px' }}
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      
                      {u.approvalStatus === 'RECHAZADO' && (
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleApprove(u.id, u.role)}
                          title="Cambiar a Aprobado"
                          style={{ padding: '4px 8px' }}
                        >
                          <CheckCircle2 size={14} /> Aprobar
                        </button>
                      )}

                      {u.approvalStatus === 'APROBADO' && u.role !== 'ADMIN' && (
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleReject(u.id, u.role)}
                          title="Revocar Acceso"
                          style={{ padding: '4px 8px', color: '#ef4444' }}
                        >
                          <XCircle size={14} /> Revocar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
