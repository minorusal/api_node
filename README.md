# api_node
Api en node con autenticación, tutas protegidas, upload de archivos y más ...

API_NODE.postman_collection.json es es la culeccion para hacer uso de la API

y el examen teorico es el archivo word cuestionarioNode.dox

## Variables de entorno

Para ejecutar la aplicación es necesario definir un archivo `.env` con las
siguientes variables:

```
MONGODB_URI=mongodb://127.0.0.1:27017/example_BD
PORT=3000
JWT_SECRET=keySecret
OPERACIONES_SECRET=4RC542024L3v4n74m13n70
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=demodb
```

`OPERACIONES_SECRET` se utiliza para validar los tokens manejados en el módulo
`operacionesModule`.
