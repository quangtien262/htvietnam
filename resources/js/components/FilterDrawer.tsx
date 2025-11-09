import React from 'react';
import { Drawer, Button, Space } from 'antd';

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  onClear?: () => void;
  title?: string;
  children: React.ReactNode;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  visible,
  onClose,
  onClear,
  title = 'Bộ lọc & Tìm kiếm',
  children
}) => {
  return (
    <Drawer
      title={title}
      placement="left"
      onClose={onClose}
      open={visible}
      width={300}
      footer={
        <Space style={{ width: '100%' }} direction="vertical">
          <Button block type="primary" onClick={onClose}>
            Áp dụng
          </Button>
          {onClear && (
            <Button block onClick={onClear}>
              Xóa bộ lọc
            </Button>
          )}
        </Space>
      }
    >
      {children}
    </Drawer>
  );
};

export default FilterDrawer;
