# Guía para adaptar el frontend Flutter de TableNow

## Objetivo

Adaptar `frontend_moviles` para consumir el backend NestJS de TableNow usando el modelo:

```text
Usuario 1:N Reserva N:1 Mesa N:1 Restaurante
Restaurante 1:N Horario
```

No inventar rutas ni cambiar los nombres indicados abajo. Mantener la capa actual de `ApiClient`, repositories, modelos y estados.

## Base URL y CORS

Usar la URL configurada en el cliente HTTP. En desarrollo web el backend permite CORS.

Swagger para revisar el contrato:

```text
http://localhost:3000/api
```

## Modelos

### Usuario

```json
{
  "idUsuario": 1,
  "nombre": "Ana",
  "apellido": "Pérez",
  "email": "ana@example.com",
  "telefono": "88888888"
}
```

### Restaurante

Los campos nuevos que deben modelarse son:

```json
{
  "idRestaurante": 1,
  "nombre": "La Terraza Dorada",
  "descripcion": "Restaurante familiar",
  "ubicacion": "Nicoya centro",
  "telefono": "88888888",
  "imagenUrl": "https://res.cloudinary.com/...",
  "estado": true,
  "mesasDisponibles": 5,
  "horasDisponibles": ["18:00", "18:30", "19:00"]
}
```

`horasDisponibles` contiene slots de 30 minutos generados desde los horarios configurados. El endpoint de restaurantes devuelve slots agregados; la disponibilidad real de una mesa se consulta para una fecha y hora específicas.

### Reserva

Usar como contrato principal:

```json
{
  "idReserva": 25,
  "idRestaurante": 1,
  "idMesa": 10,
  "idUsuario": 3,
  "restauranteNombre": "La Terraza Dorada",
  "fechaReserva": "2026-11-20",
  "horaInicio": "19:00",
  "horaFin": "19:30",
  "cantidadPersonas": 4,
  "estado": "confirmada"
}
```

El backend también devuelve temporalmente `fecha` y `hora` como aliases de compatibilidad, pero el frontend nuevo debe migrar a `fechaReserva` y `horaInicio`.

## Endpoints

### Restaurantes

```text
GET /restaurante/GetAllRestaurantesActivos?page=1&limit=50
GET /restaurante/GetAllRestaurantesInactivos?page=1&limit=50
GET /restaurante/GetRestauranteById/:idRestaurante
```

La respuesta paginada es `{ "data": [...], "total": 0 }`.

### Mesas disponibles

```text
GET /mesas/restaurante/:idRestaurante/disponibles?fecha=2026-11-20&hora=19:00
```

Respuesta:

```json
{
  "data": [
    {
      "idMesa": 10,
      "numeroMesa": 3,
      "cantidadSillas": 4,
      "estado": true
    }
  ],
  "total": 1
}
```

La consulta considera restaurante activo, mesa activa, horario válido y reservas `confirmada` o `pendiente`. Las reservas `cancelada` no bloquean.

### Usuarios

```text
POST /usuarios
GET /usuarios/:idUsuario
PATCH /usuarios/:idUsuario
```

Crear usuario:

```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "email": "ana@example.com",
  "telefono": "88888888"
}
```

Guardar `idUsuario` en el estado de sesión o en el flujo de reserva. Todavía no existe autenticación; no implementar JWT en esta tarea.

### Horarios administrativos

```text
POST /horarios
GET /horarios/restaurante/:idRestaurante
PATCH /horarios/:idHorario
DELETE /horarios/:idHorario
```

Crear horario:

```json
{
  "idRestaurante": 1,
  "diaSemana": "viernes",
  "horaApertura": "18:00",
  "horaCierre": "22:00"
}
```

### Reservas

Crear reserva:

```text
POST /reservas
```

Body recomendado:

```json
{
  "idRestaurante": 1,
  "idMesa": 10,
  "idUsuario": 3,
  "fechaReserva": "2026-11-20",
  "horaInicio": "19:00",
  "horaFin": "19:30",
  "cantidadPersonas": 4
}
```

Consultar y cancelar:

```text
GET /reservas/:idReserva
PATCH /reservas/:idReserva/cancelar
```

El backend valida capacidad, pertenencia de mesa, horario del restaurante, fecha futura y conflictos de intervalo. El frontend debe mostrar el mensaje recibido del backend y no permitir seleccionar mesas que ya no estén en la respuesta de disponibilidad.

## Cambios de pantallas

1. Crear o recuperar un `Usuario` antes de reservar y conservar su `idUsuario`.
2. En el detalle del restaurante, mostrar `mesasDisponibles` y `horasDisponibles`.
3. Al cambiar fecha u hora, volver a llamar inmediatamente al endpoint de mesas disponibles.
4. Mostrar las mesas disponibles como selección única.
5. Validar localmente que `cantidadPersonas > 0` y no supere `cantidadSillas`, sin reemplazar la validación del backend.
6. Enviar `horaFin` como `horaInicio + 30 minutos` salvo que el diseño permita intervalos distintos.
7. Después de crear una reserva, mostrar `idReserva`, restaurante, mesa, fecha, intervalo, personas y estado.
8. Añadir acción de cancelar y actualizar la disponibilidad después de una cancelación.
9. Manejar estos estados HTTP:
   - `400`: datos o campos inválidos.
   - `404`: restaurante, mesa, usuario o reserva inexistente.
   - `409`: mesa ocupada o conflicto.
   - `422`: regla de negocio, horario cerrado o capacidad insuficiente.

## Prompt para el agente del frontend

```text
Adapta el frontend Flutter TableNow para el backend NestJS actual. Respeta la arquitectura existente de ApiClient, repositories, modelos, providers/blocs y pantallas.

Usa exactamente estas rutas:
GET /restaurante/GetAllRestaurantesActivos?page=1&limit=50
GET /restaurante/GetRestauranteById/:idRestaurante
GET /mesas/restaurante/:idRestaurante/disponibles?fecha=YYYY-MM-DD&hora=HH:mm
POST /usuarios
GET /usuarios/:idUsuario
POST /reservas
GET /reservas/:idReserva
PATCH /reservas/:idReserva/cancelar

Actualiza los modelos para soportar Restaurante(idRestaurante, nombre, descripcion, ubicacion, telefono, imagenUrl, estado, mesasDisponibles, horasDisponibles), Usuario(idUsuario, nombre, apellido, email, telefono), Mesa(idMesa, numeroMesa, cantidadSillas, estado) y Reserva(idReserva, idRestaurante, idMesa, idUsuario, restauranteNombre, fechaReserva, horaInicio, horaFin, cantidadPersonas, estado).

Implementa el flujo: cargar restaurantes activos; abrir detalle; seleccionar fecha, hora y cantidad de personas; consultar mesas disponibles; seleccionar una mesa; crear la reserva; mostrar confirmación; consultar detalle; cancelar y refrescar disponibilidad.

Usa horasDisponibles como slots de 30 minutos. Cada cambio de fecha u hora debe refrescar mesas disponibles. Envía fecha en YYYY-MM-DD, horas en HH:mm y horaFin como horaInicio más 30 minutos.

Mapea errores HTTP 400, 404, 409 y 422 a mensajes visibles y legibles. No hardcodees mesas, horarios ni reservas. No cambies las rutas. Ejecuta flutter analyze y las pruebas existentes al terminar.
```
