import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Role definitions ─────────────────────────────────────────────
export const ROLES = {
  ADMIN:    'admin',
  MANAGER:  'manager',
  END_USER: 'end-user',
};

// Permission map — remains exactly as you defined
export const PERMISSIONS = {
  asset_view:      [ROLES.ADMIN, ROLES.MANAGER, ROLES.END_USER],
  asset_create:    [ROLES.ADMIN, ROLES.MANAGER],
  asset_edit:      [ROLES.ADMIN, ROLES.MANAGER],
  asset_delete:    [ROLES.ADMIN],
  asset_qr:        [ROLES.ADMIN, ROLES.MANAGER],
  asset_gatepass:  [ROLES.ADMIN, ROLES.MANAGER],

  consumable_view:     [ROLES.ADMIN, ROLES.MANAGER, ROLES.END_USER],
  consumable_create:   [ROLES.ADMIN, ROLES.MANAGER],
  consumable_stockin:  [ROLES.ADMIN, ROLES.MANAGER],
  consumable_issue:    [ROLES.ADMIN, ROLES.MANAGER],
  consumable_delete:   [ROLES.ADMIN],

  log_view:     [ROLES.ADMIN, ROLES.MANAGER],
  log_export:   [ROLES.ADMIN],

  user_manage:  [ROLES.ADMIN],

  location_manage:  [ROLES.ADMIN, ROLES.MANAGER],
  category_manage:  [ROLES.ADMIN],

  settings_view:    [ROLES.ADMIN, ROLES.MANAGER],
  settings_edit:    [ROLES.ADMIN],
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Rehydrate & Validate Session ───────────────────────────────
  useEffect(() => {
    function rehydrate() {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser  = localStorage.getItem('user');

        // Check if token looks like a real JWT (has segments) 
        // to prevent the "Not enough segments" 422 error on boot.
        if (savedToken && savedToken.includes('.') && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else if (savedToken) {
          // If token exists but is malformed (mock-token), clear it
          console.warn("Malformed token detected, clearing session.");
          logout();
        }
      } catch (err) {
        console.error("Auth Rehydration Error:", err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    rehydrate();
  }, []);

  // ─── Authentic Login ─────────────────────────────────────────────
  // This is called by your LoginPage.jsx after a successful 
  // response from your Python /api/login route.
  function login(userData, jwtToken) {
    if (!jwtToken || !jwtToken.includes('.')) {
      console.error("Attempted to login with invalid JWT format.");
      return;
    }
    
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // ─── Clear All State ─────────────────────────────────────────────
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // We don't use .clear() to avoid wiping other non-auth app settings
  }

  // ─── Permission Check ────────────────────────────────────────────
  function can(permission) {
    if (!user || !user.role) return false;
    const allowed = PERMISSIONS[permission];
    return allowed ? allowed.includes(user.role) : false;
  }

  // Convenience booleans
  const isAdmin   = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const isEndUser = user?.role === ROLES.END_USER;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, can,
      isAdmin, isManager, isEndUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}