import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Express } from 'express';
import { Restaurante } from './entities/restaurante.entity';
import { Repository } from 'typeorm';
import { CrearRestauranteDto } from './dto/crearRestauranteDto';
import { uploadBufferToCloudinary } from 'src/common/cloudinary/cloudinary-buffer.service';
import { ActualizarRestauranteDto } from './dto/actualizarRestauranteDto';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Horario } from '../horario/entities/horario.entity';
import { generateTimeSlots } from '../../common/dates/date-time.helper';

@Injectable()
export class RestauranteService {
  constructor(
    @InjectRepository(Restaurante)
    private readonly restauranteRepository: Repository<Restaurante>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,
  ) {}

  async crearRestaurante(dto: CrearRestauranteDto, file: Express.Multer.File): Promise<Restaurante> {
    const restauranteExistente = await this.restauranteRepository.findOne({
      where: { nombre: dto.nombre },
    });

    if (restauranteExistente) {
      throw new ConflictException(
        `Ya existe un restaurante con ese nombre.`,
      );
    }

    const { secure_url } = await uploadBufferToCloudinary(
      file.buffer,
      'restaurantes',
    );

    const nuevoRestaurante = this.restauranteRepository.create({
      ...dto,
      imagenUrl: secure_url,
    });
    return await this.restauranteRepository.save(nuevoRestaurante);
  }


  async actualizarRestaurante(idRestaurante: number, dto: ActualizarRestauranteDto, file?: Express.Multer.File): Promise<Restaurante> {
    const restaurante = await this.restauranteRepository.findOne({
      where: { idRestaurante: idRestaurante },
    });

    if (!restaurante) {
      throw new NotFoundException(`Restaurante con id "${idRestaurante}" no encontrado.`);
    }

    if(dto.nombre && dto.nombre !== restaurante.nombre){
      const restauranteExistente = await this.restauranteRepository.findOne({
        where: { nombre: dto.nombre },
      });

      if (restauranteExistente) {
        throw new ConflictException(
          `Ya existe un restaurante con el nombre "${dto.nombre}".`,
        );
      }
   }

   if (file) {
     const { secure_url } = await uploadBufferToCloudinary(
       file.buffer,
       'restaurantes',
     );
     restaurante.imagenUrl = secure_url;
   }

   for (const [key, value] of Object.entries(dto)) {
     if (value !== undefined && value !== '') {
       (restaurante as any)[key] = value;
     }
   }
       return await this.restauranteRepository.save(restaurante);
  }

  async handleEstadoRestaurante(id: number): Promise<{ message: string }> {
    const restaurante = await this.restauranteRepository.findOne({where: { idRestaurante: id }});

    if (!restaurante) {
      throw new NotFoundException(`Restaurante con id "${id}" no encontrado.`);
    }

    restaurante.estado = !restaurante.estado;
    await this.restauranteRepository.save(restaurante);
    
    return { message: `Restaurante ${restaurante.estado ? 'habilitado' : 'deshabilitado'} exitosamente.` };
  }


  async getAllRestaurantesActivos(page?: number, limit?: number): Promise<{data: Partial<Restaurante>[], total: number}>{

    if (!page || !limit) throw new BadRequestException('Los parámetros page y limit son requeridos.');

    const [data, total] = await this.restauranteRepository.findAndCount({
        where: {estado: true},
        skip: (page - 1) * limit,
        take: limit,
        order: {idRestaurante: 'DESC' },
        select: ['idRestaurante', 'nombre', 'descripcion', 'ubicacion', 'telefono', 'imagenUrl', 'estado'],
    });

    if((page - 1) * limit >= total){
        return {data: [], total};
    } 

    return { data: await Promise.all(data.map((restaurante) => this.enrichRestaurant(restaurante))), total };
  }


  async getAllRestaurantesInactivos(page?: number, limit?: number): Promise<{data: Partial<Restaurante>[], total: number}>{

    if (!page || !limit) throw new BadRequestException('Los parámetros page y limit son requeridos.');

    const [data, total] = await this.restauranteRepository.findAndCount({
        where: {estado: false},
        skip: (page - 1) * limit,
        take: limit,
        order: {idRestaurante: 'DESC' },
        select: ['idRestaurante', 'nombre', 'ubicacion'],
    });

    if((page - 1) * limit >= total){
        return {data: [], total};
    }

    return {data, total};
  }


  async getRestauranteById(idRestaurante: number): Promise<Partial<Restaurante>> {

    const restaurante = await this.restauranteRepository.findOne({
      where: { idRestaurante },
      select: ['idRestaurante', 'nombre', 'descripcion', 'ubicacion', 'telefono', 'imagenUrl', 'estado'],
    });

    if (!restaurante) {
      throw new NotFoundException(`Restaurante con id "${idRestaurante}" no encontrado.`);
    }

    return this.enrichRestaurant(restaurante);
  }

  private async enrichRestaurant(restaurante: Partial<Restaurante>) {
    const [mesasDisponibles, horarios] = await Promise.all([
      this.mesaRepository.count({ where: { restaurante: { idRestaurante: restaurante.idRestaurante }, estado: true } }),
      this.horarioRepository.find({ where: { restaurante: { idRestaurante: restaurante.idRestaurante }, estado: true } }),
    ]);
    const horasDisponibles = [...new Set(
      horarios.flatMap((horario) => generateTimeSlots(horario.horaApertura, horario.horaCierre)),
    )].sort();
    return { ...restaurante, mesasDisponibles, horasDisponibles };
  }

}
