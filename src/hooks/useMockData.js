import { useState, useEffect } from 'react';
import { doubtsAPI, activitiesAPI } from '../services/api';

export const useRealData = () => {
  const [doubts, setDoubts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [doubtsRes, activitiesRes] = await Promise.all([
          doubtsAPI.getAll(),
          activitiesAPI.getAll(),
        ]);
        setDoubts(doubtsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    doubts,
    activities,
    loading,
    setDoubts,
  };
};
