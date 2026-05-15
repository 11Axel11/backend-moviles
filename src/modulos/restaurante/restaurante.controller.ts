import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { RestauranteService } from './restaurante.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CrearRestauranteDto } from './dto/crearRestauranteDto';
import { ActualizarRestauranteDto } from './dto/actualizarRestauranteDto';
import { Restaurante } from './entities/restaurante.entity';

@Controller('restaurante')
export class RestauranteController {

    constructor(
        private readonly restauranteService: RestauranteService,
    ){}


    @Post('crearRestaurante')
    @UseInterceptors(FileInterceptor('imagen'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
        type: 'object',
        properties: {
            nombre: { type: 'string', example: 'Bella Vista' },
            descripcion: { type: 'string', example: 'Restaurante de comida italiana' },
            ubicacion: { type: 'string', example: 'Calle Principal 123' },
            telefono: { type: 'string', example: '12345678' },
            imagen: {type: 'string', format: 'binary'},
        },
      },
    })
    async crearRestaurante(
    @UploadedFile() file: Express.Multer.File, 
    @Body() dto: CrearRestauranteDto,
    ) {
        return this.restauranteService.crearRestaurante(dto, file);
   } 



   @Patch('actualizarRestaurante/:idRestaurante')
    @UseInterceptors(FileInterceptor('imagen'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
        type: 'object',
        properties: {
            nombre: { type: 'string', example: 'Bella Vista' },
            descripcion: { type: 'string', example: 'Restaurante de comida italiana' },
            ubicacion: { type: 'string', example: 'Calle Principal 123' },
            telefono: { type: 'string', example: '12345678' },
            imagen: {type: 'string', format: 'binary'},
        },
      },
    })
    async actualizarRestaurante(@Param('idRestaurante', ParseIntPipe) idRestaurante: number, 
    @Body() dto: ActualizarRestauranteDto, 
    @UploadedFile() file?: Express.Multer.File
    ){
        return this.restauranteService.actualizarRestaurante(idRestaurante, dto, file);
    }


    @Patch('handleEstadoRestaurante/:idRestaurante')
    async handleRestaurante(@Param('idRestaurante', ParseIntPipe) idRestaurante: number): Promise<{message: string}>{
        return this.restauranteService.handleEstadoRestaurante(idRestaurante);
    }


    @Get('GetAllRestaurantesActivos')
    GetAllRestaurantes(
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number,
    ): Promise<{data: Restaurante[], total: number}>{
        return this.restauranteService.getAllRestaurantesActivos(page, limit);
    }    


    @Get('GetAllRestaurantesInactivos')
    GetAllRestaurantesInactivos(
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number,
    ): Promise<{data: Partial<Restaurante>[], total: number}>{
        return this.restauranteService.getAllRestaurantesInactivos(page, limit);
    }


    @Get('GetRestauranteById/:idRestaurante')
    GetRestauranteById(@Param('idRestaurante', ParseIntPipe) idRestaurante: number){
        return this.restauranteService.getRestauranteById(idRestaurante);
    }
}
