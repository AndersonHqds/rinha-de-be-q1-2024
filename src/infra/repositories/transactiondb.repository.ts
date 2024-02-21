import TransactionRepository from "../../domain/transaction.repository";
import Transaction, { TransactionType } from "../../domain/transaction.vo";
import Connection from "../database/connection";
import { logger } from "../logger/logger";

export default class TransactionDbRepository implements TransactionRepository {
  constructor(readonly pool: Connection) {
    this.pool = pool;
  }

  async saveTransactionAndUpdateNewBalance(
    transaction: Transaction,
    balance: number
  ): Promise<Error | void> {
    const [connection, release] = await this.pool.connect();
    try {
      // logger.info("Saving transaction and updating balance");
      // logger.info({ transaction, balance });
      await connection.query("BEGIN;");
      await connection.query("select pg_advisory_xact_lock($1);", [
        transaction.clientId,
      ]);
      await connection.query(
        `
        INSERT INTO transactions (
          client_id, 
          amount, 
          operation_type, 
          description
        ) VALUES ($1, $2, $3, $4);`,
        [
          transaction.clientId,
          transaction.value,
          transaction.type,
          transaction.description,
        ]
      );

      await connection.query(`UPDATE clients SET balance = $1 WHERE id = $2;`, [
        balance,
        transaction.clientId,
      ]);
      await connection.query("COMMIT;");
      // logger.info("Transaction and balance updated");
    } catch (e) {
      await connection.query("ROLLBACK;");
      logger.error(e, "Error on credit operation");
      return e as Error;
    } finally {
      release();
    }
  }
}
