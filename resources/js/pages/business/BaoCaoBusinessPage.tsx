import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

const { RangePicker } = DatePicker;

interface BaoCaoData {
  tong_co_hoi: number;
  co_hoi_thanh_cong: number;
  co_hoi_that_bai: number;
  gia_tri_du_kien: number;
}

const BaoCaoBusinessPage: React.FC = () => {
  const [data, setData] = useState<BaoCaoData>({
    tong_co_hoi: 0,
    co_hoi_thanh_cong: 0,
    co_hoi_that_bai: 0,
    gia_tri_du_kien: 0,
  });
  const [loading, setLoading] = useState(false);
  const [thang, setThang] = useState(dayjs().month() + 1);
  const [nam, setNam] = useState(dayjs().year());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/business/co-hoi/bao-cao', {
        params: { thang, nam },
      });
      setData(res.data);
    } catch (error) {
      message.error('Lỗi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [thang, nam]);

  const handleMonthChange = (date: Dayjs | null) => {
    if (date) {
      setThang(date.month() + 1);
      setNam(date.year());
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="Báo cáo Kinh doanh" extra={<DatePicker picker="month" onChange={handleMonthChange} defaultValue={dayjs()} />}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng cơ hội"
                value={data.tong_co_hoi}
                valueStyle={{ color: '#1890ff' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cơ hội thành công"
                value={data.co_hoi_thanh_cong}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
                suffix={`/ ${data.tong_co_hoi}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cơ hội thất bại"
                value={data.co_hoi_that_bai}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
                suffix={`/ ${data.tong_co_hoi}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Giá trị dự kiến"
                value={data.gia_tri_du_kien}
                precision={0}
                valueStyle={{ color: '#faad14' }}
                prefix={<ArrowUpOutlined />}
                suffix="đ"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="Tỷ lệ chuyển đổi">
              <Statistic
                title="Win Rate"
                value={data.tong_co_hoi > 0 ? ((data.co_hoi_thanh_cong / data.tong_co_hoi) * 100).toFixed(2) : 0}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Tỷ lệ thất bại">
              <Statistic
                title="Loss Rate"
                value={data.tong_co_hoi > 0 ? ((data.co_hoi_that_bai / data.tong_co_hoi) * 100).toFixed(2) : 0}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BaoCaoBusinessPage;
