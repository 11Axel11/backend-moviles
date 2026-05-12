import { IsOptional, IsString } from "class-validator";


export class ActualizarRestauranteDto {

  @IsOptional()
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion!: string;

  @IsOptional()
  @IsString()
  ubicacion!: string;

  @IsOptional()
  @IsString()
  telefono!: string;

  @IsString()
  @IsOptional()
  imagenUrl?: string;
  
}