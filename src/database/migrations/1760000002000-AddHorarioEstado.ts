import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddHorarioEstado1760000002000 implements MigrationInterface {
  name = 'AddHorarioEstado1760000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('horario');
    if (table && !table.findColumnByName('estado')) {
      await queryRunner.addColumn('horario', new TableColumn({ name: 'estado', type: 'boolean', default: true }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('horario');
    if (table?.findColumnByName('estado')) await queryRunner.dropColumn('horario', 'estado');
  }
}
