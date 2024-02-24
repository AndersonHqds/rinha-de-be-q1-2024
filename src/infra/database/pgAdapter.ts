import Connection from "./connection";
import pg from "pg";
import { PoolMonitor } from "./poolMonitor";

export default class PgAdapter implements Connection {
  pool: pg.Pool;
  // poolMonitor: PoolMonitor;

  constructor() {
    this.pool = new pg.Pool({
      user: process.env.DB_USER || "admin",
      host: process.env.DB_HOSTNAME || "db",
      database: process.env.DB_NAME || "rinha",
      password: process.env.DB_PASSWORD || "123",
      port: 5432,
      max: 30,
      // idleTimeoutMillis: 0,
      connectionTimeoutMillis: 60_000,
      // keepAlive: true,
    });
    // this.poolMonitor = new PoolMonitor(this.pool);
  }

  async connect(): Promise<
    [
      { query: (statement: string, params?: any) => Promise<any> },
      close: () => void
    ]
  > {
    const connection = await this.pool.connect();
    // console.log(this.poolMonitor.getStatus());
    const close = () => {
      connection.release();
      // console.log(this.poolMonitor.getStatus());
    };
    return [connection, close];
  }

  close(): Promise<void> {
    return this.pool.end();
  }
}
