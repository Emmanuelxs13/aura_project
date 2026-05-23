# Aura Project

Aura Project es un sistema web MVC de gestion de inventario tecnologico premium con renderizado SSR, enfocado en velocidad, limpieza visual y contratos HTTP estrictos. La aplicacion integra frontend en EJS, backend en Express y persistencia analitica en PostgreSQL.

Autores: Esteban Correa, Emmanuel Berrio Y Andres.

## Stack tecnico

- Node.js + Express
- EJS (SSR)
- PostgreSQL
- CSS nativo + Chart.js

## Arquitectura

- `models`: consultas SQL puras para inventario y analitica.
- `controllers`: orquestan datos, validan y renderizan vistas.
- `views`: componentes y paginas SSR.
- `public`: estilos y scripts del cliente.

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Configuracion rapida

1. Instalar dependencias:

```bash
npm install
```

2. Revisar `.env` (se incluye uno base en el proyecto).

3. Inicializar base de datos:

```bash
# Recomendado: usar el runner de migraciones incluido
DATABASE_URL=postgres://user:pass@localhost:5432/aura_project npm run migrate

# Alternativa: aplicar el backup manualmente
psql -U postgres -d aura_project -f db/backup.sql
```

4. Levantar servidor:

```bash
npm start
```

5. Abrir en navegador:

- `http://localhost:3000/`

## Endpoints principales

Vistas SSR:

- `GET /`
- `GET /dashboard`
- `GET /devices`
- `GET /analytics`

API:

- `GET /api/v1/analytics/valuation`
- `POST /api/v1/devices`
- `POST /api/devices` (alias de compatibilidad)

Administrador (requiere login con rol Admin/Administrator/Operador/Auditor):

- `GET /admin`
- `GET /admin/users`
- `POST /admin/users` (crear usuario admin)
- `POST /admin/users/:userId/role` (cambiar rol)
- `POST /admin/users/:userId/status` (activar/suspender)
- `GET /admin/devices` (listar activos)
- `POST /admin/devices` (crear activo)
- `POST /admin/devices/:deviceId` (actualizar activo)
- `POST /admin/devices/:deviceId/delete` (eliminar activo)
- `GET /admin/devices/:deviceId/logs` (ver incidencias)
- `POST /admin/devices/:deviceId/logs` (crear incidencia)
- `POST /admin/devices/:deviceId/logs/:logId/status` (actualizar estado incidencia)
- `POST /admin/devices/:deviceId/logs/:logId/delete` (eliminar incidencia)
- `GET /admin/audit?q=&page=&pageSize=` (listado auditoría paginado)

## Flujo integrado

- En `/devices`, el formulario "Registrar nuevo dispositivo" consume `POST /api/v1/devices`.
- El backend valida payload, persiste en PostgreSQL y responde JSON.
- La vista recarga y muestra el nuevo dispositivo registrado.
- En `/analytics`, el grafico y la tabla muestran datos agregados de PostgreSQL.

## Pruebas

Consulta el archivo `pruebas.md` para un paso a paso completo (UI, API y validaciones contra DB). El documento incluye ejemplos listos para Postman y curl para testear rutas públicas y de administrador.
