import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateReservas1760000000000 implements MigrationInterface {
  name = 'CreateReservas1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('reservas');
    if (exists) return;

    await queryRunner.createTable(new Table({
      name: 'reservas',
      columns: [
        { name: 'idReserva', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'fechaReserva', type: 'date' },
        { name: 'horaInicio', type: 'time' },
        { name: 'horaFin', type: 'time' },
        { name: 'cantidadPersonas', type: 'int' },
        { name: 'estado', type: 'enum', enum: ['confirmada', 'cancelada', 'pendiente'], default: "'confirmada'" },
        { name: 'idRestaurante', type: 'int' },
        { name: 'idMesa', type: 'int' },
        { name: 'idUsuario', type: 'int', isNullable: true },
        { name: 'createdAt', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        { name: 'updatedAt', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
      ],
    }), true);

    await queryRunner.createIndex('reservas', new TableIndex({ name: 'IDX_RESERVA_RESTAURANTE_FECHA_HORA', columnNames: ['idRestaurante', 'fechaReserva', 'horaInicio'] }));
    await queryRunner.createIndex('reservas', new TableIndex({ name: 'IDX_RESERVA_MESA_FECHA_HORA', columnNames: ['idMesa', 'fechaReserva', 'horaInicio'] }));
    await queryRunner.createIndex('reservas', new TableIndex({ name: 'IDX_RESERVA_ESTADO', columnNames: ['estado'] }));

    await queryRunner.createForeignKey('reservas', new TableForeignKey({
      name: 'FK_RESERVA_RESTAURANTE', columnNames: ['idRestaurante'], referencedTableName: 'restaurante', referencedColumnNames: ['idRestaurante'], onDelete: 'RESTRICT',
    }));
    await queryRunner.createForeignKey('reservas', new TableForeignKey({
      name: 'FK_RESERVA_MESA', columnNames: ['idMesa'], referencedTableName: 'mesa', referencedColumnNames: ['idMesa'], onDelete: 'RESTRICT',
    }));
    await queryRunner.createForeignKey('reservas', new TableForeignKey({
      name: 'FK_RESERVA_USUARIO', columnNames: ['idUsuario'], referencedTableName: 'usuarios', referencedColumnNames: ['idUsuario'], onDelete: 'SET NULL',
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('reservas');
    if (!table) return;
    for (const foreignKey of table.foreignKeys) await queryRunner.dropForeignKey('reservas', foreignKey);
    await queryRunner.dropTable('reservas');
  }
}
