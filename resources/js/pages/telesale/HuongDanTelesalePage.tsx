import React from 'react';
import { Card, Collapse, Typography, Steps, Alert } from 'antd';
import { PhoneOutlined, DatabaseOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

const HuongDanTelesalePage: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Hướng dẫn sử dụng Module Telesale">
        <Alert
          message="Quy trình Telesale"
          description="Module Telesale giúp quản lý toàn bộ quy trình bán hàng qua điện thoại: từ nhập data, thực hiện cuộc gọi, đến tạo đơn hàng và theo dõi KPI."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Title level={4}>Quy trình làm việc</Title>
        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: 'Nhập Data khách hàng',
              description: 'Import data từ Excel hoặc nhập thủ công. Phân loại data: Nóng, Ấm, Lạnh',
              icon: <DatabaseOutlined />,
            },
            {
              title: 'Phân bổ Data',
              description: 'Gán data cho từng nhân viên Telesale để gọi',
            },
            {
              title: 'Thực hiện cuộc gọi',
              description: 'Ghi nhận kết quả cuộc gọi: Thành công, Không nghe máy, Từ chối, Hẹn gọi lại, Sai số',
              icon: <PhoneOutlined />,
            },
            {
              title: 'Tạo đơn hàng',
              description: 'Nếu khách hàng đồng ý mua, tạo đơn hàng ngay sau cuộc gọi',
              icon: <ShoppingCartOutlined />,
            },
            {
              title: 'Theo dõi & chăm sóc',
              description: 'Theo dõi lịch hẹn gọi lại, chăm sóc khách hàng định kỳ',
            },
            {
              title: 'Báo cáo KPI',
              description: 'Xem báo cáo tổng hợp: Số cuộc gọi, đơn hàng, doanh thu, tỷ lệ chốt đơn',
            },
          ]}
        />

        <Title level={4} style={{ marginTop: 32 }}>Các tính năng chính</Title>
        <Collapse>
          <Panel header="Quản lý Data Khách hàng" key="1">
            <Paragraph>
              - Import data từ Excel/CSV<br />
              - Nhập data thủ công<br />
              - Phân loại data: Nóng (quan tâm cao), Ấm (quan tâm trung bình), Lạnh (ít quan tân)<br />
              - Gắn tags để dễ tìm kiếm<br />
              - Phân bổ data cho nhân viên Telesale<br />
              - Theo dõi trạng thái: Mới, Đang gọi, Đã gọi, Thành công, Thất bại, Trùng
            </Paragraph>
          </Panel>
          <Panel header="Quản lý Cuộc gọi" key="2">
            <Paragraph>
              - Ghi nhận cuộc gọi với đầy đủ thông tin<br />
              - Tự động tính thời lượng cuộc gọi<br />
              - Kết quả cuộc gọi: Thành công, Không nghe máy, Từ chối, Hẹn gọi lại, Sai số<br />
              - Ghi chú nội dung trao đổi<br />
              - Tự động tạo lịch hẹn gọi lại (nếu chọn kết quả "Hẹn gọi lại")<br />
              - Lưu file ghi âm cuộc gọi (nếu có)
            </Paragraph>
          </Panel>
          <Panel header="Quản lý Đơn hàng" key="3">
            <Paragraph>
              - Tạo đơn hàng trực tiếp sau cuộc gọi thành công<br />
              - Quản lý chi tiết sản phẩm, số lượng, đơn giá<br />
              - Tính tự động tổng tiền + phí ship<br />
              - Hình thức thanh toán: COD, Chuyển khoản, Thẻ<br />
              - Theo dõi trạng thái: Mới → Đã xác nhận → Đang giao → Thành công / Hoàn / Hủy<br />
              - Liên kết với cuộc gọi tạo đơn
            </Paragraph>
          </Panel>
          <Panel header="Lịch hẹn gọi lại" key="4">
            <Paragraph>
              - Tự động tạo lịch hẹn khi cuộc gọi kết quả "Hẹn gọi lại"<br />
              - Phân loại độ ưu tiên: Cao, Trung bình, Thấp<br />
              - Xem lịch hẹn theo ngày<br />
              - Đánh dấu đã gọi/chưa gọi<br />
              - Nhắc nhở nhân viên gọi đúng hẹn
            </Paragraph>
          </Panel>
          <Panel header="KPI & Báo cáo" key="5">
            <Paragraph>
              - Báo cáo cuộc gọi hôm nay: Tổng cuộc gọi, thành công, không nghe máy<br />
              - Báo cáo đơn hàng theo tháng: Số lượng, doanh thu<br />
              - Tỷ lệ nghe máy %<br />
              - Tỷ lệ chốt đơn %<br />
              - Thời gian gọi trung bình<br />
              - KPI cá nhân theo tháng: Mục tiêu và thực tế
            </Paragraph>
          </Panel>
        </Collapse>

        <Title level={4} style={{ marginTop: 32 }}>Lưu ý quan trọng</Title>
        <Paragraph>
          - Luôn ghi nhận cuộc gọi ngay sau khi gọi xong để đảm bảo thông tin chính xác<br />
          - Khi chọn kết quả "Hẹn gọi lại", nhớ điền thời gian hẹn cụ thể<br />
          - Tạo đơn hàng ngay sau cuộc gọi thành công để tránh quên<br />
          - Kiểm tra lịch hẹn gọi lại hàng ngày để không bỏ lỡ khách hàng<br />
          - Data trùng sẽ được tự động đánh dấu để tránh gọi lại nhiều lần<br />
          - Thường xuyên xem báo cáo KPI để cải thiện hiệu suất
        </Paragraph>
      </Card>
    </div>
  );
};

export default HuongDanTelesalePage;
