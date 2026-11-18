import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActualizarUsuarioDto, CrearUsuarioDto } from './dto/crearUsuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(@InjectRepository(Usuario) private readonly usuariosRepository: Repository<Usuario>) {}

  async crear(dto: CrearUsuarioDto) {
    const existente = await this.usuariosRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existente) throw new ConflictException('Ya existe un usuario con ese correo electrónico.');
    return this.usuariosRepository.save(this.usuariosRepository.create({ ...dto, email: dto.email.toLowerCase() }));
  }

  async obtener(idUsuario: number) {
    const usuario = await this.usuariosRepository.findOne({ where: { idUsuario } });
    if (!usuario) throw new NotFoundException(`Usuario con id "${idUsuario}" no encontrado.`);
    return usuario;
  }

  async actualizar(idUsuario: number, dto: ActualizarUsuarioDto) {
    const usuario = await this.obtener(idUsuario);
    if (dto.email && dto.email.toLowerCase() !== usuario.email) {
      const existente = await this.usuariosRepository.findOne({ where: { email: dto.email.toLowerCase() } });
      if (existente) throw new ConflictException('Ya existe un usuario con ese correo electrónico.');
      usuario.email = dto.email.toLowerCase();
    }
    Object.assign(usuario, { ...dto, email: usuario.email });
    return this.usuariosRepository.save(usuario);
  }
}
