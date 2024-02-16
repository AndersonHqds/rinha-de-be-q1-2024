import ExtractRepository from "../domain/extract.repository";

export default class ExtractUsecase {
  constructor(readonly extractRepository: ExtractRepository) {
    this.extractRepository = extractRepository;
  }
  async execute(clientId: number) {
    const {rows} = await this.extractRepository.findByClientId(clientId);
    const clientBalanceInfo = rows[0];
    return {
      balance: clientBalanceInfo?.balance,
      limit: clientBalanceInfo?.money_limit,
      last_transactions: rows.map(
        ({ amount, operation_type, description, created_at }) => 
          ({ 
            valor: amount, 
            tipo: operation_type, 
            descricao: description, 
            realizada_em: created_at 
          }))
    }
  }
}