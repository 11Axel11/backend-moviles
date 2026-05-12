import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Restaurante {
  @PrimaryGeneratedColumn()
  idRestaurante!: number;

  @Column({ length: 50 })
  nombre!: string;

  @Column({ length: 200 })
  descripcion!: string;

  @Column({ length: 50 })
  ubicacion!: string;

  @Column({ length: 20 })
  telefono!: string;

  @Column()
  imagenUrl!: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  estado!: boolean;
}
