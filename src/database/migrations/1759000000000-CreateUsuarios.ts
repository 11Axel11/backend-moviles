import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsuarios1759000000000 implements MigrationInterface {
  name = 'CreateUsuarios1759000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('usuarios')) return;
    await queryRunner.createTable(new Table({
      name: 'usuarios',
      columns: [
        { name: 'idUsuario', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'nombre', type: 'varchar', length: '80' },
        { name: 'apellido', type: 'varchar', length: '80' },
        { name: 'email', type: 'varchar', length: '160', isUnique: true },
        { name: 'telefono', type: 'varchar', length: '25' },
      ],
    }), true);
    await queryRunner.createIndex('usuarios', new TableIndex({ name: 'IDX_USUARIO_EMAIL', columnNames: ['email'], isUnique: true }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('usuarios')) await queryRunner.dropTable('usuarios');
  }
}
