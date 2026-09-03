import { WeightRecord } from './weightRecord';

export class Person {
  private gender: string;
  private height: number;
  private weight: number;
  private age: number;
  private BMR: number;
  private activityCode = 0;
  private weightRecordList: WeightRecord[] = [];

  private constructor(gender: string, height: number, weight: number, age: number) {
    if (!gender) {
      throw new Error('性别不能为空');
    }
    if (height <= 0) {
      throw new Error('身高不能为负数');
    }
    if (weight <= 0) {
      throw new Error('体重不能为负数');
    }
    if (age <= 0) {
      throw new Error('年龄不能为负数');
    }
    this.gender = gender;
    this.height = height;
    this.weight = weight;
    this.age = age;
    this.BMR = 0;
    this.calculateBMR();
  }

  static createPerson(gender: string, height: number, weight: number, age: number): Person {
    const inputGender = gender.trim().toLowerCase();
    if (inputGender !== 'male' && inputGender !== 'female') {
      throw new Error('性别非法，仅支持 male / female');
    }
    return new Person(inputGender, height, weight, age);
  }

  getGender(): string {
    return this.gender;
  }

  getWeight(): number {
    return this.weight;
  }

  getHeight(): number {
    return this.height;
  }

  getAge(): number {
    return this.age;
  }

  getBMR(): number {
    return this.BMR;
  }

  getActivityCode(): number {
    return this.activityCode;
  }

  addWeightRecord(record: WeightRecord): void {
    this.weightRecordList.push(record);
  }

  getWeightRecordList(): WeightRecord[] {
    return this.weightRecordList;
  }

  setWeight(newWeight: number): void {
    this.weight = newWeight;
    this.calculateBMR();
  }

  setActivityCode(activityCode: number): void {
    this.activityCode = activityCode;
  }

  calculateBMR(): void {
    if (this.gender === 'male') {
      this.BMR = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
    } else {
      this.BMR = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
    }
  }

  getBMI(): number {
    if (this.height <= 0) {
      return 0;
    }
    const heightM = this.height / 100.0;
    return this.weight / (heightM * heightM);
  }

  getBMILevel(): string {
    const bmi = this.getBMI();
    if (bmi <= 0) return '暂无身体数据';
    if (bmi < 18.5) return '偏瘦，建议力量训练+适度热量盈余增肌';
    if (bmi <= 23.9) return '身材标准健康，维持当前作息即可';
    if (bmi <= 27.9) return '超重，可配合力量训练+温和热量缺口减脂';
    return '肥胖，建议有氧搭配力量训练逐步减脂';
  }

  getTDEE(activityCode: number): number {
    let factor: number;
    if (activityCode === 1) {
      factor = 1.2;
    } else if (activityCode === 2) {
      factor = 1.375;
    } else if (activityCode === 3) {
      factor = 1.55;
    } else {
      factor = 1.725;
    }
    return this.BMR * factor;
  }

  getPreciseTDEE(activityCode: number, todayTrainBurnCal: number): number {
    return this.getTDEE(activityCode) + todayTrainBurnCal;
  }
}