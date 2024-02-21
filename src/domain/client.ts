export default class Client {
  constructor(
    readonly id: number,
    readonly balance: number,
    readonly limit: number
  ) {
    this.id = id;
    this.balance = balance;
    this.limit = limit;
  }
}
