import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useRealData } from './hooks/useMockData';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Doubts } from './components/Doubts';
import { Mentorship } from './components/Mentorship';
import { Contests } from './components/Contests';
import { Courses } from './components/Courses';
import { Loader } from 'lucide-react';

function App() {
  const { user, loading, toggleRole, updateUser } = useAuth();
  const {
    doubts,
    sessions,
    contests,
    courses,
    activities,
    loading: dataLoading,
    setDoubts,
    setSessions,
    setContests,
    setCourses
  } = useRealData();
  
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading || dataLoading) {
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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to CodeHero</h1>
          <p className="text-gray-600">Please log in to access your account</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} activities={activities} />;
      case 'doubts':
        return <Doubts doubts={doubts} setDoubts={setDoubts} updateUser={updateUser} />;
      case 'mentorship':
        return <Mentorship  userRole={user.role}  />;
      case 'contests':
        return <Contests contests={contests} setContests={setContests}  />;
      case 'courses':
        return user.role === 'mentor' ? <Courses /> : null;
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
        onToggleRole={toggleRole}
      />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;