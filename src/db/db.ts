import Dexie from 'dexie';
import type { DailyTrainingDTO, ExerciseDTO, PersonDTO } from './types';

export interface UserRow {
  id: number;
  data: PersonDTO;
}

export interface TrainingRow {
  date: string;
  data: DailyTrainingDTO;
}

export interface ExerciseRow {
  name: string;
  data: ExerciseDTO;
}

const db = new Dexie('FitnessDB');
db.version(1).stores({
  users: 'id',
  trainings: 'date',
  exercises: 'name',
});

export const usersTable = db.table<UserRow, number>('users');
export const trainingsTable = db.table<TrainingRow, string>('trainings');
export const exercisesTable = db.table<ExerciseRow, string>('exercises');

export { db };