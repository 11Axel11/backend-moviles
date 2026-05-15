import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearRestauranteDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  descripcion!: string;

  @IsNotEmpty()
  @IsString()
  ubicacion!: string;

  @IsNotEmpty()
  @IsString()
  telefono!: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;
}
