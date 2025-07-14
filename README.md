# Clean Hexagonal Node API

Este proyecto es una base en Node.js con arquitectura hexagonal lista para extenderse. Incluye únicamente el flujo de autenticación con inicio y cierre de sesión utilizando JWT.

## Estructura

```
src/
  application/        Casos de uso y servicios
  domain/             Entidades y contratos de repositorio
  infrastructure/
    database/         Conexión a MySQL
    repositories/     Implementaciones de repositorios
    routes/           Rutas HTTP
    web/              Configuración de Express
  index.js            Punto de entrada
```

## Scripts

- `npm start` – Inicia el servidor con nodemon.
- `npm test` – Ejecuta las pruebas unitarias de ejemplo.

## Endpoints

- `POST /auth/login` – Inicia sesión y devuelve un JWT en una cookie.
- `POST /auth/logout` – Cierra la sesión y elimina la cookie.

Para ejecutar se debe contar con un archivo `.env` con los datos de conexión a la base y `JWT_SECRET`.
