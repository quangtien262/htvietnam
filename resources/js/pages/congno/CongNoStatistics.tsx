import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';

interface StatisticsData {
  tong_so_cong_no: number;
  tong_tien_cong_no: number;
  no_phai_tra: number;
  no_can_thu: number;
  da_thanh_toan: number;
  chua_thanh_toan: number;
  tong_da_thanh_toan: number;
  tong_hoa_don: number;
}

interface StatisticsProps {
  filters?: any;
}

const CongNoStatistics: React.FC<StatisticsProps> = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatisticsData>({
    tong_so_cong_no: 0,
    tong_tien_cong_no: 0,
    no_phai_tra: 0,
    no_can_thu: 0,
    da_thanh_toan: 0,
    chua_thanh_toan: 0,
    tong_da_thanh_toan: 0,
    tong_hoa_don: 0
  });

  useEffect(() => {
    loadStatistics();
  }, [filters]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API.congNoStatistics, {
        searchData: filters || {}
      });

      if (res.data.status_code === 200) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <Row gutter={[8, 8]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Tổng số CN"
              value={stats.tong_so_cong_no}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Nợ cần thu"
              value={formatCurrency(stats.no_can_thu)}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Nợ phải trả"
              value={formatCurrency(Math.abs(stats.no_phai_tra))}
              prefix={<FallOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Tổng CN"
              value={formatCurrency(stats.tong_tien_cong_no)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Đã TT"
              value={stats.da_thanh_toan}
              prefix={<CheckCircleOutlined />}
              suffix={`/${stats.tong_so_cong_no}`}
              valueStyle={{ color: '#52c41a', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Chưa TT"
              value={stats.chua_thanh_toan}
              prefix={<ClockCircleOutlined />}
              suffix={`/${stats.tong_so_cong_no}`}
              valueStyle={{ color: '#faad14', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Tổng đã thu"
              value={formatCurrency(stats.tong_da_thanh_toan)}
              valueStyle={{ color: '#1890ff', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Statistic
              title="Tổng HĐ"
              value={formatCurrency(stats.tong_hoa_don)}
              valueStyle={{ color: '#722ed1', fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CongNoStatistics;
