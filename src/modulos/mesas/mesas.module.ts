import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesa } from './entities/mesa.entity';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';
import { Restaurante } from '../restaurante/entities/restaurante.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { Horario } from '../horario/entities/horario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mesa, Restaurante, Reserva, Horario])],
  controllers: [MesasController],
  providers: [MesasService],
})
export class MesasModule {}
