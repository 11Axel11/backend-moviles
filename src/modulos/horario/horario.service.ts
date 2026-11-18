import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isValidTime, normalizeDay, timeToMinutes } from '../../common/dates/date-time.helper';
import { Restaurante } from '../restaurante/entities/restaurante.entity';
import { CrearHorarioDto } from './dto/crearHorarioDto';
import { Horario } from './entities/horario.entity';

@Injectable()
export class HorarioService {
  constructor(
    @InjectRepository(Horario) private readonly horariosRepository: Repository<Horario>,
    @InjectRepository(Restaurante) private readonly restaurantesRepository: Repository<Restaurante>,
  ) {}

  async crear(dto: CrearHorarioDto) {
    const restaurante = await this.getRestaurant(dto.idRestaurante);
    this.validate(dto);
    const horario = this.horariosRepository.create({
      diaSemana: normalizeDay(dto.diaSemana),
      horaApertura: dto.horaApertura,
      horaCierre: dto.horaCierre,
      estado: dto.estado ?? true,
      restaurante,
    });
    return this.horariosRepository.save(horario);
  }

  listarPorRestaurante(idRestaurante: number) {
    return this.horariosRepository.find({
      where: { restaurante: { idRestaurante } },
      order: { diaSemana: 'ASC', horaApertura: 'ASC' },
    });
  }

  async actualizar(idHorario: number, dto: Partial<CrearHorarioDto>) {
    const horario = await this.horariosRepository.findOne({ where: { idHorario } });
    if (!horario) throw new NotFoundException(`Horario con id "${idHorario}" no encontrado.`);
    const values = {
      diaSemana: dto.diaSemana !== undefined ? normalizeDay(dto.diaSemana) : horario.diaSemana,
      horaApertura: dto.horaApertura ?? horario.horaApertura,
      horaCierre: dto.horaCierre ?? horario.horaCierre,
      estado: dto.estado ?? horario.estado,
    };
    this.validate(values);
    if (dto.idRestaurante !== undefined) horario.restaurante = await this.getRestaurant(dto.idRestaurante);
    Object.assign(horario, values);
    return this.horariosRepository.save(horario);
  }

  async eliminar(idHorario: number) {
    const result = await this.horariosRepository.delete(idHorario);
    if (!result.affected) throw new NotFoundException(`Horario con id "${idHorario}" no encontrado.`);
    return { message: 'Horario eliminado correctamente.' };
  }

  private async getRestaurant(idRestaurante: number) {
    const restaurante = await this.restaurantesRepository.findOne({ where: { idRestaurante } });
    if (!restaurante) throw new NotFoundException(`Restaurante con id "${idRestaurante}" no encontrado.`);
    return restaurante;
  }

  private validate(dto: { diaSemana: string; horaApertura: string; horaCierre: string }) {
    const validDays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const day = normalizeDay(dto.diaSemana);
    if (!validDays.includes(day)) throw new UnprocessableEntityException('El día de la semana no es válido.');
    if (!isValidTime(dto.horaApertura) || !isValidTime(dto.horaCierre)) {
      throw new UnprocessableEntityException('Las horas deben tener el formato HH:mm.');
    }
    if (timeToMinutes(dto.horaCierre) <= timeToMinutes(dto.horaApertura)) {
      throw new UnprocessableEntityException('La hora de cierre debe ser posterior a la hora de apertura.');
    }
  }
}
