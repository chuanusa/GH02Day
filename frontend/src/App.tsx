
import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { DailyLogForm } from './components/DailyLogForm';
import { ProjectManagement } from './components/ProjectManagement';
import { UserManagement } from './components/UserManagement';
import { HolidayManagement } from './components/HolidayManagement';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'dailyLog' | 'projects' | 'users' | 'holidays'>('dashboard');

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'dailyLog': return <DailyLogForm user={user} />;
      case 'projects': return <ProjectManagement />;
      case 'users': return <UserManagement />;
      case 'holidays': return <HolidayManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto">
            <h1 className="text-3xl font-bold text-gray-900 cursor-pointer flex-shrink-0" onClick={() => setCurrentView('dashboard')}>
              工程日誌系統
            </h1>
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px - 3 py - 2 rounded - md text - sm font - medium whitespace - nowrap ${currentView === 'dashboard' ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-200'} `}
              >
                儀表板
              </button>
              <button
                onClick={() => setCurrentView('dailyLog')}
                className={`px - 3 py - 2 rounded - md text - sm font - medium whitespace - nowrap ${currentView === 'dailyLog' ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-200'} `}
              >
                填寫日誌
              </button>
              <button
                onClick={() => setCurrentView('projects')}
                className={`px - 3 py - 2 rounded - md text - sm font - medium whitespace - nowrap ${currentView === 'projects' ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-200'} `}
              >
                工程管理
              </button>
              {user.role === '管理員' && (
                <>
                  <button
                    onClick={() => setCurrentView('users')}
                    className={`px - 3 py - 2 rounded - md text - sm font - medium whitespace - nowrap ${currentView === 'users' ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-200'} `}
                  >
                    使用者
                  </button>
                  <button
                    onClick={() => setCurrentView('holidays')}
                    className={`px - 3 py - 2 rounded - md text - sm font - medium whitespace - nowrap ${currentView === 'holidays' ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-200'} `}
                  >
                    假日/TBM
                  </button>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-gray-600 hidden md:inline">歡迎, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
            >
              登出
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;

