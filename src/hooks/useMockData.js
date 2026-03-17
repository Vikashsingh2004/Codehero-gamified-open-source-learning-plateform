import { useState, useEffect } from 'react';
import { doubtsAPI, sessionsAPI, contestsAPI, coursesAPI, activitiesAPI } from '../services/api';

export const useRealData = () => {
  const [doubts, setDoubts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [contests, setContests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [doubtsRes, sessionsRes, contestsRes, coursesRes, activitiesRes] = await Promise.all([
          doubtsAPI.getAll(),
          sessionsAPI.getAll(),
          contestsAPI.getAll(),
          coursesAPI.getAll(),
          activitiesAPI.getAll()
        ]);
        
        setDoubts(doubtsRes.data);
        setSessions(sessionsRes.data);
        setContests(contestsRes.data);
        setCourses(coursesRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return {
    doubts,
    sessions,
    contests,
    courses,
    activities,
    loading,
    setDoubts,
    setSessions,
    setContests,
    setCourses
  };
};