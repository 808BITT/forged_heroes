import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/main-layout';
import ToolEditor from './components/ToolEditor';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { ThemeProvider } from './components/ui/theme-provider';
import ArmoryPage from './pages/ArmoryPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import { useToolStore } from './store/toolStore';

function App() {
  const loadToolSpecifications = useToolStore(state => state.loadToolSpecifications);
  const isLoaded = useToolStore(state => state.isLoaded);
  const isLoading = useToolStore(state => state.isLoading);
  const error = useToolStore(state => state.error);

  // Load tool specifications on app initialization
  useEffect(() => {
    if (!isLoaded) {
      loadToolSpecifications();
    }
  }, [isLoaded, loadToolSpecifications]);

  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
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
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/new" element={<ToolEditor />} />
            <Route path="/tools/:id" element={<ToolEditor />} />
            <Route path="/armory" element={<ArmoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
