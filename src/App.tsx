import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/layout/main-layout';
import ToolEditor from './components/ToolEditor';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { ThemeProvider } from './components/ui/theme-provider';
import { ToastProvider } from "./components/ui/use-toast";
import ArmoryPage from './pages/ArmoryPage';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import HomePage from './pages/HomePage';
import Privacy from './pages/Privacy';
import Support from './pages/Support';
import Terms from './pages/Terms';
import ToolsPage from './pages/ToolsPage';
import { useToolStore } from './store/toolStore';

function App() {
  const loadToolSpecifications = useToolStore(state => state.loadToolSpecifications);
  const isLoaded = useToolStore(state => state.isLoaded);
  const isLoading = useToolStore(state => state.isLoading);
  const error = useToolStore(state => state.error);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) {
      loadToolSpecifications().catch(err => {
        console.error('Failed to load tool specifications:', err);
      });
    }
  }, [isLoaded, loadToolSpecifications]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      switch (e.key) {
        case '1':
          navigate('/dashboard');
          break;
        case '2':
          navigate('/tools');
          break;
        case '3':
          navigate('/contact');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <ErrorBoundary>
          <MainLayout>
            {error && (
              <div className="bg-amber-500/10 border border-amber-500/50 text-amber-500 p-2 text-center text-sm mb-4 rounded-md">
                <strong>Error connecting to server:</strong> {error}
              </div>
            )}

            {isLoading && !isLoaded && (
              <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-lg">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-foreground">Loading Tool Forge...</p>
                </div>
              </div>
            )}

            <Routes>
              <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/tools" element={<ErrorBoundary><ToolsPage /></ErrorBoundary>} />
              <Route path="/tools/new" element={<ErrorBoundary><ToolEditor /></ErrorBoundary>} />
              <Route path="/tools/:id" element={<ErrorBoundary><ToolEditor /></ErrorBoundary>} />
              <Route path="/armory" element={<ErrorBoundary><ArmoryPage /></ErrorBoundary>} />
              <Route path="/documentation" element={<ErrorBoundary><Documentation /></ErrorBoundary>} />
              <Route path="/support" element={<ErrorBoundary><Support /></ErrorBoundary>} />
              <Route path="/privacy" element={<ErrorBoundary><Privacy /></ErrorBoundary>} />
              <Route path="/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
