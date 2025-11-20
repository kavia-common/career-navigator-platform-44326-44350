import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getRoles, getRole, isMockMode } from "../api";

/**
 * PUBLIC_INTERFACE
 * AppStateContext provides global app state for role selection and taxonomy access.
 * - selectedCurrentRole: RoleOut | null
 * - selectedTargetRole: RoleOut | null
 * - setSelectedCurrentRole(role)
 * - setSelectedTargetRole(role)
 * - roles: array of roles (from backend if reachable, else local JSON)
 * - refreshRoles(): refetch roles
 *
 * Persistence:
 * - Saves selected role ids in localStorage and restores on mount.
 */

const AppStateContext = createContext(undefined);

const STORAGE_KEYS = {
  currentRoleId: "cn.selectedCurrentRoleId",
  targetRoleId: "cn.selectedTargetRoleId",
};

async function loadLocalJson(file) {
  const resp = await fetch(process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}${file}` : file);
  if (!resp.ok) throw new Error(`Failed to load ${file}`);
  return resp.json();
}

async function loadRolesWithFallback() {
  try {
    if (!isMockMode()) {
      // Prefer backend when available (api.js already has its own fallback)
      const roles = await getRoles();
      if (Array.isArray(roles) && roles.length) return roles;
    }
  } catch (_) {
    // ignore, fallback to local
  }
  // Fallback to local JSON taxonomy
  try {
    const local = await loadLocalJson("/mock/roles.json");
    return Array.isArray(local) ? local : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function AppStateProvider({ children }) {
  /** Context provider that loads roles and persists selected role ids. */
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedCurrentRole, setSelectedCurrentRole] = useState(null);
  const [selectedTargetRole, setSelectedTargetRole] = useState(null);

  // Load roles on mount
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingRoles(true);
      const list = await loadRolesWithFallback();
      if (!ignore) setRoles(list);
      setLoadingRoles(false);
    })();
    return () => { ignore = true; };
  }, []);

  // Restore selected role ids from storage, then resolve to role objects when roles are loaded
  useEffect(() => {
    const cid = localStorage.getItem(STORAGE_KEYS.currentRoleId);
    const tid = localStorage.getItem(STORAGE_KEYS.targetRoleId);
    if (cid && roles.length) {
      const r = roles.find((x) => String(x.id) === String(cid));
      if (r) setSelectedCurrentRole(r);
    }
    if (tid && roles.length) {
      const r = roles.find((x) => String(x.id) === String(tid));
      if (r) setSelectedTargetRole(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.length]);

  // Persist selected ids
  useEffect(() => {
    if (selectedCurrentRole?.id != null) {
      localStorage.setItem(STORAGE_KEYS.currentRoleId, String(selectedCurrentRole.id));
    }
  }, [selectedCurrentRole]);

  useEffect(() => {
    if (selectedTargetRole?.id != null) {
      localStorage.setItem(STORAGE_KEYS.targetRoleId, String(selectedTargetRole.id));
    }
  }, [selectedTargetRole]);

  // Methods
  const refreshRoles = async () => {
    setLoadingRoles(true);
    const list = await loadRolesWithFallback();
    setRoles(list);
    setLoadingRoles(false);
  };

  const value = useMemo(() => ({
    roles,
    loadingRoles,
    selectedCurrentRole,
    selectedTargetRole,
    setSelectedCurrentRole,
    setSelectedTargetRole,
    refreshRoles,
  }), [roles, loadingRoles, selectedCurrentRole, selectedTargetRole]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAppState() {
  /** Hook to access AppStateContext. */
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
