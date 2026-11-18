import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';


export class ActualizarMesaDto {
    
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idRestaurante!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroMesa!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidadSillas!: number;
}
