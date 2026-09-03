import { CardioRecord } from './cardioRecord';
import { todayISO } from './dateUtil';
import { Person } from './person';
import { WorkoutLog } from './workoutLog';

export class DailyTraining {
  private date: string;
  private workoutLogs: WorkoutLog[];
  private cardioList: CardioRecord[] = [];
  private remark: string | undefined;
  private person: Person;

  constructor(person: Person) {
    this.person = person;
    this.date = todayISO();
    this.workoutLogs = [];
    this.cardioList = [];
  }

  addWorkoutLog(log: WorkoutLog | null): void {
    if (log !== null && log !== undefined) {
      this.workoutLogs.push(log);
    }
  }

  addCardio(cardio: CardioRecord | null): void {
    if (cardio !== null && cardio !== undefined) {
      this.cardioList.push(cardio);
    }
  }

  getUserWeight(): number {
    if (!this.person) {
      return 0;
    }
    return this.person.getWeight();
  }

  setTrainDate(trainDate: string): void {
    this.date = trainDate;
  }

  calculateWholeBurn(userWeight: number): number {
    let strengthBurn = 0;
    let cardioBurn = 0;
    for (const log of this.workoutLogs) {
      strengthBurn += log.getTotalBurn(userWeight);
    }
    for (const cardio of this.cardioList) {
      cardioBurn += cardio.calcBurn(userWeight);
    }
    return strengthBurn + cardioBurn;
  }

  getDailyTotalVolume(): number {
    let volume = 0;
    for (const log of this.workoutLogs) {
      volume += log.getTrainVolume();
    }
    return volume;
  }

  getStrengthBurn(): number {
    let sum = 0;
    const weight = this.getUserWeight();
    for (const log of this.workoutLogs) {
      sum += log.getTotalBurn(weight);
    }
    return sum;
  }

  getCardioBurn(): number {
    let total = 0;
    const weight = this.getUserWeight();
    for (const record of this.cardioList) {
      total += record.calcBurn(weight);
    }
    return total;
  }

  getDate(): string {
    return this.date;
  }

  getRemark(): string | undefined {
    return this.remark;
  }

  setRemark(remark: string): void {
    this.remark = remark;
  }

  getPerson(): Person {
    return this.person;
  }

  setPerson(person: Person): void {
    this.person = person;
  }

  getWorkoutLogs(): WorkoutLog[] {
    return this.workoutLogs;
  }

  getCardioList(): CardioRecord[] {
    return this.cardioList;
  }

  showAllDetail(): string {
    let content = '====今日训练详情====\n';
    content += `训练日期：${this.getDate()}\n`;
    if (this.remark && this.remark.trim() !== '') {
      content += `训练备注：${this.remark}\n`;
    }
    content += '【力量训练】\n';
    for (const log of this.workoutLogs) {
      content += log.toString() + '\n';
    }
    content += `今日总训练容量：${this.getDailyTotalVolume()}\n`;
    content += '【有氧训练】\n';
    for (const cardio of this.cardioList) {
      const line = `有氧：${cardio.getCardioName()}，时长：${cardio.getMinute()}分钟，预估消耗：${Math.round(cardio.calcBurn(this.person.getWeight()) + 0.5)}kcal`;
      content += line + '\n';
    }
    const totalBurn = this.getStrengthBurn() + this.getCardioBurn();
    content += `今日训练额外消耗：${totalBurn}`;
    return content;
  }
}