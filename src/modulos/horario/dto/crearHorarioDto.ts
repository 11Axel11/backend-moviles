import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';


export class CrearHorarioDto {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    idRestaurante!: number;

    @IsString()
    @IsNotEmpty()
    diaSemana!: string;

    @IsString()
    @IsNotEmpty()
    horaApertura!: string;

    @IsString()
    @IsNotEmpty()
    horaCierre!: string

    @IsOptional()
    @IsBoolean()
    estado?: boolean;
}

export class ActualizarHorarioDto {
    @IsOptional()
    @IsString()
    diaSemana?: string;

    @IsOptional()
    @IsString()
    horaApertura?: string;

    @IsOptional()
    @IsString()
    horaCierre?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    idRestaurante?: number;

    @IsOptional()
    @IsBoolean()
    estado?: boolean;
}
