import Transaction from "./transaction.vo";

export default interface TransactionRepository {
  findHigherClientId(): Promise<number>;
  findClientInfoById(
    clientId: number
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, error: Nullable<Error>]
  >;
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
  isClientExists(clientId: number): Promise<boolean>;
}
Promise<[Nullable<{ rows: any[] }>, error: Nullable<Error>]>;
