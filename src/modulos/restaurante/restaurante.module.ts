import { Module } from '@nestjs/common';
import { Restaurante } from './entities/restaurante.entity';
import { RestauranteController } from './restaurante.controller';
import { RestauranteService } from './restaurante.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Horario } from '../horario/entities/horario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurante, Mesa, Horario])],
  controllers: [RestauranteController],
  providers: [RestauranteService],
})
export class RestauranteModule {}
