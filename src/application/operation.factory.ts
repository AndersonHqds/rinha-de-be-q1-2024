import TransactionRepository from "../domain/transaction.repository";
import CreditUsecase from "./credit.usecase";
import DebitUsecase from "./debit.usecase";

export default class OperationFactory {
  static createOperation(type: "c" | "d", transactionRepository: TransactionRepository) {
    if (type === 'c') {
      return new CreditUsecase(transactionRepository);
    } else {
      return new DebitUsecase(transactionRepository);
    }
    
  }
}