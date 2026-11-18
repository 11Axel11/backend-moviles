import { config } from 'dotenv';
import { DataSource, Repository } from 'typeorm';
import { addMinutesToTime, getTodayInCostaRica, minutesToTime } from '../../common/dates/date-time.helper';
import { Horario } from '../../modulos/horario/entities/horario.entity';
import { Mesa } from '../../modulos/mesas/entities/mesa.entity';
import { Restaurante } from '../../modulos/restaurante/entities/restaurante.entity';
import { EstadoReserva, Reserva } from '../../modulos/reservas/entities/reserva.entity';
import { Usuario } from '../../modulos/usuario/entities/usuario.entity';

config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Restaurante, Mesa, Horario, Reserva, Usuario],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
  synchronize: false,
});

function dateAfter(days: number): string {
  const date = new Date(`${getTodayInCostaRica()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function getOrCreateRestaurant(repository: Repository<Restaurante>, data: Partial<Restaurante>) {
  let restaurant = await repository.findOne({ where: { nombre: data.nombre } });
  if (!restaurant) restaurant = repository.create(data);
  else Object.assign(restaurant, data);
  return repository.save(restaurant);
}

async function getOrCreateUser(repository: Repository<Usuario>, data: Partial<Usuario>) {
  let user = await repository.findOne({ where: { email: data.email } });
  if (!user) user = repository.create(data);
  else Object.assign(user, data);
  return repository.save(user);
}

async function seed(): Promise<void> {
  await dataSource.initialize();

  const restaurantRepository = dataSource.getRepository(Restaurante);
  const tableRepository = dataSource.getRepository(Mesa);
  const scheduleRepository = dataSource.getRepository(Horario);
  const reservationRepository = dataSource.getRepository(Reserva);
  const userRepository = dataSource.getRepository(Usuario);

  const restaurantOne = await getOrCreateRestaurant(restaurantRepository, {
    nombre: 'La Terraza Dorada',
    descripcion: 'Restaurante familiar de comida costarricense.',
    ubicacion: 'Nicoya centro',
    telefono: '88888888',
    imagenUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    estado: true,
  });
  const restaurantTwo = await getOrCreateRestaurant(restaurantRepository, {
    nombre: 'Sabores del Valle',
    descripcion: 'Cocina contemporánea y ambiente relajado.',
    ubicacion: 'Liberia centro',
    telefono: '87777777',
    imagenUrl: 'https://images.unsplash.com/photo-1515003196954-5a2f2f6f3c6f',
    estado: true,
  });

  const users = await Promise.all([
    getOrCreateUser(userRepository, { nombre: 'Ana', apellido: 'Pérez', email: 'ana.demo@tablenow.local', telefono: '88881111' }),
    getOrCreateUser(userRepository, { nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos.demo@tablenow.local', telefono: '88882222' }),
  ]);

  const restaurants = [restaurantOne, restaurantTwo];
  for (const restaurant of restaurants) {
    for (const day of ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']) {
      const existing = await scheduleRepository.findOne({ where: { restaurante: { idRestaurante: restaurant.idRestaurante }, diaSemana: day, horaApertura: '11:00', horaCierre: '22:00' } });
      if (!existing) {
        await scheduleRepository.save(scheduleRepository.create({
          diaSemana: day,
          horaApertura: '11:00',
          horaCierre: '22:00',
          estado: true,
          restaurante: restaurant,
        }));
      }
    }
  }

  const tables: Mesa[] = [];
  for (const [restaurant, tableData] of [[restaurantOne, [[1, 2], [2, 4], [3, 6]]], [restaurantTwo, [[1, 2], [2, 4]]]] as const) {
    for (const [numeroMesa, cantidadSillas] of tableData) {
      let table = await tableRepository.findOne({ where: { restaurante: { idRestaurante: restaurant.idRestaurante }, numeroMesa } });
      if (!table) table = tableRepository.create({ restaurante: restaurant, numeroMesa, cantidadSillas, estado: true });
      else Object.assign(table, { cantidadSillas, estado: true, restaurante: restaurant });
      tables.push(await tableRepository.save(table));
    }
  }

  const seedDate = dateAfter(2);
  const nextDate = dateAfter(3);
  await upsertReservation(reservationRepository, {
    restaurante: restaurantOne,
    mesa: tables[0],
    usuario: users[0],
    fechaReserva: seedDate,
    horaInicio: '19:00',
    horaFin: '19:30',
    cantidadPersonas: 2,
    estado: EstadoReserva.CONFIRMADA,
  });
  await upsertReservation(reservationRepository, {
    restaurante: restaurantOne,
    mesa: tables[1],
    usuario: users[1],
    fechaReserva: seedDate,
    horaInicio: '19:30',
    horaFin: '20:00',
    cantidadPersonas: 4,
    estado: EstadoReserva.PENDIENTE,
  });
  await upsertReservation(reservationRepository, {
    restaurante: restaurantOne,
    mesa: tables[0],
    usuario: users[0],
    fechaReserva: nextDate,
    horaInicio: '18:00',
    horaFin: '18:30',
    cantidadPersonas: 2,
    estado: EstadoReserva.CANCELADA,
  });

  console.log('Seeds cargados correctamente.');
  console.table({
    restauranteUno: restaurantOne.idRestaurante,
    restauranteDos: restaurantTwo.idRestaurante,
    usuarioAna: users[0].idUsuario,
    usuarioCarlos: users[1].idUsuario,
    fechaPrueba: seedDate,
    mesaReservada: tables[0].idMesa,
    mesaDisponible: tables[2].idMesa,
    horaPrueba: '19:00',
  });
}

async function upsertReservation(repository: Repository<Reserva>, data: Partial<Reserva>) {
  let reservation = await repository.findOne({ where: {
    mesa: { idMesa: data.mesa!.idMesa },
    fechaReserva: data.fechaReserva,
    horaInicio: data.horaInicio,
  } });
  if (!reservation) reservation = repository.create(data);
  else Object.assign(reservation, data);
  return repository.save(reservation);
}

seed()
  .catch((error) => {
    console.error('No se pudieron cargar los seeds:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });
