import React, { createContext, useContext, useState, useEffect } from 'react';
import { authFetch } from '../lib/api';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local session on mount
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          await fetchProfile(token);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await authFetch(`${API_URL}/profile`);
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      } else {
        console.warn("Failed to fetch profile, status:", response.status);
        if (response.status === 401) {
          signOut();
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const signUp = async (email, password, userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();
    return { data, error: null };
  };

  const signIn = async (email, password) => {
    const requestBody = { email, password };
    console.log("AuthContext - Request Body:", requestBody);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    if (data.session) {
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('session', JSON.stringify(data.session));
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await fetchProfile(data.session.access_token);
    }

    return { data, error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  const isPremium = profile?.is_premium || false;

  const value = {
    user,
    profile,
    isPremium,
    signUp,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
