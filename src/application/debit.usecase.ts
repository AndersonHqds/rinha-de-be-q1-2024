import Client from "../domain/client";
import ClientRepository from "../domain/client.repository";
import TransactionRepository from "../domain/transaction.repository";
import Transaction from "../domain/transaction.vo";
import { logger } from "../infra/logger/logger";

export default class DebitUsecase {
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
      const transaction = new Transaction(clientId, value, description, type);
      const [client, err] = await this.transactionRepository.debit(transaction);
      if (!client) {
        return [null, new Error("Limit exceeded")];
      }
      if (err) {
        return [null, err];
      }
      return [new Client(clientId, client.balance, client.money_limit), null];
    } catch (e) {
      logger.error(e, "Error on debit usecase");
      return [null, e as Error];
    }
  }
}

type Output = [Nullable<Client>, Nullable<Error>];
