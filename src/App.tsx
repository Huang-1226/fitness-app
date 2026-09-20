import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { todayISO } from './core/dateUtil';
import { useI18n } from './i18n/i18nStore';
import { useLibraryStore } from './store/libraryStore';
import { useTrainingStore } from './store/trainingStore';
import { useUserStore } from './store/userStore';
import BottomNav from './ui/components/BottomNav';

const HomePage = lazy(() => import('./ui/pages/HomePage'));
const TrainingPage = lazy(() => import('./ui/pages/TrainingPage'));
const HistoryPage = lazy(() => import('./ui/pages/HistoryPage'));
const PlanPage = lazy(() => import('./ui/pages/PlanPage'));
const LibraryPage = lazy(() => import('./ui/pages/LibraryPage'));

const ROLLOVER_CHECK_MS = 60_000;

export default function App() {
  const { t } = useI18n();
  const loadUser = useUserStore((s) => s.loadUser);
  const loadAll = useTrainingStore((s) => s.loadAll);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);

  useEffect(() => {
    void Promise.all([loadUser(), loadAll(), loadLibrary()]);
  }, [loadUser, loadAll, loadLibrary]);

  useEffect(() => {
    const checkRollover = () => {
      const t = useTrainingStore.getState().todayTrain;
      if (t && t.getDate() !== todayISO()) {
        void useTrainingStore.getState().loadAll();
      }
    };
    const timer = window.setInterval(checkRollover, ROLLOVER_CHECK_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <HashRouter>
      <Suspense
        fallback={<div className="px-4 pt-4 text-sm text-muted-foreground">{t('common.loading')}</div>}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </HashRouter>
  );
}
