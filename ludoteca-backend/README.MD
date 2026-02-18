#  Ludoteca Básica — Backend

Aplicación mínima para la gestión de inventario de una ludoteca, desarrollada con **Node.js + TypeScript + PostgreSQL**, que incluye:

* Inventario de juegos
* Búsqueda y filtros
* Autenticación con JWT
* Importación de datos (XML)
* Eliminación de registros
* Frontend estático integrado

El objetivo del proyecto es demostrar **estructura de backend, seguridad básica y razonamiento técnico**, más que perfección visual.

---

#  Stack Tecnológico

![Node](https://img.shields.io/badge/Node.js-20-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

#  Arquitectura

Capa de Presentación (Frontend estático)
Archivos HTML/CSS/JS servidos por Express. Consume la API vía fetch y gestiona el token (JWT) en el navegador.

Capa de API (Rutas y Controladores)

Routes: definen endpoints, validan el contrato básico de cada ruta y aplican middlewares.

Controllers: concentran la lógica HTTP (request/response), delegando la lógica de negocio a servicios.

Capa de Dominio/Servicios (Business logic)
Contiene la lógica del inventario y autenticación (búsqueda, filtros, creación/eliminación, validaciones de reglas simples).

Capa de Persistencia (DB / Utils)
Acceso a PostgreSQL mediante pg con queries parametrizadas, evitando SQL Injection y centralizando la conexión.

Capa Transversal (Middlewares)
Funciones reutilizables (p. ej. requireAuth) para control de acceso por JWT.

#  Instalación y ejecución

## 1️ Clonar repositorio

```bash
git clone <repo-url>
cd ludoteca-backend
```

## 2 Instalar dependencias

```bash
npm install
```

## 3️ Configurar variables de entorno

Crear archivo `.env` basado en:

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

---

## 4️ Crear base de datos

En PostgreSQL:

```sql
CREATE DATABASE ludoteca;
```

Ejecutar migración de tabla `games` y `users` (si aplica).

---

## 5️ Ejecutar servidor

```bash
npm run dev
```

Abrir en navegador:

```
http://localhost:3000
```

---

#  Autenticación

El sistema usa **JWT**:

* `POST /api/auth/register`
* `POST /api/auth/login`

Respuesta:

```json
{
  "token": "JWT_TOKEN"
}
```

El token se envía en:

```
Authorization: Bearer <token>
```

---

#  Endpoints principales
Endpoints principales

La API de la ludoteca expone un conjunto pequeño de rutas que permiten verificar el estado del sistema, gestionar el inventario de juegos y autenticar usuarios.

Estado del sistema

GET /api/health
Permite comprobar rápidamente si el servidor está funcionando correctamente y si la conexión con la base de datos PostgreSQL está activa.
Es útil para pruebas técnicas y monitoreo.

Inventario de juegos

GET /api/games
Devuelve la lista de juegos registrados en la ludoteca.
Puede utilizarse junto con filtros de búsqueda desde el frontend.

POST /api/games
Permite registrar un nuevo juego en el inventario enviando sus datos en formato JSON
(nombre, categoría, edad mínima, número de jugadores, stock y etiquetas).

DELETE /api/games/:id
Elimina un juego específico usando su identificador.
Esta operación normalmente requiere autenticación.

Autenticación

POST /api/auth/register
Crea un nuevo usuario dentro del sistema.
La contraseña se guarda de forma segura usando hashing.

POST /api/auth/login
Valida las credenciales del usuario y, si son correctas, devuelve un token JWT
que permite acceder a las rutas protegidas del inventario.

# Pruebas rápidas con cURL

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"test@test.com","password":"123456"}'
```

### Crear juego

```bash
curl -X POST http://localhost:3000/api/games \
-H "Authorization: Bearer TOKEN" \
-H "Content-Type: application/json" \
-d '{"name":"UNO","stock":5}'
```

---

#  Decisiones técnicas

* Separación en **routes / controllers / services** para escalabilidad
* Uso de **queries parametrizadas** para prevenir SQL Injection
* Autenticación **stateless con JWT**
* Frontend mínimo para demostrar integración completa
* Variables sensibles fuera del repositorio (`.env`)

---
