import TransactionRepository from "../domain/transaction.repository";

export default class ClientExistsUsecase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(clientId: number): Promise<boolean> {
    return await this.transactionRepository.isClientExists(clientId);
  }
}