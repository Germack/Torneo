# TorneoSUD - Backend API (Neon PostgreSQL)

Servicio backend REST para la gestión integral de torneos de fútbol, conectado a **Neon Serverless PostgreSQL** (Proyecto `morning-rice-16295130`).

## 📁 Ubicación del Proyecto
- **Ruta de acceso en el Escritorio:** `C:\Users\Gerar\Desktop\TorneoSUD`
- **Ruta del workspace:** `c:\Users\Gerar\Desktop\TournamentProjectGM\TorneoSUD`

Ambas rutas están enlazadas mediante una unión de directorio de Windows, por lo que cualquier cambio se sincroniza instantáneamente.

---

## 🚀 Puesta en marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configuración de variables de entorno (`.env`):**
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_Fs1kODVQ8PUq@ep-noisy-union-b5zjcl2g-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   PORT=4000
   ```

3. **Cargar / Reiniciar datos en Neon:**
   ```bash
   npm run seed
   ```

4. **Iniciar servidor:**
   ```bash
   npm start
   # o en modo desarrollo con recarga automática:
   npm run dev
   ```
   El servidor responderá en: **`http://localhost:4000`**

---

## 📡 Endpoints de la API REST

### 1. Torneo
- **`GET /api/tournament`**: Obtiene la información oficial del torneo actual.
- **`PUT /api/tournament`**: Actualiza fechas, sede, premios y reglamento. *(Permiso: Admin y Comité)*.

### 2. Equipos
- **`GET /api/teams`**: Lista de clubes participantes con DT, representante y colores.
- **`POST /api/teams`**: Inscribe un nuevo club al torneo. *(Permiso: Admin)*.

### 3. Jugadores
- **`GET /api/players`**: Plantel general de jugadores con goles y tarjetas. Filtros disponibles: `?teamId=eq_1`, `?status=Habilitado`, `?position=DEL`.
- **`POST /api/players`**: Crea un nuevo jugador directamente. *(Permiso: Admin y Comité)*.
- **`PUT /api/players/:id`**: Modifica la ficha, dorsal, posición o estado disciplinario (Habilitado, Suspendido, En revisión). *(Permiso: Admin y Comité)*.

### 4. Partidos & Fixture
- **`GET /api/matches`**: Lista de partidos con incidencias (goles y tarjetas con minuto y autor). Filtros: `?matchday=1`, `?status=Finalizado`.
- **`POST /api/matches`**: Programa un nuevo partido en el fixture. *(Permiso: Admin)*.
- **`PUT /api/matches/:id`**: Actualiza el marcador, estado (Finalizado, En Vivo), árbitro e incidencias. *(Permiso: Admin y Comité)*.

### 5. Solicitudes & Trámites (Especial Representante / Jugador)
- **`GET /api/requests`**: Lista de solicitudes radicadas. Filtros: `?status=PENDIENTE`.
- **`POST /api/requests`**: Permite al Representante o Jugador crear una solicitud formal (Inscripción de jugador, Reprogramación de fecha/hora, Apelación de sanción). *(Permiso: Representante / Jugador / Todos)*.
- **`PUT /api/requests/:id/resolve`**: Emite el dictamen oficial (`APROBADA` o `RECHAZADA`) con fundamentación. *(Permiso: Admin y Comité)*.
  * *Nota:* Si se aprueba una solicitud de tipo `INSCRIPCION_JUGADOR`, el backend inserta automáticamente al nuevo jugador en la tabla `players` de Neon.

### 6. Sistema & Salud
- **`GET /api/health`**: Verifica la conectividad en vivo con la base de datos Neon.
- **`POST /api/seed`**: Restablece los datos de demostración en Neon.
- **`GET /api/roles`**: Información de permisos por rol.
