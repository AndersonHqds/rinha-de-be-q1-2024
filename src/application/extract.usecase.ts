import ExtractRepository from "../domain/extract.repository";

export default class ExtractUsecase {
  constructor(readonly extractRepository: ExtractRepository) {
    this.extractRepository = extractRepository;
  }
  async execute(clientId: number) {
    const [result, err] = await this.extractRepository.findByClientId(clientId);
    if (err || !result) {
      return null;
    }
    const { rows } = result;
    const clientData = rows[0];
    return {
      balance: clientData?.balance,
      limit: clientData?.money_limit,
      last_transactions: clientData.last_transactions || [],
    };
  }
}
