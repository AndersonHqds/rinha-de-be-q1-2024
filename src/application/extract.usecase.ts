import ClientRepository from "../domain/client.repository";
import TransactionRepository from "../domain/transaction.repository";

export default class ExtractUsecase {
  constructor(
    readonly transactionRepository: TransactionRepository,
    private readonly clientRepository: ClientRepository
  ) {
    this.transactionRepository = transactionRepository;
    this.clientRepository = clientRepository;
  }
  async execute(clientId: number): Promise<any> {
    const { result: client, error: clientError } =
      await this.clientRepository.findById(clientId);

    if (!client || clientError) {
      return {
        result: null,
        error: clientError ?? new Error("Error to get Client"),
      };
    }

    const [{ result, error }, balanceResult] = await Promise.all([
      this.transactionRepository.findByClientId(clientId),
      this.clientRepository.getBalance(client),
    ]);

    if (error || !result) {
      return null;
    }
    return {
      balance: balanceResult.balance,
      limit: client.limit,
      last_transactions:
        result.map((transaction) => ({
          valor: transaction.value,
          tipo: transaction.type,
          descricao: transaction.description,
          realizada_em: transaction?.createdAt,
        })) || [],
    };
  }
}
