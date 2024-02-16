import Transaction from "./transaction.vo";

export default interface TransactionRepository {
  findClientInfoById(clientId: number): Promise<{ balance: number; money_limit: number}>;
  credit(transaction: Transaction): Promise<{ balance: number; money_limit: number}>;
  debit(transaction: Transaction): Promise<void>;
  isClientExists(clientId: number): Promise<boolean>;
}