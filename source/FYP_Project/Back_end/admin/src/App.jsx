import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Scenarios from './pages/Scenarios';
import UserReports from './pages/UserReports';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === 'true'
  );
  const [language, setLanguage] = useState(
    () => sessionStorage.getItem('admin_lang') || 'en'
  );

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'zh' : 'en';
    setLanguage(next);
    sessionStorage.setItem('admin_lang', next);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar onLogout={handleLogout} language={language} onToggleLang={toggleLanguage} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard language={language} />} />
            <Route path="/users" element={<Users language={language} />} />
            <Route path="/scenarios" element={<Scenarios language={language} />} />
            <Route path="/reports" element={<UserReports language={language} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;