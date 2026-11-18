import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';


export class CrearMesaDto {

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idRestaurante!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroMesa!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidadSillas!: number;
  
}
