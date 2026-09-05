import { CardioRecord } from '../core/cardioRecord';
import { DailyTraining } from '../core/dailyTraining';
import { Exercise, MuscleRatio } from '../core/exercise';
import { Person } from '../core/person';
import { WeightRecord } from '../core/weightRecord';
import { CardioTemplate } from '../core/workoutLibrary';
import { SetRecord, WorkoutLog } from '../core/workoutLog';
import type {
  CardioRecordDTO,
  CardioTemplateDTO,
  DailyTrainingDTO,
  ExerciseDTO,
  PersonDTO,
  SetRecordDTO,
  WeightRecordDTO,
  WorkoutLogDTO,
} from './types';

export function exerciseToDTO(e: Exercise): ExerciseDTO {
  return {
    name: e.getName(),
    trainGroup: e.getTrainGroup(),
    sets: e.getSets(),
    reps: e.getReps(),
    metValue: e.getMetValue(),
    muscleRatios: e.getMuscleRatios().map((mr) => ({
      muscleName: mr.getMuscleName(),
      ratio: mr.getRatio(),
    })),
  };
}

export function exerciseFromDTO(dto: ExerciseDTO): Exercise {
  const ex = new Exercise(dto.name, dto.trainGroup, dto.sets, dto.reps, dto.metValue);
  for (const mr of dto.muscleRatios) {
    ex.getMuscleRatios().push(new MuscleRatio(mr.muscleName, mr.ratio));
  }
  return ex;
}

export function setRecordToDTO(sr: SetRecord): SetRecordDTO {
  return {
    trainWeight: sr.getTrainWeight(),
    reps: sr.getReps(),
    minute: sr.getMinute(),
  };
}

export function workoutLogToDTO(log: WorkoutLog): WorkoutLogDTO {
  return {
    exercise: exerciseToDTO(log.getExercise()),
    setRecords: log.getSetRecords().map(setRecordToDTO),
  };
}

export function workoutLogFromDTO(dto: WorkoutLogDTO): WorkoutLog {
  const log = new WorkoutLog(exerciseFromDTO(dto.exercise));
  for (const sr of dto.setRecords) {
    log.addSet(sr.trainWeight, sr.reps, sr.minute);
  }
  return log;
}

export function cardioToDTO(c: CardioRecord): CardioRecordDTO {
  return {
    cardioName: c.getCardioName(),
    metValue: c.getMetValue(),
    minute: c.getMinute(),
  };
}

export function cardioFromDTO(dto: CardioRecordDTO): CardioRecord {
  return new CardioRecord(dto.cardioName, dto.metValue, dto.minute);
}

export function cardioTemplateToDTO(t: CardioTemplate): CardioTemplateDTO {
  return {
    name: t.name,
    met: t.met,
    recommendMin: t.recommendMin,
    tip: t.tip,
  };
}

export function cardioTemplateFromDTO(dto: CardioTemplateDTO): CardioTemplate {
  return new CardioTemplate(dto.name, dto.met, dto.recommendMin, dto.tip);
}

export function weightRecordToDTO(wr: WeightRecord): WeightRecordDTO {
  return { date: wr.getRecordDate(), weight: wr.getWeight() };
}

export function weightRecordFromDTO(dto: WeightRecordDTO): WeightRecord {
  return new WeightRecord(dto.date, dto.weight);
}

export function personToDTO(p: Person): PersonDTO {
  return {
    gender: p.getGender(),
    height: p.getHeight(),
    weight: p.getWeight(),
    age: p.getAge(),
    BMR: p.getBMR(),
    activityCode: p.getActivityCode(),
    weightRecords: p.getWeightRecordList().map(weightRecordToDTO),
  };
}

export function personFromDTO(dto: PersonDTO): Person {
  const p = Person.createPerson(dto.gender, dto.height, dto.weight, dto.age);
  p.setActivityCode(dto.activityCode);
  for (const wr of dto.weightRecords) {
    p.addWeightRecord(weightRecordFromDTO(wr));
  }
  return p;
}

export function trainingToDTO(t: DailyTraining): DailyTrainingDTO {
  return {
    date: t.getDate(),
    remark: t.getRemark(),
    person: personToDTO(t.getPerson()),
    workoutLogs: t.getWorkoutLogs().map(workoutLogToDTO),
    cardioList: t.getCardioList().map(cardioToDTO),
  };
}

export function trainingFromDTO(dto: DailyTrainingDTO): DailyTraining {
  const t = new DailyTraining(personFromDTO(dto.person));
  t.setTrainDate(dto.date);
  if (dto.remark !== undefined) {
    t.setRemark(dto.remark);
  }
  for (const logDTO of dto.workoutLogs) {
    t.addWorkoutLog(workoutLogFromDTO(logDTO));
  }
  for (const c of dto.cardioList) {
    t.addCardio(cardioFromDTO(c));
  }
  return t;
}