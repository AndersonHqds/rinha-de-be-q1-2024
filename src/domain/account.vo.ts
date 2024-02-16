export default class Account {
  constructor(readonly clientId: number, readonly balance: number, readonly limit: number) {
    this.clientId = clientId;
    this.balance = balance;
    this.limit = limit;
  }
}