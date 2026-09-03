export class CardioRecord {
  private cardioName: string;
  private metValue: number;
  private minute: number;

  constructor(cardioName: string, metValue: number, minute: number) {
    this.cardioName = cardioName;
    this.metValue = metValue;
    this.minute = minute;
  }

  calcBurn(weightKg: number): number {
    const hour = this.minute / 60.0;
    return weightKg * this.metValue * hour;
  }

  getCardioName(): string {
    return this.cardioName;
  }

  getMinute(): number {
    return this.minute;
  }

  getMetValue(): number {
    return this.metValue;
  }
}