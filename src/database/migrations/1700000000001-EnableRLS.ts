import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableRLS1700000000001 implements MigrationInterface {
  name = 'EnableRLS1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable Row Level Security on user-owned tables
    await queryRunner.query(`ALTER TABLE "wallet_transactions" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "savings_pots" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "pot_transactions" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "withdrawal_requests" ENABLE ROW LEVEL SECURITY;`);

    // Force RLS even for table owners (recommended for app connection pools)
    await queryRunner.query(`ALTER TABLE "wallet_transactions" FORCE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "savings_pots" FORCE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "pot_transactions" FORCE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "withdrawal_requests" FORCE ROW LEVEL SECURITY;`);

    // RLS Policy for wallet_transactions
    await queryRunner.query(`
      CREATE POLICY wallet_transactions_user_policy ON "wallet_transactions"
      FOR ALL
      USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
      WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
    `);

    // RLS Policy for savings_pots
    await queryRunner.query(`
      CREATE POLICY savings_pots_user_policy ON "savings_pots"
      FOR ALL
      USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
      WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
    `);

    // RLS Policy for pot_transactions (linked via savings_pots)
    await queryRunner.query(`
      CREATE POLICY pot_transactions_user_policy ON "pot_transactions"
      FOR ALL
      USING (
        pot_id IN (
          SELECT id FROM "savings_pots"
          WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
      );
    `);

    // RLS Policy for withdrawal_requests
    await queryRunner.query(`
      CREATE POLICY withdrawal_requests_user_policy ON "withdrawal_requests"
      FOR ALL
      USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
      WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP POLICY IF EXISTS withdrawal_requests_user_policy ON "withdrawal_requests";`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS pot_transactions_user_policy ON "pot_transactions";`,
    );
    await queryRunner.query(`DROP POLICY IF EXISTS savings_pots_user_policy ON "savings_pots";`);
    await queryRunner.query(
      `DROP POLICY IF EXISTS wallet_transactions_user_policy ON "wallet_transactions";`,
    );

    await queryRunner.query(`ALTER TABLE "withdrawal_requests" DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "pot_transactions" DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "savings_pots" DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "wallet_transactions" DISABLE ROW LEVEL SECURITY;`);
  }
}
