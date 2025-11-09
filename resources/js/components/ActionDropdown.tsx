import React from 'react';
import { Button, Dropdown, Modal } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface ActionDropdownProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirmTitle?: string;
  deleteConfirmContent?: string;
  extraActions?: MenuProps['items'];
  record?: any;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onEdit,
  onDelete,
  deleteConfirmTitle = 'Xác nhận xóa',
  deleteConfirmContent = 'Bạn có chắc chắn muốn xóa?',
  extraActions = [],
  record
}) => {
  const menuItems: MenuProps['items'] = [
    ...(extraActions || []),
    ...(onEdit ? [{
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Sửa',
      onClick: onEdit
    }] : []),
    ...(onEdit && onDelete ? [{ type: 'divider' as const }] : []),
    ...(onDelete ? [{
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: deleteConfirmTitle,
          content: deleteConfirmContent,
          okText: 'Có',
          cancelText: 'Không',
          onOk: onDelete
        });
      }
    }] : [])
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="link" icon={<MoreOutlined />}>
        Thao tác
      </Button>
    </Dropdown>
  );
};
