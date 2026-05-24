# Aura Store - E-commerce Premium

Sistema de comercio electronico completo con **React + Tailwind CSS** en el frontend y **Node.js + Express + PostgreSQL** en el backend, siguiendo una arquitectura **MVC** y principios **SOLID**.

## Stack Tecnologico

### Frontend
- **React 18** con Vite
- **Tailwind CSS 3** con paleta de colores personalizada
- **React Router DOM v6** para navegacion SPA
- **Chart.js + react-chartjs-2** para graficos del dashboard admin
- **Axios** para peticiones HTTP

### Backend
- **Node.js + Express 4** (API REST)
- **PostgreSQL 14+** con `pg` nativo
- **JWT** para autenticacion segura (jsonwebtoken)
- **bcryptjs** para encriptacion de contrasenas
- **CORS** configurado para desarrollo local

## Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Primario | `#FEF3E2` | Fondo claro |
| Secundario | `#FAB12F` | Acentos calidos |
| Terciario (CTA) | `#FA812F` | Botones, llamadas a la accion |
| Peligro | `#DD0303` | Alertas, errores, peligro |

## Arquitectura MVC

```
aura_project/
├── app.js                    # Entry point del servidor Express
├── config/
│   └── database.js           # Configuracion de conexion PostgreSQL
├── models/                   # CAPA MODELO - Consultas SQL
│   ├── productModel.js       # CRUD de productos
│   ├── userModel.js          # CRUD de usuarios
│   ├── orderModel.js         # Pedidos y order_items
│   └── analyticsModel.js     # Metricas y reportes
├── services/                 # CAPA DE SERVICIOS - Logica de negocio (SOLID)
│   ├── authService.js        # Registro, login, validacion de credenciales
│   ├── productService.js     # Validacion y gestion de productos
│   └── orderService.js       # Creacion y gestion de pedidos
├── controllers/              # CAPA CONTROLADOR - Manejo de peticiones HTTP
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── adminController.js
├── middleware/                # Middleware
│   ├── auth.js               # JWT verification, admin check
│   ├── errorHandler.js       # Manejo centralizado de errores
│   └── validate.js           # Validacion de schemas
├── routes/                   # Definicion de rutas REST
│   ├── index.js              # Agrupador de rutas
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   └── admin.js
├── validators/               # Validacion de inputs
├── db/                       # Archivos SQL
│   ├── backup.sql            # Schema completo + datos de prueba
│   └── migrations/
├── frontend/                 # Aplicacion React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Componentes reutilizables (Navbar, Footer, ProductCard, etc.)
│   │   ├── pages/            # Paginas de la aplicacion
│   │   │   ├── Home.jsx
│   │   │   ├── Celulares.jsx
│   │   │   ├── Laptops.jsx
│   │   │   ├── Accesorios.jsx
│   │   │   ├── Nosotros.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── admin/        # Panel de administracion
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── Orders.jsx
│   │   │       └── Users.jsx
│   │   ├── context/          # Contextos de React (Auth, Cart)
│   │   ├── services/         # Cliente Axios para API
│   │   └── App.jsx           # Configuracion de rutas
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json
├── postman_collection.json
└── README.md
```

## Requisitos

- **Node.js 18+**
- **PostgreSQL 14+**
- **npm 9+**

## Configuracion Rapida

### 1. Clonar e instalar dependencias

```bash
npm install
cd frontend && npm install
cd ..
```

### 2. Configurar variables de entorno

Editar `.env` en la raiz del proyecto:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/aura_store
PGSSLMODE=disable
JWT_SECRET=tu-secreto-jwt-seguro
FRONTEND_URL=http://localhost:5173
```

### 3. Crear la base de datos

```bash
# Opcion 1: Restaurar backup directamente
psql -U postgres -c "CREATE DATABASE aura_store;"
psql -U postgres -d aura_store -f db/backup.sql

# Opcion 2: Dejar que el servidor la cree automaticamente
# El servidor ejecuta bootstrapDatabase() al iniciar si no encuentra las tablas
```

### 4. Iniciar el servidor backend

```bash
npm run dev
```

El servidor Express se iniciara en `http://localhost:3000`.

### 5. Iniciar el frontend (otra terminal)

```bash
cd frontend
npm run dev
```

Vite iniciara en `http://localhost:5173` con HMR habilitado.

## Usuarios de Prueba

| Email | Contrasena | Rol |
|-------|-----------|-----|
| admin@aura.co | admin123 | Admin |
| client@aura.co | client123 | Customer |

> **Nota:** Las contrasenas estan hasheadas con SHA-256 en el backup.sql. Para usar estos usuarios, debes registrar nuevos usuarios a traves de la API o reemplazar los hash por bcrypt manualmente.

## Endpoints de la API

### Autenticacion
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesion |
| GET | `/api/auth/me` | Obtener usuario actual (requiere token) |

### Productos (publicos)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/products` | Listar productos (query: category, search, featured) |
| GET | `/api/products/featured` | Productos destacados |
| GET | `/api/products/search?q=` | Buscar productos |
| GET | `/api/products/categories` | Listar categorias con conteo |
| GET | `/api/products/:slug` | Detalle de producto por slug |

### Pedidos (requiere autenticacion)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders` | Listar pedidos del usuario |
| GET | `/api/orders/:id` | Detalle de pedido |

### Admin (requiere rol Admin/Administrator/Operador/Auditor)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Metricas del dashboard |
| GET | `/api/admin/analytics` | Datos analiticos completos |
| **Productos** | | |
| GET | `/api/admin/products` | Listar productos (admin) |
| GET | `/api/admin/products/:id` | Obtener producto por ID |
| POST | `/api/admin/products` | Crear producto |
| PUT | `/api/admin/products/:id` | Actualizar producto |
| DELETE | `/api/admin/products/:id` | Eliminar producto |
| **Usuarios** | | |
| GET | `/api/admin/users` | Listar usuarios |
| PUT | `/api/admin/users/:id/role` | Cambiar rol de usuario |
| PUT | `/api/admin/users/:id/status` | Cambiar estado (Active/Suspended) |
| **Pedidos** | | |
| GET | `/api/admin/orders` | Listar pedidos |
| PUT | `/api/admin/orders/:id/status` | Actualizar estado del pedido |

## Decisiones Tecnicas

### 1. Por que Express + pg nativo y no un ORM?
Se eligio `pg` directo porque el schema ya existe en `db/backup.sql` y las consultas SQL ya estan definidas. Esto evita la capa de abstraccion de un ORM y da control total sobre las queries.

### 2. Arquitectura de 3 capas + servicios
Se implemento una arquitectura en 4 capas:
- **Modelos**: Consultas SQL puras. Cada modelo es un objeto con metodos.
- **Servicios**: Logica de negocio con validacion (principio de Responsabilidad Unica).
- **Controladores**: Manejo de HTTP (req/res), delegan en servicios.
- **Middlewares**: Autenticacion, autorizacion, manejo de errores.

### 3. JWT sin sesiones
Se opto por JWT en lugar de sesiones basadas en cookies para facilitar la integracion con el frontend SPA de React. El token se almacena en localStorage y se envia via header `Authorization: Bearer <token>`.

### 4. Mapeo de categorias
Las categorias de la BD (`iPhone`, `Mac`, `Accessories`, `Audio`, `Displays`, `iPad`) se mapean a las rutas amigables del frontend:
- `/celulares` -> categoria `iPhone`
- `/laptops` -> categoria `Mac`
- `/accesorios` -> categorias `Accessories`, `Audio`, `Displays`, `iPad`

### 5. Chart.js para graficos
Se eligio Chart.js por su ligereza, compatibilidad con React (react-chartjs-2) y capacidad de generar graficos de linea, barra y doughnut para el dashboard administrativo.

## Pruebas

### Probar la API con Postman
Importar el archivo `postman_collection.json` en Postman para probar todos los endpoints.

### Probar localmente
```bash
# Iniciar backend
npm run dev

# En otra terminal, probar endpoints
curl http://localhost:3000/api/products
curl http://localhost:3000/api/products/featured
curl http://localhost:3000/api/health
```

## Licencia
Proyecto academico - Juan Esteban Correa - Andres - Emmanuel Berrio
