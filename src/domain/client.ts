export default class Client {
  constructor(
    readonly id: number,
    readonly limit: number,
    readonly balance?: number
  ) {
    this.id = id;
    this.balance = balance;
    this.limit = limit;
  }
}
