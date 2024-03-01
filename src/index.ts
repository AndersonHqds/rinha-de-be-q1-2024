import Fastify from "fastify";
import TransactionDbRepository from "./infra/repositories/transactiondb.repository";
import PgAdapter from "./infra/database/pgAdapter";
import ExtractUsecase from "./application/extract.usecase";
import { logger } from "./infra/logger/logger";
import { extractSchema, transactionSchema } from "./infra/schemas/fastify";
import ClientDbRepository from "./infra/repositories/clientdb.repository";
import ClientRepository from "./domain/client.repository";
import TransactionController, {
  PostBody,
  ReqParams,
} from "./infra/controllers/transaction.controller";
import PerformOperationUsecase from "./application/perform-operation.usecase";
import ExtractController from "./infra/controllers/extract.controller";

const fastify = Fastify({
  logger: false,
});

const existentClients = new Set<number>();

const preloadClients = async (clientRepository: ClientRepository) => {
  const higherId = await clientRepository.findHigherClientId();
  for (let i = 1; i <= higherId; i++) {
    existentClients.add(i);
  }
};

const isTheClientValid = (id: number, reply: any) => {
  if (existentClients.has(id)) {
    return true;
  }
  reply.code(404).send({ error: "Client not found" });
  return false;
};

export const start = async () => {
  try {
    const connection = new PgAdapter();
    const transactionRepository = new TransactionDbRepository(connection);
    const clientRepository = new ClientDbRepository(connection);

    const performOperationUsecase = new PerformOperationUsecase(
      transactionRepository,
      clientRepository
    );
    const extractUsecase = new ExtractUsecase(
      transactionRepository,
      clientRepository
    );
    await preloadClients(clientRepository);

    fastify.post<{ Params: ReqParams; Body: PostBody }>(
      "/clientes/:id/transacoes",
      {
        schema: transactionSchema,
      },
      async (request, reply) =>
        TransactionController.handle(
          request,
          reply,
          performOperationUsecase,
          () => isTheClientValid(request?.params?.id, reply)
        )
    );

    fastify.get<{ Params: ReqParams }>(
      "/clientes/:id/extrato",
      extractSchema,
      async (request, reply) =>
        ExtractController.handle(request, reply, extractUsecase, () =>
          isTheClientValid(request?.params?.id, reply)
        )
    );

    fastify.setErrorHandler((error, _, reply) => {
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
