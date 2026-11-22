import { useState, useEffect } from 'react';
import Layout, { type PageId } from '@/components/Layout';
import { ToastProvider } from '@/components/Toast';
import Dashboard from '@/pages/Dashboard';
import EntryPage from '@/pages/EntryPage';
import ExitPage from '@/pages/ExitPage';
import HistoryPage from '@/pages/HistoryPage';
import CodePage from '@/pages/CodePage';
import {
  loadActive,
  saveActive,
  loadHistory,
  saveHistory,
  type ActiveVehicle,
  type HistoryRecord,
} from '@/lib/parking';

function AppInner() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [active, setActive] = useState<ActiveVehicle[]>(() => loadActive());
  const [history, setHistory] = useState<HistoryRecord[]>(() => loadHistory());

  useEffect(() => {
    saveActive(active);
  }, [active]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleRegister = (vehicle: ActiveVehicle) => {
    setActive((prev) => [...prev, vehicle]);
  };

  const handleExit = (record: HistoryRecord) => {
    setActive((prev) => prev.filter((v) => v.regNo !== record.regNo));
    setHistory((prev) => [record, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <Layout page={page} onNavigate={setPage}>
      {page === 'dashboard' && (
        <Dashboard active={active} history={history} onNavigate={setPage} />
      )}
      {page === 'entry' && <EntryPage active={active} onRegister={handleRegister} />}
      {page === 'exit' && <ExitPage active={active} onExit={handleExit} />}
      {page === 'history' && (
        <HistoryPage history={history} onClear={handleClearHistory} />
      )}
      {page === 'code' && <CodePage />}
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
