export default class Transaction {
  constructor(readonly clientId: number, readonly value: number, readonly description: string, readonly type: "c" | "d") {
    this.value = value;
    this.description = description;
    this.type = type; 
    this.clientId = clientId;
    this.validate();
  }

  private validate() {
    if (isNaN(this.value) || this.value <= 0) {
      throw new Error('Invalid value');
    }
    if (this.type !== 'c' && this.type !== 'd') {
      throw new Error('Invalid transaction type');
    }
  }
}