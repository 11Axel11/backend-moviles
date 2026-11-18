import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CrearReservaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idRestaurante!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  idMesa!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  idUsuario?: number;

  @IsDateString()
  @IsOptional()
  fechaReserva?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  horaInicio?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  horaFin?: string;

  // Alias temporales para clientes de la versión anterior.
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  hora?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidadPersonas!: number;
}
