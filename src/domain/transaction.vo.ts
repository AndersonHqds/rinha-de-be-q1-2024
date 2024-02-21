export default class Transaction {
  constructor(
    readonly clientId: number,
    readonly value: number,
    readonly description: string,
    readonly type: TransactionType
  ) {
    this.value = value;
    this.description = description;
    this.type = type;
    this.clientId = clientId;
  }
}

export enum TransactionType {
  CREDIT = "c",
  DEBIT = "d",
}
