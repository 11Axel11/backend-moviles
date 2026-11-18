import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteModule } from './modulos/restaurante/restaurante.module';
import { MesasModule } from './modulos/mesas/mesas.module';
import { HorarioModule } from './modulos/horario/horario.module';
import { ReservasModule } from './modulos/reservas/reservas.module';
import { UsuarioModule } from './modulos/usuario/usuario.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      dropSchema: false,
      migrationsRun: true,
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
    }),
    RestauranteModule,
    MesasModule,
    HorarioModule,
    ReservasModule,
    UsuarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
