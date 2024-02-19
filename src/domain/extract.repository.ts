export default interface ExtractRepository {
  findByClientId(
    clientId: number
  ): Promise<[Nullable<{ rows: any[] }>, error: Nullable<Error>]>;
}
