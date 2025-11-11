import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, message } from 'antd';
import { SearchOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface Domain {
  id: number;
  domain: string;
  status: string;
  registration_date: string;
  expiry_date: string;
  auto_renew: boolean;
  dns_management: boolean;
  email_forwarding: boolean;
  whois_privacy: boolean;
}

const ClientDomains: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    fetchDomains();
  }, [pagination.current, filters]);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/client/domains', {
        params: {
          page: pagination.current,
          per_page: pagination.pageSize,
          ...filters,
        },
      });
      setDomains(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch {
      message.error('Không thể tải danh sách tên miền');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (domain: Domain) => {
    try {
      await axios.post(`/aio/api/whmcs/client/domains/${domain.id}/renew`);
      message.success('Yêu cầu gia hạn domain thành công');
      fetchDomains();
    } catch {
      message.error('Không thể gia hạn domain');
    }
  };

  const statusColors: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    expired: 'error',
    cancelled: 'default',
    transferred: 'blue',
  };

  const statusLabels: Record<string, string> = {
    active: 'Hoạt động',
    pending: 'Chờ xử lý',
    expired: 'Hết hạn',
    cancelled: 'Đã hủy',
    transferred: 'Đã chuyển',
  };

  const columns: ColumnsType<Domain> = [
    {
      title: 'Tên miền',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registration_date',
      key: 'registration_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => {
        const expiryDate = dayjs(date);
        const daysLeft = expiryDate.diff(dayjs(), 'days');
        const color = daysLeft < 30 ? 'red' : daysLeft < 60 ? 'orange' : 'inherit';
        return <span style={{ color }}>{expiryDate.format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Tự động gia hạn',
      dataIndex: 'auto_renew',
      key: 'auto_renew',
      render: (autoRenew: boolean) => (
        <Tag color={autoRenew ? 'success' : 'default'}>
          {autoRenew ? 'Bật' : 'Tắt'}
        </Tag>
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
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            href={`/aio/whmcs/domains/${record.id}`}
          >
            Quản lý
          </Button>
          {record.status === 'active' && (
            <Button
              type="primary"
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleRenew(record)}
            >
              Gia hạn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Tên miền của tôi"
      extra={
        <Space>
          <Input
            placeholder="Tìm kiếm tên miền..."
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
            <Option value="active">Hoạt động</Option>
            <Option value="pending">Chờ xử lý</Option>
            <Option value="expired">Hết hạn</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={domains}
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
  );
};

export default ClientDomains;
