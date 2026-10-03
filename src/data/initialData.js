// Datos iniciales de demostración para el sistema de Torneo de Fútbol

export const ROLES = {
  ADMIN: 'ADMIN',
  COMITE: 'COMITE',
  REPRESENTANTE: 'REPRESENTANTE',
};

export const ROLE_INFO = {
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    name: 'Administrador',
    shortTitle: 'Admin Supremo',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    description: 'Acceso total y sin restricciones. Puede gestionar usuarios, torneos, equipos, partidos, jugadores y resolver solicitudes.',
    permissions: [
      'Ver todos los datos del torneo, partidos, equipos y jugadores',
      'Editar y configurar datos del torneo',
      'Crear y eliminar torneos',
      'Editar datos y resultados de partidos',
      'Crear y reprogramar partidos',
      'Editar información y estado de jugadores',
      'Crear y transferir jugadores',
      'Crear solicitudes oficiales',
      'Aprobar o rechazar solicitudes de representantes',
      'Gestionar usuarios y cambiar roles',
      'Restablecer y exportar base de datos'
    ]
  },
  [ROLES.COMITE]: {
    id: ROLES.COMITE,
    name: 'Comité Organizador / Disciplinario',
    shortTitle: 'Comité Técnico',
    badgeColor: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    description: 'Responsable de la gestión deportiva: edición de jugadores, partidos, datos del torneo y resolución de solicitudes.',
    permissions: [
      'Ver todos los datos del torneo, partidos, equipos y jugadores',
      'Editar datos del torneo (fechas, sede, categoría, premio, reglamento)',
      'Editar datos de los partidos (marcador, estado, incidencias, árbitros)',
      'Editar datos de jugadores (dorsal, posición, sanciones, habilitación)',
      'Revisar y emitir dictamen sobre solicitudes recibidas',
      'Crear solicitudes internas'
    ]
  },
  [ROLES.REPRESENTANTE]: {
    id: ROLES.REPRESENTANTE,
    name: 'Representante / Jugador',
    shortTitle: 'Representante',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    description: 'Acceso público y de clubes: consulta el torneo, calendario, estadísticas y tiene permiso para crear solicitudes oficiales.',
    permissions: [
      'Ver datos completos del torneo y reglamento',
      'Ver calendario de partidos, resultados y actas',
      'Ver tabla de posiciones y estadísticas (goleadores, tarjetas)',
      'Ver lista de equipos y plantillas de jugadores',
      'CREAR SOLICITUDES oficiales (inscripción de jugadores, cambio de fecha, apelaciones)',
      'Seguir el estado de sus solicitudes (Pendiente, Aprobada, Rechazada)'
    ]
  }
};

export const INITIAL_USERS = [
  {
    id: 'usr_admin',
    name: 'Lic. Roberto Varela',
    email: 'admin@torneo.com',
    role: ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Presidente de la Liga'
  },
  {
    id: 'usr_comite',
    name: 'Prof. Mariana Castro',
    email: 'comite@torneo.com',
    role: ROLES.COMITE,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Comisionada Técnica y Disciplinaria'
  },
  {
    id: 'usr_representante',
    name: 'Carlos Mendoza',
    email: 'representante@torneo.com',
    role: ROLES.REPRESENTANTE,
    teamId: 'eq_1',
    teamName: 'Los Galácticos FC',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Representante y Capitán - Los Galácticos'
  }
];

export const INITIAL_TOURNAMENT = {
  id: 'trn_2026_1',
  name: 'Copa de Campeones Metropolitana 2026',
  edition: 'X Edición Oficial - Clausura',
  category: 'Primera División Libre',
  season: '2026-I',
  status: 'En Curso', // 'Planificación', 'En Curso', 'Finalizado'
  startDate: '2026-03-01',
  endDate: '2026-06-28',
  venue: 'Complejo Deportivo Central & Estadio Olímpico',
  organizer: 'Asociación Metropolitana de Fútbol',
  prize: '$5,000 USD + Trofeo Dorado y Medallas de Honor',
  rules: 'Partidos de 2 tiempos de 45 minutos. Máximo 5 cambios en 3 ventanas. Dos tarjetas amarillas acumulan suspensión de un partido. Tarjeta roja directa genera mínimo un partido de sanción y revisión del comité.',
  teamsCount: 6,
  matchesCount: 15,
  bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80'
};

export const INITIAL_TEAMS = [
  {
    id: 'eq_1',
    name: 'Los Galácticos FC',
    shortName: 'GAL',
    color: '#06b6d4',
    secondaryColor: '#0891b2',
    shield: '⚡',
    stadium: 'Arena Galáctica (Césped Natural)',
    representative: 'Carlos Mendoza',
    coach: 'Marcelo Bielsa Jr.',
    founded: '2018',
    city: 'Zona Norte'
  },
  {
    id: 'eq_2',
    name: 'Real Titanes',
    shortName: 'TIT',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    shield: '🛡️',
    stadium: 'Coliseo Titán (Sintético FIFA)',
    representative: 'Andrés Silva',
    coach: 'Javier Aguirre G.',
    founded: '2015',
    city: 'Distrito Central'
  },
  {
    id: 'eq_3',
    name: 'Rayo Metropolitano',
    shortName: 'RAY',
    color: '#ef4444',
    secondaryColor: '#b91c1c',
    shield: '⚡',
    stadium: 'Estadio El Rayo (Césped Natural)',
    representative: 'Diego Fernández',
    coach: 'Jorge Sampaoli V.',
    founded: '2019',
    city: 'Zona Poniente'
  },
  {
    id: 'eq_4',
    name: 'Huracán del Norte',
    shortName: 'HUR',
    color: '#8b5cf6',
    secondaryColor: '#6d28d9',
    shield: '🌪️',
    stadium: 'Campo Los Vientos',
    representative: 'Martín Gómez',
    coach: 'Gabriel Milito S.',
    founded: '2017',
    city: 'Altos del Norte'
  },
  {
    id: 'eq_5',
    name: 'Sporting Centenario',
    shortName: 'SPO',
    color: '#10b981',
    secondaryColor: '#047857',
    shield: '🌟',
    stadium: 'Parque Centenario',
    representative: 'Roberto Morales',
    coach: 'Gustavo Alfaro M.',
    founded: '2012',
    city: 'Sur Tradicional'
  },
  {
    id: 'eq_6',
    name: 'Furia Roja CF',
    shortName: 'FUR',
    color: '#e11d48',
    secondaryColor: '#9f1239',
    shield: '🔥',
    stadium: 'Estadio El Volcán',
    representative: 'Javier Paredes',
    coach: 'Ernesto Valverde R.',
    founded: '2020',
    city: 'Valle Oriente'
  }
];

export const INITIAL_PLAYERS = [
  // Los Galácticos FC
  {
    id: 'jug_1',
    name: 'Carlos Mendoza',
    dorsal: 10,
    position: 'MED',
    teamId: 'eq_1',
    age: 27,
    status: 'Habilitado', // 'Habilitado', 'Suspendido', 'En revisión'
    goals: 7,
    yellowCards: 1,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Capitán y volante creativo del equipo.'
  },
  {
    id: 'jug_2',
    name: 'Mateo Benítez',
    dorsal: 9,
    position: 'DEL',
    teamId: 'eq_1',
    age: 24,
    status: 'Habilitado',
    goals: 6,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Delantero centro de área, goleador veloz.'
  },
  {
    id: 'jug_3',
    name: 'Esteban Rivas',
    dorsal: 1,
    position: 'POR',
    teamId: 'eq_1',
    age: 29,
    status: 'Habilitado',
    goals: 0,
    yellowCards: 0,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    notes: 'Portero titular con 2 vallas invictas.'
  },
  {
    id: 'jug_4',
    name: 'Luciano Correa',
    dorsal: 4,
    position: 'DEF',
    teamId: 'eq_1',
    age: 26,
    status: 'Suspendido',
    goals: 1,
    yellowCards: 3,
    redCards: 1,
    matchesPlayed: 3,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    notes: 'Suspendido por tarjeta roja directa en fecha 3 (cumple 1 fecha restante).'
  },

  // Real Titanes
  {
    id: 'jug_5',
    name: 'Rodrigo De Paulis',
    dorsal: 7,
    position: 'DEL',
    teamId: 'eq_2',
    age: 25,
    status: 'Habilitado',
    goals: 8,
    yellowCards: 1,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    notes: 'Líder actual de la tabla de goleo.'
  },
  {
    id: 'jug_6',
    name: 'Hugo Santamaría',
    dorsal: 5,
    position: 'DEF',
    teamId: 'eq_2',
    age: 28,
    status: 'Habilitado',
    goals: 0,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    notes: 'Defensa central líder en intercepciones.'
  },
  {
    id: 'jug_7',
    name: 'Ignacio Barreto',
    dorsal: 1,
    position: 'POR',
    teamId: 'eq_2',
    age: 31,
    status: 'Habilitado',
    goals: 0,
    yellowCards: 0,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    notes: 'Capitán de Real Titanes.'
  },

  // Rayo Metropolitano
  {
    id: 'jug_8',
    name: 'Felipe Albarrán',
    dorsal: 11,
    position: 'DEL',
    teamId: 'eq_3',
    age: 23,
    status: 'Habilitado',
    goals: 5,
    yellowCards: 0,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    notes: 'Extremo izquierdo veloz y habilidoso.'
  },
  {
    id: 'jug_9',
    name: 'Samuel Obregón',
    dorsal: 8,
    position: 'MED',
    teamId: 'eq_3',
    age: 26,
    status: 'En revisión',
    goals: 2,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 3,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    notes: 'En revisión médica y disciplinaria por informe arbitral.'
  },

  // Huracán del Norte
  {
    id: 'jug_10',
    name: 'Bruno Quinteros',
    dorsal: 9,
    position: 'DEL',
    teamId: 'eq_4',
    age: 28,
    status: 'Habilitado',
    goals: 4,
    yellowCards: 1,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    notes: 'Delantero potente de juego aéreo.'
  },
  {
    id: 'jug_11',
    name: 'Tomás Villalba',
    dorsal: 6,
    position: 'DEF',
    teamId: 'eq_4',
    age: 25,
    status: 'Habilitado',
    goals: 1,
    yellowCards: 1,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80',
    notes: 'Lateral derecho con gran proyección ofensiva.'
  },

  // Sporting Centenario
  {
    id: 'jug_12',
    name: 'Joaquín Navarrete',
    dorsal: 10,
    position: 'MED',
    teamId: 'eq_5',
    age: 30,
    status: 'Habilitado',
    goals: 3,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    notes: 'Veterano creador de juego y especialista en tiros libres.'
  },

  // Furia Roja CF
  {
    id: 'jug_13',
    name: 'Darío Valenzuela',
    dorsal: 9,
    position: 'DEL',
    teamId: 'eq_6',
    age: 22,
    status: 'Habilitado',
    goals: 4,
    yellowCards: 1,
    redCards: 0,
    matchesPlayed: 4,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: 'Joven promesa del torneo.'
  }
];

export const INITIAL_MATCHES = [
  // Jornada 1 (Finalizados)
  {
    id: 'mat_1',
    matchday: 1,
    homeTeamId: 'eq_1',
    awayTeamId: 'eq_2',
    homeScore: 3,
    awayScore: 2,
    date: '2026-03-07',
    time: '16:00',
    stadium: 'Estadio Olímpico - Cancha 1',
    referee: 'Fernando Guerrero R.',
    status: 'Finalizado', // 'Programado', 'En Vivo', 'Finalizado', 'Suspendido'
    incidents: [
      { min: 14, type: 'GOL', player: 'Mateo Benítez', teamId: 'eq_1' },
      { min: 38, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' },
      { min: 55, type: 'GOL', player: 'Carlos Mendoza', teamId: 'eq_1' },
      { min: 72, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' },
      { min: 88, type: 'GOL', player: 'Carlos Mendoza', teamId: 'eq_1' },
      { min: 41, type: 'AMARILLA', player: 'Luciano Correa', teamId: 'eq_1' }
    ]
  },
  {
    id: 'mat_2',
    matchday: 1,
    homeTeamId: 'eq_3',
    awayTeamId: 'eq_4',
    homeScore: 1,
    awayScore: 1,
    date: '2026-03-07',
    time: '18:30',
    stadium: 'Complejo Deportivo - Cancha Norte',
    referee: 'César Arturo Ramos',
    status: 'Finalizado',
    incidents: [
      { min: 22, type: 'GOL', player: 'Felipe Albarrán', teamId: 'eq_3' },
      { min: 65, type: 'GOL', player: 'Bruno Quinteros', teamId: 'eq_4' },
      { min: 79, type: 'AMARILLA', player: 'Samuel Obregón', teamId: 'eq_3' }
    ]
  },
  {
    id: 'mat_3',
    matchday: 1,
    homeTeamId: 'eq_5',
    awayTeamId: 'eq_6',
    homeScore: 2,
    awayScore: 0,
    date: '2026-03-08',
    time: '10:00',
    stadium: 'Parque Centenario - Cancha A',
    referee: 'Marco Antonio Ortiz',
    status: 'Finalizado',
    incidents: [
      { min: 30, type: 'GOL', player: 'Joaquín Navarrete', teamId: 'eq_5' },
      { min: 78, type: 'GOL', player: 'Joaquín Navarrete', teamId: 'eq_5' }
    ]
  },

  // Jornada 2 (Finalizados)
  {
    id: 'mat_4',
    matchday: 2,
    homeTeamId: 'eq_2',
    awayTeamId: 'eq_3',
    homeScore: 4,
    awayScore: 1,
    date: '2026-03-14',
    time: '16:00',
    stadium: 'Coliseo Titán',
    referee: 'Luis Enrique Santander',
    status: 'Finalizado',
    incidents: [
      { min: 10, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' },
      { min: 25, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' },
      { min: 50, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' },
      { min: 63, type: 'GOL', player: 'Samuel Obregón', teamId: 'eq_3' },
      { min: 82, type: 'GOL', player: 'Hugo Santamaría', teamId: 'eq_2' }
    ]
  },
  {
    id: 'mat_5',
    matchday: 2,
    homeTeamId: 'eq_4',
    awayTeamId: 'eq_5',
    homeScore: 2,
    awayScore: 2,
    date: '2026-03-14',
    time: '18:15',
    stadium: 'Campo Los Vientos',
    referee: 'Diego Montaño',
    status: 'Finalizado',
    incidents: [
      { min: 18, type: 'GOL', player: 'Bruno Quinteros', teamId: 'eq_4' },
      { min: 44, type: 'GOL', player: 'Joaquín Navarrete', teamId: 'eq_5' },
      { min: 70, type: 'GOL', player: 'Tomás Villalba', teamId: 'eq_4' }
    ]
  },
  {
    id: 'mat_6',
    matchday: 2,
    homeTeamId: 'eq_6',
    awayTeamId: 'eq_1',
    homeScore: 1,
    awayScore: 3,
    date: '2026-03-15',
    time: '11:00',
    stadium: 'Estadio El Volcán',
    referee: 'Adonai Escobedo',
    status: 'Finalizado',
    incidents: [
      { min: 12, type: 'GOL', player: 'Darío Valenzuela', teamId: 'eq_6' },
      { min: 31, type: 'GOL', player: 'Mateo Benítez', teamId: 'eq_1' },
      { min: 60, type: 'GOL', player: 'Mateo Benítez', teamId: 'eq_1' },
      { min: 75, type: 'GOL', player: 'Carlos Mendoza', teamId: 'eq_1' }
    ]
  },

  // Jornada 3 (Próximos / En Vivo)
  {
    id: 'mat_7',
    matchday: 3,
    homeTeamId: 'eq_1',
    awayTeamId: 'eq_4',
    homeScore: 2,
    awayScore: 1,
    date: '2026-03-21',
    time: '16:00',
    stadium: 'Arena Galáctica',
    referee: 'Fernando Hernández',
    status: 'Finalizado',
    incidents: [
      { min: 20, type: 'GOL', player: 'Carlos Mendoza', teamId: 'eq_1' },
      { min: 54, type: 'GOL', player: 'Bruno Quinteros', teamId: 'eq_4' },
      { min: 83, type: 'GOL', player: 'Mateo Benítez', teamId: 'eq_1' },
      { min: 89, type: 'ROJA', player: 'Luciano Correa', teamId: 'eq_1' }
    ]
  },
  {
    id: 'mat_8',
    matchday: 3,
    homeTeamId: 'eq_2',
    awayTeamId: 'eq_6',
    homeScore: 3,
    awayScore: 1,
    date: '2026-03-21',
    time: '18:30',
    stadium: 'Coliseo Titán',
    referee: 'Erick Yair Miranda',
    status: 'Finalizado',
    incidents: [
      { min: 15, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' },
      { min: 40, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' },
      { min: 61, type: 'GOL', player: 'Darío Valenzuela', teamId: 'eq_6' },
      { min: 87, type: 'GOL', player: 'Rodrigo De Paulis', teamId: 'eq_2' }
    ]
  },
  {
    id: 'mat_9',
    matchday: 3,
    homeTeamId: 'eq_3',
    awayTeamId: 'eq_5',
    homeScore: 0,
    awayScore: 0,
    date: '2026-03-22',
    time: '12:00',
    stadium: 'Estadio El Rayo',
    referee: 'Víctor Cáceres',
    status: 'Programado',
    incidents: []
  },

  // Jornada 4 (Programados)
  {
    id: 'mat_10',
    matchday: 4,
    homeTeamId: 'eq_5',
    awayTeamId: 'eq_1',
    homeScore: 0,
    awayScore: 0,
    date: '2026-03-28',
    time: '16:00',
    stadium: 'Parque Centenario',
    referee: 'Por designar',
    status: 'Programado',
    incidents: []
  },
  {
    id: 'mat_11',
    matchday: 4,
    homeTeamId: 'eq_6',
    awayTeamId: 'eq_3',
    homeScore: 0,
    awayScore: 0,
    date: '2026-03-28',
    time: '18:30',
    stadium: 'Estadio El Volcán',
    referee: 'Por designar',
    status: 'Programado',
    incidents: []
  },
  {
    id: 'mat_12',
    matchday: 4,
    homeTeamId: 'eq_4',
    awayTeamId: 'eq_2',
    homeScore: 0,
    awayScore: 0,
    date: '2026-03-29',
    time: '11:00',
    stadium: 'Campo Los Vientos',
    referee: 'Por designar',
    status: 'Programado',
    incidents: []
  }
];

export const INITIAL_REQUESTS = [
  {
    id: 'sol_1',
    title: 'Inscripción de refuerzo: Javier "Chicharito" Morales',
    type: 'INSCRIPCION_JUGADOR',
    teamId: 'eq_1',
    teamName: 'Los Galácticos FC',
    applicantId: 'usr_representante',
    applicantName: 'Carlos Mendoza',
    applicantRole: ROLES.REPRESENTANTE,
    createdAt: '2026-03-18 10:30',
    status: 'APROBADA', // 'PENDIENTE', 'APROBADA', 'RECHAZADA'
    description: 'Solicito la inscripción formal del jugador Javier Morales como mediocampista ofensivo, adjuntando certificado médico y copia de identificación vigente para la Jornada 4 en adelante.',
    proposedPlayer: {
      name: 'Javier Morales',
      dorsal: 14,
      position: 'MED',
      age: 26
    },
    resolutionNote: 'Aprobada por el Comité Técnico en sesión ordinaria. Jugador debidamente federado y habilitado para jugar.',
    resolvedBy: 'Prof. Mariana Castro (Comité)',
    resolvedAt: '2026-03-19 14:15'
  },
  {
    id: 'sol_2',
    title: 'Reprogramación de partido Jornada 4 vs Sporting Centenario',
    type: 'CAMBIO_HORARIO',
    teamId: 'eq_1',
    teamName: 'Los Galácticos FC',
    applicantId: 'usr_representante',
    applicantName: 'Carlos Mendoza',
    applicantRole: ROLES.REPRESENTANTE,
    createdAt: '2026-03-22 09:15',
    status: 'PENDIENTE',
    description: 'Por motivos de compromiso universitario de 5 jugadores clave el sábado por la tarde, solicitamos formalmente que el partido programado para el sábado 28 a las 16:00 se mueva al domingo 29 a las 10:00 AM en la misma sede. Ya se cuenta con el visto bueno preliminar del delegado rival.',
    proposedPlayer: null,
    resolutionNote: '',
    resolvedBy: '',
    resolvedAt: ''
  },
  {
    id: 'sol_3',
    title: 'Apelación a sanción de 2 partidos de Luciano Correa',
    type: 'APELACION_SANCION',
    teamId: 'eq_1',
    teamName: 'Los Galácticos FC',
    applicantId: 'usr_representante',
    applicantName: 'Carlos Mendoza',
    applicantRole: ROLES.REPRESENTANTE,
    createdAt: '2026-03-22 11:45',
    status: 'PENDIENTE',
    description: 'Presentamos video del minuto 89 del partido contra Huracán del Norte donde se evidencia que el contacto no fue con fuerza desmedida sino una disputa limpia de balón. Solicitamos reducir la pena a 1 sola fecha.',
    proposedPlayer: null,
    resolutionNote: '',
    resolvedBy: '',
    resolvedAt: ''
  },
  {
    id: 'sol_4',
    title: 'Cambio de color de indumentaria visitante por coincidencia',
    type: 'OTRO',
    teamId: 'eq_2',
    teamName: 'Real Titanes',
    applicantId: 'usr_titanes',
    applicantName: 'Andrés Silva',
    applicantRole: ROLES.REPRESENTANTE,
    createdAt: '2026-03-15 16:00',
    status: 'APROBADA',
    description: 'Notificación para utilizar camiseta alternativa negra con vivos dorados en el próximo partido como visitante para evitar confusión visual con el uniforme arbitral.',
    proposedPlayer: null,
    resolutionNote: 'Aprobado. Notificado el cuerpo arbitral de la Jornada 3.',
    resolvedBy: 'Lic. Roberto Varela (Admin)',
    resolvedAt: '2026-03-16 09:30'
  }
];

// Helper para calcular la tabla de posiciones dinámicamente a partir de los partidos finalizados
export function calculateStandings(teams, matches) {
  const table = teams.map(team => ({
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    shield: team.shield,
    color: team.color,
    pj: 0, // Partidos jugados
    pg: 0, // Ganados
    pe: 0, // Empatados
    pp: 0, // Perdidos
    gf: 0, // Goles a favor
    gc: 0, // Goles en contra
    dg: 0, // Diferencia de goles
    pts: 0 // Puntos
  }));

  const teamMap = {};
  table.forEach(item => {
    teamMap[item.id] = item;
  });

  matches.forEach(match => {
    if (match.status === 'Finalizado') {
      const home = teamMap[match.homeTeamId];
      const away = teamMap[match.awayTeamId];

      if (home && away) {
        home.pj += 1;
        away.pj += 1;

        const hScore = Number(match.homeScore) || 0;
        const aScore = Number(match.awayScore) || 0;

        home.gf += hScore;
        home.gc += aScore;
        away.gf += aScore;
        away.gc += hScore;

        if (hScore > aScore) {
          home.pg += 1;
          home.pts += 3;
          away.pp += 1;
        } else if (hScore < aScore) {
          away.pg += 1;
          away.pts += 3;
          home.pp += 1;
        } else {
          home.pe += 1;
          away.pe += 1;
          home.pts += 1;
          away.pts += 1;
        }
      }
    }
  });

  table.forEach(item => {
    item.dg = item.gf - item.gc;
  });

  // Ordenar por: Puntos DESC, Diferencia de Goles DESC, Goles a Favor DESC, Nombre ASC
  table.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  return table;
}
