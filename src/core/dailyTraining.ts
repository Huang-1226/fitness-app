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

  getWorkoutLogs(): WorkoutLog[] {
    return this.workoutLogs;
  }

  getCardioList(): CardioRecord[] {
    return this.cardioList;
  }

  /**
   * 返回一个内容相同的新实例。用于状态层「可变对象 + 不可变引用」更新，
   * 保证 zustand 选择器订阅能感知变化。
   */
  clone(): DailyTraining {
    const copy = new DailyTraining(this.person);
    copy.setTrainDate(this.date);
    copy.remark = this.remark;
    copy.workoutLogs = [...this.workoutLogs];
    copy.cardioList = [...this.cardioList];
    return copy;
  }
}