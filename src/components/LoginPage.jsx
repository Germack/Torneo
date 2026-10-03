import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const BARRIOS = [
  'Arboledas', 'Montecarmelo', 'Valle Nuevo', 'Monte Cristo',
  'Las Cañas', 'Alta Vista', 'La Palma', 'Rosalinda'
];

const CEDULA_REGEX = /^\d{3}-\d{4}-\d{4}$/;

function calcAge(birthDateStr) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ============================================================
// FORMULARIO DE LOGIN
// ============================================================
function LoginForm({ onLogin, onSwitch, isBackendOnline }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.login(identifier, password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-logo">
        <div className="auth-logo-icon">⚽</div>
        <div>
          <h1 className="auth-title">TorneoSUD</h1>
          <p className="auth-subtitle">Sistema de Gestión de Torneos</p>
        </div>
      </div>

      <h2 className="auth-form-title">Iniciar Sesión</h2>
      <p className="auth-form-desc">Accede con tu usuario y contraseña</p>

      {!isBackendOnline && (
        <div className="auth-warning-banner">
          <span>⚠️</span>
          <span>Backend offline — el login requiere conexión al servidor TorneoSUD.</span>
        </div>
      )}

      {error && (
        <div className="auth-error-box">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Usuario o correo electrónico</label>
          <input
            id="login-identifier"
            type="text"
            className="form-input"
            placeholder="Ej: cmendoza o tu@correo.com"
            value={identifier}
            onChange={e => { setIdentifier(e.target.value); setError(''); }}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <div className="input-with-icon">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Tu contraseña"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>



        <button
          type="submit"
          className="btn-auth-submit"
          disabled={loading || !isBackendOnline}
        >
          {loading ? (
            <><span className="spinner-sm"></span> Verificando...</>
          ) : (
            <><span>🔐</span> Iniciar Sesión</>
          )}
        </button>
      </form>

      <div className="auth-switch">
        <span>¿No tienes cuenta?</span>
        <button type="button" className="auth-switch-btn" onClick={onSwitch}>
          Crear cuenta nueva →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FORMULARIO DE REGISTRO - MULTI-PASO
// ============================================================
function RegisterForm({ onSuccess, onSwitch }) {
  const [step, setStep] = useState(1); // 1: Datos básicos, 2: Datos personales, 3: Tutor (si < 18), 4: Confirmación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    cedula: '',
    barrio: '',
    role: 'REPRESENTANTE',
    guardianName: '',
    guardianPhone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const age = calcAge(form.birthDate);
  const isMinor = age !== null && age >= 16 && age < 18;
  const isTooYoung = age !== null && age < 16;
  const totalSteps = isMinor ? 4 : 3; // 4 pasos si menor, 3 si mayor

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const formatCedula = (val) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!form.firstName.trim()) return 'El nombre es obligatorio.';
      if (!form.lastName.trim()) return 'El apellido es obligatorio.';
      if (!form.email.includes('@')) return 'El correo electrónico no es válido.';
      if (form.username.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres.';
      if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
      if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden.';
    }
    if (s === 2) {
      if (!form.phone.trim()) return 'El número de teléfono es obligatorio.';
      if (!form.birthDate) return 'La fecha de nacimiento es obligatoria.';
      if (isTooYoung) return 'Debes tener al menos 16 años para registrarte.';
      if (!form.barrio) return 'Por favor selecciona tu barrio.';
      if (form.role === 'COMITE') {
        if (!form.cedula) return 'El número de cédula de miembro es obligatorio para el Comité.';
        if (!CEDULA_REGEX.test(form.cedula)) return 'La cédula debe tener el formato: 000-0000-0000.';
      }
    }
    if (s === 3 && isMinor) {
      if (!form.guardianName.trim()) return 'El nombre del padre, madre o tutor legal es obligatorio.';
      if (!form.guardianPhone.trim()) return 'El número de teléfono del tutor es obligatorio.';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    // Si no es menor y estamos en paso 2, vamos directamente al paso de confirmación (3 = review)
    if (step === 2 && !isMinor) {
      setStep(3); // paso de revisión (sin tutor)
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    if (step === 3 && !isMinor) {
      setStep(2);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isMinor) {
      const err = validateStep(3);
      if (err) { setError(err); return; }
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        username: form.username,
        password: form.password,
        phone: form.phone,
        birthDate: form.birthDate,
        cedula: form.cedula || null,
        barrio: form.barrio,
        role: form.role,
        guardianName: isMinor ? form.guardianName : null,
        guardianPhone: isMinor ? form.guardianPhone : null,
      });
      setSuccess(result);
    } catch (err) {
      setError(err.message || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Vista de éxito
  if (success) {
    return (
      <div className="auth-form-container">
        <div className="auth-success-screen">
          <div className="success-icon-big">🎉</div>
          <h2 className="success-title">¡Cuenta creada exitosamente!</h2>
          <p className="success-message">{success.message}</p>

          {success.requiresApproval && (
            <div className="success-pending-notice">
              <span>⏳</span>
              <div>
                <strong>Pendiente de aprobación</strong>
                <p>El administrador revisará tu solicitud para unirte al Comité. Recibirás acceso una vez aprobado.</p>
              </div>
            </div>
          )}

          <div className="success-user-summary">
            <div className="summary-row"><span>👤</span><span>{form.firstName} {form.lastName}</span></div>
            <div className="summary-row"><span>📧</span><span>{form.email}</span></div>
            <div className="summary-row"><span>🏷️</span><span>@{form.username}</span></div>
            <div className="summary-row">
              <span>{form.role === 'COMITE' ? '📋' : '🏅'}</span>
              <span>{form.role === 'COMITE' ? 'Miembro del Comité' : 'Representante / Jugador'}</span>
            </div>
          </div>

          {!success.requiresApproval && (
            <button className="btn-auth-submit" onClick={onSwitch} style={{ marginTop: '1.5rem' }}>
              🔐 Ir al inicio de sesión
            </button>
          )}

          {success.requiresApproval && (
            <button className="btn-auth-secondary" onClick={onSwitch} style={{ marginTop: '1.5rem' }}>
              Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    );
  }

  const stepTitles = isMinor
    ? ['Credenciales', 'Datos personales', 'Tutor legal', 'Revisión']
    : ['Credenciales', 'Datos personales', 'Revisión'];

  return (
    <div className="auth-form-container">
      <div className="auth-logo">
        <div className="auth-logo-icon">⚽</div>
        <div>
          <h1 className="auth-title">TorneoSUD</h1>
          <p className="auth-subtitle">Registro de usuario</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="auth-stepper">
        {stepTitles.map((title, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isDone = stepNum < step;
          return (
            <React.Fragment key={i}>
              <div className={`stepper-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                <div className="stepper-circle">
                  {isDone ? '✓' : stepNum}
                </div>
                <span className="stepper-label">{title}</span>
              </div>
              {i < stepTitles.length - 1 && (
                <div className={`stepper-line ${isDone ? 'done' : ''}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="auth-error-box">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* PASO 1: Credenciales */}
      {step === 1 && (
        <div className="auth-form">
          <h3 className="step-title">Credenciales de acceso</h3>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nombres *</label>
              <input type="text" className="form-input" placeholder="Ej: Carlos Eduardo"
                value={form.firstName} onChange={e => update('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Apellidos *</label>
              <input type="text" className="form-input" placeholder="Ej: Mendoza López"
                value={form.lastName} onChange={e => update('lastName', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo electrónico *</label>
            <input type="email" className="form-input" placeholder="tu@correo.com"
              value={form.email} onChange={e => update('email', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de usuario *</label>
            <input type="text" className="form-input" placeholder="Ej: cmendoza (sin espacios)"
              value={form.username}
              onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))} />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <div className="input-with-icon">
              <input type={showPassword ? 'text' : 'password'} className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={form.password} onChange={e => update('password', e.target.value)} />
              <button type="button" className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar contraseña *</label>
            <div className="input-with-icon">
              <input type={showConfirmPassword ? 'text' : 'password'} className="form-input"
                placeholder="Repite tu contraseña"
                value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
              <button type="button" className="input-icon-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <span className="field-error">Las contraseñas no coinciden</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de cuenta *</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-option ${form.role === 'REPRESENTANTE' ? 'selected' : ''}`}
                onClick={() => update('role', 'REPRESENTANTE')}
              >
                <span className="role-icon">🏅</span>
                <span className="role-name">Representante / Jugador</span>
                <span className="role-desc">Acceso de consulta y creación de solicitudes</span>
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'COMITE' ? 'selected' : ''}`}
                onClick={() => update('role', 'COMITE')}
              >
                <span className="role-icon">📋</span>
                <span className="role-name">Miembro del Comité</span>
                <span className="role-desc">Requiere aprobación del administrador</span>
                {form.role === 'COMITE' && (
                  <span className="role-approval-badge">⏳ Aprobación requerida</span>
                )}
              </button>
            </div>
          </div>

          <button type="button" className="btn-auth-submit" onClick={nextStep}>
            Siguiente →
          </button>
        </div>
      )}

      {/* PASO 2: Datos personales */}
      {step === 2 && (
        <div className="auth-form">
          <h3 className="step-title">Datos personales</h3>

          <div className="form-group">
            <label className="form-label">Número de teléfono *</label>
            <input type="tel" className="form-input" placeholder="Ej: +505 8888-0000"
              value={form.phone} onChange={e => update('phone', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de nacimiento *</label>
            <input type="date" className="form-input"
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
              value={form.birthDate} onChange={e => update('birthDate', e.target.value)} />
            {form.birthDate && age !== null && (
              <span className={`field-hint ${isTooYoung ? 'error' : 'ok'}`}>
                {isTooYoung
                  ? '❌ Debes tener al menos 16 años para registrarte.'
                  : isMinor
                  ? `⚠️ Tienes ${age} años. Se requieren datos del tutor legal.`
                  : `✅ Tienes ${age} años.`}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Barrio *</label>
            <select className="form-input" value={form.barrio}
              onChange={e => update('barrio', e.target.value)}>
              <option value="">— Selecciona tu barrio —</option>
              {BARRIOS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {form.role === 'COMITE' && (
            <div className="form-group">
              <label className="form-label">
                Número de cédula de miembro *
                <span className="field-hint-inline">(Formato: 000-0000-0000)</span>
              </label>
              <input type="text" className="form-input" placeholder="000-0000-0000"
                maxLength={14}
                value={form.cedula}
                onChange={e => update('cedula', formatCedula(e.target.value))} />
              {form.cedula && !CEDULA_REGEX.test(form.cedula) && (
                <span className="field-error">Formato inválido. Usa: 000-0000-0000</span>
              )}
            </div>
          )}

          <div className="auth-step-nav">
            <button type="button" className="btn-auth-secondary" onClick={prevStep}>
              ← Anterior
            </button>
            <button type="button" className="btn-auth-submit" onClick={nextStep}
              disabled={isTooYoung}>
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Tutor legal (solo si es menor) */}
      {step === 3 && isMinor && (
        <div className="auth-form">
          <h3 className="step-title">Datos del tutor legal</h3>
          <div className="minor-notice">
            <span>📋</span>
            <div>
              <strong>Requerido para menores de 18 años</strong>
              <p>Como tienes {age} años, necesitamos los datos de tu padre, madre o tutor legal para completar el registro.</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre completo del padre, madre o tutor legal *</label>
            <input type="text" className="form-input" placeholder="Nombre completo"
              value={form.guardianName} onChange={e => update('guardianName', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Número de teléfono del tutor legal *</label>
            <input type="tel" className="form-input" placeholder="Ej: +505 8888-1111"
              value={form.guardianPhone} onChange={e => update('guardianPhone', e.target.value)} />
          </div>

          <div className="auth-step-nav">
            <button type="button" className="btn-auth-secondary" onClick={prevStep}>
              ← Anterior
            </button>
            <button type="button" className="btn-auth-submit" onClick={nextStep}>
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* PASO REVISIÓN (3 sin tutor, 4 con tutor) */}
      {((step === 3 && !isMinor) || (step === 4 && isMinor)) && (
        <div className="auth-form">
          <h3 className="step-title">Revisa tus datos</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Por favor verifica que toda la información sea correcta antes de crear tu cuenta.
          </p>

          <div className="review-card">
            <div className="review-section-title">Credenciales</div>
            <div className="review-row"><span>Nombre</span><strong>{form.firstName} {form.lastName}</strong></div>
            <div className="review-row"><span>Usuario</span><strong>@{form.username}</strong></div>
            <div className="review-row"><span>Correo</span><strong>{form.email}</strong></div>
            <div className="review-row"><span>Tipo de cuenta</span>
              <strong className={`review-role ${form.role.toLowerCase()}`}>
                {form.role === 'COMITE' ? '📋 Comité' : '🏅 Representante'}
              </strong>
            </div>
          </div>

          <div className="review-card" style={{ marginTop: '0.75rem' }}>
            <div className="review-section-title">Datos personales</div>
            <div className="review-row"><span>Teléfono</span><strong>{form.phone}</strong></div>
            <div className="review-row"><span>Fecha de nac.</span><strong>{form.birthDate}</strong></div>
            <div className="review-row"><span>Barrio</span><strong>{form.barrio}</strong></div>
            {form.cedula && <div className="review-row"><span>Cédula</span><strong>{form.cedula}</strong></div>}
          </div>

          {isMinor && (
            <div className="review-card" style={{ marginTop: '0.75rem' }}>
              <div className="review-section-title">Tutor legal</div>
              <div className="review-row"><span>Nombre</span><strong>{form.guardianName}</strong></div>
              <div className="review-row"><span>Teléfono</span><strong>{form.guardianPhone}</strong></div>
            </div>
          )}

          {form.role === 'COMITE' && (
            <div className="auth-info-box" style={{ marginTop: '1rem' }}>
              <span>ℹ️</span>
              <span>Tu cuenta como miembro del Comité quedará <strong>pendiente de aprobación</strong> por el Administrador antes de poder acceder.</span>
            </div>
          )}

          {error && (
            <div className="auth-error-box" style={{ marginTop: '1rem' }}>
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          <div className="auth-step-nav">
            <button type="button" className="btn-auth-secondary" onClick={prevStep} disabled={loading}>
              ← Corregir
            </button>
            <button type="button" className="btn-auth-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <><span className="spinner-sm"></span> Creando cuenta...</>
              ) : (
                <><span>✅</span> Crear cuenta</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="auth-switch">
        <span>¿Ya tienes cuenta?</span>
        <button type="button" className="auth-switch-btn" onClick={onSwitch}>
          ← Iniciar sesión
        </button>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL DE LOGIN PAGE
// ============================================================
export function LoginPage({ onLogin, isBackendOnline }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  return (
    <div className="auth-page">
      {/* Fondo decorativo */}
      <div className="auth-bg">
        <div className="auth-bg-pitch"></div>
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
        <div className="auth-bg-orb auth-bg-orb-3"></div>
      </div>

      {/* Panel lateral (desktop) */}
      <div className="auth-panel-left">
        <div className="auth-panel-content">
          <div className="auth-panel-logo">⚽</div>
          <h1 className="auth-panel-title">TorneoSUD</h1>
          <p className="auth-panel-sub">Sistema Integral de Gestión de Torneos de Fútbol</p>

          <div className="auth-panel-features">
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <div>
                <strong>Gestión de torneos</strong>
                <p>Organiza torneos, fases y categorías de manera eficiente</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚽</span>
              <div>
                <strong>Control de partidos</strong>
                <p>Registra resultados, incidencias y estadísticas en tiempo real</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div>
                <strong>Gestión de equipos y jugadores</strong>
                <p>Administra plantillas, dorsales y estados de habilitación</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <div>
                <strong>Sistema de solicitudes</strong>
                <p>Tramita inscripciones, apelaciones y cambios oficialmente</p>
              </div>
            </div>
          </div>

          <div className="auth-panel-footer">
            <div className={`backend-status-dot ${isBackendOnline ? 'online' : 'offline'}`}></div>
            <span>Backend TorneoSUD: {isBackendOnline ? 'En línea ✅' : 'Sin conexión ⚠️'}</span>
          </div>
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="auth-panel-right">
        <div className="auth-card">
          {mode === 'login' ? (
            <LoginForm
              onLogin={onLogin}
              onSwitch={() => setMode('register')}
              isBackendOnline={isBackendOnline}
            />
          ) : (
            <RegisterForm
              onSuccess={() => {}}
              onSwitch={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
