import { IsNotEmpty, IsString } from "class-validator";


export class CrearHorarioDto {

    @IsString()
    @IsNotEmpty()
    diaSemana!: string;

    @IsString()
    @IsNotEmpty()
    horaApertura!: string;

    @IsString()
    @IsNotEmpty()
    horaCierre!: string
}