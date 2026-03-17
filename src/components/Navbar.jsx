import React from 'react';
import { User, BookOpen, Trophy, Users, HelpCircle, Settings, Bell } from 'lucide-react';

const Navbar = ({ user, activeTab, onTabChange, onToggleRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'doubts', label: 'Doubts', icon: HelpCircle },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'contests', label: 'Contests', icon: Trophy },
    ...(user.role === 'mentor' ? [{ id: 'courses', label: 'My Courses', icon: BookOpen }] : [])
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CodeHero</span>
            </div>
            
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === item.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Level {user.level}</span>
                  <span className="text-xs text-yellow-600 font-medium">{user.contributionPoints} pts</span>
                </div>
              </div>
              
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{user.level}</span>
                </div>
              </div>

              <button
                onClick={onToggleRole}
                className="ml-2 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                {user.role === 'user' ? 'Become Mentor' : 'Switch to User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };