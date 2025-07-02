# api_node
Pequeña API en Node.js con autenticación por JWT, rutas protegidas,
subida de archivos y consumo de APIs públicas.

API_NODE_New.postman_collection.json es la colección actualizada para usar la API, incluyendo materiales, accesorios y playsets. Para el escenario de ejemplo se agregó el archivo `API_NODE_Scenario.postman_collection.json` que muestra cómo registrar materiales y vincularlos a un accesorio.

y el examen teorico es el archivo word cuestinarioNode.docx

## Variables de entorno

Para ejecutar la aplicación es necesario definir un archivo `.env` con las
siguientes variables:

```
PORT=3000
JWT_SECRET=keySecret
OPERACIONES_SECRET=4RC542024L3v4n74m13n70
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
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
  - Parámetros opcionales: `page`, `limit` y `search` para paginar y filtrar por texto.
- `GET /accessories` Lista accesorios (protegido).
  - Parámetros opcionales: `page` y `limit` para paginar los resultados.
- `GET /accessories/:id` Obtiene un accesorio con sus materiales y componentes.
- `GET /accessories/:id/cost` Calcula el costo y precio de un accesorio.
- `PUT /accessories/:id/components` Reemplaza los componentes de un accesorio.
  - Envía un arreglo `components` con `accessory_id` y `quantity`.
- `POST /accessories` Crea un accesorio y opcionalmente vincula materiales y otros accesorios enviando los campos `materials` y `accessories`.
- `GET /playsets` Lista playsets (protegido).
- `GET /playsets/:id/cost` Calcula el costo total de un playset.
- `POST /playset-accessories` Crea vínculo de accesorio a playset (protegido).
- `GET /playset-accessories` Lista vínculos playset-accesorio (protegido).
- `PUT /playset-accessories/:id` Actualiza la cantidad del vínculo (protegido).
- `DELETE /playset-accessories/:id` Elimina un vínculo (protegido).
- `POST /accessory-materials` Vincula materiales a un accesorio de forma
  independiente. Cuando se envían `cost` o `price` se multiplican por `quantity`
  para guardar el total.
- `PUT /accessory-materials/:id` Actualiza un vínculo individual o reemplaza los
  materiales de un accesorio. Los valores de `cost` y `price` también se
  multiplican por `quantity`.
- `GET /clients` Lista clientes (protegido).
- `POST /clients` Crea un cliente (protegido).
- `GET /projects` Lista proyectos (protegido). Incluye el nombre y descripción del playset asociado.
- `POST /projects` Crea un proyecto con cliente y playset (protegido).
- `POST /installation-costs` Registra los costos de instalación de un proyecto.
- `GET /installation-costs?project_id=<id>` Obtiene los costos de instalación por proyecto.
- `PUT /installation-costs/:project_id` Actualiza los costos de instalación.

## Ejemplo de construcción de un playset

Para crear un playset y vincular accesorios se pueden usar los nuevos endpoints.
A continuación se muestran peticiones de ejemplo:

```bash
curl -X POST http://localhost:3000/playsets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Mi playset","description":"Con varios accesorios"}'
```

```bash
curl -X POST http://localhost:3000/playset-accessories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"playsetId":1,"accessoryId":2,"quantity":1}'
```

```bash
curl -X POST http://localhost:3000/installation-costs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"project_id":1,"workers":2,"days":5,"meal_per_person":100,"hotel_per_day":200,"labor_cost":300,"personal_transport":50,"local_transport":80,"extra_expenses":120}'
```

Puedes usar `API_NODE_Scenario.postman_collection.json` como referencia para
probar estas solicitudes y construir un playset completo.

## Configuración de CORS

El dominio permitido se define con la variable de entorno `CORS_ORIGIN`. Puedes
proporcionar varios orígenes separados por comas. De forma predeterminada la
aplicación siempre permitirá `http://localhost:4200` para facilitar el trabajo
en local. Si no se especifica la variable, se permite cualquier origen. La
configuración incluye `credentials: true` para permitir el envío de cookies en
solicitudes cross-origin, por lo que asegúrate de definir `CORS_ORIGIN` cuando
uses autenticación basada en cookies. Si accedes a la documentación Swagger
desde `http://localhost:3000`, incluye ese origen, por ejemplo:

```
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
```

Al consumir los endpoints protegidos debes enviar el token JWT. Puedes
hacerlo en el encabezado `Authorization` (recomendado) o confiar en la cookie
`jwt`. Si utilizas cookies, establece `withCredentials: true` para que el
navegador la envíe en cada solicitud.

## Pruebas

Para asegurarte de que las dependencias de desarrollo necesarias para las
pruebas estén instaladas, ejecuta primero `npm install` y luego `npm test`:

```bash
npm install
npm test
```

También puedes usar el script `run-tests.sh` incluido en este repositorio, el
cual instala las dependencias y lanza las pruebas en un solo paso.

## Documentación Swagger

La versión utilizada del paquete `swagger-ui-express` es ^5.0.1. Puedes acceder a la documentación interactiva en:

```
http://localhost:3000/api-docs
```

Cambia el puerto si usas un valor distinto en la variable `PORT`.

## Actualización de remisiones

Para identificar si una remisión es para el propietario de la empresa o para el cliente, se añadió la columna `recipient_type` a la tabla `remissions`.

Si ya tienes datos y sólo quieres aplicar el cambio ejecuta:

```sql
ALTER TABLE remissions ADD COLUMN recipient_type ENUM('owner','client') DEFAULT 'owner';
```

## Personalización de colores en remisiones

Puedes modificar el color de fondo y el color de texto de las cabeceras en las remisiones mediante el endpoint:

```http
PUT /remission-style
```

En el cuerpo envía los campos `headerBackgroundColor` y/o `headerTextColor` en formato hexadecimal. Para obtener los valores actuales utiliza:

```http
GET /remission-style
```

## Consultar remisiones por owner

Para obtener todas las remisiones asociadas a un propietario utiliza:

```http
GET /remissions/by-owner/{owner_id}
```
Puedes añadir los parámetros de consulta `page`, `limit` y `search` para
paginar y filtrar los resultados.

## Menús por propietario

El endpoint `GET /menus` permite filtrar los menús pertenecientes a una empresa
(**owner**) utilizando el parámetro de consulta `owner_id`. Si no se indica, se
asume el valor `1`.

```http
GET /menus?owner_id=<id>
```

Para crear un menú asociado a un propietario también se puede enviar el campo
`owner_id` en el cuerpo de la petición:

```http
POST /menus
Content-Type: application/json

{
  "name": "Nombre del menú",
  "path": null,
  "parent_id": null,
  "owner_id": <id>
}
```

De esta manera cada empresa puede contar con su propio conjunto de menús.
