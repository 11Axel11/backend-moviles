import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Restaurante } from '../restaurante/entities/restaurante.entity';
import { Reserva } from './entities/reserva.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Restaurante, Mesa, Usuario])],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
