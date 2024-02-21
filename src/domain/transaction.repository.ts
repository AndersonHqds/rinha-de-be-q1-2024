import Transaction from "./transaction.vo";

export default interface TransactionRepository {
  saveTransactionAndUpdateNewBalance(
    transaction: Transaction,
    balance: number
  ): Promise<Error | void>;
}
Promise<[Nullable<{ rows: any[] }>, error: Nullable<Error>]>;
