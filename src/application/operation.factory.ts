import ClientRepository from "../domain/client.repository";
import TransactionRepository from "../domain/transaction.repository";
import { TransactionType } from "../domain/transaction.vo";
import CreditUsecase from "./credit.usecase";
import DebitUsecase from "./debit.usecase";

export default class OperationFactory {
  static createOperation(
    type: TransactionType,
    transactionRepository: TransactionRepository,
    clientRepository: ClientRepository
  ) {
    if (type === TransactionType.CREDIT) {
      return new CreditUsecase(transactionRepository, clientRepository);
    } else {
      return new DebitUsecase(transactionRepository, clientRepository);
    }
  }
}
