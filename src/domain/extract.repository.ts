export default interface ExtractRepository {
  findByClientId(clientId: number): Promise<{ rows: any[]}>;
}