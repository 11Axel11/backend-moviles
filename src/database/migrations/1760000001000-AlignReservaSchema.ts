import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AlignReservaSchema1760000001000 implements MigrationInterface {
  name = 'AlignReservaSchema1760000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('reservas'))) return;
    const table = await queryRunner.getTable('reservas');
    if (!table) return;

    if (table.findColumnByName('fecha') && !table.findColumnByName('fechaReserva')) {
      await queryRunner.renameColumn('reservas', 'fecha', 'fechaReserva');
    }
    if (table.findColumnByName('hora') && !table.findColumnByName('horaInicio')) {
      await queryRunner.renameColumn('reservas', 'hora', 'horaInicio');
    }
    const refreshed = await queryRunner.getTable('reservas');
    if (refreshed && !refreshed.findColumnByName('horaFin')) {
      await queryRunner.addColumn('reservas', new TableColumn({ name: 'horaFin', type: 'time', isNullable: true }));
      await queryRunner.query('UPDATE reservas SET horaFin = ADDTIME(horaInicio, "00:30:00") WHERE horaFin IS NULL');
      await queryRunner.changeColumn('reservas', 'horaFin', new TableColumn({ name: 'horaFin', type: 'time', isNullable: false }));
    }
    const withUser = await queryRunner.getTable('reservas');
    if (withUser && !withUser.findColumnByName('idUsuario')) {
      await queryRunner.addColumn('reservas', new TableColumn({ name: 'idUsuario', type: 'int', isNullable: true }));
      if (await queryRunner.hasTable('usuarios')) {
        await queryRunner.createForeignKey('reservas', new TableForeignKey({ name: 'FK_RESERVA_USUARIO', columnNames: ['idUsuario'], referencedTableName: 'usuarios', referencedColumnNames: ['idUsuario'], onDelete: 'SET NULL' }));
      }
    }

    const horarios = await queryRunner.getTable('horario');
    if (horarios && !horarios.findColumnByName('estado')) {
      await queryRunner.addColumn('horario', new TableColumn({ name: 'estado', type: 'boolean', default: true }));
    }
  }

  async down(_queryRunner: QueryRunner): Promise<void> {}
}
