import React from 'react';
import { Calendar, Trophy, Users, TrendingUp, Award, Flame, Target, Clock } from 'lucide-react';

const Dashboard = ({ user, activities }) => {
  const nextLevelExp = (user.level + 1) * 250;
  const progressPercentage = (user.experience / nextLevelExp) * 100;

  const statsCards = [
    {
      title: 'Current Streak',
      value: `${user.streak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Current Rating',
      value: user.rating,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Contribution Points',
      value: user.contributionPoints,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Level Progress',
      value: `${Math.round(progressPercentage)}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600">
          Keep up the great work! You're {user.role === 'mentor' ? 'inspiring others' : 'making excellent progress'}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
            <span className="text-sm text-gray-500">Level {user.level}</span>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{user.experience} XP</span>
              <span>{nextLevelExp} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {nextLevelExp - user.experience} XP to next level
            </p>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h3>
            <div className="flex flex-wrap gap-3">
              {user.badges.slice(0, 6).map((badge, index) => (
                <div key={index} className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-2xl mr-2">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {activities.slice(0, 8).map((activity) => (
              <div key={activity._id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                    <span className="text-xs font-medium text-green-600">+{activity.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No recent activity</p>
              <p className="text-gray-400 text-xs mt-1">Start participating to see your progress here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
