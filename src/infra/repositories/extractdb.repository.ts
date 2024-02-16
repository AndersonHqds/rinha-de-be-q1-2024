import ExtractRepository from "../../domain/extract.repository";
import Connection from "../database/connection";

export default class ExtractDbRepository implements ExtractRepository {
  constructor(readonly connection: Connection) {
    this.connection = connection;
  }

  async findByClientId(clientId: number): Promise<{ rows: any[] }> {
    return await this.connection.query("SELECT balance, money_limit, amount, operation_type, description, created_at FROM clients INNER JOIN transactions ON transactions.client_id = clients.id WHERE clients.id = $1 ORDER BY created_at DESC;", [clientId]);
  }

}