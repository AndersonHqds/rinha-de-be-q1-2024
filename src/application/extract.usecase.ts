import ClientRepository from "../domain/client.repository";
import ExtractRepository from "../domain/extract.repository";

export default class ExtractUsecase {
  constructor(
    readonly extractRepository: ExtractRepository,
    private readonly clientRepository: ClientRepository
  ) {
    this.extractRepository = extractRepository;
    this.clientRepository = clientRepository;
  }
  async execute(clientId: number) {
    const [client] = (await this.clientRepository.findById(clientId)) as any;
    const [result, err] = await this.extractRepository.findByClientId(clientId);

    if (err || !result) {
      return null;
    }
    const { rows } = result;
    return {
      balance: client.balance,
      limit: client.limit,
      last_transactions: rows || [],
    };
  }
}
