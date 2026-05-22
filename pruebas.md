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
