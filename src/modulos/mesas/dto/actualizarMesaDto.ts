import { IsOptional } from "class-validator";


export class ActualizarMesaDto {
    
  @IsOptional()
  idRestaurante!: number;

  @IsOptional()
  numeroMesa!: number;

  @IsOptional()
  cantidadSillas!: number;
}