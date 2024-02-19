import pg from "pg";

export class PoolMonitor {
  pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.pool = pool;
    this.pool.on("error", () => console.log("Erro no pool"));
  }

  getStatus() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };
  }
}
