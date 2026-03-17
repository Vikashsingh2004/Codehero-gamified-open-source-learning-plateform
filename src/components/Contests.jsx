import React, { useState } from 'react';
import { Trophy, Calendar, Clock, Users, Code, Star, Award, TrendingUp } from 'lucide-react';

const Contests = ({ contests, setContests }) => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredContests = contests.filter(contest => contest.status === activeTab);

  const handleJoinContest = (contestId) => {
    setContests(prevContests =>
      prevContests.map(contest =>
        contest.id === contestId
          ? {
              ...contest,
              participants: [
                ...contest.participants,
                {
                  userId: '1',
                  userName: 'John Doe',
                  score: 0,
                  submissions: [],
                  rank: contest.participants.length + 1
                }
              ]
            }
          : contest
      )
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (selectedContest) {
    return <ContestDetail contest={selectedContest} onBack={() => setSelectedContest(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programming Contests</h1>
          <p className="text-gray-600 mt-2">Test your skills and compete with other developers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
            <div className="flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Current Rating: 1350</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {['upcoming', 'ongoing', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab} ({contests.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>

      {/* Contests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContests.map((contest) => (
          <div key={contest._id || contest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{contest.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                  {contest.status}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{contest.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <p>Start: {new Date(contest.startTime).toLocaleDateString()}</p>
                    <p>{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <div>
                    <p>Duration</p>
                    <p>{Math.round((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60 * 60))}h</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <div>
                    <p>Participants</p>
                    <p>{contest.participants.length}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Code className="w-4 h-4 mr-2" />
                  <div>
                    <p>Problems</p>
                    <p>{contest.problems.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(contest.difficulty)}`}>
                  {contest.difficulty}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedContest(contest)}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  {contest.status === 'upcoming' && !contest.participants.some(p => p.userId === '1') && (
                    <button
                      onClick={() => handleJoinContest(contest.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Register
                    </button>
                  )}
                  {contest.status === 'ongoing' && contest.participants.some(p => p.userId === '1') && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Enter Contest
                    </button>
                  )}
                  {contest.participants.some(p => p.userId === '1') && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <Award className="w-4 h-4 mr-1" />
                      Registered
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContests.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No {activeTab} contests</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for new contests</p>
        </div>
      )}
    </div>
  );
};

// Contest Detail Component
const ContestDetail = ({ contest, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const isRegistered = contest.participants.some(p => p.userId === '1');
  const userParticipant = contest.participants.find(p => p.userId === '1');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 transition-colors"
      >
        ← Back to Contests
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{contest.title}</h1>
            <p className="text-gray-600">{contest.description}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              contest.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
              contest.status === 'ongoing' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {contest.status}
            </span>
            {userParticipant && (
              <div className="mt-2 text-sm text-gray-600">
                Your Rank: #{userParticipant.rank}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Start Time</p>
            <p className="font-medium">{new Date(contest.startTime).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{Math.round((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60 * 60))} hours</p>
          </div>
          <div className="text-center">
            <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Participants</p>
            <p className="font-medium">{contest.participants.length}</p>
          </div>
          <div className="text-center">
            <Code className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Problems</p>
            <p className="font-medium">{contest.problems.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['overview', 'problems', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contest Rules & Information</h2>
          <div className="prose max-w-none text-gray-700">
            <ul className="space-y-2">
              <li>• This is a {contest.difficulty} level programming contest</li>
              <li>• Contest duration: {Math.round((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60 * 60))} hours</li>
              <li>• Solve problems to earn points and improve your ranking</li>
              <li>• Submissions are evaluated in real-time</li>
              <li>• Faster solutions earn more points</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="space-y-4">
          {contest.problems.map((problem, index) => (
            <div key={problem._id || problem.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {String.fromCharCode(65 + index)}. {problem.title}
                </h3>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    problem.difficulty === 'easy' ? 'text-green-600 bg-green-100' :
                    problem.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-sm font-medium text-blue-600">{problem.points} points</span>
                </div>
              </div>
              <p className="text-gray-600">{problem.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Participant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Problems Solved</th>
                </tr>
              </thead>
              <tbody>
                {contest.participants.sort((a, b) => b.score - a.score).map((participant, index) => (
                  <tr key={participant.userId} className={`border-b border-gray-100 ${participant.userId === '1' ? 'bg-blue-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {index < 3 && (
                          <Trophy className={`w-4 h-4 mr-2 ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-amber-600'
                          }`} />
                        )}
                        #{index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{participant.userName}</td>
                    <td className="py-3 px-4 text-gray-700">{participant.score}</td>
                    <td className="py-3 px-4 text-gray-700">{participant.submissions.filter(s => s.status === 'accepted').length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export { Contests };