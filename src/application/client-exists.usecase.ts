import TransactionRepository from "../domain/transaction.repository";
import { logger } from "../infra/logger/logger";

export default class ClientExistsUsecase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(clientId: number): Promise<boolean> {
    try {
      const client = await this.transactionRepository.isClientExists(clientId);
      return client;
    } catch (e) {
      logger.error(e, "Error on client exists usecase");
      return false;
    }
  }
}
