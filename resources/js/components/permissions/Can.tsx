import React, { ReactNode } from 'react';
import { usePermission } from '../../contexts/PermissionContext';

interface CanProps {
  /** Single permission to check */
  permission?: string;
  /** Multiple permissions - user must have at least one */
  anyPermission?: string[];
  /** Multiple permissions - user must have all of them */
  allPermissions?: string[];
  /** Content to render if user has permission */
  children: ReactNode;
  /** Optional fallback content if permission denied */
  fallback?: ReactNode;
}

/**
 * Can Component - Conditional rendering based on permissions
 *
 * Usage examples:
 *
 * 1. Single permission:
 * ```tsx
 * <Can permission="task.create">
 *   <button>Tạo task mới</button>
 * </Can>
 * ```
 *
 * 2. Any of multiple permissions:
 * ```tsx
 * <Can anyPermission={['task.update', 'task.update_own']}>
 *   <button>Chỉnh sửa</button>
 * </Can>
 * ```
 *
 * 3. All permissions required:
 * ```tsx
 * <Can allPermissions={['task.delete', 'project.update']}>
 *   <button>Xóa task</button>
 * </Can>
 * ```
 *
 * 4. With fallback:
 * ```tsx
 * <Can permission="task.create" fallback={<span>Bạn không có quyền tạo task</span>}>
 *   <button>Tạo task</button>
 * </Can>
 * ```
 */
export const Can: React.FC<CanProps> = ({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let canRender = false;

  if (permission) {
    canRender = hasPermission(permission);
  } else if (anyPermission) {
    canRender = hasAnyPermission(anyPermission);
  } else if (allPermissions) {
    canRender = hasAllPermissions(allPermissions);
  }

  return <>{canRender ? children : fallback}</>;
};

interface CannotProps {
  /** Single permission to check */
  permission?: string;
  /** Multiple permissions - renders if user lacks at least one */
  anyPermission?: string[];
  /** Content to render if user does NOT have permission */
  children: ReactNode;
}

/**
 * Cannot Component - Inverse of Can component
 *
 * Renders content only if user does NOT have the permission.
 *
 * Usage:
 * ```tsx
 * <Cannot permission="project.delete">
 *   <p>Bạn không thể xóa dự án này</p>
 * </Cannot>
 * ```
 */
export const Cannot: React.FC<CannotProps> = ({
  permission,
  anyPermission,
  children
}) => {
  const { hasPermission, hasAnyPermission } = usePermission();

  let cannotRender = false;

  if (permission) {
    cannotRender = !hasPermission(permission);
  } else if (anyPermission) {
    cannotRender = !hasAnyPermission(anyPermission);
  }

  return <>{cannotRender ? children : null}</>;
};

interface RoleCheckProps {
  /** Role names to check (e.g., 'admin', 'manager') */
  roles: string | string[];
  /** Content to render if user has the role */
  children: ReactNode;
  /** Optional fallback if role check fails */
  fallback?: ReactNode;
}

/**
 * RoleCheck Component - Conditional rendering based on user role
 *
 * Usage:
 * ```tsx
 * <RoleCheck roles="admin">
 *   <button>Xóa dự án</button>
 * </RoleCheck>
 *
 * <RoleCheck roles={['admin', 'manager']}>
 *   <button>Quản lý thành viên</button>
 * </RoleCheck>
 * ```
 */
export const RoleCheck: React.FC<RoleCheckProps> = ({
  roles,
  children,
  fallback = null
}) => {
  const { role } = usePermission();

  if (!role) {
    return <>{fallback}</>;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasRole = roleArray.includes(role.name);

  return <>{hasRole ? children : fallback}</>;
};
