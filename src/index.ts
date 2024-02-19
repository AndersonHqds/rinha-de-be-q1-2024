import Fastify from "fastify";
import TransactionDbRepository from "./infra/repositories/transactiondb.repository";
import PgAdapter from "./infra/database/pgAdapter";
import Transaction from "./domain/transaction.vo";
import OperationFactory from "./application/operation.factory";
import ExtractDbRepository from "./infra/repositories/extractdb.repository";
import ExtractUsecase from "./application/extract.usecase";
import { logger } from "./infra/logger/logger";
import { transactionSchema } from "./infra/schemas/fastify";

const fastify = Fastify({
  logger: false,
});

type PostBody = {
  tipo: "c" | "d";
  valor: number;
  descricao: string;
};

type ReqParams = {
  id: number;
};

const existentClients = new Set<number>();

const preloadClients = async (
  transactionRepository: TransactionDbRepository
) => {
  const higherId = await transactionRepository.findHigherClientId();
  for (let i = 1; i <= higherId; i++) {
    existentClients.add(i);
  }
};

export const start = async () => {
  try {
    const connection = new PgAdapter();
    const transactionRepository = new TransactionDbRepository(connection);
    const extractRepository = new ExtractDbRepository(connection);
    const extractUsecase = new ExtractUsecase(extractRepository);
    await preloadClients(transactionRepository);
    const offSetBrasilia = -3 * 60;

    const isTheClientValid = (id: number, reply: any) => {
      if (existentClients.has(id)) {
        return true;
      }
      reply.code(404).send({ error: "Client not found" });
      return false;
    };

    fastify.post<{ Body: PostBody; Params: ReqParams }>(
      "/clientes/:id/transacoes",
      {
        schema: transactionSchema,
        config: {},
      },
      async (request, reply) => {
        const { tipo, valor, descricao } = request.body;
        if (!isTheClientValid(request?.params?.id, reply)) {
          return;
        }
        const transaction = new Transaction(
          request?.params?.id,
          valor,
          descricao,
          tipo
        );
        const operation = OperationFactory.createOperation(
          tipo,
          transactionRepository
        );
        const [result, err] = await operation?.execute(transaction);

        if (err) {
          return reply.code(422).send(err);
        }
        return reply.code(200).send({
          limite: result?.limit,
          saldo: result?.balance,
        });
      }
    );

    fastify.get<{ Params: ReqParams }>(
      "/clientes/:id/extrato",
      {
        schema: {
          params: {
            type: "object",
            properties: {
              id: {
                type: "integer",
              },
            },
          },
        },
      },
      async (request, reply) => {
        if (!isTheClientValid(request?.params?.id, reply)) {
          return;
        }
        const extract = await extractUsecase.execute(request?.params?.id);

        if (!extract) {
          return reply.code(500).send({ error: "Error on extract usecase" });
        }

        return reply.code(200).send({
          saldo: {
            total: extract?.balance || 0,
            limite: extract.limit,
            data_extrato: new Date(
              new Date().getTime() + offSetBrasilia * 60000
            ).toISOString(),
          },
          ultimas_transacoes: extract.last_transactions,
        });
      }
    );

    fastify.setErrorHandler((error, request, reply) => {
      if (error.validation) {
        reply.code(422).send({ error: "Invalid input" });
      }
    });

    fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
      if (err) throw err;
      logger.info(`Server is running on ${address} 🚀`);
    });
  } catch (e) {
    logger.error(e);
  }
};

start();
