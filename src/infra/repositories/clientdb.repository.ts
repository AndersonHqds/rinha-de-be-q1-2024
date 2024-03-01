import Client from "../../domain/client";
import ClientRepository from "../../domain/client.repository";
import Connection from "../database/connection";

export default class ClientDbRepository implements ClientRepository {
  constructor(readonly pool: Connection) {
    this.pool = pool;
  }

  async findById(id: number) {
    const { connection, close: release } = await this.pool.connect();
    try {
      const result = await connection.query(
        `SELECT * FROM clients WHERE id = $1 LIMIT 1`,
        [id]
      );
      const client = result.rows[0];

      return {
        result: new Client(client.id, client.limit),
        error: null,
      };
    } catch (e) {
      return {
        result: null,
        error: e as Error,
      };
    } finally {
      release();
    }
  }

  async getBalance(client: Client): Promise<any> {
    const { connection, close: release } = await this.pool.connect();

    try {
      const {
        rows: [balance],
      } = await connection.query(
        `
        SELECT value, now() as "checkedAt" 
        FROM balances
        WHERE client_id = $1
        LIMIT 1
      `,
        [client.id]
      );
      return {
        balance: balance.value,
        checkedAt: new Date(balance.checkedAt) || new Date(),
      };
    } catch (e) {
      throw e;
    } finally {
      release();
    }
  }

  async isClientExists(clientId: number): Promise<boolean> {
    const { connection, close: release } = await this.pool.connect();
    const {
      rows: [{ exists }],
    } = await connection.query(
      "SELECT EXISTS (SELECT 1 FROM clients WHERE id = $1)",
      [clientId]
    );
    release();
    return exists;
  }

  async findHigherClientId(): Promise<number> {
    const { connection, close: release } = await this.pool.connect();
    const {
      rows: [{ max }],
    } = await connection.query("SELECT MAX(id) FROM clients");
    release();
    return max;
  }
}
