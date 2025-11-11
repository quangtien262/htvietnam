import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, message, Modal, Form, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  department: string;
  priority: string;
  status: string;
  last_reply: string;
  created_at: string;
  updated_at: string;
}

const ClientTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    fetchTickets();
  }, [pagination.current, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/user/tickets', {
        params: {
          page: pagination.current,
          per_page: pagination.pageSize,
          ...filters,
        },
      });
      setTickets(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch {
      message.error('Không thể tải danh sách ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (values: any) => {
    try {
      await axios.post('/aio/api/whmcs/user/tickets', values);
      message.success('Tạo ticket thành công');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchTickets();
    } catch {
      message.error('Không thể tạo ticket');
    }
  };

  const priorityColors: Record<string, string> = {
    low: 'blue',
    medium: 'orange',
    high: 'red',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
  };

  const statusColors: Record<string, string> = {
    open: 'processing',
    answered: 'success',
    'customer-reply': 'warning',
    closed: 'default',
  };

  const statusLabels: Record<string, string> = {
    open: 'Mở',
    answered: 'Đã trả lời',
    'customer-reply': 'Chờ phản hồi',
    closed: 'Đã đóng',
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: 'Mã ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (ticketNumber: string, record) => (
        <a href={`/aio/whmcs/tickets/${record.id}`}>{ticketNumber}</a>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>{priorityLabels[priority] || priority}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: 'Phản hồi cuối',
      dataIndex: 'last_reply',
      key: 'last_reply',
      render: (lastReply: string) => lastReply || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            href={`/aio/whmcs/tickets/${record.id}`}
          >
            Xem
          </Button>
          {record.status !== 'closed' && (
            <Button
              type="link"
              icon={<MessageOutlined />}
              href={`/aio/whmcs/tickets/${record.id}#reply`}
            >
              Trả lời
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Hỗ trợ kỹ thuật"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm ticket..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="open">Mở</Option>
              <Option value="answered">Đã trả lời</Option>
              <Option value="customer-reply">Chờ phản hồi</Option>
              <Option value="closed">Đã đóng</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo Ticket Mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </Card>

      <Modal
        title="Tạo Ticket Hỗ Trợ Mới"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTicket}
        >
          <Form.Item
            label="Phòng ban"
            name="department"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
          >
            <Select placeholder="Chọn phòng ban">
              <Option value="technical">Kỹ thuật</Option>
              <Option value="billing">Thanh toán</Option>
              <Option value="sales">Kinh doanh</Option>
              <Option value="support">Hỗ trợ chung</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Độ ưu tiên"
            name="priority"
            rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
            initialValue="medium"
          >
            <Select placeholder="Chọn độ ưu tiên">
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Tiêu đề"
            name="subject"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Mô tả ngắn gọn vấn đề của bạn" />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="message"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea
              rows={6}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
            />
          </Form.Item>

          <Text type="secondary">
            Chúng tôi sẽ phản hồi ticket của bạn trong vòng 24 giờ làm việc.
          </Text>
        </Form>
      </Modal>
    </>
  );
};

export default ClientTickets;
