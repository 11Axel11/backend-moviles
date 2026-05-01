import { Module } from '@nestjs/common';
import { Restaurante } from './entities/restaurante.entity';
import { RestauranteController } from './restaurante.controller';
import { RestauranteService } from './restaurante.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurante])],
  controllers: [RestauranteController],
  providers: [RestauranteService],
})
export class RestauranteModule {}
