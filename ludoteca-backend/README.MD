
# Ludoteca Básica — Backend

Backend mínimo para la gestión de inventario de una ludoteca, desarrollado con Node.js, TypeScript y PostgreSQL. Incluye inventario de juegos, búsqueda y filtros, autenticación con JWT, endpoint de importación XML y frontend estático integrado.

## Stack tecnológico

- Node.js
- TypeScript
- PostgreSQL
- Express (API y servidor de estáticos) :contentReference[oaicite:0]{index=0}
- pg (pool de conexiones y queries parametrizadas) :contentReference[oaicite:1]{index=1}
- JWT (autenticación) :contentReference[oaicite:2]{index=2}
- bcrypt (hash de contraseñas) :contentReference[oaicite:3]{index=3}
- multer (carga de archivo XML) :contentReference[oaicite:4]{index=4}
- zod (validación de payloads) :contentReference[oaicite:5]{index=5}

## Arquitectura

- public/: frontend estático (login e inventario) servido por Express :contentReference[oaicite:6]{index=6}  
- src/routes/: definición de endpoints y conexión con controladores :contentReference[oaicite:7]{index=7}  
- src/controllers/: manejo HTTP (req, res), validaciones y respuestas JSON :contentReference[oaicite:8]{index=8}  
- src/services/: lógica de negocio y acceso a base de datos :contentReference[oaicite:9]{index=9}  
- src/middlewares/: seguridad y validaciones (JWT, validate, upload) :contentReference[oaicite:10]{index=10}  
- src/utils/: conexión a PostgreSQL y utilidades comunes :contentReference[oaicite:11]{index=11}  

## Endpoints

### Salud

- GET /api/health  
  Verifica que Express está corriendo, PostgreSQL responde y que existe la tabla principal `games`. :contentReference[oaicite:12]{index=12}

### Autenticación

- POST /api/auth/register  
- POST /api/auth/login  

En registro, la contraseña se almacena como hash con bcrypt. En login, se valida contra el hash y se genera un JWT firmado con `JWT_SECRET` y expiración. :contentReference[oaicite:13]{index=13}

### Juegos (inventario)

- GET /api/games :contentReference[oaicite:14]{index=14}  
  Filtros soportados por query string: `search`, `category`, `min_age`, `players`, `in_stock`. :contentReference[oaicite:15]{index=15}

- POST /api/games :contentReference[oaicite:16]{index=16}  
  Body esperado: `name`, `category`, `min_age`, `players`, `stock`, `tags`. :contentReference[oaicite:17]{index=17}  
  Validación mínima del schema:  
  - name: obligatorio, 1–120 caracteres  
  - category: opcional  
  - min_age: entero >= 0  
  - players: entero >= 1  
  - stock: entero >= 0  
  - tags: lista de textos :contentReference[oaicite:18]{index=18}

- DELETE /api/games/:id :contentReference[oaicite:19]{index=19}  
  El borrado debe ejecutarse con `DELETE FROM games WHERE id = $1 RETURNING id` para poder saber si existía. :contentReference[oaicite:20]{index=20}

- POST /api/games/import-xml :contentReference[oaicite:21]{index=21}  
  Requiere un archivo en `req.file`, se procesa con `multer` (`upload.single("file")`) y por ahora confirma recepción del XML. :contentReference[oaicite:22]{index=22} :contentReference[oaicite:23]{index=23}

## Rutas del frontend

- GET / sirve `login.html` :contentReference[oaicite:24]{index=24}  
- GET /app sirve `index.html` :contentReference[oaicite:25]{index=25}  
- Archivos estáticos servidos desde `public/` :contentReference[oaicite:26]{index=26}

## Instalación y ejecución

### 1) Clonar repositorio

```bash
git clone <repo-url>
cd ludoteca-backend
````

### 2) Instalar dependencias

```bash
npm install
```

### 3) Variables de entorno

Crear archivo `.env` en la raíz. Variables mínimas: 

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ludoteca

JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1d
```

El proyecto carga `.env` con `dotenv.config()`.  

### 4) Base de datos

#### 4.1 Crear base de datos

```sql
CREATE DATABASE ludoteca;
```

Entrar a PostgreSQL:

```bash
psql -U postgres
```

En Windows, si no está en PATH:

```bash
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
```

#### 4.2 Crear tablas (SQL manual)

Si no hay migraciones automáticas, crear tablas manualmente. La aplicación usa una tabla principal `games` y una tabla `users` para autenticación.  

Ejemplo mínimo funcional (ajustar nombres de columnas si tu implementación difiere):

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  min_age INT NOT NULL DEFAULT 0,
  players INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5) Ejecutar servidor

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Dependencias a instalar

Las dependencias exactas se definen en `package.json`. En general, para este proyecto se requieren las siguientes:

### Producción

* express (API y estáticos) 
* pg (PostgreSQL pool/query) 
* dotenv (carga de .env) 
* jsonwebtoken (JWT) 
* bcrypt (hash/compare) 
* multer (upload XML) 
* zod (validación) 

### Desarrollo

* typescript
* ts-node-dev (desarrollo con recarga)
* @types/node
* @types/express
* @types/pg
* @types/jsonwebtoken
* @types/bcrypt
* @types/multer (si aplica)

## Pruebas rápidas

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"
```

### Crear juego

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"UNO\",\"category\":\"cartas\",\"min_age\":7,\"players\":4,\"stock\":5,\"tags\":[\"familia\",\"rapido\"]}"
```

### Listar juegos con filtros

```bash
curl "http://localhost:3000/api/games?search=uno&in_stock=true"
```

### Eliminar juego por id

```bash
curl -X DELETE "http://localhost:3000/api/games/1"
```

## Notas de implementación

* Los controladores reciben parámetros desde `req.body`, `req.query`, `req.params` y, para XML, desde `req.file`.  
* `GET /api/games` soporta búsqueda por texto y filtros por categoría, edad mínima, jugadores y stock.  
* El endpoint `/api/health` verifica conexión real con PostgreSQL y existencia de tabla `games`. 

