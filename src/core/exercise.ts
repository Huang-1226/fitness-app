export class MuscleRatio {
  readonly muscleName: string;
  readonly ratio: number;

  constructor(muscleName: string, ratio: number) {
    this.muscleName = muscleName;
    this.ratio = ratio;
  }

  getMuscleName(): string {
    return this.muscleName;
  }

  getRatio(): number {
    return this.ratio;
  }
}

export class Exercise {
  private name: string;
  private trainGroup: string;
  private sets: number;
  private reps: number;
  private muscleRatios: MuscleRatio[] = [];
  private metValue: number;

  constructor(name: string, trainGroup: string, sets: number, reps: number, metValue: number) {
    this.name = name;
    this.trainGroup = trainGroup;
    this.sets = sets;
    this.reps = reps;
    this.metValue = metValue;
  }

  getName(): string {
    return this.name;
  }

  getTrainGroup(): string {
    return this.trainGroup;
  }

  getSets(): number {
    return this.sets;
  }

  getReps(): number {
    return this.reps;
  }

  getMuscleRatios(): MuscleRatio[] {
    return this.muscleRatios;
  }

  getMuscleRatio(muscleName: string): number {
    for (const mr of this.muscleRatios) {
      if (mr.getMuscleName() === muscleName) {
        return mr.getRatio();
      }
    }
    return 0;
  }

  getMetValue(): number {
    return this.metValue;
  }

  calculateBurnCalorie(weightKg: number, trainMinute: number): number {
    const hour = trainMinute / 60.0;
    return weightKg * this.metValue * hour;
  }

  equals(other: Exercise): boolean {
    return this.name === other.name;
  }

  toString(): string {
    let muscleInfo = '';
    for (const mr of this.muscleRatios) {
      muscleInfo += `${mr.getMuscleName()}(${mr.getRatio()}%) `;
    }
    return `动作：${this.name} | 目标肌群：${this.trainGroup} | 锻炼肌肉及其占比：${muscleInfo} | 新手推荐：${this.sets}组 × ${this.reps}次`;
  }
}