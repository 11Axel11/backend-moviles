import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCoreTables1740000000000 implements MigrationInterface {
  name = 'CreateCoreTables1740000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('restaurante'))) {
      await queryRunner.createTable(new Table({
        name: 'restaurante',
        columns: [
          { name: 'idRestaurante', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'nombre', type: 'varchar', length: '50' },
          { name: 'descripcion', type: 'varchar', length: '200' },
          { name: 'ubicacion', type: 'varchar', length: '50' },
          { name: 'telefono', type: 'varchar', length: '20' },
          { name: 'imagenUrl', type: 'varchar', length: '255' },
          { name: 'estado', type: 'boolean', default: true },
        ],
      }), true);
    }

    if (!(await queryRunner.hasTable('horario'))) {
      await queryRunner.createTable(new Table({
        name: 'horario',
        columns: [
          { name: 'idHorario', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'diaSemana', type: 'varchar', length: '15' },
          { name: 'horaApertura', type: 'varchar', length: '60' },
          { name: 'horaCierre', type: 'varchar', length: '60' },
          { name: 'estado', type: 'boolean', default: true },
          { name: 'idRestaurante', type: 'int' },
        ],
      }), true);
      await queryRunner.createForeignKey('horario', new TableForeignKey({ name: 'FK_HORARIO_RESTAURANTE', columnNames: ['idRestaurante'], referencedTableName: 'restaurante', referencedColumnNames: ['idRestaurante'], onDelete: 'CASCADE' }));
    }

    if (!(await queryRunner.hasTable('mesa'))) {
      await queryRunner.createTable(new Table({
        name: 'mesa',
        columns: [
          { name: 'idMesa', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'numeroMesa', type: 'int' },
          { name: 'cantidadSillas', type: 'int' },
          { name: 'estado', type: 'boolean', default: true },
          { name: 'idRestaurante', type: 'int' },
        ],
      }), true);
      await queryRunner.createForeignKey('mesa', new TableForeignKey({ name: 'FK_MESA_RESTAURANTE', columnNames: ['idRestaurante'], referencedTableName: 'restaurante', referencedColumnNames: ['idRestaurante'], onDelete: 'CASCADE' }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('mesa')) await queryRunner.dropTable('mesa');
    if (await queryRunner.hasTable('horario')) await queryRunner.dropTable('horario');
    if (await queryRunner.hasTable('restaurante')) await queryRunner.dropTable('restaurante');
  }
}
