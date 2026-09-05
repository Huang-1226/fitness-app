import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { todayISO } from './core/dateUtil';
import { cn } from './lib/utils';
import { useLibraryStore } from './store/libraryStore';
import { useTrainingStore } from './store/trainingStore';
import { useUserStore } from './store/userStore';
import BottomNav from './ui/components/BottomNav';
import { SettingsButton } from './ui/components/SettingsButton';
import HistoryPage from './ui/pages/HistoryPage';
import HomePage from './ui/pages/HomePage';
import LibraryPage from './ui/pages/LibraryPage';
import PlanPage from './ui/pages/PlanPage';
import TrainingPage from './ui/pages/TrainingPage';

const SCROLL_SHOW_SETTINGS = 80;
const ROLLOVER_CHECK_MS = 60_000;

export default function App() {
  const loadUser = useUserStore((s) => s.loadUser);
  const loadAll = useTrainingStore((s) => s.loadAll);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    void Promise.all([loadUser(), loadAll(), loadLibrary()]);
  }, [loadUser, loadAll, loadLibrary]);

  useEffect(() => {
    const onScroll = () => setShowSettings(window.scrollY > SCROLL_SHOW_SETTINGS);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto flex max-w-[640px] justify-end px-4 pt-3 transition-opacity duration-300',
          showSettings ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className={showSettings ? 'pointer-events-auto' : 'pointer-events-none'}>
          <SettingsButton />
        </div>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
      <BottomNav />
    </HashRouter>
  );
}