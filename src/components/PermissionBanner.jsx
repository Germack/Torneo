import React from 'react';
import { 
  Award, 
  Shield, 
  UserCheck, 
  Check, 
  X, 
  PlusCircle, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import { ROLES, ROLE_INFO } from '../data/initialData';

export function PermissionBanner({ 
  currentRole, 
  currentUser, 
  onNewRequest, 
  onEditTournament 
}) {
  const roleData = ROLE_INFO[currentRole];

  return (
    <div className={`perm-banner ${currentRole}`}>
      <div className="perm-banner-user">
        <img 
          src={currentUser.avatar} 
          alt={currentUser.name} 
          className="perm-banner-avatar" 
        />
        <div className="perm-banner-info">
          <h4>
            {currentUser.name}
            <span 
              className="role-tag"
              style={{ background: roleData.badgeBg, color: roleData.badgeColor, border: `1px solid ${roleData.badgeColor}` }}
            >
              {currentRole === ROLES.ADMIN && <Award size={13} />}
              {currentRole === ROLES.COMITE && <Shield size={13} />}
              {currentRole === ROLES.REPRESENTANTE && <UserCheck size={13} />}
              {roleData.name}
            </span>
          </h4>
          <p>{currentUser.title} {currentUser.teamName ? `• ${currentUser.teamName}` : ''}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <span className={`badge ${currentRole === ROLES.REPRESENTANTE ? 'badge-neutral' : 'badge-success'}`}>
            {currentRole === ROLES.REPRESENTANTE ? <X size={12} /> : <Check size={12} />}
            Editar Torneo
          </span>
          <span className={`badge ${currentRole === ROLES.REPRESENTANTE ? 'badge-neutral' : 'badge-success'}`}>
            {currentRole === ROLES.REPRESENTANTE ? <X size={12} /> : <Check size={12} />}
            Editar Partido
          </span>
          <span className={`badge ${currentRole === ROLES.REPRESENTANTE ? 'badge-neutral' : 'badge-success'}`}>
            {currentRole === ROLES.REPRESENTANTE ? <X size={12} /> : <Check size={12} />}
            Editar Jugador
          </span>
          <span className="badge badge-success">
            <Check size={12} />
            Crear Solicitud
          </span>
        </div>

        {/* Quick action button tailored to role */}
        {currentRole === ROLES.REPRESENTANTE ? (
          <button className="btn btn-primary btn-sm" onClick={onNewRequest}>
            <PlusCircle size={15} />
            Crear Solicitud
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={onEditTournament}>
            <Edit3 size={15} />
            Editar Torneo
          </button>
        )}
      </div>
    </div>
  );
}
