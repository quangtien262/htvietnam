import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Table,
  Descriptions,
  Divider,
  Timeline,
  Button
} from 'antd';
import { DollarOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';
import dayjs from 'dayjs';

interface PaymentModalProps {
  visible: boolean;
  congNo: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentHistory {
  id: number;
  so_tien: number;
  ghi_chu: string;
  ten_nguoi_thanh_toan: string;
  created_at: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, congNo, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (visible && congNo) {
      loadPaymentHistory();
    }
  }, [visible, congNo]);

  const loadPaymentHistory = async () => {
    if (!congNo) return;

    setLoadingHistory(true);
    try {
      const res = await axios.post(API.congNoPaymentHistory, {
        cong_no_id: congNo.id
      });

      if (res.data.status_code === 200) {
        setHistory(res.data.data.list || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử thanh toán:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (values.so_tien_thanh_toan > congNo.so_tien_no) {
        message.error('Số tiền thanh toán không được lớn hơn số tiền nợ');
        return;
      }

      setLoading(true);

      const res = await axios.post(API.congNoPayment, {
        id: congNo.id,
        so_tien_thanh_toan: values.so_tien_thanh_toan,
        ghi_chu: values.ghi_chu || ''
      });

      if (res.data.status_code === 200) {
        message.success('Thanh toán thành công');
        form.resetFields();
        onSuccess();
        loadPaymentHistory();
      }
    } catch (error) {
      message.error('Lỗi khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (!congNo) return null;

  return (
    <Modal
      title={
        <span>
          <DollarOutlined style={{ marginRight: 8 }} />
          Thanh toán công nợ
        </span>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      width={800}
      okText="Thanh toán"
      cancelText="Đóng"
      confirmLoading={loading}
    >
      <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Mã công nợ">{congNo.code}</Descriptions.Item>
        <Descriptions.Item label="Tiêu đề">{congNo.name}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền HĐ">
          <strong style={{ color: '#1890ff' }}>{formatCurrency(congNo.tong_tien_hoa_don)}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Đã thanh toán">
          <strong style={{ color: 'green' }}>{formatCurrency(congNo.so_tien_da_thanh_toan)}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Còn nợ" span={2}>
          <strong style={{ color: 'red', fontSize: 16 }}>{formatCurrency(congNo.so_tien_no)}</strong>
        </Descriptions.Item>
      </Descriptions>

      <Divider>Thanh toán</Divider>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Số tiền thanh toán"
          name="so_tien_thanh_toan"
          rules={[
            { required: true, message: 'Vui lòng nhập số tiền' },
            {
              validator: (_, value) => {
                if (value && value > congNo.so_tien_no) {
                  return Promise.reject('Số tiền không được lớn hơn số tiền nợ');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập số tiền thanh toán"
            max={congNo.so_tien_no}
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="ghi_chu">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            onClick={() => form.setFieldsValue({ so_tien_thanh_toan: congNo.so_tien_no })}
          >
            Thanh toán hết
          </Button>
          <Button
            size="small"
            onClick={() => form.setFieldsValue({ so_tien_thanh_toan: congNo.so_tien_no / 2 })}
          >
            Thanh toán 50%
          </Button>
        </div>
      </Form>

      <Divider>
        <HistoryOutlined /> Lịch sử thanh toán
      </Divider>

      {history.length > 0 ? (
        <Timeline
          items={history.map((item) => ({
            color: 'green',
            children: (
              <div>
                <div><strong>{formatCurrency(item.so_tien)}</strong></div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {item.ten_nguoi_thanh_toan} - {dayjs(item.created_at).format('DD/MM/YYYY HH:mm')}
                </div>
                {item.ghi_chu && (
                  <div style={{ fontSize: 12, fontStyle: 'italic' }}>{item.ghi_chu}</div>
                )}
              </div>
            )
          }))}
        />
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
          Chưa có lịch sử thanh toán
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
