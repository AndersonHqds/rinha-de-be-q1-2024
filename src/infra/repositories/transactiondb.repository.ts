import TransactionRepository from "../../domain/transaction.repository";
import Transaction, { TransactionType } from "../../domain/transaction.vo";
import Connection from "../database/connection";
import { logger } from "../logger/logger";

export default class TransactionDbRepository implements TransactionRepository {
  constructor(readonly pool: Connection) {
    this.pool = pool;
  }

  async credit(
    transaction: Transaction
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, Nullable<Error>]
  > {
    const [connection, release] = await this.pool.connect();
    try {
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

      return [client, null];
    } catch (e) {
      await connection.query("ROLLBACK;");
      logger.error(e, "Error on credit operation");
      return [null, e as Error];
    } finally {
      release();
    }
  }

  async debit(
    transaction: Transaction
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, Nullable<Error>]
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
      await connection.query("ROLLBACK;");
      logger.error(e, "Error on credit operation");
      return [null, e as Error];
    } finally {
      release();
    }
  }
}
