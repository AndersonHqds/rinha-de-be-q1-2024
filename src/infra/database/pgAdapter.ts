import Connection from "./connection";
import pg from 'pg';

export default class PgAdapter implements Connection {
  connection: pg.Pool;

  constructor() {
    this.connection = new pg.Pool({
      user: process.env.DB_USERNAME || 'admin',
      host: process.env.DB_HOSTNAME || 'localhost',
      database: process.env.DB_NAME || 'rinha',
      password: process.env.DB_PASSWORD || '123',
      port: 5432
    });

    this.connection.on('error', (err: any) => {
      console.error('Database error', err);
    });

    this.connection.connect((err, client, release) => {
      if (err) {
          console.error('Erro ao obter cliente do pool', err);
          return;
      }
      console.log('Conexão bem sucedida com o banco de dados');
      release(); // Libera o cliente de volta para o pool
  });
  }

  query(statement: string, params?: any): Promise<any> {
    return this.connection.query(statement, params);
  }
  close(): Promise<void> {
    return this.connection.end();
  }
  
}