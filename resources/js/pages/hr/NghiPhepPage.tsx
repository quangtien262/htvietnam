import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Input, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function NghiPhepPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nghiPheps, setNghiPheps] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        axios.get('/aio/api/hr/nghi-phep/list')
            .then((res: any) => {
                if (res.data.message === 'success') {
                    setNghiPheps(res.data.data || []);
                }
            })
            .catch(() => message.error('Lỗi'))
            .finally(() => setLoading(false));
    };

    const onFinish = (values: any) => {
        const data = {
            ...values,
            tu_ngay: values.date_range[0].format('YYYY-MM-DD'),
            den_ngay: values.date_range[1].format('YYYY-MM-DD'),
        };
        delete data.date_range;

        setLoading(true);
        axios.post('/aio/api/hr/nghi-phep/store', data)
            .then(() => {
                message.success('Tạo đơn nghỉ phép thành công');
                setIsModalOpen(false);
                form.resetFields();
                loadData();
            })
            .catch(() => message.error('Lỗi'))
            .finally(() => setLoading(false));
    };

    const approve = (id: number) => {
        axios.post(`/aio/api/hr/nghi-phep/approve/${id}`)
            .then(() => {
                message.success('Đã duyệt');
                loadData();
            })
            .catch(() => message.error('Lỗi'));
    };

    const reject = (id: number) => {
        Modal.confirm({
            title: 'Từ chối đơn',
            content: <Input placeholder="Lý do từ chối" id="reject-reason" />,
            onOk: () => {
                const reason = (document.getElementById('reject-reason') as HTMLInputElement)?.value;
                axios.post(`/aio/api/hr/nghi-phep/reject/${id}`, { ghi_chu_duyet: reason })
                    .then(() => {
                        message.success('Đã từ chối');
                        loadData();
                    })
                    .catch(() => message.error('Lỗi'));
            }
        });
    };

    const columns = [
        { title: 'Mã đơn', dataIndex: 'ma_don', width: 150 },
        { title: 'Nhân viên', dataIndex: ['nhan_vien', 'name'] },
        {
            title: 'Loại nghỉ',
            dataIndex: 'loai_nghi',
            render: (v: string) => {
                const labels: any = {
                    phep_nam: 'Phép năm',
                    om: 'Ốm đau',
                    thai_san: 'Thai sản',
                    khong_luong: 'Không lương',
                    khac: 'Khác'
                };
                return labels[v] || v;
            }
        },
        { title: 'Từ ngày', dataIndex: 'tu_ngay', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
        { title: 'Đến ngày', dataIndex: 'den_ngay', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
        { title: 'Số ngày', dataIndex: 'so_ngay_nghi' },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            render: (v: string) => {
                const color = v === 'pending' ? 'orange' : v === 'approved' ? 'green' : 'red';
                const text = v === 'pending' ? 'Chờ duyệt' : v === 'approved' ? 'Đã duyệt' : 'Từ chối';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            render: (_: any, record: any) => (
                <Space>
                    {record.trang_thai === 'pending' && (
                        <>
                            <Button size="small" type="primary" onClick={() => approve(record.id)}>Duyệt</Button>
                            <Button size="small" danger onClick={() => reject(record.id)}>Từ chối</Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>Nghỉ phép</h2>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
                Đăng ký nghỉ phép
            </Button>

            <Table
                columns={columns}
                dataSource={nghiPheps}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title="Đăng ký nghỉ phép"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="loai_nghi" label="Loại nghỉ" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="phep_nam">Phép năm</Select.Option>
                            <Select.Option value="om">Ốm đau</Select.Option>
                            <Select.Option value="thai_san">Thai sản</Select.Option>
                            <Select.Option value="khong_luong">Không lương</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="date_range" label="Thời gian" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="ly_do" label="Lý do">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>Gửi đơn</Button>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
