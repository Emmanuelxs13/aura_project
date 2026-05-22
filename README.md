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
psql -U postgres -d aura_project -f db_backup.sql
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

## Flujo integrado

- En `/devices`, el formulario "Registrar nuevo dispositivo" consume `POST /api/v1/devices`.
- El backend valida payload, persiste en PostgreSQL y responde JSON.
- La vista recarga y muestra el nuevo dispositivo registrado.
- En `/analytics`, el grafico y la tabla muestran datos agregados de PostgreSQL.

## Pruebas

Consulta el archivo `pruebas.md` para un paso a paso completo (UI, API y validaciones contra DB).
