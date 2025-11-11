import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space, message, InputNumber, Switch, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';
import dayjs from 'dayjs';

const { Option } = Select;

const DomainList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [form] = Form.useForm();
    const [clients, setClients] = useState([]);
    const [tlds, setTlds] = useState([]);

    useEffect(() => {
        fetchData();
        fetchClients();
        fetchTlds();
    }, []);

    const fetchClients = async () => {
        const res = await callApi(API.whmcs_clientsList, { perPage: 1000 });
        if (res?.success) setClients(res.data.data);
    };

    const fetchTlds = async () => {
        const res = await callApi(API.whmcs_domainsTlds);
        if (res?.success) setTlds(res.data);
    };

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await callApi(API.whmcs_domainsList, {
                perPage: pagination.pageSize,
                page
            });
            if (res?.success) {
                setData(res.data.data);
                setPagination({ ...pagination, current: page, total: res.data.total });
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        }
        setLoading(false);
    };

    const renewDomain = async (id: any) => {
        const res = await callApi(API.whmcs_domainsRenew(id), { renewal_period: 1 });
        if (res?.success) {
            message.success('Gia hạn tên miền thành công');
            fetchData(pagination.current);
        } else {
            message.error(res?.message || 'Gia hạn thất bại');
        }
    };

    const openModal = (record?: any) => {
        setEditingRecord(record || null);
        if (record) {
            form.setFieldsValue({
                ...record,
                registration_date: record.registration_date ? dayjs(record.registration_date) : null,
                expiry_date: record.expiry_date ? dayjs(record.expiry_date) : null,
            });
        } else {
            form.resetFields();
        }
        setModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        const payload = {
            ...values,
            registration_date: values.registration_date?.format('YYYY-MM-DD'),
            expiry_date: values.expiry_date?.format('YYYY-MM-DD'),
        };

        const res = editingRecord
            ? await callApi(API.whmcs_domainsUpdate(editingRecord.id), payload)
            : await callApi(API.whmcs_domainsAdd, payload);

        if (res?.success) {
            message.success(editingRecord ? 'Cập nhật thành công' : 'Thêm tên miền thành công');
            setModalVisible(false);
            fetchData(pagination.current);
        } else {
            message.error(res?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        const res = await callApi(API.whmcs_domainsDelete(id));
        if (res?.success) {
            message.success('Xóa thành công');
            fetchData(pagination.current);
        } else {
            message.error('Xóa thất bại');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        {
            title: 'Tên miền',
            dataIndex: 'domain',
            width: 250
        },
        {
            title: 'Khách hàng',
            render: (_: any, r: any) => `${r.client?.firstname} ${r.client?.lastname}`,
            width: 180
        },
        {
            title: 'TLD',
            dataIndex: ['tld', 'tld'],
            width: 100
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'registration_date',
            width: 120
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'expiry_date',
            width: 120,
            render: (date: string) => {
                const daysLeft = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysLeft <= 30 && daysLeft > 0;
                const isExpired = daysLeft <= 0;

                return (
                    <span style={{ color: isExpired ? 'red' : isExpiringSoon ? 'orange' : 'inherit' }}>
                        {date}
                        {isExpiringSoon && ` (${daysLeft} ngày)`}
                        {isExpired && ' (Hết hạn)'}
                    </span>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: (s: string) => {
                const colors: any = {
                    Active: 'green',
                    Pending: 'orange',
                    Expired: 'red',
                    Cancelled: 'default',
                    Transferred: 'blue',
                    Fraud: 'volcano'
                };
                return <Tag color={colors[s]}>{s}</Tag>;
            }
        },
        {
            title: 'Auto Renew',
            dataIndex: 'auto_renew',
            width: 100,
            render: (v: boolean) => v ? <Tag color="green">Bật</Tag> : <Tag>Tắt</Tag>
        },
        {
            title: 'Hành động',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} size="small">
                        Sửa
                    </Button>
                    {(record.status === 'active' || record.status === 'expired') && (
                        <Button
                            type="link"
                            icon={<SyncOutlined />}
                            onClick={() => renewDomain(record.id)}
                            size="small"
                        >
                            Gia hạn
                        </Button>
                    )}
                    <Popconfirm
                        title="Xác nhận xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Quản lý tên miền</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Thêm tên miền
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchData(p.current)}
                rowKey="id"
                scroll={{ x: 1400 }}
            />

            <Modal
                title={editingRecord ? 'Sửa tên miền' : 'Thêm tên miền'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                width={700}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item name="client_id" label="Khách hàng" rules={[{ required: true }]}>
                        <Select placeholder="Chọn khách hàng" showSearch filterOption={(input, option: any) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }>
                            {clients.map((c: any) => (
                                <Option key={c.id} value={c.id}>
                                    {c.firstname} {c.lastname} - {c.email}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="domain" label="Tên miền" rules={[{ required: true }]}>
                        <Input placeholder="example.com" />
                    </Form.Item>

                    <Form.Item name="tld_id" label="TLD" rules={[{ required: true }]}>
                        <Select placeholder="Chọn TLD">
                            {tlds.map((t: any) => (
                                <Option key={t.id} value={t.id}>
                                    {t.tld} - {t.price_register?.toLocaleString()} VND/năm
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                        <Select>
                            <Option value="register">Đăng ký mới</Option>
                            <Option value="transfer">Chuyển về</Option>
                            <Option value="other">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="registration_date" label="Ngày đăng ký" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item name="expiry_date" label="Ngày hết hạn" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item name="billing_cycle" label="Chu kỳ thanh toán" rules={[{ required: true }]}>
                        <Select>
                            <Option value="annually">Hàng năm</Option>
                            <Option value="biennially">2 năm</Option>
                            <Option value="triennially">3 năm</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="recurring_amount" label="Giá gia hạn" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="VND" />
                    </Form.Item>

                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                        <Select>
                            <Option value="pending">Chờ xử lý</Option>
                            <Option value="pending_transfer">Chờ transfer</Option>
                            <Option value="active">Đang hoạt động</Option>
                            <Option value="expired">Hết hạn</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="auto_renew" label="Tự động gia hạn" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="id_protection" label="Bảo vệ thông tin WHOIS" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DomainList;
