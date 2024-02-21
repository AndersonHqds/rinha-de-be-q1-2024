import ClientRepository from "../domain/client.repository";
import { logger } from "../infra/logger/logger";

export default class ClientExistsUsecase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(clientId: number): Promise<boolean> {
    try {
      const client = await this.clientRepository.isClientExists(clientId);
      return client;
    } catch (e) {
      logger.error(e, "Error on client exists usecase");
      return false;
    }
  }
}
