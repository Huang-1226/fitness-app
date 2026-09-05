export interface MuscleRatioDTO {
  muscleName: string;
  ratio: number;
}

export interface ExerciseDTO {
  name: string;
  trainGroup: string;
  sets: number;
  reps: number;
  metValue: number;
  muscleRatios: MuscleRatioDTO[];
}

export interface SetRecordDTO {
  trainWeight: number;
  reps: number;
  minute: number;
}

export interface WorkoutLogDTO {
  exercise: ExerciseDTO;
  setRecords: SetRecordDTO[];
}

export interface CardioRecordDTO {
  cardioName: string;
  metValue: number;
  minute: number;
}

export interface CardioTemplateDTO {
  name: string;
  met: number;
  recommendMin: number;
  tip: string;
}

export interface WeightRecordDTO {
  date: string;
  weight: number;
}

export interface PersonDTO {
  gender: string;
  height: number;
  weight: number;
  age: number;
  BMR: number;
  activityCode: number;
  weightRecords: WeightRecordDTO[];
}

export interface DailyTrainingDTO {
  date: string;
  remark?: string;
  person: PersonDTO;
  workoutLogs: WorkoutLogDTO[];
  cardioList: CardioRecordDTO[];
}