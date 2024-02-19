export default class Transaction {
  constructor(
    readonly clientId: number,
    readonly value: number,
    readonly description: string,
    readonly type: "c" | "d"
  ) {
    this.value = value;
    this.description = description;
    this.type = type;
    this.clientId = clientId;
  }
}
