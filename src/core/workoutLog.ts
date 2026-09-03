import { Exercise } from './exercise';

export class SetRecord {
  private trainWeight: number;
  private reps: number;
  private minute: number;

  constructor(trainWeight: number, reps: number, minute: number) {
    this.trainWeight = trainWeight;
    this.reps = reps;
    this.minute = minute;
  }

  getTrainWeight(): number {
    return this.trainWeight;
  }

  getReps(): number {
    return this.reps;
  }

  getMinute(): number {
    return this.minute;
  }
}

export class WorkoutLog {
  private exercise: Exercise;
  private setRecords: SetRecord[] = [];

  constructor(exercise: Exercise) {
    if (!exercise) {
      throw new Error('训练动作不能为null');
    }
    this.exercise = exercise;
  }

  hasSetRecord(): boolean {
    return this.setRecords.length > 0;
  }

  addSet(trainWeight: number, reps: number, minute: number): void {
    if (trainWeight <= 0) {
      throw new Error('训练重量必须大于0');
    }
    if (reps <= 0) {
      throw new Error('次数必须大于0');
    }
    if (minute <= 0) {
      throw new Error('训练时长必须大于0');
    }
    this.setRecords.push(new SetRecord(trainWeight, reps, minute));
  }

  getTrainVolume(): number {
    let total = 0;
    for (const record of this.setRecords) {
      total += record.getTrainWeight() * record.getReps();
    }
    return total;
  }

  getTotalBurn(userWeight: number): number {
    if (!this.exercise || this.setRecords.length === 0) {
      return 0;
    }
    let total = 0;
    for (const sr of this.setRecords) {
      total += this.exercise.calculateBurnCalorie(userWeight, sr.getMinute());
    }
    return total;
  }

  getExercise(): Exercise {
    return this.exercise;
  }

  getSetRecords(): SetRecord[] {
    return [...this.setRecords];
  }

  toString(): string {
    if (!this.exercise) return '空训练记录';
    let result = `训练动作:${this.exercise.getName()}`;
    for (let i = 0; i < this.setRecords.length; i++) {
      result += ` 组${i + 1}:${this.setRecords[i].getTrainWeight()}kg*${this.setRecords[i].getReps()} `;
    }
    result += ` 总训练容量：${this.getTrainVolume()}`;
    return result;
  }
}