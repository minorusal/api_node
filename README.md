# api_node
Pequeña API en Node.js con autenticación por JWT, rutas protegidas,
subida de archivos y consumo de APIs públicas.

API_NODE.postman_collection.json es es la culeccion para hacer uso de la API

y el examen teorico es el archivo word cuestionarioNode.dox

## Variables de entorno

Para ejecutar la aplicación es necesario definir un archivo `.env` con las
siguientes variables:

```
PORT=3000
JWT_SECRET=keySecret
OPERACIONES_SECRET=4RC542024L3v4n74m13n70
CORS_ORIGIN=http://localhost:3000
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=demodb
```

`OPERACIONES_SECRET` se utiliza para validar los tokens manejados en el módulo
`operacionesModule`.

## Endpoints principales

- `POST /auth/register` Registra un usuario.
- `POST /auth/login` Inicia sesión y entrega un JWT.
- `POST /auth/logout` Cierra sesión.
- `GET /users` Obtiene todos los usuarios (protegido).
- `POST /files/upload` Sube una imagen.
- `POST /operaciones/suma-numeros` Retorna la suma de dos números y almacena el resultado en MySQL.
- `GET /public-apis/get-api` Consume una API pública.
- `GET /materials` Lista materiales (protegido).
- `GET /accessories` Lista accesorios (protegido).
- `GET /playsets` Lista playsets (protegido).

## Configuración de CORS

El dominio permitido se define con la variable de entorno `CORS_ORIGIN`. Si no se
especifica se permite cualquier origen.

## Pruebas

Ejecuta `npm test` para correr las pruebas unitarias con Mocha.
