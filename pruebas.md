# Pruebas detalladas - Aura Project

## 1. Prerrequisitos

- Node.js 18 o superior.
- PostgreSQL 14 o superior.
- Base de datos local creada, por ejemplo: `aura_project`.

## 2. Configurar base de datos

1. Crear la base si aun no existe:

```sql
CREATE DATABASE aura_project;
```

2. Ejecutar el script de inicializacion y datos semilla:

```bash
psql -U postgres -d aura_project -f db_backup.sql
```

Alternativa equivalente:

```bash
psql -U postgres -d aura_project -f db/backup.sql
```

3. Validar que hay datos:

```sql
SELECT COUNT(*) FROM devices;
SELECT COUNT(*) FROM users;
```

## 3. Configurar y levantar backend

1. Instalar dependencias:

```bash
npm install
```

2. Confirmar variables de entorno en `.env`:

- `DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/aura_project`
- `PORT=3000`

3. Iniciar la app:

```bash
npm start
```

4. Verificar log esperado en consola:

- `Aura app running on http://localhost:3000`

## 4. Pruebas de UI (frontend -> backend -> db)

### 4.1 Landing

- Abrir `http://localhost:3000`
- Debe renderizar cards de dispositivos existentes.

### 4.2 Devices + creacion

- Ir a `http://localhost:3000/devices`
- Completar el formulario "Registrar nuevo dispositivo".
- Ejemplo valido:
  - Modelo: `Mac Studio M3 Ultra`
  - Categoria: `Mac`
  - Serial: `C02MX5K0Q09A`
  - Precio: `19999000`
  - Fecha: `2026-05-20`
  - Especificaciones: `{"ram":"128GB","ssd":"2TB"}`
- Al enviar:
  - Debe aparecer mensaje de exito.
  - Debe recargar la pagina.
  - Debe aparecer el nuevo dispositivo en el listado.

Validar en PostgreSQL:

```sql
SELECT id, model_name, serial_number FROM devices ORDER BY id DESC LIMIT 5;
```

### 4.3 Analytics

- Ir a `http://localhost:3000/analytics`
- Debe verse:
  - Grafico de valor historico.
  - Tabla de rotacion y salud.

## 5. Pruebas API manuales (Postman/curl)

### 5.1 Crear dispositivo exitoso

```bash
curl -X POST http://localhost:3000/api/v1/devices \
  -H "Content-Type: application/json" \
  -d "{\"model_name\":\"iPhone 15 Pro\",\"category\":\"iPhone\",\"serial_number\":\"G6TNEW123456\",\"purchase_price\":5299000,\"purchase_date\":\"2026-05-21\",\"specifications\":{\"storage\":\"256GB\"}}"
```

Esperado:

- HTTP `201`
- JSON con `status: "created"` y `device_id`.

### 5.2 Validacion de contrato (error 400)

```bash
curl -X POST http://localhost:3000/api/v1/devices \
  -H "Content-Type: application/json" \
  -d "{\"model_name\":\"Equipo X\",\"category\":\"Consola\",\"purchase_price\":-5}"
```

Esperado:

- HTTP `400`
- JSON con `status: "error"` y arreglo `errors`.

### 5.3 Endpoint analitico

```bash
curl http://localhost:3000/api/v1/analytics/valuation
```

Esperado:

- HTTP `200`
- JSON con `status: "success"` y `data` como arreglo.

## 6. Casos de error recomendados

- Serial repetido en creacion de dispositivo.
  - Esperado: `400` (violacion de unicidad).
- Fecha invalida en `purchase_date`.
  - Esperado: `400`.
- Precio `0` o negativo.
  - Esperado: `400`.

## 7. Checklist final

- [ ] Backend inicia sin errores.
- [ ] Vistas SSR responden (`/`, `/dashboard`, `/devices`, `/analytics`).
- [ ] Formulario de devices crea registros reales en PostgreSQL.
- [ ] API analitica responde y la vista analytics renderiza datos.
- [ ] Validaciones retornan `400` en entradas invalidas.

## 8. Colección de pruebas para Postman / curl (Admin & API)

Notas generales para Postman:

- Usar el tipo de cuerpo `x-www-form-urlencoded` o `form-data` para rutas que provienen de formularios SSR (login, creación de usuarios, dispositivos desde la UI).
- Habilitar "Automatically follow redirects" si quieres que Postman siga la redirección luego de `/login`.
- Guardar cookies en la colección: Postman mantiene cookies en la pestaña "Cookies"; tras `POST /login` se establecerá la cookie de sesión usada para rutas admin.

1. Login (obligatorio para operaciones admin)

POST http://localhost:3000/login

Body (x-www-form-urlencoded):

- `email`: admin@example.com
- `password`: adminpassword

Ejemplo curl (guardar cookies en cookiejar):

```bash
curl -v -c cookiejar.txt -X POST http://localhost:3000/login \
  -d "email=admin@example.com" -d "password=adminpassword"
```

2. Listar auditoría (paginado)

GET http://localhost:3000/admin/audit?q=&page=1&pageSize=50

curl con cookies:

```bash
curl -b cookiejar.txt "http://localhost:3000/admin/audit?q=&page=1&pageSize=50"
```

3. Crear dispositivo (desde Admin UI)

POST http://localhost:3000/admin/devices

Body (x-www-form-urlencoded):

- `model_name`, `category`, `serial_number`, `purchase_price`, `purchase_date` (YYYY-MM-DD), `specifications` (string JSON)

Ejemplo curl:

```bash
curl -b cookiejar.txt -X POST http://localhost:3000/admin/devices \
  -d "model_name=Test Device X" \
  -d "category=Mac" \
  -d "serial_number=SN123456789" \
  -d "purchase_price=1299900" \
  -d "purchase_date=2026-05-22" \
  -d "specifications={\"ram\":\"32GB\"}"
```

4. Editar dispositivo

POST http://localhost:3000/admin/devices/:deviceId

Body: incluir los campos a actualizar (`model_name`, `assigned_to`, `status`, `purchase_price`, `specifications`)

Ejemplo curl:

```bash
curl -b cookiejar.txt -X POST http://localhost:3000/admin/devices/123 \
  -d "assigned_to=Juan Perez" -d "status=Assigned"
```

5. Eliminar dispositivo

POST http://localhost:3000/admin/devices/:deviceId/delete

curl:

```bash
curl -b cookiejar.txt -X POST http://localhost:3000/admin/devices/123/delete
```

6. Gestionar incidencias (logs)

- Crear incidencia: POST `/admin/devices/:deviceId/logs` (form fields: `code`, `title`, `area`, `maintenance_cost`, `status`, `notes`)
- Actualizar estado: POST `/admin/devices/:deviceId/logs/:logId/status` (form field `status`)
- Eliminar incidencia: POST `/admin/devices/:deviceId/logs/:logId/delete`

Ejemplos curl:

```bash
# Crear incidencia
curl -b cookiejar.txt -X POST http://localhost:3000/admin/devices/123/logs \
  -d "title=Falla de pantalla" -d "area=Soporte" -d "maintenance_cost=120000" -d "status=Open"

# Actualizar estado
curl -b cookiejar.txt -X POST http://localhost:3000/admin/devices/123/logs/456/status -d "status=Resolved"

# Eliminar incidencia
curl -b cookiejar.txt -X POST http://localhost:3000/admin/devices/123/logs/456/delete
```

7. Crear usuario admin

POST http://localhost:3000/admin/users

Body (x-www-form-urlencoded): `name`, `email`, `password`, `role` (use `Admin`|`Administrator`|`Operador`|`Auditor`), `status` (`Active`|`Suspended`)

Ejemplo curl:

```bash
curl -b cookiejar.txt -X POST http://localhost:3000/admin/users \
  -d "name=Nuevo Admin" -d "email=admin2@example.com" -d "password=secretpass" -d "role=Admin" -d "status=Active"
```

8. Cambiar rol / estado de usuario

POST `/admin/users/:userId/role` with `role` body
POST `/admin/users/:userId/status` with `status` body

9. Endpoints públicos / API

- `GET /api/v1/analytics/valuation` (GET)
- `POST /api/v1/devices` (API create device JSON) — este endpoint es público y acepta JSON body; para Postman usar `raw` > `application/json`.

Ejemplo curl JSON:

```bash
curl -X POST http://localhost:3000/api/v1/devices \
  -H "Content-Type: application/json" \
  -d '{"model_name":"iPhone Test","category":"iPhone","serial_number":"PX-001","purchase_price":4999000,"purchase_date":"2026-05-21","specifications":{"storage":"128GB"}}'
```

10. Notas sobre cookies y autenticación en Postman

- Usar la pestaña Cookies para confirmar que la cookie de sesión (`connect.sid` o similar) fue establecida.
- Alternativa: puedes usar `curl -c cookiejar.txt` para capturar cookies y `-b cookiejar.txt` para enviarlas en peticiones subsiguientes.

Si quieres, genero un archivo JSON de colección Postman con estas solicitudes — dime si lo quieres y lo agrego al repo.
