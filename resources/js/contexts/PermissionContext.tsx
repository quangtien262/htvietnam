import React, { createContext, useContext, ReactNode } from 'react';

interface PermissionContextValue {
  permissions: string[];
  role: {
    name: string;
    display_name: string;
    priority: number;
  } | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

interface PermissionProviderProps {
  permissions: string[];
  role?: {
    name: string;
    display_name: string;
    priority: number;
  } | null;
  children: ReactNode;
}

/**
 * Permission Provider Component
 *
 * Wrap your project-related components with this provider to enable permission checks.
 *
 * Usage:
 * ```tsx
 * <PermissionProvider permissions={projectPermissions} role={userRole}>
 *   <YourComponent />
 * </PermissionProvider>
 * ```
 */
export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  permissions,
  role = null,
  children
}) => {
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every(p => permissions.includes(p));
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        role,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * Permission Hook
 *
 * Hook to access permission checking functions and user role.
 *
 * Usage:
 * ```tsx
 * const { hasPermission, role } = usePermission();
 *
 * if (hasPermission('task.create')) {
 *   // Show create button
 * }
 * ```
 */
export const usePermission = (): PermissionContextValue => {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }

  return context;
};
