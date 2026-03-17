import { useState, useEffect } from "react";

// Mock current user - in real app this would come from authentication
const mockUser = {
  id: "1",
  name: "Vikash Singh",
  email: "Vikash@codehero.dev",
  avatar:
    "https://res.cloudinary.com/dqzq0cjnr/image/upload/v1755711659/WhatsApp_Image_2025-04-29_at_18.04.51_eb6aea5b_elmq4o.jpg",
  role: "user",
  level: 5,
  experience: 1250,
  streak: 15,
  rating: 1350,
  contributionPoints: 2500,
  badges: [
    {
      id: "1",
      name: "First Doubt",
      description: "Created your first doubt",
      icon: "❓",
      earnedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Helper",
      description: "Solved 10 doubts",
      icon: "🤝",
      earnedAt: new Date("2024-01-20"),
    },
    {
      id: "3",
      name: "Streak Master",
      description: "Maintained 7-day streak",
      icon: "🔥",
      earnedAt: new Date("2024-01-25"),
    },
  ],
  joinedAt: new Date("2024-01-01"),
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleRole = () => {
    if (user) {
      setUser({
        ...user,
        role: user.role === "user" ? "mentor" : "user",
      });
    }
  };

  return {
    user,
    loading,
    toggleRole,
  };
};
