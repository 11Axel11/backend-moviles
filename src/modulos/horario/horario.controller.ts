import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ActualizarHorarioDto, CrearHorarioDto } from './dto/crearHorarioDto';
import { HorarioService } from './horario.service';

@ApiTags('Horarios')
@Controller('horarios')
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un horario para un restaurante' })
  @ApiBody({ type: CrearHorarioDto, examples: { horario: { value: { idRestaurante: 1, diaSemana: 'viernes', horaApertura: '18:00', horaCierre: '22:00' } } } })
  crear(@Body() dto: CrearHorarioDto) { return this.horarioService.crear(dto); }

  @Get('restaurante/:idRestaurante')
  @ApiOperation({ summary: 'Listar horarios de un restaurante' })
  @ApiParam({ name: 'idRestaurante', type: Number })
  listar(@Param('idRestaurante', ParseIntPipe) idRestaurante: number) {
    return this.horarioService.listarPorRestaurante(idRestaurante);
  }

  @Patch(':idHorario')
  @ApiOperation({ summary: 'Actualizar un horario' })
  actualizar(@Param('idHorario', ParseIntPipe) idHorario: number, @Body() dto: ActualizarHorarioDto) {
    return this.horarioService.actualizar(idHorario, dto);
  }

  @Delete(':idHorario')
  @ApiOperation({ summary: 'Eliminar un horario' })
  eliminar(@Param('idHorario', ParseIntPipe) idHorario: number) {
    return this.horarioService.eliminar(idHorario);
  }
}
