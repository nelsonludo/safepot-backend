import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enum types
    await queryRunner.query(
      `CREATE TYPE "kyc_status_enum" AS ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "wallet_transaction_type_enum" AS ENUM('TOPUP', 'WITHDRAWAL', 'POT_DEBIT', 'POT_CREDIT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "wallet_transaction_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "savings_pot_status_enum" AS ENUM('ACTIVE', 'LOCKED', 'UNLOCKED', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pot_transaction_type_enum" AS ENUM('DEPOSIT', 'UNLOCK_RETURN', 'PENALTY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pot_transaction_status_enum" AS ENUM('CONFIRMED', 'PENDING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "withdrawal_status_enum" AS ENUM('PENDING', 'DISBURSED', 'FAILED')`,
    );

    // users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" text NOT NULL,
        "phone" text,
        "password_hash" text,
        "kyc_status" "kyc_status_enum" NOT NULL DEFAULT 'PENDING',
        "kyc_verified_at" TIMESTAMP WITH TIME ZONE,
        "preferred_lang" character(2) NOT NULL DEFAULT 'fr',
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // wallet_transactions table
    await queryRunner.query(`
      CREATE TABLE "wallet_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "type" "wallet_transaction_type_enum" NOT NULL,
        "amount_xaf" bigint NOT NULL,
        "status" "wallet_transaction_status_enum" NOT NULL DEFAULT 'PENDING',
        "idempotency_key" text,
        "aggregator_ref" text,
        "pot_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_wallet_tx_idempotency_key" UNIQUE ("idempotency_key"),
        CONSTRAINT "PK_wallet_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wallet_tx_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // savings_pots table
    await queryRunner.query(`
      CREATE TABLE "savings_pots" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "name" text NOT NULL,
        "target_amount_xaf" bigint,
        "status" "savings_pot_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "lock_until" TIMESTAMP WITH TIME ZONE NOT NULL,
        "early_exit_penalty_pct" smallint NOT NULL DEFAULT 5,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_savings_pots_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_savings_pots_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // pot_transactions table
    await queryRunner.query(`
      CREATE TABLE "pot_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "pot_id" uuid NOT NULL,
        "type" "pot_transaction_type_enum" NOT NULL,
        "amount_xaf" bigint NOT NULL,
        "status" "pot_transaction_status_enum" NOT NULL DEFAULT 'CONFIRMED',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pot_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pot_tx_pot_id" FOREIGN KEY ("pot_id") REFERENCES "savings_pots"("id") ON DELETE CASCADE
      )
    `);

    // withdrawal_requests table
    await queryRunner.query(`
      CREATE TABLE "withdrawal_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "amount_xaf" bigint NOT NULL,
        "phone_number" text NOT NULL,
        "operator_code" text NOT NULL,
        "status" "withdrawal_status_enum" NOT NULL DEFAULT 'PENDING',
        "idempotency_key" text,
        "aggregator_ref" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "processed_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_withdrawal_idempotency_key" UNIQUE ("idempotency_key"),
        CONSTRAINT "PK_withdrawal_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_withdrawal_requests_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Indexes on user_id, status, created_at
    await queryRunner.query(
      `CREATE INDEX "idx_wallet_tx_user_id" ON "wallet_transactions" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_wallet_tx_status" ON "wallet_transactions" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_wallet_tx_created_at" ON "wallet_transactions" ("created_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_savings_pots_user_id" ON "savings_pots" ("user_id")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_savings_pots_status" ON "savings_pots" ("status")`);
    await queryRunner.query(
      `CREATE INDEX "idx_savings_pots_created_at" ON "savings_pots" ("created_at")`,
    );

    await queryRunner.query(`CREATE INDEX "idx_pot_tx_pot_id" ON "pot_transactions" ("pot_id")`);
    await queryRunner.query(`CREATE INDEX "idx_pot_tx_status" ON "pot_transactions" ("status")`);
    await queryRunner.query(
      `CREATE INDEX "idx_pot_tx_created_at" ON "pot_transactions" ("created_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_withdrawal_user_id" ON "withdrawal_requests" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_withdrawal_status" ON "withdrawal_requests" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_withdrawal_created_at" ON "withdrawal_requests" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_withdrawal_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_withdrawal_status"`);
    await queryRunner.query(`DROP INDEX "idx_withdrawal_user_id"`);

    await queryRunner.query(`DROP INDEX "idx_pot_tx_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_pot_tx_status"`);
    await queryRunner.query(`DROP INDEX "idx_pot_tx_pot_id"`);

    await queryRunner.query(`DROP INDEX "idx_savings_pots_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_savings_pots_status"`);
    await queryRunner.query(`DROP INDEX "idx_savings_pots_user_id"`);

    await queryRunner.query(`DROP INDEX "idx_wallet_tx_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_wallet_tx_status"`);
    await queryRunner.query(`DROP INDEX "idx_wallet_tx_user_id"`);

    await queryRunner.query(`DROP TABLE "withdrawal_requests"`);
    await queryRunner.query(`DROP TABLE "pot_transactions"`);
    await queryRunner.query(`DROP TABLE "savings_pots"`);
    await queryRunner.query(`DROP TABLE "wallet_transactions"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "withdrawal_status_enum"`);
    await queryRunner.query(`DROP TYPE "pot_transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "pot_transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "savings_pot_status_enum"`);
    await queryRunner.query(`DROP TYPE "wallet_transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "wallet_transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "kyc_status_enum"`);
  }
}
