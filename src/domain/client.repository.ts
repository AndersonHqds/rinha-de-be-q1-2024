import { Nullable, RepositoryOutput } from "../common.types";
import Client from "./client";

export default interface ClientRepository {
  findById(
    id: number
  ): Promise<RepositoryOutput<Nullable<Client>, Nullable<Error>>>;
  isClientExists(clientId: number): Promise<boolean>;
  findHigherClientId(): Promise<number>;
  getBalance(client: Client): Promise<any>;
}
