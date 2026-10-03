import React, { useState, useEffect } from 'react';
import { Calendar, Save, ArrowLeft, RefreshCw, X, Plus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function ScheduleBuilder({ teams, existingMatches, currentRole, onClose, addToast, onMatchesCreated }) {
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  
  // Calculate matchdays per round based on teams
  const tmsCount = teams.length;
  const numTeams = tmsCount + (tmsCount % 2 !== 0 ? 1 : 0);
  const matchdaysPerRound = tmsCount > 1 ? numTeams - 1 : 1;

  // Auto mode state
  const [autoTargetRound, setAutoTargetRound] = useState(1);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual mode state
  const [manualRound, setManualRound] = useState(1);
  const [manualRoundMatchday, setManualRoundMatchday] = useState(1); // relative to the round (1 to matchdaysPerRound)
  const actualManualMatchday = (manualRound - 1) * matchdaysPerRound + manualRoundMatchday;
  const [manualMatches, setManualMatches] = useState([]);

  // Generate Fixture for a SPECIFIC ROUND
  const generateFixtureForRound = (targetRound) => {
    if (teams.length < 2) return;
    
    let tms = [...teams];
    if (tms.length % 2 !== 0) {
      tms.push({ id: 'BYE', name: 'Libre (Descansa)' });
    }
    
    const matchesPerDay = tms.length / 2;
    const targetRoundIdx = targetRound - 1;
    let currentMatchday = targetRoundIdx * matchdaysPerRound + 1;
    
    let schedule = [];
    let currentTeams = [...tms];
    const swapLocals = (targetRoundIdx % 2 !== 0); 
    
    for (let day = 0; day < matchdaysPerRound; day++) {
      let dayMatches = [];
      for (let i = 0; i < matchesPerDay; i++) {
        let home = currentTeams[i];
        let away = currentTeams[tms.length - 1 - i];
        
        if (home.id !== 'BYE' && away.id !== 'BYE') {
          if (swapLocals) {
            const temp = home;
            home = away;
            away = temp;
          }
          
          dayMatches.push({
            matchday: currentMatchday,
            homeTeamId: home.id,
            awayTeamId: away.id,
            homeTeamName: home.name,
            awayTeamName: away.name,
            date: '',
            time: '10:00',
            stadium: home.stadium || 'Cancha Principal'
          });
        }
      }
      schedule.push({ matchday: currentMatchday, matches: dayMatches });
      
      const last = currentTeams.pop();
      currentTeams.splice(1, 0, last);
      
      currentMatchday++;
    }
    setGeneratedSchedule(schedule);
  };

  useEffect(() => {
    if (mode === 'auto') generateFixtureForRound(autoTargetRound);
  }, [autoTargetRound, teams, mode]);

  const handleMatchChange = (dayIndex, matchIndex, field, value) => {
    const updatedSchedule = [...generatedSchedule];
    updatedSchedule[dayIndex].matches[matchIndex][field] = value;
    setGeneratedSchedule(updatedSchedule);
  };

  const addManualMatch = () => {
    setManualMatches([
      ...manualMatches,
      {
        id: Date.now() + Math.random(),
        homeTeamId: '',
        awayTeamId: '',
        date: '',
        time: '10:00',
        stadium: ''
      }
    ]);
  };

  const removeManualMatch = (id) => {
    setManualMatches(manualMatches.filter(m => m.id !== id));
  };

  const updateManualMatch = (id, field, value) => {
    setManualMatches(manualMatches.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSaveSchedule = async () => {
    let allMatchesToSave = [];

    if (mode === 'auto') {
      for (const day of generatedSchedule) {
        for (const m of day.matches) {
          if (!m.date) {
            addToast({ type: 'error', title: 'Falta información', message: `El partido de Jornada ${m.matchday} entre ${m.homeTeamName} y ${m.awayTeamName} no tiene fecha seleccionada.` });
            return;
          }
          allMatchesToSave.push({
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            date: m.date,
            time: m.time,
            stadium: m.stadium,
            matchday: m.matchday,
            status: 'Programado',
            homeScore: 0,
            awayScore: 0,
            incidents: []
          });
        }
      }
    } else {
      // Manual mode validation
      if (manualMatches.length === 0) {
        addToast({ type: 'error', title: 'Sin Partidos', message: 'Debes agregar al menos un partido manual para guardar.' });
        return;
      }

      const playedTeams = new Set();
      for (const m of manualMatches) {
        if (!m.homeTeamId || !m.awayTeamId) {
          addToast({ type: 'error', title: 'Falta información', message: 'Todos los partidos deben tener equipo local y visitante seleccionados.' });
          return;
        }
        if (m.homeTeamId === m.awayTeamId) {
          addToast({ type: 'error', title: 'Partido Inválido', message: 'Un equipo no puede jugar contra sí mismo.' });
          return;
        }
        if (!m.date) {
          addToast({ type: 'error', title: 'Falta información', message: 'Todos los partidos deben tener una fecha seleccionada.' });
          return;
        }
        if (playedTeams.has(m.homeTeamId)) {
          addToast({ type: 'error', title: 'Equipo Duplicado', message: 'Un equipo no puede jugar dos veces en la misma jornada.' });
          return;
        }
        playedTeams.add(m.homeTeamId);

        if (playedTeams.has(m.awayTeamId)) {
          addToast({ type: 'error', title: 'Equipo Duplicado', message: 'Un equipo no puede jugar dos veces en la misma jornada.' });
          return;
        }
        playedTeams.add(m.awayTeamId);

        allMatchesToSave.push({
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          date: m.date,
          time: m.time,
          stadium: m.stadium,
          matchday: actualManualMatchday,
          status: 'Programado',
          homeScore: 0,
          awayScore: 0,
          incidents: []
        });
      }
    }
    
    setIsGenerating(true);
    try {
      const createdMatches = [];
      for (const matchData of allMatchesToSave) {
        const res = await api.createMatch(matchData, currentRole);
        if (res.error) throw new Error(res.error);
        createdMatches.push(res.match);
      }
      
      addToast({
        type: 'success',
        title: mode === 'auto' ? 'Fixture Generado' : 'Jornada Guardada',
        message: `Se han programado exitosamente ${createdMatches.length} partidos.`
      });
      onMatchesCreated(createdMatches);
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Error al guardar los partidos programados.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Calendar size={22} color="#10b981" />
              Programar Partidos
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, marginTop: '4px' }}>
              Elige la vuelta y jornada que deseas generar o agregar.
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={handleSaveSchedule} className="btn btn-primary" disabled={isGenerating}>
            <Save size={16} /> {isGenerating ? 'Guardando...' : 'Guardar Calendario'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          className={`btn ${mode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('auto')}
        >
          Sugerencias Automáticas
        </button>
        <button 
          className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('manual')}
        >
          Creación Manual (Jornada)
        </button>
      </div>

      {mode === 'auto' && (
        <>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px' }}>
            <label style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Generar sugerencias para la Vuelta #:</label>
            <input 
              type="number" 
              min="1" 
              max="4" 
              value={autoTargetRound} 
              onChange={(e) => setAutoTargetRound(Number(e.target.value))} 
              className="form-input" 
              style={{ width: '80px', padding: '6px' }} 
            />
            <button onClick={() => generateFixtureForRound(autoTargetRound)} className="btn btn-secondary">
              <RefreshCw size={16} /> Regenerar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {generatedSchedule.map((day, dayIndex) => (
              <div key={day.matchday} style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--pitch-green-light)', marginBottom: '16px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                  Jornada {day.matchday} (Vuelta {autoTargetRound})
                </h3>
                
                <div className="table-responsive">
                  <table className="custom-table" style={{ background: 'transparent', boxShadow: 'none' }}>
                    <thead>
                      <tr>
                        <th>Partido</th>
                        <th>Fecha sugerida</th>
                        <th>Hora</th>
                        <th>Cancha / Estadio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.matches.map((match, matchIndex) => (
                        <tr key={matchIndex}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>
                            {match.homeTeamName} <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>vs</span> {match.awayTeamName}
                          </td>
                          <td>
                            <input 
                              type="date" 
                              className="form-input" 
                              value={match.date}
                              onChange={(e) => handleMatchChange(dayIndex, matchIndex, 'date', e.target.value)}
                              style={{ padding: '6px', fontSize: '0.85rem' }}
                            />
                          </td>
                          <td>
                            <input 
                              type="time" 
                              className="form-input" 
                              value={match.time}
                              onChange={(e) => handleMatchChange(dayIndex, matchIndex, 'time', e.target.value)}
                              style={{ padding: '6px', fontSize: '0.85rem' }}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={match.stadium}
                              onChange={(e) => handleMatchChange(dayIndex, matchIndex, 'stadium', e.target.value)}
                              style={{ padding: '6px', fontSize: '0.85rem' }}
                            />
                          </td>
                        </tr>
                      ))}
                      {day.matches.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay partidos para esta jornada</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {mode === 'manual' && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vuelta #:</label>
              <input 
                type="number" 
                min="1" 
                max="4"
                value={manualRound} 
                onChange={(e) => setManualRound(Number(e.target.value))} 
                className="form-input" 
                style={{ width: '80px', padding: '8px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Jornada de la vuelta:</label>
              <select 
                className="form-select" 
                value={manualRoundMatchday} 
                onChange={(e) => setManualRoundMatchday(Number(e.target.value))}
                style={{ padding: '8px', minWidth: '150px' }}
              >
                {Array.from({ length: matchdaysPerRound }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>Jornada {day}</option>
                ))}
              </select>
            </div>
            <div style={{ marginLeft: '10px', color: 'var(--pitch-green-light)', fontWeight: 600, marginTop: '22px' }}>
              (Jornada Global: {actualManualMatchday})
            </div>
            <button onClick={addManualMatch} className="btn btn-secondary" style={{ marginTop: '22px', marginLeft: 'auto' }}>
              <Plus size={16} /> Agregar Partido
            </button>
          </div>

          {manualMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: '10px' }}>
              <AlertCircle size={32} style={{ opacity: 0.5, margin: '0 auto 10px auto' }} />
              <p>Aún no has agregado partidos manuales.</p>
              <p style={{ fontSize: '0.8rem' }}>Haz clic en "Agregar Partido" para comenzar a armar la jornada.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table" style={{ background: 'transparent', boxShadow: 'none' }}>
                <thead>
                  <tr>
                    <th>Local</th>
                    <th>Visitante</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Cancha / Estadio</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {manualMatches.map((match) => (
                    <tr key={match.id}>
                      <td>
                        <select 
                          className="form-select" 
                          value={match.homeTeamId} 
                          onChange={(e) => updateManualMatch(match.id, 'homeTeamId', e.target.value)}
                          style={{ padding: '6px', fontSize: '0.85rem' }}
                        >
                          <option value="">Seleccione Local...</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select 
                          className="form-select" 
                          value={match.awayTeamId} 
                          onChange={(e) => updateManualMatch(match.id, 'awayTeamId', e.target.value)}
                          style={{ padding: '6px', fontSize: '0.85rem' }}
                        >
                          <option value="">Seleccione Visitante...</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={match.date}
                          onChange={(e) => updateManualMatch(match.id, 'date', e.target.value)}
                          style={{ padding: '6px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="time" 
                          className="form-input" 
                          value={match.time}
                          onChange={(e) => updateManualMatch(match.id, 'time', e.target.value)}
                          style={{ padding: '6px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Sede"
                          value={match.stadium}
                          onChange={(e) => updateManualMatch(match.id, 'stadium', e.target.value)}
                          style={{ padding: '6px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => removeManualMatch(match.id)} className="btn btn-danger btn-sm" title="Quitar partido">
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
