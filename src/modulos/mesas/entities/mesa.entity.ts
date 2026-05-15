import { Restaurante } from "src/modulos/restaurante/entities/restaurante.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Mesa {
  @PrimaryGeneratedColumn()
  idMesa!: number;

  @Column()
  numeroMesa!: number;

  @Column()
  cantidadSillas!: number;

  @Column({ type: 'boolean', default: true })
  estado!: boolean;

  @ManyToOne(() => Restaurante, (restaurante) => restaurante.mesas)
  @JoinColumn({ name: 'idRestaurante' })
  restaurante!: Restaurante;
}