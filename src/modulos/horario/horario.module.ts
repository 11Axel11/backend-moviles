import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from './entities/horario.entity';
import { HorarioController } from './horario.controller';
import { HorarioService } from './horario.service';
import { Restaurante } from '../restaurante/entities/restaurante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Horario, Restaurante])],
  controllers: [HorarioController],
  providers: [HorarioService],
  exports: [HorarioService],
})
export class HorarioModule {}
