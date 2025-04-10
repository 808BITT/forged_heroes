import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AppLayout from './components/AppLayout.tsx';
import Dashboard from './components/Dashboard.tsx';
import ToolEditor from './components/ToolEditor.tsx';
import ToolList from './components/ToolList';
import { ThemeProvider } from './components/ui/theme-provider';
import { useToolStore } from './store/toolStore';

function App() {
  const loadToolSpecifications = useToolStore(state => state.loadToolSpecifications);

  // Load tool specifications when the app starts
  useEffect(() => {
    loadToolSpecifications();
  }, [loadToolSpecifications]);

  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tools" element={<ToolList />} />
            <Route path="tools/new" element={<ToolEditor />} />
            <Route path="tools/:id" element={<ToolEditor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
