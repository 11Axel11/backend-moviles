import { Restaurante } from "src/modulos/restaurante/entities/restaurante.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Horario {

  @PrimaryGeneratedColumn()
  idHorario!: number;

  @Column({ length: 15 })
  diaSemana!: string;

  @Column({ length: 60 })
  horaApertura!: string;

  @Column({ length: 60 })
  horaCierre!: string;

  @Column({ type: 'boolean', default: true })
  estado!: boolean;

  @ManyToOne(() => Restaurante, restaurante => restaurante.horarios)
  restaurante!: Restaurante;
}
