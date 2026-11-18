import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

export enum EstadoReserva {
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  PENDIENTE = 'pendiente',
}

@Entity('reservas')
@Index('IDX_RESERVA_RESTAURANTE_FECHA_HORA', ['restaurante', 'fechaReserva', 'horaInicio'])
@Index('IDX_RESERVA_MESA_FECHA_HORA', ['mesa', 'fechaReserva', 'horaInicio'])
@Index('IDX_RESERVA_ESTADO', ['estado'])
export class Reserva {
  @PrimaryGeneratedColumn()
  idReserva!: number;

  @Column({ type: 'date' })
  fechaReserva!: string;

  @Column({ type: 'time' })
  horaInicio!: string;

  @Column({ type: 'time' })
  horaFin!: string;

  @Column({ type: 'int' })
  cantidadPersonas!: number;

  @Column({ type: 'enum', enum: EstadoReserva, default: EstadoReserva.CONFIRMADA })
  estado!: EstadoReserva;

  @ManyToOne(() => Restaurante, restaurante => restaurante.reservas, { nullable: false })
  @JoinColumn({ name: 'idRestaurante' })
  restaurante!: Restaurante;

  @ManyToOne(() => Mesa, mesa => mesa.reservas, { nullable: false })
  @JoinColumn({ name: 'idMesa' })
  mesa!: Mesa;

  @ManyToOne(() => Usuario, usuario => usuario.reservas, { nullable: true })
  @JoinColumn({ name: 'idUsuario' })
  usuario?: Usuario | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
