# Fitness App (React PWA)

A cross-platform PWA version of the Java **Fitness Management System**. The app is a pure frontend with local persistence: no server, no account, and no app store required.

- **No server:** static frontend plus IndexedDB; data stays on the device.
- **Cross-platform:** works on Android, iPhone, and desktop browsers; can be added to the home screen and run full-screen.
- **Offline:** a service worker caches the app shell and assets, so it keeps working without a network.
- **No app store:** deploy to GitHub Pages or Vercel as a static site.

## Live demo

https://huang-1226.github.io/fitness-app/

## Tech stack

- **Language:** TypeScript (business logic ported from the Java version)
- **Framework:** React 19 + Vite
- **State management:** Zustand
- **Local database:** IndexedDB + Dexie
- **PWA:** `vite-plugin-pwa` (manifest + service worker)

## Architecture

```text
src/
├── core/        # business logic ported from the Java model/util/workout layers
│   ├── person.ts
│   ├── dailyTraining.ts
│   ├── workoutLog.ts
│   ├── cardioRecord.ts
│   ├── exercise.ts
│   ├── muscleRecoverRule.ts
│   ├── nutritionCalculator.ts
│   └── workoutLibrary.ts
├── db/          # persistence layer
│   ├── types.ts             # IndexedDB DTOs
│   ├── converters.ts        # class ⇄ DTO conversion
│   └── db.ts                # Dexie table definitions
├── store/       # Zustand state layer
│   ├── userStore.ts
│   ├── trainingStore.ts
│   └── libraryStore.ts
└── ui/          # React interface
    ├── components/
    └── pages/   # home, training, history, plans, exercise library
```

### Data flow

```text
user action → React component → Zustand action → core function → Dexie/IndexedDB
                                   ↑                              ↓
                              state update ←──────────────── data query
```

The three Java serialization files map to IndexedDB tables:

| Java CLI | PWA |
|---|---|
| `user.dat` | `users` table (id = 1) |
| `history.dat` | `trainings` table (date as key) |
| `exercise.dat` | `exercises` table (name as key) |

## Quick start

```bash
npm install
npm run dev      # local development at http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
npm run verify   # logic-layer regression test (tsx scripts/verify.ts)
```

## Deploy to GitHub Pages

```bash
npm run build
# push dist/ to the gh-pages branch, or deploy with a GitHub Actions workflow
```

Then enable GitHub Pages for the repository. When deploying to a subpath, set `base` in `vite.config.ts` (for example, `/fitness-app/`). On a phone, open the live URL and choose “Add to Home Screen”.

## Relationship to the Java version

The 19 CLI menu functions are mapped to five pages: profile/BMI, weight tracking, today's training (strength, cardio, calories, archive), history and 7-day statistics, workout plans, muscle filtering, diet plan, and the exercise library.

The original Java project is [FitnessManagementSystem](https://github.com/Huang-1226/FitnessManagementSystem).

---

© 2026 Huang1226 · [GitHub](https://github.com/Huang-1226)
