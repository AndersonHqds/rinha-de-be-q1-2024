import TransactionRepository from "../../domain/transaction.repository";
import Transaction from "../../domain/transaction.vo";
import Connection from "../database/connection";

export default class TransactionDbRepository implements TransactionRepository {
  constructor(readonly connection: Connection) {
    this.connection = connection;
  }

  async isClientExists(clientId: number): Promise<boolean> {
    const {
      rows: [exists],
    } = await this.connection.query(
      "SELECT EXISTS (SELECT 1 FROM clients WHERE id = $1)",
      [clientId]
    );
    return exists;
  }

  async findClientInfoById(
    clientId: number
  ): Promise<{ balance: number; money_limit: number }> {
    try {
      await this.connection.query("BEGIN");
      const {
        rows: [client],
      } = await this.connection.query(
        "SELECT money_limit, balance FROM clients WHERE id = $1",
        [clientId]
      );
      await this.connection.query("COMMIT");
      return client;
    } catch (e) {
      await this.connection.query("ROLLBACK");
      throw new Error("Error on find client info by id");
    }
  }

  async debit(transaction: Transaction): Promise<void> {
    try {
      await this.connection.query("BEGIN");
      await this.connection.query(
        "UPDATE clients SET balance = balance - $1 WHERE id = $2",
        [transaction.value, transaction.clientId]
      );
      await this.connection.query(
        "INSERT INTO transactions (client_id, amount, operation_type, description) VALUES ($1, $2, 'd', $3)",
        [transaction.clientId, transaction.value, transaction.description]
      );
      await this.connection.query("COMMIT");
    } catch (e) {
      await this.connection.query("ROLLBACK");
      throw new Error("Error on debit operation");
    }
  }

  async credit(
    transaction: Transaction
  ): Promise<{ balance: number; money_limit: number }> {
    try {
      await this.connection.query("BEGIN");
      const {
        rows: [client],
      } = await this.connection.query(
        "UPDATE clients SET balance = balance + $1 WHERE id = $2 RETURNING balance, money_limit",
        [transaction.value, transaction.clientId]
      );
      await this.connection.query(
        "INSERT INTO transactions (client_id, amount, operation_type, description) VALUES ($1, $2, 'c', $3)",
        [transaction.clientId, transaction.value, transaction.description]
      );
      await this.connection.query("COMMIT");
      return client;
    } catch (e) {
      await this.connection.query("ROLLBACK");
      throw new Error("Error on credit operation");
    }
  }
}
