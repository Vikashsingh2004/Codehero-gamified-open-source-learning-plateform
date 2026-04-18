import React, { useState } from 'react';
import { BookOpen, Trophy, Users, HelpCircle, Bell, LogOut, ChevronDown, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ user, activeTab, onTabChange }) => {
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'doubts', label: 'Doubts', icon: HelpCircle },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'courses', label: user.role === 'mentor' ? 'My Courses' : 'Courses', icon: BookOpen },
  ];

  const avatarFallback = user.name?.charAt(0).toUpperCase() || 'U';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CodeHero</span>
            </div>

            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{avatarFallback}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{user.level}</span>
                  </div>
                </div>

                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                  <div className="flex items-center gap-1">
                    {user.role === 'mentor' ? (
                      <span className="text-xs font-medium text-cyan-600 flex items-center gap-0.5">
                        <Shield className="w-3 h-3" />
                        Mentor
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 flex items-center gap-0.5">
                        <User className="w-3 h-3" />
                        User
                      </span>
                    )}
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-yellow-600 font-medium">{user.contributionPoints} pts</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        user.role === 'mentor'
                          ? 'bg-cyan-50 text-cyan-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'mentor' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {user.role === 'mentor' ? 'Mentor' : 'User'}
                      </span>
                      <span className="text-xs text-gray-500">Level {user.level}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </nav>
  );
};

export { Navbar };
