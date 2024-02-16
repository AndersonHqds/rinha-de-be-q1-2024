import Account from '../domain/account.vo';
import TransactionRepository from '../domain/transaction.repository';
import Transaction from '../domain/transaction.vo';

export default class DebitUsecase {
  constructor(private readonly transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  async execute({ clientId, value, description, type }: Transaction): Promise<Output> {
    try {
      const client = await this.transactionRepository.findClientInfoById(clientId);
      const newBalance = client.balance - value;
      console.log("OK")
      if (Math.abs(newBalance) > client.money_limit) {
        return [null, new Error('Limit exceeded')];
      }
      const transaction = new Transaction(clientId, value, description, type);
      await this.transactionRepository.debit(transaction)
      const account = new Account(clientId, newBalance, client.money_limit);
      return [account, null];
    }
    catch(e) {
      return [null, e as Error];
    }
  }
}

type Output = [Nullable<Account>, Nullable<Error>];