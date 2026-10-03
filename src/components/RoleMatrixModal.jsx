import React from 'react';
import { X, ShieldCheck, Check, AlertTriangle, UserCheck, Shield, Award } from 'lucide-react';
import { ROLE_INFO, ROLES } from '../data/initialData';

export function RoleMatrixModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const permissionsList = [
    {
      action: 'Ver datos del torneo, tabla, fixture y estadísticas',
      admin: true,
      comite: true,
      representante: true,
      category: 'Visualización'
    },
    {
      action: 'Ver fichas de jugadores y clubes',
      admin: true,
      comite: true,
      representante: true,
      category: 'Visualización'
    },
    {
      action: 'Crear solicitudes oficiales (inscripciones, cambios, apelaciones)',
      admin: true,
      comite: true,
      representante: true,
      highlight: true,
      category: 'Solicitudes'
    },
    {
      action: 'Editar datos del torneo (nombre, fechas, sede, premios, reglas)',
      admin: true,
      comite: true,
      representante: false,
      category: 'Gestión Deportiva'
    },
    {
      action: 'Editar datos de partidos (marcador, fecha, cancha, árbitro, incidencias)',
      admin: true,
      comite: true,
      representante: false,
      category: 'Gestión Deportiva'
    },
    {
      action: 'Editar jugadores (dorsal, posición, sanciones, habilitación médica)',
      admin: true,
      comite: true,
      representante: false,
      category: 'Gestión Deportiva'
    },
    {
      action: 'Resolver / Emitir dictamen en solicitudes (Aprobar / Rechazar)',
      admin: true,
      comite: true,
      representante: false,
      category: 'Solicitudes'
    },
    {
      action: 'Crear nuevos partidos en el fixture',
      admin: true,
      comite: false,
      representante: false,
      category: 'Administración Total'
    },
    {
      action: 'Crear nuevos torneos o eliminar torneos',
      admin: true,
      comite: false,
      representante: false,
      category: 'Administración Total'
    },
    {
      action: 'Gestionar roles de usuario y permisos del sistema',
      admin: true,
      comite: false,
      representante: false,
      category: 'Administración Total'
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <ShieldCheck size={24} color="#10b981" />
            Matriz Oficial de Permisos por Rol
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Esta tabla resume el control de acceso basado en roles configurado según los requerimientos solicitados para la app:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', fontWeight: 700, marginBottom: '6px' }}>
                <Award size={18} /> Administrador
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong>Todos los permisos.</strong> Acceso total al sistema, creación/edición de torneos, partidos, clubes, jugadores y resolución de trámites.
              </p>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: 700, marginBottom: '6px' }}>
                <Shield size={18} /> Comité
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong>Permiso de editar:</strong> Jugador, datos del partido, datos del torneo y ver cada uno de ellos. Resolver solicitudes deportivas.
              </p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, marginBottom: '6px' }}>
                <UserCheck size={18} /> Representante / Jugador
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong>Permiso de ver los datos</strong> del torneo, tablas, partidos, plantillas y <strong>permiso para crear solicitudes</strong>.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '240px' }}>Acción / Funcionalidad</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Admin</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Comité</th>
                  <th style={{ textAlign: 'center', width: '160px' }}>Representante / Jugador</th>
                </tr>
              </thead>
              <tbody>
                {permissionsList.map((item, idx) => (
                  <tr key={idx} style={item.highlight ? { background: 'rgba(16, 185, 129, 0.06)' } : {}}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.action}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.category}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.admin ? (
                        <span className="badge badge-success"><Check size={14} /> Permitido</span>
                      ) : (
                        <span className="badge badge-danger"><X size={14} /> Denegado</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.comite ? (
                        <span className="badge badge-success"><Check size={14} /> Permitido</span>
                      ) : (
                        <span className="badge badge-neutral"><X size={14} /> No</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.representante ? (
                        <span className="badge badge-success"><Check size={14} /> Permitido</span>
                      ) : (
                        <span className="badge badge-neutral"><X size={14} /> Solo Lectura</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
