import { create } from 'zustand';
import { Exercise } from '../core/exercise';
import { WorkoutLibrary } from '../core/workoutLibrary';
import { exerciseFromDTO, exerciseToDTO } from '../db/converters';
import { exercisesTable } from '../db/db';

interface LibraryState {
  library: WorkoutLibrary;
  loaded: boolean;
  loadLibrary: () => Promise<void>;
  addExercise: (e: Exercise) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  library: new WorkoutLibrary(),
  loaded: false,

  loadLibrary: async () => {
    try {
      const rows = await exercisesTable.toArray();
      const lib = new WorkoutLibrary();
      for (const row of rows) {
        lib.addExercise(exerciseFromDTO(row.data));
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

  resetToDefault: async () => {
    await exercisesTable.clear();
    set({ library: new WorkoutLibrary() });
  },
}));