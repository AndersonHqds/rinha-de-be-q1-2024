import ExtractRepository from "../../domain/extract.repository";
import Connection from "../database/connection";
import { logger } from "../logger/logger";

export default class ExtractDbRepository implements ExtractRepository {
  constructor(readonly pool: Connection) {
    this.pool = pool;
  }

  async findByClientId(
    clientId: number
  ): Promise<[Nullable<{ rows: any[] }>, error: Nullable<Error>]> {
    const [connection, release] = await this.pool.connect();
    try {
      const result = await connection.query(
        `
        SELECT amount as valor, operation_type as tipo, description as descricao, created_at as realizada_em
        FROM transactions
        WHERE client_id = $1
        ORDER BY created_at DESC
        LIMIT 10;
        `,
        [clientId]
      );
      return [result, null];
    } catch (e) {
      logger.error(e, "Error on find extract by client id");
      return [null, e as Error];
    } finally {
      release();
    }
  }
}
