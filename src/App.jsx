import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useRealData } from './hooks/useMockData';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Doubts } from './components/Doubts';
import { Mentorship } from './components/Mentorship';
import { Contests } from './components/Contests';
import { Courses } from './components/Courses';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import { Loader } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const {
    doubts,
    activities,
    loading: dataLoading,
    setDoubts,
  } = useRealData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading CodeHero...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'login') {
      return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
    }
    return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} activities={activities} />;
      case 'doubts':
        return <Doubts doubts={doubts} setDoubts={setDoubts} />;
      case 'mentorship':
        return <Mentorship userRole={user.role} currentUser={user} />;
      case 'contests':
        return <Contests currentUser={user} />;
      case 'courses':
        return <Courses currentUser={user} />;
      default:
        return <Dashboard user={user} activities={activities} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
