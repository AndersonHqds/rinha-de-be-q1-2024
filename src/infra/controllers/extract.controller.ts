import { FastifyRequest, FastifyReply } from "fastify";
import Transaction, { TransactionType } from "../../domain/transaction.vo";
import PerformOperationUsecase from "../../application/perform-operation.usecase";
import ExtractUsecase from "../../application/extract.usecase";

export type PostBody = {
  tipo: TransactionType;
  valor: number;
  descricao: string;
};

export type ReqParams = {
  id: number;
};

const offSetBrasilia = -3 * 60;

export default class ExtractController {
  static async handle(
    request: FastifyRequest<{ Params: ReqParams }>,
    reply: FastifyReply,
    extractUsecase: ExtractUsecase,
    preValidation: () => boolean
  ) {
    if (!preValidation()) {
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
}
