import { create } from 'zustand';
import { todayISO } from '../core/dateUtil';
import { Person } from '../core/person';
import { WeightRecord } from '../core/weightRecord';
import { personFromDTO, personToDTO } from '../db/converters';
import { usersTable } from '../db/db';

const USER_ID = 1;

interface UserState {
  user: Person | null;
  loaded: boolean;
  loadUser: () => Promise<void>;
  createProfile: (gender: string, height: number, weight: number, age: number) => Promise<Person>;
  setActivityCode: (code: number) => Promise<void>;
  addWeightRecord: (weight: number) => Promise<void>;
}

async function persist(p: Person): Promise<void> {
  await usersTable.put({ id: USER_ID, data: personToDTO(p) });
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  loaded: false,

  loadUser: async () => {
    try {
      const row = await usersTable.get(USER_ID);
      if (row) {
        set({ user: personFromDTO(row.data) });
      }
    } finally {
      set({ loaded: true });
    }
  },

  createProfile: async (gender, height, weight, age) => {
    const person = Person.createPerson(gender, height, weight, age);
    await persist(person);
    set({ user: person });
    return person;
  },

  setActivityCode: async (code) => {
    const u = get().user;
    if (!u) return;
    u.setActivityCode(code);
    await persist(u);
    set({ user: u });
  },

  addWeightRecord: async (weight) => {
    const u = get().user;
    if (!u) return;
    const date = todayISO();
    const exists = u.getWeightRecordList().some((r) => r.getRecordDate() === date);
    if (exists) return;
    u.addWeightRecord(new WeightRecord(date, weight));
    await persist(u);
    set({ user: u });
  },
}));