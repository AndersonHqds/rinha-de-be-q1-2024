import Fastify from "fastify";
import TransactionDbRepository from "./infra/repositories/transactiondb.repository";
import PgAdapter from "./infra/database/pgAdapter";
import Transaction from "./domain/transaction.vo";
import OperationFactory from "./application/operation.factory";
import ClientExistsUsecase from "./application/client-exists.usecase";
import ExtractDbRepository from "./infra/repositories/extractdb.repository";
import ExtractUsecase from "./application/extract.usecase";

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

export const start = () => {
  try {
    const connection = new PgAdapter();
    const transactionRepository = new TransactionDbRepository(connection);
    const extractRepository = new ExtractDbRepository(connection);
    const clientExistsUsecase = new ClientExistsUsecase(transactionRepository);
    const extractUsecase = new ExtractUsecase(extractRepository);

    const offSetBrasilia = -3 * 60;

    const isInputValid = async (id: number, reply: any) => {
      if (isNaN(id)) {
        reply.code(400).send({ error: "Invalid id" });
        return false;
      }
      const exists = await clientExistsUsecase.execute(id);
      if (!exists) {
        reply.code(404).send({ error: "Client not found" });
        return false;
      }
      return true;
    };

    fastify.post<{ Body: PostBody; Params: ReqParams }>(
      "/clientes/:id/transacoes",
      async (request, reply) => {
        const { tipo, valor } = request.body;
        const isInputInvalid = !(await isInputValid(
          request?.params?.id,
          reply
        ));
        if (isInputInvalid) {
          return;
        }
        let transaction = null;
        try {
          transaction = new Transaction(
            request?.params?.id,
            valor,
            request?.body?.descricao,
            tipo
          );
        } catch (e) {
          console.log("Error in Transaction");
          return reply.code(422).send({ error: (e as Error)?.message });
        }
        const operation = OperationFactory.createOperation(
          tipo,
          transactionRepository
        );
        const [result, err] = await operation?.execute(transaction);

        if (err) {
          console.log("Error in operation");
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
      async (request, reply) => {
        if (!isInputValid(request?.params?.id, reply)) {
          return;
        }
        const extract = await extractUsecase.execute(request?.params?.id);
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

    fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
      if (err) throw err;
      console.log(`Server is running on ${address} 🚀`);
    });
  } catch (e) {
    console.error(e);
  }
};

start();
