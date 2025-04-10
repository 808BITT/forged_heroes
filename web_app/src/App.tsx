import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/main-layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import HomePage from './pages/HomePage.tsx';
import ToolEditor from './components/ToolEditor.tsx';
import { ThemeProvider } from './components/ui/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="tools/new" element={<ToolEditor />} />
            <Route path="tools/:id" element={<ToolEditor />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
