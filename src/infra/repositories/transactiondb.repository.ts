import TransactionRepository from "../../domain/transaction.repository";
import Transaction from "../../domain/transaction.vo";
import Connection from "../database/connection";
import { logger } from "../logger/logger";

export default class TransactionDbRepository implements TransactionRepository {
  constructor(readonly pool: Connection) {
    this.pool = pool;
  }

  async findHigherClientId(): Promise<number> {
    const [connection, release] = await this.pool.connect();
    const {
      rows: [{ max }],
    } = await connection.query("SELECT MAX(id) FROM clients");
    release();
    return max;
  }

  async isClientExists(clientId: number): Promise<boolean> {
    const [connection, release] = await this.pool.connect();
    const {
      rows: [{ exists }],
    } = await connection.query(
      "SELECT EXISTS (SELECT 1 FROM clients WHERE id = $1)",
      [clientId]
    );
    release();
    return exists;
  }

  async findClientInfoById(
    clientId: number
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, error: Nullable<Error>]
  > {
    const [connection, release] = await this.pool.connect();
    try {
      const {
        rows: [client],
      } = await connection.query(
        "SELECT money_limit, balance FROM clients WHERE id = $1 LIMIT 1",
        [clientId]
      );
      return [client, null];
    } catch (e) {
      logger.error(e, "Error on find client info by id");
      return [null, e as Error];
    } finally {
      release();
    }
  }

  async debit(
    transaction: Transaction
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, error: Nullable<Error>]
  > {
    const [connection, release] = await this.pool.connect();
    try {
      const {
        rows: [client],
      } = await connection.query(
        `
        WITH valid_transaction AS (
          SELECT id
          FROM clients
          WHERE id = $2 AND ABS(balance - $1) <= money_limit
          FOR UPDATE
        ),
        update_balance AS (
          UPDATE clients SET balance = balance - $1 
          WHERE EXISTS (SELECT 1 FROM valid_transaction WHERE clients.id = valid_transaction.id)
          RETURNING clients.id AS client_id, balance, money_limit
        ),
        insert_transaction AS (
          INSERT INTO transactions (client_id, amount, operation_type, description) 
          SELECT $2, $1, 'd', $3
          FROM update_balance
          RETURNING client_id
        )
        SELECT balance, money_limit FROM update_balance;
      `,
        [transaction.value, transaction.clientId, transaction.description]
      );
      return [client, null];
    } catch (e) {
      logger.error(e, "Error on debit operation");
      return [null, e as Error];
    } finally {
      release();
    }
  }

  async credit(
    transaction: Transaction
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, error: Nullable<Error>]
  > {
    const [connection, release] = await this.pool.connect();
    try {
      connection.query("BEGIN;");
      connection.query("SELECT 1 FROM clients WHERE id = $1 FOR UPDATE;", [
        transaction.clientId,
      ]);
      const {
        rows: [client],
      } = await connection.query(
        ` 
          WITH insert_transaction AS (
            INSERT INTO transactions (client_id, amount, operation_type, description)
            VALUES ($2, $1, 'c', $3)
          )
          UPDATE clients SET balance = balance + $1 WHERE id = $2 RETURNING balance, money_limit;
      `,
        [transaction.value, transaction.clientId, transaction.description]
      );
      connection.query("COMMIT;");
      return [client, null];
    } catch (e) {
      connection.query("ROLLBACK;");
      logger.error(e, "Error on credit operation");
      return [null, e as Error];
    } finally {
      release();
    }
  }
}
