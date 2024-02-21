import Client from "../domain/client";
import ClientRepository from "../domain/client.repository";
import TransactionRepository from "../domain/transaction.repository";
import Transaction from "../domain/transaction.vo";
import { logger } from "../infra/logger/logger";

export default class CreditUsecase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly clientRepository: ClientRepository
  ) {
    this.transactionRepository = transactionRepository;
    this.clientRepository = clientRepository;
  }

  async execute({
    clientId,
    value,
    description,
    type,
  }: Transaction): Promise<Output> {
    try {
      const clientResult = await this.clientRepository.findById(clientId);
      if (!clientResult) {
        return [null, new Error("Client not found")];
      }
      const [client] = clientResult;

      const newBalance = client.balance + value;

      const transaction = new Transaction(
        client.id,
        client.balance,
        description,
        type
      );

      const err =
        await this.transactionRepository.saveTransactionAndUpdateNewBalance(
          transaction,
          newBalance
        );

      if (err) {
        return [null, err];
      }
      return [new Client(client.id, newBalance, client.limit), null];
    } catch (e) {
      logger.error(e, "Error on credit usecase");
      return [null, e as Error];
    }
  }
}

type Output = [Nullable<Client>, Nullable<Error>];
