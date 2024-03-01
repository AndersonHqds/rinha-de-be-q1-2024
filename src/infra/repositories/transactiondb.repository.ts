import TransactionRepository from "../../domain/transaction.repository";
import Transaction, { TransactionType } from "../../domain/transaction.vo";
import Connection from "../database/connection";
import { logger } from "../logger/logger";

export default class TransactionDbRepository implements TransactionRepository {
  constructor(readonly pool: Connection) {
    this.pool = pool;
  }

  getOperationByTransactionType(transactionType: TransactionType) {
    return transactionType === TransactionType.CREDIT ? "+" : "-";
  }

  async findByClientId(clientId: number) {
    const { connection, close: release } = await this.pool.connect();
    try {
      const { rows } = await connection.query(
        `
        SELECT id, value, operation_type as type, description, created_at as "createdAt" 
        FROM transactions
        WHERE client_id = $1
        ORDER BY created_at DESC
        LIMIT 10
        `,
        [clientId]
      );

      return {
        result: rows,
        error: null,
      };
    } catch (e) {
      logger.error(e, "Error on find extract by client id");
      return {
        result: null,
        error: e as Error,
      };
    } finally {
      release();
    }
  }

  async performTransaction(transaction: Transaction, limit: number) {
    const { connection, close: release } = await this.pool.connect();

    try {
      await connection.query("BEGIN");
      await connection.query("SELECT pg_advisory_xact_lock($1)", [
        transaction.clientId,
      ]);

      if (transaction.type === TransactionType.DEBIT) {
        const {
          rows: [balance],
        } = await connection.query(
          `
          SELECT value 
          FROM balances
          WHERE client_id = $1
          LIMIT 1
        `,
          [transaction.clientId]
        );
        if (balance.value - transaction.value < -limit) {
          await connection.query("ROLLBACK");
          return { result: null, error: new Error("Limit Excedeed") };
        }
      }

      const {
        rows: [value],
      } = await connection.query(
        `
          UPDATE balances SET value = value ${this.getOperationByTransactionType(
            transaction.type
          )} $1 WHERE client_id = $2
          RETURNING value
        `,
        [transaction.value, transaction.clientId]
      );
      await connection.query(
        `INSERT INTO transactions (description, client_id, operation_type, value)
        VALUES ($1, $2, $3, $4)`,
        [
          transaction.description,
          transaction.clientId,
          transaction.type,
          transaction.value,
        ]
      );
      await connection.query("COMMIT");
      return { result: value, error: null };
    } catch (e) {
      await connection.query("ROLLBACK;");
      logger.error(e, "Error on transaction operation");
      return { result: null, error: e as Error };
    } finally {
      release();
    }
  }
}
