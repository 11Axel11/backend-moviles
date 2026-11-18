import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reserva } from '../../reservas/entities/reserva.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  idUsuario!: number;

  @Column({ length: 80 })
  nombre!: string;

  @Column({ length: 80 })
  apellido!: string;

  @Column({ length: 160, unique: true })
  email!: string;

  @Column({ length: 25 })
  telefono!: string;

  @OneToMany(() => Reserva, reserva => reserva.usuario)
  reservas!: Reserva[];
}
