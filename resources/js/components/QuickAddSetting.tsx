import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Space, ColorPicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '../common/api';

interface QuickAddSettingProps {
  tableName: string;
  buttonText?: string;
  buttonType?: 'link' | 'text' | 'default' | 'primary' | 'dashed';
  buttonSize?: 'small' | 'middle' | 'large';
  showAsTag?: boolean;
  onSuccess?: (newItem: any) => void;
  modalTitle?: string;
  hasColor?: boolean;
  placeholder?: string;
}

/**
 * Component "Thêm nhanh" setting cho các bảng common
 * Sử dụng API CommonSettingController
 */
const QuickAddSetting: React.FC<QuickAddSettingProps> = ({
  tableName,
  buttonText = 'Thêm nhanh',
  buttonType = 'link',
  buttonSize = 'small',
  showAsTag = false,
  onSuccess,
  modalTitle,
  hasColor = true,
  placeholder = 'Nhập tên...'
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedColor, setSelectedColor] = useState<string>('#1890ff');

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent events
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedColor('#1890ff');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload: any = {
        name: values.name,
      };

      if (hasColor) {
        payload.color = selectedColor;
      }

      const res = await axios.post(API.commonSettingAdd(tableName), payload);

      if (res.data.status_code === 200) {
        message.success('Thêm mới thành công');
        
        // Gọi callback với item mới
        if (onSuccess) {
          const newItem = {
            id: res.data.data.id,
            name: values.name,
            color: selectedColor,
            ...res.data.data
          };
          onSuccess(newItem);
        }

        handleCancel();
      } else {
        message.error(res.data.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderButton = () => {
    if (showAsTag) {
      return (
        <Button
          type="link"
          size="small"
          onClick={handleOpen}
          icon={<PlusOutlined />}
          style={{ 
            padding: '0 8px',
            height: '22px',
            fontSize: '12px',
            color: '#1890ff'
          }}
        />
      );
    }

    return (
      <Button
        type={buttonType}
        size={buttonSize}
        icon={<PlusOutlined />}
        onClick={handleOpen}
      >
        {buttonText}
      </Button>
    );
  };

  return (
    <>
      {renderButton()}

      <Modal
        title={modalTitle || `Thêm nhanh ${buttonText.toLowerCase()}`}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Thêm"
        cancelText="Hủy"
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input placeholder={placeholder} autoFocus />
          </Form.Item>

          {hasColor && (
            <Form.Item label="Màu sắc">
              <Space>
                <ColorPicker
                  value={selectedColor}
                  onChange={(color) => setSelectedColor(color.toHexString())}
                />
                <span style={{ color: '#8c8c8c' }}>{selectedColor}</span>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default QuickAddSetting;
