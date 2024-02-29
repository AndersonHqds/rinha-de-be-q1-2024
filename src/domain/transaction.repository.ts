import Transaction from "./transaction.vo";

export default interface TransactionRepository {
  credit(
    transaction: Transaction
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, error: Nullable<Error>]
  >;
  debit(
    transaction: Transaction
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, error: Nullable<Error>]
  >;
}
