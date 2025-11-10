import React from 'react';
import { Card, Collapse, Typography, Steps } from 'antd';
import { FileTextOutlined, DollarOutlined, SolutionOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

const HuongDanBusinessPage: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Hướng dẫn sử dụng Module Quản lý Kinh doanh">
        <Title level={4}>Quy trình quản lý cơ hội kinh doanh</Title>
        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: 'Lead',
              description: 'Tiếp nhận thông tin khách hàng tiềm năng từ các nguồn (website, facebook, sự kiện...)',
              icon: <FileTextOutlined />,
            },
            {
              title: 'Prospect',
              description: 'Xác định khách hàng có nhu cầu thực sự, phân loại tiềm năng',
              icon: <SolutionOutlined />,
            },
            {
              title: 'Qualified',
              description: 'Đánh giá khách hàng đủ điều kiện (ngân sách, quyền quyết định, nhu cầu rõ ràng)',
            },
            {
              title: 'Proposal',
              description: 'Gửi báo giá, đề xuất giải pháp cho khách hàng',
              icon: <DollarOutlined />,
            },
            {
              title: 'Negotiation',
              description: 'Đàm phán điều khoản, giá cả, thời gian triển khai',
            },
            {
              title: 'Won / Lost',
              description: 'Chốt đơn thành công hoặc thất bại. Ghi nhận kết quả và lý do',
            },
          ]}
        />

        <Title level={4} style={{ marginTop: 32 }}>Các tính năng chính</Title>
        <Collapse>
          <Panel header="Quản lý Cơ hội Kinh doanh" key="1">
            <Paragraph>
              - Tạo, sửa, xóa cơ hội kinh doanh<br />
              - Theo dõi giai đoạn của từng cơ hội (7 giai đoạn)<br />
              - Gán nhân viên phụ trách<br />
              - Đánh giá xác suất thành công (%)<br />
              - Dự kiến giá trị và ngày chốt<br />
              - Ghi nhận lý do thất bại (nếu có)
            </Paragraph>
          </Panel>
          <Panel header="Quản lý Báo giá" key="2">
            <Paragraph>
              - Tạo báo giá cho cơ hội kinh doanh<br />
              - Quản lý chi tiết sản phẩm/dịch vụ<br />
              - Tự động tính tổng tiền, giảm giá<br />
              - Theo dõi trạng thái: Nháp, Đã gửi, Đã duyệt, Từ chối, Hết hạn<br />
              - Thiết lập thời hạn hiệu lực<br />
              - Ghi rõ điều khoản thanh toán
            </Paragraph>
          </Panel>
          <Panel header="Báo cáo & Phân tích" key="3">
            <Paragraph>
              - Thống kê cơ hội theo tháng<br />
              - Tỷ lệ chuyển đổi (Win Rate)<br />
              - Tỷ lệ thất bại (Loss Rate)<br />
              - Tổng giá trị dự kiến<br />
              - Phân tích nguồn khách hàng<br />
              - Đánh giá hiệu suất nhân viên
            </Paragraph>
          </Panel>
        </Collapse>

        <Title level={4} style={{ marginTop: 32 }}>Lưu ý</Title>
        <Paragraph>
          - Cập nhật giai đoạn cơ hội thường xuyên để theo dõi chính xác<br />
          - Khi cơ hội thành công (Won), hệ thống tự động ghi nhận ngày chốt thực tế<br />
          - Nếu thất bại (Lost), bắt buộc ghi rõ lý do để phân tích cải thiện<br />
          - Báo giá có thời hạn hiệu lực, sau thời hạn sẽ chuyển sang trạng thái "Hết hạn"<br />
          - Liên kết cơ hội với báo giá và hợp đồng để quản lý toàn diện
        </Paragraph>
      </Card>
    </div>
  );
};

export default HuongDanBusinessPage;
