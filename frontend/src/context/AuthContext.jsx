import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Role definitions ─────────────────────────────────────────────
// admin      → full control: CRUD, audit logs, user management
// manager    → view all, approve requests, issue/return assets
// end-user   → view only their own assigned items, submit requests
export const ROLES = {
  ADMIN:    'admin',
  MANAGER:  'manager',
  END_USER: 'end-user',
};

// Permission map — what each role can do
export const PERMISSIONS = {
  // Assets
  asset_view:    [ROLES.ADMIN, ROLES.MANAGER, ROLES.END_USER],
  asset_create:  [ROLES.ADMIN, ROLES.MANAGER],
  asset_edit:    [ROLES.ADMIN, ROLES.MANAGER],
  asset_delete:  [ROLES.ADMIN],
  asset_qr:      [ROLES.ADMIN, ROLES.MANAGER],
  asset_gatepass:[ROLES.ADMIN, ROLES.MANAGER],

  // Consumables
  consumable_view:     [ROLES.ADMIN, ROLES.MANAGER, ROLES.END_USER],
  consumable_create:   [ROLES.ADMIN, ROLES.MANAGER],
  consumable_stockin:  [ROLES.ADMIN, ROLES.MANAGER],
  consumable_issue:    [ROLES.ADMIN, ROLES.MANAGER],
  consumable_delete:   [ROLES.ADMIN],

  // Audit log
  log_view:     [ROLES.ADMIN, ROLES.MANAGER],
  log_export:   [ROLES.ADMIN],

  // Users
  user_manage:  [ROLES.ADMIN],

  // Locations & Categories
  location_manage:  [ROLES.ADMIN, ROLES.MANAGER],
  category_manage:  [ROLES.ADMIN],

  // Settings
  settings_view:    [ROLES.ADMIN, ROLES.MANAGER],
  settings_edit:    [ROLES.ADMIN],
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser  = localStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // Login — called by Login page after successful API response
  function login(userData, jwtToken) {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Logout — clears all state
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.clear();
  }

  // Permission check helper — use this everywhere instead of role string comparisons
  function can(permission) {
    if (!user) return false;
    const allowed = PERMISSIONS[permission];
    if (!allowed) return false;
    return allowed.includes(user.role);
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

// Custom hook — import this in every component that needs auth
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}