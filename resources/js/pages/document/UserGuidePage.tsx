import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Space, Collapse, Tag, Steps, Alert, Divider, Button, Dropdown } from 'antd';
import type { TabsProps, MenuProps } from 'antd';
import {
    FolderOutlined,
    FileOutlined,
    StarOutlined,
    ShareAltOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    SafetyOutlined,
    QuestionCircleOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    DownOutlined,
    ClockCircleOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const UserGuidePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Tab content components
    const OverviewTab = () => (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
                message="Giới Thiệu Module"
                description="Module Quản lý Tài liệu giúp bạn tổ chức, lưu trữ, chia sẻ và quản lý các file tài liệu trong công ty một cách hiệu quả, an toàn và dễ dàng."
                type="info"
                showIcon
            />

            <Card title="🎯 Tính Năng Chính" bordered={false}>
                <Collapse ghost>
                    <Panel header="📂 Quản Lý Thư Mục" key="1">
                        <ul>
                            <li>Tạo cấu trúc thư mục nhiều cấp (tree structure)</li>
                            <li>Tổ chức theo loại: Cá nhân, Phòng ban, Công ty, Dự án</li>
                            <li>Tùy chỉnh màu sắc và icon cho từng thư mục</li>
                            <li>Sắp xếp thư mục tùy ý bằng cách kéo thả</li>
                        </ul>
                    </Panel>
                    <Panel header="📄 Quản Lý File" key="2">
                        <ul>
                            <li>Upload nhiều file cùng lúc</li>
                            <li>Preview file trực tiếp (PDF, hình ảnh, video...)</li>
                            <li>Tải xuống file nhanh chóng</li>
                            <li>Đánh dấu sao file quan trọng</li>
                            <li>Di chuyển, sao chép file giữa các thư mục</li>
                            <li>Quản lý phiên bản file</li>
                        </ul>
                    </Panel>
                    <Panel header="🔗 Chia Sẻ Tài Liệu" key="3">
                        <ul>
                            <li>Chia sẻ với người dùng cụ thể trong hệ thống</li>
                            <li>Phân quyền chi tiết: Xem, Chỉnh sửa, Quản lý</li>
                            <li>Tạo link chia sẻ công khai có mật khẩu</li>
                            <li>Đặt thời hạn chia sẻ tự động</li>
                            <li>Giới hạn số lượt xem/tải xuống</li>
                        </ul>
                    </Panel>
                    <Panel header="🔐 Bảo Mật & Phân Quyền" key="4">
                        <ul>
                            <li>Kiểm soát quyền truy cập chi tiết</li>
                            <li>Mã hóa link chia sẻ</li>
                            <li>Lịch sử hoạt động đầy đủ</li>
                            <li>Theo dõi ai xem, tải file</li>
                        </ul>
                    </Panel>
                    <Panel header="♻️ Quản Lý Dung Lượng" key="5">
                        <ul>
                            <li>Xem dung lượng đã sử dụng</li>
                            <li>Quản lý quota theo user/phòng ban</li>
                            <li>Thùng rác với khả năng khôi phục</li>
                            <li>Tự động phát hiện file trùng lặp</li>
                        </ul>
                    </Panel>
                </Collapse>
            </Card>

            <Card title="🗂️ Các Trang Chính" bordered={false}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Tag color="blue"><FolderOutlined /> Trình Duyệt File</Tag>
                        <Text> - Trang chính để quản lý thư mục và file</Text>
                    </div>
                    <div>
                        <Tag color="gold"><StarOutlined /> File Đã Gắn Sao</Tag>
                        <Text> - Xem nhanh các file quan trọng đã đánh dấu</Text>
                    </div>
                    <div>
                        <Tag color="green"><ClockCircleOutlined /> File Gần Đây</Tag>
                        <Text> - File đã xem/chỉnh sửa gần đây</Text>
                    </div>
                    <div>
                        <Tag color="red"><DeleteOutlined /> Thùng Rác</Tag>
                        <Text> - Khôi phục file đã xóa</Text>
                    </div>
                    <div>
                        <Tag color="purple"><SettingOutlined /> Cài Đặt</Tag>
                        <Text> - Xem dung lượng, cấu hình thông báo</Text>
                    </div>
                </Space>
            </Card>
        </Space>
    );

    const FoldersTab = () => (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="📁 Tạo Thư Mục Mới" bordered={false}>
                <Steps
                    direction="vertical"
                    current={-1}
                    items={[
                        {
                            title: 'Bước 1: Mở Form Tạo Thư Mục',
                            description: 'Vào trang "Trình duyệt File", click nút "Thư mục mới" trên thanh công cụ.',
                            icon: <FolderOutlined />
                        },
                        {
                            title: 'Bước 2: Nhập Thông Tin',
                            description: (
                                <div>
                                    <Paragraph>
                                        <Text strong>Tên thư mục</Text> (Bắt buộc): Nhập tên mô tả cho thư mục
                                    </Paragraph>
                                    <Paragraph>
                                        <Text strong>Loại thư mục</Text>: Chọn một trong các loại:
                                        <ul>
                                            <li><Tag color="blue">Cá nhân</Tag> - Thư mục riêng của bạn</li>
                                            <li><Tag color="green">Phòng ban</Tag> - Chia sẻ trong phòng ban</li>
                                            <li><Tag color="orange">Công ty</Tag> - Toàn công ty truy cập</li>
                                            <li><Tag color="purple">Dự án</Tag> - Thư mục dự án cụ thể</li>
                                        </ul>
                                    </Paragraph>
                                    <Paragraph>
                                        <Text strong>Màu sắc</Text>: Chọn màu để dễ phân biệt
                                    </Paragraph>
                                </div>
                            ),
                            icon: <FileOutlined />
                        },
                        {
                            title: 'Bước 3: Xác Nhận',
                            description: 'Click "OK" để tạo thư mục. Hệ thống sẽ tự động tạo mã thư mục (TM0001, TM0002...).',
                            icon: <CheckCircleOutlined />
                        }
                    ]}
                />

                <Divider />

                <Alert
                    message="💡 Mẹo"
                    description={
                        <ul>
                            <li>Để tạo thư mục con, hãy chọn thư mục cha trước khi click "Thư mục mới"</li>
                            <li>Dùng màu sắc để phân loại: Đỏ (Khẩn cấp), Xanh (Hoàn thành), Vàng (Đang xử lý)...</li>
                            <li>Tên thư mục nên ngắn gọn, dễ hiểu (VD: "Hợp đồng 2024", "Báo cáo tháng"...)</li>
                        </ul>
                    }
                    type="info"
                    showIcon
                />
            </Card>

            <Card title="🎨 Tổ Chức Thư Mục" bordered={false}>
                <Paragraph>
                    <Text strong>Cấu trúc cây thư mục (Tree Structure):</Text>
                </Paragraph>
                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
{`📂 Công ty
 ├── 📂 Phòng Kinh Doanh
 │   ├── 📂 Hợp đồng 2024
 │   │   ├── 📄 hop-dong-A.pdf
 │   │   └── 📄 hop-dong-B.pdf
 │   └── 📂 Báo cáo
 │       └── 📄 bao-cao.xlsx
 ├── 📂 Phòng Kỹ Thuật
 └── 📂 Phòng Nhân Sự`}
                </pre>

                <Divider />

                <Paragraph>
                    <Text strong>Các thao tác khác:</Text>
                </Paragraph>
                <ul>
                    <li><Text strong>Đổi tên thư mục:</Text> Click menu "..." → "Đổi tên"</li>
                    <li><Text strong>Di chuyển thư mục:</Text> Kéo thả thư mục vào vị trí mới</li>
                    <li><Text strong>Xóa thư mục:</Text> Click menu "..." → "Xóa"</li>
                    <li><Text strong>Khôi phục:</Text> Vào "Thùng rác" → Click "Khôi phục"</li>
                </ul>
            </Card>
        </Space>
    );

    const FilesTab = () => (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="📤 Upload File" bordered={false}>
                <Steps
                    direction="vertical"
                    current={-1}
                    items={[
                        {
                            title: 'Bước 1: Chọn Thư Mục Đích',
                            description: 'Click vào thư mục bên trái (hoặc để trống cho thư mục gốc)',
                            icon: <FolderOutlined />
                        },
                        {
                            title: 'Bước 2: Click "Tải File Lên"',
                            description: 'Click nút "Tải file lên" trên thanh công cụ',
                            icon: <CloudUploadOutlined />
                        },
                        {
                            title: 'Bước 3: Chọn File',
                            description: 'Chọn một hoặc nhiều file từ máy tính. Hệ thống hỗ trợ mọi loại file.',
                            icon: <FileOutlined />
                        },
                        {
                            title: 'Bước 4: Đợi Upload Hoàn Thành',
                            description: 'Hệ thống sẽ tự động upload và tạo mã tài liệu (TL0001, TL0002...)',
                            icon: <CheckCircleOutlined />
                        }
                    ]}
                />

                <Divider />

                <Alert
                    message="⚠️ Lưu Ý Khi Upload"
                    description={
                        <ul>
                            <li>Kiểm tra dung lượng còn lại trước khi upload</li>
                            <li>File lớn có thể mất thời gian upload, hãy kiên nhẫn</li>
                            <li>Hệ thống tự động phát hiện file trùng lặp (dựa vào hash MD5)</li>
                            <li>Nên đặt tên file rõ ràng: <code>bao-cao-tai-chinh-thang-11-2024.pdf</code></li>
                        </ul>
                    }
                    type="warning"
                    showIcon
                />
            </Card>

            <Card title="👁️ Xem & Tải File" bordered={false}>
                <Paragraph>
                    <Text strong>Xem Trước File (Preview):</Text>
                </Paragraph>
                <ul>
                    <li>Click vào tên file để mở preview</li>
                    <li>Hỗ trợ xem trước: PDF, hình ảnh (JPG, PNG, GIF), video, văn bản...</li>
                    <li>Trong preview có thể zoom, download, chia sẻ</li>
                </ul>

                <Divider />

                <Paragraph>
                    <Text strong>Đánh Dấu Sao (Star):</Text>
                </Paragraph>
                <ul>
                    <li>Click icon <StarOutlined /> bên file để đánh dấu</li>
                    <li>File sẽ xuất hiện trong trang "File đã gắn sao"</li>
                    <li>Bỏ sao: Click icon <StarOutlined /> lần nữa</li>
                    <li>Dùng để đánh dấu file quan trọng, thường xuyên sử dụng</li>
                </ul>
            </Card>

            <Card title="🗑️ Xóa & Khôi Phục File" bordered={false}>
                <Paragraph>
                    <Text strong>Xóa File (Soft Delete):</Text>
                </Paragraph>
                <ul>
                    <li>Click menu "..." → "Xóa"</li>
                    <li>File sẽ chuyển vào "Thùng rác", không bị xóa vĩnh viễn</li>
                    <li>File trong thùng rác được lưu trong <Tag color="orange">30 ngày</Tag></li>
                    <li>Có thể khôi phục bất kỳ lúc nào trong thời gian này</li>
                </ul>

                <Divider />

                <Paragraph>
                    <Text strong>Khôi Phục File:</Text>
                </Paragraph>
                <ul>
                    <li>Vào trang <Tag color="red">Thùng Rác</Tag></li>
                    <li>Tìm file cần khôi phục</li>
                    <li>Click nút <Tag color="green">Khôi phục</Tag></li>
                    <li>File sẽ được đưa về vị trí ban đầu</li>
                </ul>

                <Divider />

                <Alert
                    message="⚠️ Xóa Vĩnh Viễn (Permanent Delete)"
                    description={
                        <div>
                            <Paragraph style={{ marginBottom: 8 }}>
                                Trong thùng rác, bạn có thể click nút <Tag color="red">Xóa vĩnh viễn</Tag> để xóa file hoàn toàn:
                            </Paragraph>
                            <ul style={{ marginBottom: 8 }}>
                                <li>Modal xác nhận sẽ xuất hiện với cảnh báo</li>
                                <li>File sẽ bị xóa khỏi cả database và storage</li>
                                <li>Dung lượng được giải phóng ngay lập tức</li>
                                <li><Text strong type="danger">KHÔNG THỂ hoàn tác - Hãy thận trọng!</Text></li>
                            </ul>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                <InfoCircleOutlined /> Nên sử dụng khi: cần giải phóng dung lượng ngay, file có thông tin nhạy cảm, hoặc chắc chắn không cần file nữa.
                            </Paragraph>
                        </div>
                    }
                    type="error"
                    showIcon
                />
            </Card>
        </Space>
    );

    const ShareTab = () => (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="👥 Chia Sẻ Nội Bộ (Với Người Dùng)" bordered={false}>
                <Steps
                    direction="vertical"
                    current={-1}
                    items={[
                        {
                            title: 'Bước 1: Mở Form Chia Sẻ',
                            description: 'Click icon "Chia sẻ" bên file → Tab "Chia sẻ nội bộ"',
                            icon: <ShareAltOutlined />
                        },
                        {
                            title: 'Bước 2: Chọn Quyền Truy Cập',
                            description: (
                                <div>
                                    <ul>
                                        <li><Tag color="blue">Viewer</Tag> - Chỉ xem và tải xuống</li>
                                        <li><Tag color="orange">Editor</Tag> - Xem, tải, chỉnh sửa</li>
                                        <li><Tag color="red">Manager</Tag> - Full quyền</li>
                                    </ul>
                                </div>
                            ),
                            icon: <SafetyOutlined />
                        },
                        {
                            title: 'Bước 3: Xác Nhận',
                            description: 'Click "Chia sẻ" để hoàn thành',
                            icon: <CheckCircleOutlined />
                        }
                    ]}
                />
            </Card>

            <Card title="🔗 Tạo Link Chia Sẻ Công Khai" bordered={false}>
                <Paragraph>
                    <Text strong>Link chia sẻ công khai</Text> cho phép bạn chia sẻ file với người ngoài hệ thống
                    qua đường link, không cần đăng nhập.
                </Paragraph>

                <Divider />

                <Alert
                    message="🔒 Bảo Mật Link Chia Sẻ"
                    description={
                        <ul>
                            <li><Text strong>Luôn dùng mật khẩu</Text> cho file quan trọng</li>
                            <li><Text strong>Đặt ngày hết hạn</Text> để link tự vô hiệu</li>
                            <li><Text strong>Giới hạn lượt xem</Text> để tránh lan truyền</li>
                            <li><Text strong>Thu hồi link</Text> ngay khi không cần nữa</li>
                        </ul>
                    }
                    type="warning"
                    showIcon
                />
            </Card>
        </Space>
    );

    const FeaturesTab = () => (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="⭐ File Đã Gắn Sao" bordered={false}>
                <Paragraph>
                    Trang này hiển thị tất cả file bạn đã đánh dấu sao để truy cập nhanh.
                </Paragraph>
                <ul>
                    <li>Click vào file để xem preview</li>
                    <li>File vẫn ở nguyên vị trí ban đầu, chỉ được "bookmark"</li>
                    <li>Bỏ sao: Click icon <StarOutlined /> để xóa khỏi danh sách</li>
                </ul>
            </Card>

            <Card title="🕒 File Gần Đây" bordered={false}>
                <Paragraph>
                    Trang này hiển thị file bạn đã xem, chỉnh sửa hoặc tải xuống gần đây.
                </Paragraph>
                <ul>
                    <li>Sắp xếp theo thời gian truy cập (mới nhất trước)</li>
                    <li>Hiển thị số lượt xem của mỗi file</li>
                    <li>Tự động cập nhật khi bạn mở file</li>
                </ul>
            </Card>

            <Card title="🗑️ Thùng Rác" bordered={false}>
                <Paragraph>
                    Trang này hiển thị file và thư mục đã xóa (soft delete).
                </Paragraph>

                <Alert
                    message="⏰ Thời Gian Lưu Trữ"
                    description="File trong thùng rác được lưu trong 30 ngày. Sau đó hệ thống tự động xóa vĩnh viễn."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Steps
                    direction="vertical"
                    size="small"
                    items={[
                        {
                            title: 'Khôi Phục File',
                            description: 'Click nút "Khôi phục" để đưa file về vị trí ban đầu',
                            icon: <CheckCircleOutlined />
                        },
                        {
                            title: 'Xóa Vĩnh Viễn (Cẩn Thận!)',
                            description: (
                                <div>
                                    <div>Click nút "Xóa vĩnh viễn" (màu đỏ) để xóa hoàn toàn</div>
                                    <Alert
                                        message="⚠️ CẢNH BÁO"
                                        description={
                                            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                                                <li>File sẽ bị xóa hoàn toàn khỏi hệ thống</li>
                                                <li>File vật lý trong storage cũng bị xóa</li>
                                                <li>Dung lượng được giải phóng ngay lập tức</li>
                                                <li><Text strong type="danger">KHÔNG THỂ khôi phục sau khi xóa vĩnh viễn!</Text></li>
                                            </ul>
                                        }
                                        type="error"
                                        showIcon
                                        style={{ marginTop: 8 }}
                                    />
                                </div>
                            ),
                            icon: <WarningOutlined />
                        }
                    ]}
                />

                <Divider />

                <Paragraph>
                    <Text strong>Khi nào nên xóa vĩnh viễn?</Text>
                </Paragraph>
                <ul>
                    <li>Cần giải phóng dung lượng ngay lập tức</li>
                    <li>File chứa thông tin nhạy cảm cần xóa hoàn toàn</li>
                    <li>Chắc chắn 100% không cần file nữa</li>
                </ul>
            </Card>

            <Card title="⚙️ Cài Đặt & Dung Lượng" bordered={false}>
                <Paragraph>
                    <Text strong>Quản Lý Dung Lượng:</Text>
                </Paragraph>
                <ul>
                    <li>Xem dung lượng đã sử dụng / dung lượng tối đa (quota)</li>
                    <li>Biểu đồ phân tích theo loại file</li>
                    <li>Cảnh báo khi gần hết dung lượng</li>
                </ul>
            </Card>
        </Space>
    );

    const FAQTab = () => (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="❓ Câu Hỏi Thường Gặp" bordered={false}>
                <Collapse accordion>
                    <Panel header="❓ Làm sao để upload nhiều file cùng lúc?" key="1">
                        <Paragraph>
                            Khi click "Tải file lên", bạn có thể chọn nhiều file bằng cách:
                        </Paragraph>
                        <ul>
                            <li>Giữ phím <Tag>Ctrl</Tag> (Windows) hoặc <Tag>Cmd</Tag> (Mac) và click chọn từng file</li>
                            <li>Hoặc giữ phím <Tag>Shift</Tag> và click file đầu + file cuối để chọn cả dải</li>
                        </ul>
                    </Panel>

                    <Panel header="❓ Dung lượng tối đa của mỗi file là bao nhiêu?" key="2">
                        <Paragraph>
                            Dung lượng tối đa phụ thuộc vào cấu hình server:
                        </Paragraph>
                        <ul>
                            <li>Mặc định: <Tag color="blue">100MB</Tag> cho mỗi file</li>
                            <li>Nếu cần upload file lớn hơn, liên hệ quản trị viên</li>
                        </ul>
                    </Panel>

                    <Panel header="❓ Tôi có thể khôi phục file đã xóa bao lâu?" key="3">
                        <Paragraph>
                            File trong thùng rác được lưu trong <Tag color="orange">30 ngày</Tag>.
                        </Paragraph>
                        <ul>
                            <li>Trong vòng 30 ngày: Khôi phục bất kỳ lúc nào</li>
                            <li>Sau 30 ngày: Hệ thống tự động xóa vĩnh viễn</li>
                            <li>File đã xóa vĩnh viễn (permanent delete): <Text strong type="danger">KHÔNG THỂ khôi phục</Text></li>
                        </ul>
                        <Alert
                            message="💡 Lưu ý"
                            description="Bạn có thể chủ động click 'Xóa vĩnh viễn' trong thùng rác để giải phóng dung lượng ngay, nhưng hành động này không thể hoàn tác!"
                            type="info"
                            showIcon
                            style={{ marginTop: 12 }}
                        />
                    </Panel>

                    <Panel header="❓ Quyền 'Viewer', 'Editor', 'Manager' khác nhau như thế nào?" key="4">
                        <Paragraph>
                            <Text strong>Viewer:</Text> Chỉ xem và tải xuống
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Editor:</Text> Xem, tải, chỉnh sửa
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Manager:</Text> Full quyền: xem, sửa, xóa, chia sẻ
                        </Paragraph>
                    </Panel>

                    <Panel header="❓ File trùng lặp được xử lý như thế nào?" key="5">
                        <Paragraph>
                            Hệ thống tự động phát hiện file trùng dựa vào hash MD5:
                        </Paragraph>
                        <ul>
                            <li>Nếu upload file đã tồn tại, hệ thống báo lỗi</li>
                            <li>Bạn có thể chọn: "Giữ cả hai" hoặc "Bỏ qua"</li>
                        </ul>
                    </Panel>
                </Collapse>
            </Card>

            <Card title="📞 Liên Hệ Hỗ Trợ" bordered={false}>
                <Alert
                    message="Cần Trợ Giúp?"
                    description={
                        <div>
                            <Paragraph>
                                Nếu bạn gặp vấn đề hoặc cần hỗ trợ thêm, vui lòng liên hệ:
                            </Paragraph>
                            <ul>
                                <li><Text strong>Email:</Text> support@company.com</li>
                                <li><Text strong>Hotline:</Text> 1900 xxxx</li>
                            </ul>
                        </div>
                    }
                    type="success"
                    showIcon
                />
            </Card>
        </Space>
    );

    // Tab items configuration
    const tabIcons = {
        overview: <InfoCircleOutlined />,
        folders: <FolderOutlined />,
        files: <FileOutlined />,
        share: <ShareAltOutlined />,
        features: <StarOutlined />,
        faq: <QuestionCircleOutlined />
    };

    const tabLabels: Record<string, string> = {
        'overview': 'Tổng Quan',
        'folders': 'Quản Lý Thư Mục',
        'files': 'Quản Lý File',
        'share': 'Chia Sẻ',
        'features': 'Tính Năng Khác',
        'faq': 'FAQ'
    };

    const tabContents = {
        overview: <OverviewTab />,
        folders: <FoldersTab />,
        files: <FilesTab />,
        share: <ShareTab />,
        features: <FeaturesTab />,
        faq: <FAQTab />
    };

    // Desktop tabs - icon + text
    const tabItems: TabsProps['items'] = [
        {
            key: 'overview',
            label: <span><InfoCircleOutlined /> Tổng Quan</span>,
            children: tabContents.overview
        },
        {
            key: 'folders',
            label: <span><FolderOutlined /> Quản Lý Thư Mục</span>,
            children: tabContents.folders
        },
        {
            key: 'files',
            label: <span><FileOutlined /> Quản Lý File</span>,
            children: tabContents.files
        },
        {
            key: 'share',
            label: <span><ShareAltOutlined /> Chia Sẻ</span>,
            children: tabContents.share
        },
        {
            key: 'features',
            label: <span><StarOutlined /> Tính Năng Khác</span>,
            children: tabContents.features
        },
        {
            key: 'faq',
            label: <span><QuestionCircleOutlined /> FAQ</span>,
            children: tabContents.faq
        }
    ];

    // Mobile items - icon only
    const mobileItems: TabsProps['items'] = Object.keys(tabIcons).map(key => ({
        key: key,
        label: tabIcons[key as keyof typeof tabIcons],
        children: tabContents[key as keyof typeof tabContents],
    }));

    // Dropdown menu for mobile
    const dropdownMenuItems: MenuProps['items'] = Object.keys(tabIcons).map(key => ({
        key: key,
        icon: tabIcons[key as keyof typeof tabIcons],
        label: tabLabels[key],
        onClick: () => setActiveTab(key)
    }));

    const currentTab = Object.keys(tabIcons).find(key => key === activeTab);

    return (
        <div style={{ padding: isMobile ? '12px' : '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .ant-tabs-nav {
                            margin-bottom: 8px !important;
                        }
                        .ant-tabs-tab {
                            padding: 8px 12px !important;
                            margin: 0 4px !important;
                        }
                        .ant-tabs-tab-btn {
                            font-size: 18px !important;
                        }
                        .mobile-tab-header {
                            margin-bottom: 12px;
                            padding: 8px;
                            background: #fafafa;
                            border-radius: 4px;
                        }
                        .ant-card-head-title {
                            font-size: 16px !important;
                        }
                        .ant-typography h2 {
                            font-size: 20px !important;
                        }
                        .ant-steps-vertical .ant-steps-item-description {
                            font-size: 13px !important;
                        }
                    }
                    @media (min-width: 769px) {
                        .mobile-tab-header {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <Card>
                <Title level={2} style={{ marginBottom: 16 }}>
                    <QuestionCircleOutlined /> Hướng Dẫn Sử Dụng - Quản Lý Tài Liệu
                </Title>
                {!isMobile && (
                    <Paragraph>
                        Chào mừng bạn đến với hệ thống Quản lý Tài liệu!
                        Tài liệu này sẽ hướng dẫn bạn cách sử dụng đầy đủ các tính năng của hệ thống.
                    </Paragraph>
                )}

                {/* Mobile Header with Dropdown */}
                {isMobile && (
                    <div className="mobile-tab-header">
                        <Dropdown menu={{ items: dropdownMenuItems }} trigger={['click']}>
                            <Button block size="large">
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <span>
                                        {tabIcons[activeTab as keyof typeof tabIcons]} {tabLabels[activeTab] || activeTab}
                                    </span>
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>
                    </div>
                )}

                {/* Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    items={isMobile ? mobileItems : tabItems}
                    size={isMobile ? 'small' : 'middle'}
                />
            </Card>
        </div>
    );
};

export default UserGuidePage;
