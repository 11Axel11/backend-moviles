import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { addMinutesToTime, getDayName, getTodayInCostaRica, isValidDateOnly, isValidTime, normalizeDay, timeToMinutes } from '../../common/dates/date-time.helper';
import { Horario } from '../horario/entities/horario.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Restaurante } from '../restaurante/entities/restaurante.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CrearReservaDto } from './dto/crearReserva.dto';
import { EstadoReserva, Reserva } from './entities/reserva.entity';

const ESTADOS_BLOQUEANTES = [EstadoReserva.CONFIRMADA, EstadoReserva.PENDIENTE];

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva) private readonly reservasRepository: Repository<Reserva>,
    @InjectRepository(Restaurante) private readonly restaurantesRepository: Repository<Restaurante>,
    @InjectRepository(Mesa) private readonly mesasRepository: Repository<Mesa>,
    @InjectRepository(Usuario) private readonly usuariosRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async crearReserva(dto: CrearReservaDto) {
    const fechaReserva = dto.fechaReserva ?? dto.fecha;
    const horaInicio = dto.horaInicio ?? dto.hora;
    const horaFin = dto.horaFin ?? (horaInicio ? addMinutesToTime(horaInicio, 30) : undefined);
    this.validateDateAndTime(fechaReserva, horaInicio, horaFin);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const restauranteRepository = queryRunner.manager.getRepository(Restaurante);
      const mesaRepository = queryRunner.manager.getRepository(Mesa);
      const reservaRepository = queryRunner.manager.getRepository(Reserva);
      const usuarioRepository = queryRunner.manager.getRepository(Usuario);

      const restaurante = await restauranteRepository.findOne({ where: { idRestaurante: dto.idRestaurante, estado: true } });
      if (!restaurante) throw new NotFoundException(`Restaurante con id "${dto.idRestaurante}" no encontrado o inactivo.`);

      const mesa = await mesaRepository.findOne({ where: { idMesa: dto.idMesa }, relations: { restaurante: true }, lock: { mode: 'pessimistic_write' } });
      if (!mesa) throw new NotFoundException(`Mesa con id "${dto.idMesa}" no encontrada.`);
      if (!mesa.estado) throw new ConflictException('La mesa no está disponible.');
      if (mesa.restaurante.idRestaurante !== restaurante.idRestaurante) throw new UnprocessableEntityException('La mesa no pertenece al restaurante indicado.');
      if (dto.cantidadPersonas > mesa.cantidadSillas) throw new UnprocessableEntityException('La cantidad de personas supera la capacidad de la mesa.');

      await this.assertScheduleExists(restaurante.idRestaurante, fechaReserva!, horaInicio!, horaFin!, queryRunner.manager.getRepository(Horario));

      let usuario: Usuario | null = null;
      if (dto.idUsuario !== undefined) {
        usuario = await usuarioRepository.findOne({ where: { idUsuario: dto.idUsuario } });
        if (!usuario) throw new NotFoundException(`Usuario con id "${dto.idUsuario}" no encontrado.`);
      }

      const overlapping = await reservaRepository.createQueryBuilder('reserva')
        .where('reserva.idMesa = :idMesa', { idMesa: mesa.idMesa })
        .andWhere('reserva.fechaReserva = :fechaReserva', { fechaReserva })
        .andWhere('reserva.estado IN (:...estados)', { estados: ESTADOS_BLOQUEANTES })
        .andWhere('reserva.horaInicio < :horaFin', { horaFin })
        .andWhere('reserva.horaFin > :horaInicio', { horaInicio })
        .getOne();
      if (overlapping) throw new ConflictException('La mesa ya está reservada para la fecha y hora seleccionadas.');

      const reserva = reservaRepository.create({ fechaReserva: fechaReserva!, horaInicio: horaInicio!, horaFin: horaFin!, cantidadPersonas: dto.cantidadPersonas, estado: EstadoReserva.CONFIRMADA, restaurante, mesa, usuario });
      const saved = await reservaRepository.save(reserva);
      await queryRunner.commitTransaction();
      return this.toResponse(saved, restaurante, mesa);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerReserva(idReserva: number) {
    const reserva = await this.reservasRepository.findOne({ where: { idReserva }, relations: { restaurante: true, mesa: true, usuario: true } });
    if (!reserva) throw new NotFoundException(`Reserva con id "${idReserva}" no encontrada.`);
    return this.toResponse(reserva, reserva.restaurante, reserva.mesa);
  }

  async cancelarReserva(idReserva: number) {
    const reserva = await this.reservasRepository.findOne({ where: { idReserva }, relations: { restaurante: true, mesa: true, usuario: true } });
    if (!reserva) throw new NotFoundException(`Reserva con id "${idReserva}" no encontrada.`);
    if (reserva.estado === EstadoReserva.CANCELADA) return this.toResponse(reserva, reserva.restaurante, reserva.mesa);
    reserva.estado = EstadoReserva.CANCELADA;
    const saved = await this.reservasRepository.save(reserva);
    return this.toResponse(saved, saved.restaurante, saved.mesa);
  }

  private async assertScheduleExists(restauranteId: number, fecha: string, horaInicio: string, horaFin: string, repository: Repository<Horario>) {
    const horarios = await repository.find({ where: { restaurante: { idRestaurante: restauranteId }, estado: true } });
    const day = getDayName(fecha);
    const requested = timeToMinutes(horaInicio);
    const requestedEnd = timeToMinutes(horaFin);
    const valid = horarios.some((horario) => {
      if (normalizeDay(horario.diaSemana) !== day) return false;
      const open = timeToMinutes(horario.horaApertura);
      const close = timeToMinutes(horario.horaCierre);
      return requested >= open && requestedEnd <= close && (requested - open) % 30 === 0;
    });
    if (!valid) throw new UnprocessableEntityException('El restaurante no tiene disponibilidad para el horario solicitado.');
  }

  private validateDateAndTime(fecha: string | undefined, horaInicio: string | undefined, horaFin: string | undefined) {
    if (!fecha || !horaInicio || !horaFin) throw new UnprocessableEntityException('Debe indicar fechaReserva, horaInicio y horaFin.');
    if (!isValidDateOnly(fecha)) throw new UnprocessableEntityException('La fecha debe tener el formato YYYY-MM-DD y ser válida.');
    if (!isValidTime(horaInicio) || !isValidTime(horaFin)) throw new UnprocessableEntityException('Las horas deben tener el formato HH:mm y ser válidas.');
    if (timeToMinutes(horaFin) <= timeToMinutes(horaInicio)) throw new UnprocessableEntityException('La horaFin debe ser posterior a la horaInicio.');
    if (fecha < getTodayInCostaRica()) throw new UnprocessableEntityException('La fecha no puede ser anterior al día actual.');
  }

  private toResponse(reserva: Reserva, restaurante: Restaurante, mesa: Mesa) {
    const horaInicio = typeof reserva.horaInicio === 'string' ? reserva.horaInicio.slice(0, 5) : reserva.horaInicio;
    const horaFin = typeof reserva.horaFin === 'string' ? reserva.horaFin.slice(0, 5) : reserva.horaFin;
    return {
      idReserva: reserva.idReserva,
      idRestaurante: restaurante.idRestaurante,
      idMesa: mesa.idMesa,
      idUsuario: reserva.usuario?.idUsuario ?? null,
      restauranteNombre: restaurante.nombre,
      fechaReserva: reserva.fechaReserva,
      horaInicio,
      horaFin,
      cantidadPersonas: reserva.cantidadPersonas,
      estado: reserva.estado,
      fecha: reserva.fechaReserva,
      hora: horaInicio,
    };
  }
}
