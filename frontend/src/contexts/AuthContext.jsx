import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authFetch,
  API_BASE_URL as API_URL,
  getAccessToken,
  storeSession,
  clearSession,
} from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local session on mount
    const checkUser = async () => {
      try {
        const token = getAccessToken();
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
      // Pass the token explicitly so this never depends on localStorage
      // having already been written by the caller.
      const response = await authFetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    const cleanEmail = (email || '').trim();
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        first_name: (userData?.first_name || '').trim(),
        last_name: (userData?.last_name || '').trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || "Échec de l'inscription";
      throw new Error(message);
    }

    const data = await response.json();
    if (data?.session) {
      storeSession(data.session);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return { data, error: null };
  };

  const signIn = async (email, password) => {
    const requestBody = { email, password };

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorMessage = 'Échec de la connexion';
      try {
        const errorData = await response.json();
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || errorMessage;
      } catch (_) {
        if (response.status >= 500) {
          errorMessage = 'Le service est temporairement indisponible. Veuillez réessayer plus tard.';
        }
      }
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    
    if (data.session) {
      // storeSession keeps access_token and the full session (which carries the
      // rotating refresh_token) in one place.
      storeSession(data.session);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await fetchProfile(data.session.access_token);
    }

    return { data, error: null };
  };

  const signOut = async () => {
    clearSession();
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  // Premium is derived only from the server-returned profile. There is
  // deliberately no client-side path that can set it.
  const isPremium = profile?.is_premium || false;

  // Role is derived server-side and returned by GET /profile.
  // Defaults to 'user' — never set by the client.
  const role = profile?.role || 'user';
  const isAdmin = role === 'admin';

  const refreshProfile = async () => {
    const token = getAccessToken();
    if (token) await fetchProfile(token);
  };

  const value = {
    user,
    profile,
    isPremium,
    role,
    isAdmin,
    signUp,
    signIn,
    signOut,
    refreshProfile,
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
