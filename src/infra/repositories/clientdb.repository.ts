import Client from "../../domain/client";
import ClientRepository from "../../domain/client.repository";
import Connection from "../database/connection";
import { logger } from "../logger/logger";

export default class ClientDbRepository implements ClientRepository {
  constructor(readonly pool: Connection) {
    this.pool = pool;
  }

  async findById(id: number): Promise<Nullable<[Client]>> {
    const [connection, release] = await this.pool.connect();
    try {
      const result = await connection.query(
        `SELECT * FROM clients WHERE id = $1 LIMIT 1;`,
        [id]
      );
      const client = result.rows[0];
      if (!client) return null;
      return [new Client(client.id, client.balance, client.money_limit)];
    } finally {
      release();
    }
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

  async findHigherClientId(): Promise<number> {
    const [connection, release] = await this.pool.connect();
    const {
      rows: [{ max }],
    } = await connection.query("SELECT MAX(id) FROM clients");
    release();
    return max;
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
}
