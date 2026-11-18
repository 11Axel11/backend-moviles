import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Mesa } from "./entities/mesa.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CrearMesaDto } from "./dto/crearMesaDto";
import { Restaurante } from "../restaurante/entities/restaurante.entity";
import { ActualizarMesaDto } from "./dto/actualizarMesaDto";
import { Reserva } from '../reservas/entities/reserva.entity';
import { EstadoReserva } from '../reservas/entities/reserva.entity';
import { addMinutesToTime, getDayName, isValidDateOnly, isValidTime, normalizeDay, timeToMinutes } from '../../common/dates/date-time.helper';
import { Horario } from '../horario/entities/horario.entity';



@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesasRepository: Repository<Mesa>,

    @InjectRepository(Restaurante)
    private readonly restauranteRepository: Repository<Restaurante>,

    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,

    @InjectRepository(Horario)
    private readonly horariosRepository: Repository<Horario>,
  ) {}

  async crearMesa(dto: CrearMesaDto): Promise<Mesa> {
    const restaurante = await this.restauranteRepository.findOne({
      where: { idRestaurante: dto.idRestaurante },
    });

    if (!restaurante) {
      throw new NotFoundException(`No se encontró un restaurante con ese ID.`);
    }

    const nuevaMesa = this.mesasRepository.create({
      numeroMesa: dto.numeroMesa,
      cantidadSillas: dto.cantidadSillas,
      restaurante: restaurante,
    });
    return await this.mesasRepository.save(nuevaMesa);
  }

  async actualizarMesa(idMesa: number, dto: ActualizarMesaDto): Promise<Mesa> {
    const mesa = await this.mesasRepository.findOne({
      where: { idMesa: idMesa },
    });

    if (!mesa) {
      throw new NotFoundException(`No se encontró una mesa con ese ID.`);
    }

    if (dto.idRestaurante !== undefined) {
      const restaurante = await this.restauranteRepository.findOne({ where: { idRestaurante: dto.idRestaurante } });
      if (!restaurante) throw new NotFoundException(`No se encontró un restaurante con ese ID.`);
      mesa.restaurante = restaurante;
    }
    if (dto.numeroMesa !== undefined) mesa.numeroMesa = dto.numeroMesa;
    if (dto.cantidadSillas !== undefined) mesa.cantidadSillas = dto.cantidadSillas;
    if (mesa.cantidadSillas < 1) {
      throw new UnprocessableEntityException('La cantidad de sillas debe ser mayor que cero.');
    }
    return await this.mesasRepository.save(mesa);
  }

  async handleEstadoMesa(id: number): Promise<{ message: string }> {
    const mesa = await this.mesasRepository.findOne({
      where: { idMesa: id },
    });

    if (!mesa) {
      throw new NotFoundException(`Mesa con id "${id}" no encontrada.`);
    }

    mesa.estado = !mesa.estado;
    await this.mesasRepository.save(mesa);

    return {
      message: `Mesa ${mesa.estado ? 'habilitada' : 'deshabilitada'} exitosamente.`,
    };
  }


  async getAllMesasDisponibles(page?: number, limit?: number): Promise<{data: Mesa[], total: number}>{
  
      if (!page || !limit) throw new BadRequestException('Los parámetros page y limit son requeridos.');
  
      const [data, total] = await this.mesasRepository.findAndCount({
          where: {estado: true},
          skip: (page - 1) * limit,
          take: limit,
          order: {idMesa: 'DESC' },
          select: ['idMesa', 'numeroMesa', 'cantidadSillas'],
      });
  
      if((page - 1) * limit >= total){
          return {data: [], total};
      } 
  
      return {data, total};
    }


    async getAllMesasOcupadas(page?: number, limit?: number): Promise<{data: Mesa[], total: number}>{
  
      if (!page || !limit) throw new BadRequestException('Los parámetros page y limit son requeridos.');
  
      const [data, total] = await this.mesasRepository.findAndCount({
          where: {estado: false},
          skip: (page - 1) * limit,
          take: limit,
          order: {idMesa: 'DESC' },
          select: ['idMesa', 'numeroMesa', 'cantidadSillas'],
      });
  
      if((page - 1) * limit >= total){
          return {data: [], total};
      } 
  
      return {data, total};
    }


    async getMesaById(idMesa: number): Promise<Partial<Mesa>> {

    const mesa = await this.mesasRepository.findOne({
      where: { idMesa },
      select: ['idMesa', 'numeroMesa', 'cantidadSillas', 'estado'],
    });

    if (!mesa) {
      throw new NotFoundException(`Mesa con id "${idMesa}" no encontrada.`);
    }

      return mesa;
    }

  async getDisponiblesPorRestaurante(idRestaurante: number, fecha: string, hora: string) {
    if (!isValidDateOnly(fecha)) throw new BadRequestException('La fecha debe tener el formato YYYY-MM-DD y ser válida.');
    if (!isValidTime(hora)) throw new BadRequestException('La hora debe tener el formato HH:mm y ser válida.');

    const restaurante = await this.restauranteRepository.findOne({ where: { idRestaurante, estado: true } });
    if (!restaurante) throw new NotFoundException(`Restaurante con id "${idRestaurante}" no encontrado o inactivo.`);

    const requestedMinutes = timeToMinutes(hora);
    const day = getDayName(fecha);
    const horarioValido = (await this.horariosRepository.find({
      where: { restaurante: { idRestaurante }, estado: true },
    })).some((horario) => {
      const open = timeToMinutes(horario.horaApertura);
      const close = timeToMinutes(horario.horaCierre);
      return normalizeDay(horario.diaSemana) === day && requestedMinutes >= open && requestedMinutes < close;
    });
    if (!horarioValido) return { data: [], total: 0 };

    const horaFin = addMinutesToTime(hora, 30);

    const query = this.mesasRepository
      .createQueryBuilder('mesa')
      .innerJoin('mesa.restaurante', 'restaurante')
      .leftJoin(
        Reserva,
        'reserva',
        'reserva.idMesa = mesa.idMesa AND reserva.fechaReserva = :fecha AND reserva.horaInicio < :horaFin AND reserva.horaFin > :hora AND reserva.estado IN (:...estados)',
        { fecha, hora, horaFin, estados: [EstadoReserva.CONFIRMADA, EstadoReserva.PENDIENTE] },
      )
      .where('mesa.idRestaurante = :idRestaurante', { idRestaurante })
      .andWhere('mesa.estado = :estado', { estado: true })
      .andWhere('restaurante.estado = :restauranteEstado', { restauranteEstado: true })
      .andWhere('reserva.idReserva IS NULL')
      .select(['mesa.idMesa', 'mesa.numeroMesa', 'mesa.cantidadSillas', 'mesa.estado'])
      .orderBy('mesa.numeroMesa', 'ASC');

    const data = await query.getMany();
    return { data, total: data.length };
  }

}
