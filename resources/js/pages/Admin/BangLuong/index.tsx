import React, { useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, message, Tag, Space, Card, Statistic, Row, Col, Descriptions } from 'antd';
import { DollarOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function BangLuongPage(props: any) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBangLuong, setSelectedBangLuong] = useState<any>(null);
    const [form] = Form.useForm();

    const tinhLuong = () => {
        form.validateFields().then(values => {
            setLoading(true);
            axios.post(route('api.hr.bang-luong.tinh-luong'), values)
                .then(res => {
                    if (res.data.message === 'success') {
                        message.success('Tính lương thành công');
                        // Reload data
                    }
                })
                .catch(err => message.error('Lỗi'))
                .finally(() => setLoading(false));
        });
    };

    const tinhLuongToanBo = () => {
        Modal.confirm({
            title: 'Tính lương toàn bộ',
            content: `Bạn có muốn tính lương cho tất cả nhân viên tháng ${form.getFieldValue('thang')}/${form.getFieldValue('nam')}?`,
            onOk: () => {
                setLoading(true);
                axios.post(route('api.hr.bang-luong.tinh-luong-toan-bo'), form.getFieldsValue())
                    .then(res => message.success('Hoàn thành'))
                    .catch(err => message.error('Lỗi'))
                    .finally(() => setLoading(false));
            }
        });
    };

    const approve = (id: number) => {
        axios.post(route('api.hr.bang-luong.approve', { id }))
            .then(res => message.success('Đã duyệt'))
            .catch(err => message.error('Lỗi'));
    };

    const columns = [
        { title: 'Mã BL', dataIndex: 'ma_bang_luong', width: 150 },
        { title: 'Nhân viên', dataIndex: ['nhan_vien', 'name'] },
        { title: 'Tháng', dataIndex: 'thang', width: 80 },
        { title: 'Năm', dataIndex: 'nam', width: 80 },
        { title: 'Lương cơ bản', dataIndex: 'luong_co_ban', render: (v: number) => v?.toLocaleString() },
        { title: 'Ngày công', dataIndex: 'so_ngay_cong_thuc_te', width: 100 },
        { title: 'Làm thêm', dataIndex: 'tien_lam_them', render: (v: number) => v?.toLocaleString() },
        { title: 'Thực nhận', dataIndex: 'thuc_nhan', render: (v: number) => <strong>{v?.toLocaleString()}</strong> },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            render: (v: string) => (
                <Tag color={v === 'draft' ? 'default' : v === 'approved' ? 'blue' : 'green'}>
                    {v === 'draft' ? 'Nháp' : v === 'approved' ? 'Đã duyệt' : 'Đã thanh toán'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            render: (_: any, record: any) => (
                <Space>
                    <Button size="small" onClick={() => { setSelectedBangLuong(record); setIsModalOpen(true); }}>
                        Chi tiết
                    </Button>
                    {record.trang_thai === 'draft' && (
                        <Button size="small" type="primary" onClick={() => approve(record.id)}>
                            Duyệt
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <AdminLayout
            auth={props.auth}
            header="Bảng lương"
            content={
                <div>
                    <Card style={{ marginBottom: 16 }}>
                        <Form form={form} layout="inline">
                            <Form.Item name="thang" label="Tháng" initialValue={dayjs().month() + 1}>
                                <Select style={{ width: 100 }}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <Select.Option key={i + 1} value={i + 1}>{i + 1}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="nam" label="Năm" initialValue={dayjs().year()}>
                                <Select style={{ width: 100 }}>
                                    {[2023, 2024, 2025].map(y => (
                                        <Select.Option key={y} value={y}>{y}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="admin_user_id" label="Nhân viên">
                                <Select style={{ width: 200 }} allowClear placeholder="Chọn nhân viên">
                                    {props.nhanViens?.map((nv: any) => (
                                        <Select.Option key={nv.id} value={nv.id}>{nv.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Space>
                                    <Button type="primary" onClick={tinhLuong} loading={loading}>
                                        Tính lương
                                    </Button>
                                    <Button onClick={tinhLuongToanBo} loading={loading}>
                                        Tính toàn bộ
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>

                    <Table
                        columns={columns}
                        dataSource={props.bangLuongs?.data || []}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: props.bangLuongs?.current_page,
                            total: props.bangLuongs?.total,
                            pageSize: 30
                        }}
                    />

                    <Modal
                        title="Chi tiết bảng lương"
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        footer={null}
                        width={800}
                    >
                        {selectedBangLuong && (
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="Nhân viên" span={2}>{selectedBangLuong.nhan_vien?.name}</Descriptions.Item>
                                <Descriptions.Item label="Lương cơ bản">{selectedBangLuong.luong_co_ban?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Ngày công">{selectedBangLuong.so_ngay_cong_thuc_te}/{selectedBangLuong.so_ngay_cong_chuan}</Descriptions.Item>
                                <Descriptions.Item label="Lương ngày công">{selectedBangLuong.luong_theo_ngay_cong?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Tiền làm thêm">{selectedBangLuong.tien_lam_them?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Thưởng">{selectedBangLuong.tong_thuong?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Phụ cấp">{selectedBangLuong.tong_phu_cap?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="BHXH">{selectedBangLuong.tru_bhxh?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="BHYT">{selectedBangLuong.tru_bhyt?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Thuế TNCN">{selectedBangLuong.tru_thue_tncn?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Giảm trừ">{selectedBangLuong.tong_giam_tru?.toLocaleString()}</Descriptions.Item>
                                <Descriptions.Item label="Thực nhận" span={2}>
                                    <strong style={{ fontSize: 18, color: '#1677ff' }}>
                                        {selectedBangLuong.thuc_nhan?.toLocaleString()} VNĐ
                                    </strong>
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </Modal>
                </div>
            }
        />
    );
}
