import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Mesa } from "./entities/mesa.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CrearMesaDto } from "./dto/crearMesaDto";
import { Restaurante } from "../restaurante/entities/restaurante.entity";
import { ActualizarMesaDto } from "./dto/actualizarMesaDto";



@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesasRepository: Repository<Mesa>,

    @InjectRepository(Restaurante)
    private readonly restauranteRepository: Repository<Restaurante>,
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

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== '') {
        (mesa as any)[key] = value;
      }
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

}