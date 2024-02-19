import Account from "../domain/account.vo";
import TransactionRepository from "../domain/transaction.repository";
import Transaction from "../domain/transaction.vo";
import { logger } from "../infra/logger/logger";

export default class CreditUsecase {
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
      const [result, err] = await this.transactionRepository.credit(
        transaction
      );
      if (err) {
        return [null, err];
      }
      if (!result) {
        return [null, new Error("Unknown Error on credit")];
      }
      const { balance, money_limit } = result;
      const account = new Account(clientId, balance, money_limit);
      return [account, null];
    } catch (e) {
      logger.error(e, "Error on credit usecase");
      return [null, e as Error];
    }
  }
}

type Output = [Nullable<Account>, Nullable<Error>];
