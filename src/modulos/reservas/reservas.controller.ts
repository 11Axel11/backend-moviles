import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrearReservaDto } from './dto/crearReserva.dto';
import { ReservasService } from './reservas.service';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una reserva' })
  @ApiBody({
    type: CrearReservaDto,
    examples: {
      reserva: {
        value: { idRestaurante: 1, idMesa: 10, fecha: '2026-11-20', hora: '19:00', cantidadPersonas: 4 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Reserva creada.' })
  @ApiResponse({ status: 409, description: 'Mesa no disponible.' })
  crear(@Body() dto: CrearReservaDto) {
    return this.reservasService.crearReserva(dto);
  }

  @Get(':idReserva')
  @ApiOperation({ summary: 'Consultar una reserva' })
  @ApiParam({ name: 'idReserva', type: Number })
  obtener(@Param('idReserva', ParseIntPipe) idReserva: number) {
    return this.reservasService.obtenerReserva(idReserva);
  }

  @Patch(':idReserva/cancelar')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiParam({ name: 'idReserva', type: Number })
  cancelar(@Param('idReserva', ParseIntPipe) idReserva: number) {
    return this.reservasService.cancelarReserva(idReserva);
  }
}
