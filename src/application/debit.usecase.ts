import Account from "../domain/account.vo";
import TransactionRepository from "../domain/transaction.repository";
import Transaction from "../domain/transaction.vo";
import { logger } from "../infra/logger/logger";

export default class DebitUsecase {
  constructor(private readonly transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
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
      if (err) {
        return [null, err];
      }
      if (!client) {
        return [null, new Error("Limit exceeded")];
      }
      const account = new Account(clientId, client.balance, client.money_limit);
      return [account, null];
    } catch (e) {
      logger.error(e, "Error on debit usecase");
      return [null, e as Error];
    }
  }
}

type Output = [Nullable<Account>, Nullable<Error>];
