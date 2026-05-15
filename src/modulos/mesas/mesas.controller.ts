import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MesasService } from './mesas.service';
import { ApiBody } from '@nestjs/swagger';
import { CrearMesaDto } from './dto/crearMesaDto';
import { ActualizarMesaDto } from './dto/actualizarMesaDto';
import { Mesa } from './entities/mesa.entity';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post('crearMesa')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        numeroMesa: { type: 'number', example: 1 },
        cantidadSillas: { type: 'number', example: 4 },
        idRestaurante: { type: 'number', example: 2 },
      },
    },
  })
  async crearMesa(@Body() dto: CrearMesaDto) {
    return this.mesasService.crearMesa(dto);
  }

  @Patch('actualizarMesa/:idMesa')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        numeroMesa: { type: 'number', example: 1 },
        cantidadSillas: { type: 'number', example: 4 },
        idRestaurante: { type: 'number', example: 2 },
      },
    },
  })
  async actualizarMesa(
    @Param('idMesa', ParseIntPipe) idMesa: number,
    @Body() dto: ActualizarMesaDto,
  ) {
    return this.mesasService.actualizarMesa(idMesa, dto);
  }

  @Patch('handleEstadoMesa/:idMesa')
  async handleMesa(
    @Param('idMesa', ParseIntPipe) idMesa: number,
  ): Promise<{ message: string }> {
    return this.mesasService.handleEstadoMesa(idMesa);
  }

  @Get('GetAllMesasDisponibles')
  GetAllMesasDisponibles(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<{ data: Mesa[]; total: number }> {
    return this.mesasService.getAllMesasDisponibles(page, limit);
  }

  @Get('GetAllMesasOcupadas')
  GetAllMesasOcupadas(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<{ data: Mesa[]; total: number }> {
    return this.mesasService.getAllMesasOcupadas(page, limit);
  }

  @Get('GetMesaById/:idMesa')
  GetMesaById(@Param('idMesa', ParseIntPipe) idMesa: number) {
    return this.mesasService.getMesaById(idMesa);
  }
}
