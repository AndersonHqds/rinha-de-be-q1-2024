import Account from '../domain/account.vo';
import TransactionRepository from '../domain/transaction.repository';
import Transaction from '../domain/transaction.vo';

export default class CreditUsecase {
  constructor(private readonly transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  async execute({ clientId, value, description, type }: Transaction): Promise<Output> {
    try {
      const transaction = new Transaction(clientId, value, description, type);
      const { balance, money_limit } = await this.transactionRepository.credit(transaction);
      const account = new Account(clientId, balance, money_limit);
      return [account, null];
    }
    catch(e) {
      return [null, e as Error];
    }
  }
}

type Output = [Nullable<Account>, Nullable<Error>];