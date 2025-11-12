import React from 'react';
import { usePermission } from '../../contexts/PermissionContext';

interface PermissionButtonProps {
  /** Permission required to show the button */
  permission: string;
  /** Button click handler */
  onClick: () => void;
  /** Button children/label */
  children: React.ReactNode;
  /** Button className */
  className?: string;
  /** Disable button even if user has permission */
  disabled?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * PermissionButton - Button that only renders if user has permission
 *
 * Usage:
 * ```tsx
 * <PermissionButton
 *   permission="task.create"
 *   onClick={handleCreate}
 *   className="btn btn-primary"
 * >
 *   Tạo task mới
 * </PermissionButton>
 * ```
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  onClick,
  children,
  className = 'btn btn-primary',
  disabled = false,
  type = 'button',
}) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return null;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface ActionMenuItem {
  label: string;
  permission: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

interface PermissionActionMenuProps {
  /** Array of menu items with permissions */
  actions: ActionMenuItem[];
  /** Custom button label */
  buttonLabel?: string;
  /** Custom button className */
  buttonClassName?: string;
}

/**
 * PermissionActionMenu - Dropdown menu with permission-based actions
 *
 * Only shows menu items that the user has permission for.
 *
 * Usage:
 * ```tsx
 * <PermissionActionMenu
 *   buttonLabel="Hành động"
 *   actions={[
 *     {
 *       label: 'Chỉnh sửa',
 *       permission: 'task.update',
 *       onClick: handleEdit,
 *     },
 *     {
 *       label: 'Xóa',
 *       permission: 'task.delete',
 *       onClick: handleDelete,
 *       className: 'text-red-600'
 *     }
 *   ]}
 * />
 * ```
 */
export const PermissionActionMenu: React.FC<PermissionActionMenuProps> = ({
  actions,
  buttonLabel = '•••',
  buttonClassName = 'btn btn-sm btn-ghost',
}) => {
  const { hasPermission } = usePermission();
  const [isOpen, setIsOpen] = React.useState(false);

  // Filter actions based on permissions
  const availableActions = actions.filter(action => hasPermission(action.permission));

  // Don't render if no actions available
  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName}
        type="button"
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
            {availableActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${action.className || ''}`}
                type="button"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
