import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, message } from 'antd';
import { PhoneOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

const BaoCaoTelesalePage: React.FC = () => {
  const [cuocGoiData, setCuocGoiData] = useState({
    tong_cuoc_goi: 0,
    thanh_cong: 0,
    khong_nghe_may: 0,
  });
  const [donHangData, setDonHangData] = useState({
    tong_don_hang: 0,
    doanh_thu: 0,
  });
  const [loading, setLoading] = useState(false);
  const [thang, setThang] = useState(dayjs().month() + 1);
  const [nam, setNam] = useState(dayjs().year());

  const fetchCuocGoiData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/telesale/cuoc-goi/bao-cao');
      setCuocGoiData(res.data);
    } catch (error) {
      message.error('Lỗi tải báo cáo cuộc gọi');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonHangData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/telesale/don-hang/bao-cao', {
        params: { thang, nam },
      });
      setDonHangData(res.data);
    } catch (error) {
      message.error('Lỗi tải báo cáo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuocGoiData();
    fetchDonHangData();
  }, [thang, nam]);

  const handleMonthChange = (date: Dayjs | null) => {
    if (date) {
      setThang(date.month() + 1);
      setNam(date.year());
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Báo cáo Telesale"
        extra={<DatePicker picker="month" onChange={handleMonthChange} defaultValue={dayjs()} />}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng cuộc gọi hôm nay"
                value={cuocGoiData.tong_cuoc_goi}
                valueStyle={{ color: '#1890ff' }}
                prefix={<PhoneOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cuộc gọi thành công"
                value={cuocGoiData.thanh_cong}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
                suffix={`/ ${cuocGoiData.tong_cuoc_goi}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Không nghe máy"
                value={cuocGoiData.khong_nghe_may}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
                suffix={`/ ${cuocGoiData.tong_cuoc_goi}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tỷ lệ nghe máy"
                value={
                  cuocGoiData.tong_cuoc_goi > 0
                    ? (((cuocGoiData.tong_cuoc_goi - cuocGoiData.khong_nghe_may) / cuocGoiData.tong_cuoc_goi) * 100).toFixed(2)
                    : 0
                }
                precision={2}
                valueStyle={{ color: '#faad14' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Đơn hàng trong tháng"
                value={donHangData.tong_don_hang}
                valueStyle={{ color: '#1890ff' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Doanh thu trong tháng"
                value={donHangData.doanh_thu}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                suffix="đ"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tỷ lệ chốt đơn"
                value={
                  cuocGoiData.tong_cuoc_goi > 0
                    ? ((donHangData.tong_don_hang / cuocGoiData.tong_cuoc_goi) * 100).toFixed(2)
                    : 0
                }
                precision={2}
                valueStyle={{ color: '#722ed1' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BaoCaoTelesalePage;
