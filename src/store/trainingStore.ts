import { create } from 'zustand';
import { CardioRecord } from '../core/cardioRecord';
import { todayISO } from '../core/dateUtil';
import { DailyTraining } from '../core/dailyTraining';
import { WorkoutLog } from '../core/workoutLog';
import { trainingFromDTO, trainingToDTO } from '../db/converters';
import { trainingsTable, type TrainingRow } from '../db/db';
import { useUserStore } from './userStore';

const TODAY_KEY = 'TODAY';

interface TrainingState {
  todayTrain: DailyTraining | null;
  history: DailyTraining[];
  loaded: boolean;
  loadAll: () => Promise<void>;
  createToday: () => void;
  clearToday: () => void;
  addWorkoutLog: (log: WorkoutLog) => void;
  addWorkoutLogs: (logs: WorkoutLog[]) => void;
  addCardio: (c: CardioRecord) => void;
  setRemark: (r: string) => void;
  archiveToday: () => Promise<void>;
  deleteTraining: (date: string) => Promise<void>;
}

function isRealDate(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

function hasTrainingContent(t: DailyTraining): boolean {
  if (t.getCardioList().length > 0) return true;
  for (const log of t.getWorkoutLogs()) {
    if (log.getSetRecords().length > 0) return true;
  }
  return false;
}

function persistToday(t: DailyTraining): void {
  void trainingsTable.put({ date: TODAY_KEY, data: trainingToDTO(t) });
}

export const useTrainingStore = create<TrainingState>()((set, get) => ({
  todayTrain: null,
  history: [],
  loaded: false,

  loadAll: async () => {
    try {
      const all = await trainingsTable.toArray();
      const todayRow = all.find((r) => r.date === TODAY_KEY);
      let todayTrain = todayRow ? trainingFromDTO(todayRow.data) : null;

      // 跨天：把过期的「今日训练」归档到真实日期，并从内存列表同步，避免二次全表读取
      if (todayTrain && todayTrain.getDate() !== todayISO()) {
        const stale = todayTrain;
        if (hasTrainingContent(stale)) {
          const archivedRow: TrainingRow = { date: stale.getDate(), data: trainingToDTO(stale) };
          await trainingsTable.put(archivedRow);
          const idx = all.findIndex((r) => r.date === archivedRow.date);
          if (idx >= 0) all[idx] = archivedRow;
          else all.push(archivedRow);
        }
        await trainingsTable.delete(TODAY_KEY);
        todayTrain = null;
      }

      const rows = all
        .filter((r) => r.date !== TODAY_KEY && isRealDate(r.date))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      const validRows: TrainingRow[] = [];
      for (const row of rows) {
        if (hasTrainingContent(trainingFromDTO(row.data))) {
          validRows.push(row);
        } else {
          await trainingsTable.delete(row.date);
        }
      }
      set({
        todayTrain,
        history: validRows.map((r) => trainingFromDTO(r.data)),
      });
    } finally {
      set({ loaded: true });
    }
  },

  createToday: () => {
    const user = useUserStore.getState().user;
    if (!user) {
      throw new Error('请先创建个人档案');
    }
    const t = new DailyTraining(user);
    set({ todayTrain: t });
    persistToday(t);
  },

  clearToday: () => {
    set({ todayTrain: null });
    void trainingsTable.delete(TODAY_KEY);
  },

  addWorkoutLog: (log) => {
    const t = get().todayTrain;
    if (!t) return;
    t.addWorkoutLog(log);
    const next = t.clone();
    set({ todayTrain: next });
    persistToday(next);
  },

  addWorkoutLogs: (logs) => {
    const t = get().todayTrain;
    if (!t || logs.length === 0) return;
    for (const log of logs) t.addWorkoutLog(log);
    const next = t.clone();
    set({ todayTrain: next });
    persistToday(next);
  },

  addCardio: (c) => {
    const t = get().todayTrain;
    if (!t) return;
    t.addCardio(c);
    const next = t.clone();
    set({ todayTrain: next });
    persistToday(next);
  },

  setRemark: (r) => {
    const t = get().todayTrain;
    if (!t) return;
    t.setRemark(r);
    const next = t.clone();
    set({ todayTrain: next });
    persistToday(next);
  },

  archiveToday: async () => {
    const t = get().todayTrain;
    if (!t) return;
    const dateKey = t.getDate();
    await trainingsTable.delete(TODAY_KEY);
    if (!hasTrainingContent(t)) {
      set({ todayTrain: null });
      return;
    }
    const dto = trainingToDTO(t);
    await trainingsTable.put({ date: dateKey, data: dto });
    const archived = trainingFromDTO(dto);
    set({
      todayTrain: null,
      history: [archived, ...get().history.filter((h) => h.getDate() !== dateKey)],
    });
  },

  deleteTraining: async (date) => {
    await trainingsTable.delete(date);
    set({ history: get().history.filter((t) => t.getDate() !== date) });
  },
}));
