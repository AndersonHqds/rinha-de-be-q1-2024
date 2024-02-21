import Client from "./client";

export default interface ClientRepository {
  findById(id: number): Promise<Nullable<[Client]>>;
  isClientExists(clientId: number): Promise<boolean>;
  findHigherClientId(): Promise<number>;
  findClientInfoById(
    clientId: number
  ): Promise<
    [Nullable<{ balance: number; money_limit: number }>, error: Nullable<Error>]
  >;
}
