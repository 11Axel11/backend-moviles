import { IsNotEmpty } from "class-validator";


export class CrearMesaDto {

  @IsNotEmpty()
  idRestaurante!: number;

  @IsNotEmpty()
  numeroMesa!: number;

  @IsNotEmpty()
  cantidadSillas!: number;
  
}