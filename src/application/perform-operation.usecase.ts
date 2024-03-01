import { Nullable, RepositoryOutput } from "../common.types";
import Client from "../domain/client";
import ClientRepository from "../domain/client.repository";
import TransactionRepository from "../domain/transaction.repository";
import Transaction from "../domain/transaction.vo";
import { logger } from "../infra/logger/logger";

export default class PerformOperationUsecase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly clientRepository: ClientRepository
  ) {
    this.transactionRepository = transactionRepository;
    this.clientRepository = clientRepository;
  }

  async execute({ clientId, value, description, type }: Transaction): Output {
    try {
      const { result: client, error: clientError } =
        await this.clientRepository.findById(clientId);

      if (!client || clientError) {
        return {
          result: null,
          error: clientError ?? new Error("Error to get Client"),
        };
      }

      const transaction = new Transaction(client.id, value, description, type);

      const { result, error } =
        await this.transactionRepository.performTransaction(
          transaction,
          client.limit
        );

      if (!result) {
        return {
          result: null,
          error: error ?? new Error("Error to get the transaction result"),
        };
      }

      return {
        result: new Client(clientId, client.limit, result.value),
        error: null,
      };
    } catch (e) {
      logger.error(e, "Error on credit usecase");
      return { result: null, error: e as Error };
    }
  }
}

type Output = Promise<RepositoryOutput<Nullable<Client>, Nullable<Error>>>;
