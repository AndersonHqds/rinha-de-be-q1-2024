import { FastifyRequest, FastifyReply } from "fastify";
import Transaction, { TransactionType } from "../../domain/transaction.vo";
import PerformOperationUsecase from "../../application/perform-operation.usecase";

export type PostBody = {
  tipo: TransactionType;
  valor: number;
  descricao: string;
};

export type ReqParams = {
  id: number;
};

export default class TransactionController {
  static async handle(
    request: FastifyRequest<{ Body: PostBody; Params: ReqParams }>,
    reply: FastifyReply,
    performOperation: PerformOperationUsecase,
    preValidation: () => boolean
  ) {
    if (!preValidation()) {
      return;
    }
    const { tipo, valor, descricao } = request.body;

    const transaction = new Transaction(
      request?.params?.id,
      valor,
      descricao,
      tipo
    );

    const { result, error } = await performOperation.execute(transaction);

    if (error) {
      return reply.code(422).send(error.message);
    }

    return reply.code(200).send({
      limite: result?.limit,
      saldo: result?.balance,
    });
  }
}
