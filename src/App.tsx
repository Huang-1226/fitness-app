import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useLibraryStore } from './store/libraryStore';
import { useTrainingStore } from './store/trainingStore';
import { useUserStore } from './store/userStore';
import BottomNav from './ui/components/BottomNav';
import HistoryPage from './ui/pages/HistoryPage';
import HomePage from './ui/pages/HomePage';
import LibraryPage from './ui/pages/LibraryPage';
import PlanPage from './ui/pages/PlanPage';
import TrainingPage from './ui/pages/TrainingPage';

export default function App() {
  const loadUser = useUserStore((s) => s.loadUser);
  const loadAll = useTrainingStore((s) => s.loadAll);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);

  useEffect(() => {
    void Promise.all([loadUser(), loadAll(), loadLibrary()]);
  }, [loadUser, loadAll, loadLibrary]);

  return (
    <HashRouter>
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