import Dexie from 'dexie';
import type { CardioTemplateDTO, DailyTrainingDTO, ExerciseDTO, PersonDTO } from './types';

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

export interface CardioTemplateRow {
  name: string;
  data: CardioTemplateDTO;
}

const db = new Dexie('FitnessDB');
db.version(2).stores({
  users: 'id',
  trainings: 'date',
  exercises: 'name',
  cardioTemplates: 'name',
});

export const usersTable = db.table<UserRow, number>('users');
export const trainingsTable = db.table<TrainingRow, string>('trainings');
export const exercisesTable = db.table<ExerciseRow, string>('exercises');
export const cardioTemplatesTable = db.table<CardioTemplateRow, string>('cardioTemplates');

export { db };