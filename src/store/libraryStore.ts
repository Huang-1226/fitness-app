import { create } from 'zustand';
import { Exercise } from '../core/exercise';
import { CardioTemplate, WorkoutLibrary } from '../core/workoutLibrary';
import {
  cardioTemplateFromDTO,
  cardioTemplateToDTO,
  exerciseFromDTO,
  exerciseToDTO,
} from '../db/converters';
import { cardioTemplatesTable, exercisesTable } from '../db/db';

interface LibraryState {
  library: WorkoutLibrary;
  loaded: boolean;
  loadLibrary: () => Promise<void>;
  addExercise: (e: Exercise) => Promise<void>;
  addCardioTemplate: (t: CardioTemplate) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  library: new WorkoutLibrary(),
  loaded: false,

  loadLibrary: async () => {
    try {
      const [exerciseRows, cardioRows] = await Promise.all([
        exercisesTable.toArray(),
        cardioTemplatesTable.toArray(),
      ]);
      const lib = new WorkoutLibrary();
      for (const row of exerciseRows) {
        lib.addExercise(exerciseFromDTO(row.data));
      }
      for (const row of cardioRows) {
        lib.addCardioTemplate(cardioTemplateFromDTO(row.data));
      }
      set({ library: lib });
    } finally {
      set({ loaded: true });
    }
  },

  addExercise: async (e) => {
    const lib = get().library;
    if (lib.getExerciseByName(e.getName()) === null) {
      lib.addExercise(e);
      set({ library: lib });
    }
    await exercisesTable.put({ name: e.getName(), data: exerciseToDTO(e) });
  },

  addCardioTemplate: async (t) => {
    const lib = get().library;
    if (lib.getCardioByName(t.name) === null) {
      lib.addCardioTemplate(t);
      set({ library: lib });
    }
    await cardioTemplatesTable.put({ name: t.name, data: cardioTemplateToDTO(t) });
  },

  resetToDefault: async () => {
    await Promise.all([exercisesTable.clear(), cardioTemplatesTable.clear()]);
    set({ library: new WorkoutLibrary() });
  },
}));