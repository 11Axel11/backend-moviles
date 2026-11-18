# Backend TableNow

API NestJS para restaurantes, mesas, horarios y reservas.

## Configuración

Copiar `.env.example` como `.env` y completar las credenciales de MySQL y Cloudinary.

## Ejecución

```bash
npm install
npm run start:dev
```

Swagger: `http://localhost:3000/api`

## Datos de prueba

Con la base de datos configurada, ejecutar:

```bash
npm run db:seed
```

El seed es idempotente: puede ejecutarse varias veces sin duplicar restaurantes, usuarios, horarios, mesas ni reservas. Crea datos para probar mesas ocupadas, mesas libres, reservas pendientes y reservas canceladas.

## Flujo de reservas

```bash
curl "http://localhost:3000/restaurante/GetAllRestaurantesActivos?page=1&limit=50"
curl "http://localhost:3000/restaurante/GetRestauranteById/1"
curl "http://localhost:3000/mesas/restaurante/1/disponibles?fecha=2026-11-20&hora=19:00"
curl -X POST "http://localhost:3000/reservas" -H "Content-Type: application/json" -d "{\"idRestaurante\":1,\"idMesa\":10,\"fecha\":\"2026-11-20\",\"hora\":\"19:00\",\"cantidadPersonas\":4}"
curl "http://localhost:3000/reservas/1"
curl -X PATCH "http://localhost:3000/reservas/1/cancelar"
```
