import Connection from "./connection";
import pg from "pg";

export default class PgAdapter implements Connection {
  pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      user: process.env.DB_USER || "admin",
      host: process.env.DB_HOSTNAME || "localhost",
      database: process.env.DB_NAME || "rinha",
      password: process.env.DB_PASSWORD || "123",
      port: 5432,
      max: 2,
      connectionTimeoutMillis: 60_000,
      keepAlive: true,
    });
  }

  async connect(): Promise<{
    connection: { query: (statement: string, params?: any) => Promise<any> };
    close: () => void;
  }> {
    const connection = await this.pool.connect();
    const close = () => {
      connection.release();
    };
    return { connection, close };
  }

  close(): Promise<void> {
    return this.pool.end();
  }
}
