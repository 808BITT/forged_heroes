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
import Documentation from './pages/Documentation';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { useToolStore } from './store/toolStore';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const loadToolSpecifications = useToolStore(state => state.loadToolSpecifications);
  const isLoaded = useToolStore(state => state.isLoaded);
  const isLoading = useToolStore(state => state.isLoading);
  const error = useToolStore(state => state.error);

  // Load tool specifications on app initialization
  useEffect(() => {
    if (!isLoaded) {
      loadToolSpecifications().catch(err => {
        console.error('Failed to load tool specifications:', err);
      });
    }
  }, [isLoaded, loadToolSpecifications]);

  return (
    <ThemeProvider defaultTheme="dark">
      <ErrorBoundary>
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
              <Route path="/" element={
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              } />
              <Route path="/dashboard" element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="/tools" element={
                <ErrorBoundary>
                  <ToolsPage />
                </ErrorBoundary>
              } />
              <Route path="/tools/new" element={
                <ErrorBoundary>
                  <ToolEditor />
                </ErrorBoundary>
              } />
              <Route path="/tools/:id" element={
                <ErrorBoundary>
                  <ToolEditor />
                </ErrorBoundary>
              } />
              <Route path="/armory" element={
                <ErrorBoundary>
                  <ArmoryPage />
                </ErrorBoundary>
              } />
              <Route path="/documentation" element={
                <ErrorBoundary>
                  <Documentation />
                </ErrorBoundary>
              } />
              <Route path="/support" element={
                <ErrorBoundary>
                  <Support />
                </ErrorBoundary>
              } />
              <Route path="/privacy" element={
                <ErrorBoundary>
                  <Privacy />
                </ErrorBoundary>
              } />
              <Route path="/terms" element={
                <ErrorBoundary>
                  <Terms />
                </ErrorBoundary>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
