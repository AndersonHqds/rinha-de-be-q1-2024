import { Nullable, RepositoryOutput } from "../common.types";
import Transaction from "./transaction.vo";

export default interface TransactionRepository {
  performTransaction(
    transaction: Transaction,
    limit: number
  ): Promise<RepositoryOutput<Nullable<{ value: number }>, Nullable<Error>>>;
  findByClientId(
    clientId: number
  ): Promise<RepositoryOutput<Nullable<Transaction[]>, Nullable<Error>>>;
}
