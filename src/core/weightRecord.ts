export class WeightRecord {
  readonly recordDate: string;
  readonly weight: number;

  constructor(recordDate: string, weight: number) {
    this.recordDate = recordDate;
    this.weight = weight;
  }

  getRecordDate(): string {
    return this.recordDate;
  }

  getWeight(): number {
    return this.weight;
  }
}