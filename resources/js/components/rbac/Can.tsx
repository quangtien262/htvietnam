import React from 'react';
import { usePermission } from '../../contexts/PermissionContext';

interface CanProps {
    permission?: string;
    anyPermission?: string[];
    allPermissions?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Can component - Hiện nội dung nếu user CÓ quyền
 * 
 * Usage:
 * <Can permission="project.update">
 *   <Button>Sửa</Button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({
    permission,
    anyPermission,
    allPermissions,
    children,
    fallback = null,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

    let allowed = false;

    if (permission) {
        allowed = hasPermission(permission);
    } else if (anyPermission) {
        allowed = hasAnyPermission(anyPermission);
    } else if (allPermissions) {
        allowed = hasAllPermissions(allPermissions);
    }

    return allowed ? <>{children}</> : <>{fallback}</>;
};

/**
 * Cannot component - Hiện nội dung nếu user KHÔNG có quyền
 * 
 * Usage:
 * <Cannot permission="project.update">
 *   <Alert message="Bạn chỉ có quyền xem" />
 * </Cannot>
 */
export const Cannot: React.FC<CanProps> = ({
    permission,
    anyPermission,
    allPermissions,
    children,
    fallback = null,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

    let allowed = false;

    if (permission) {
        allowed = hasPermission(permission);
    } else if (anyPermission) {
        allowed = hasAnyPermission(anyPermission);
    } else if (allPermissions) {
        allowed = hasAllPermissions(allPermissions);
    }

    return !allowed ? <>{children}</> : <>{fallback}</>;
};
