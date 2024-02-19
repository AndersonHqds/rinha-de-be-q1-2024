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
        `SELECT 
        c.balance, 
        c.money_limit,
        json_agg(
            json_build_object(
                'valor', t.amount,
                'tipo', t.operation_type,
                'descricao', t.description,
                'realizada_em', t.created_at
            ) ORDER BY t.created_at DESC
        ) AS last_transactions
        FROM clients c
        LEFT JOIN transactions t ON t.client_id = c.id
        WHERE c.id = $1
        GROUP BY c.id, c.balance, c.money_limit;
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
