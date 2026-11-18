import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ActualizarUsuarioDto, CrearUsuarioDto } from './dto/crearUsuario.dto';
import { UsuarioService } from './usuario.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un usuario' })
  @ApiBody({ type: CrearUsuarioDto })
  crear(@Body() dto: CrearUsuarioDto) { return this.usuarioService.crear(dto); }

  @Get(':idUsuario')
  @ApiOperation({ summary: 'Consultar un usuario' })
  @ApiParam({ name: 'idUsuario', type: Number })
  obtener(@Param('idUsuario', ParseIntPipe) idUsuario: number) { return this.usuarioService.obtener(idUsuario); }

  @Patch(':idUsuario')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  actualizar(@Param('idUsuario', ParseIntPipe) idUsuario: number, @Body() dto: ActualizarUsuarioDto) {
    return this.usuarioService.actualizar(idUsuario, dto);
  }
}
