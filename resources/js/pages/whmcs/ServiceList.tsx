import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Descriptions, Statistic, Row, Col, Popconfirm } from 'antd';
import { EyeOutlined, PauseOutlined, PlayCircleOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';

const { Option } = Select;

const ServiceList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await callApi(API.whmcs_servicesList, {
                perPage: pagination.pageSize,
                page,
                status: statusFilter
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

    const suspendService = async (id: any) => {
        const res = await callApi(API.whmcs_servicesSuspend(id), {});
        if (res?.success) {
            message.success('Tạm ngưng dịch vụ thành công');
            fetchData(pagination.current);
        } else {
            message.error(res?.message || 'Thao tác thất bại');
        }
    };

    const unsuspendService = async (id: any) => {
        const res = await callApi(API.whmcs_servicesUnsuspend(id), {});
        if (res?.success) {
            message.success('Kích hoạt lại dịch vụ thành công');
            fetchData(pagination.current);
        } else {
            message.error(res?.message || 'Thao tác thất bại');
        }
    };

    const terminateService = async (id: any) => {
        const res = await callApi(API.whmcs_servicesTerminate(id), {});
        if (res?.success) {
            message.success('Hủy dịch vụ thành công');
            fetchData(pagination.current);
        } else {
            message.error(res?.message || 'Thao tác thất bại');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        {
            title: 'Khách hàng',
            render: (_: any, r: any) => `${r.client?.firstname} ${r.client?.lastname}`,
            width: 180
        },
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'name'],
            width: 200
        },
        {
            title: 'Domain',
            dataIndex: 'domain',
            width: 180
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'billing_cycle',
            width: 120
        },
        {
            title: 'Giá',
            dataIndex: 'amount',
            width: 120,
            render: (v: number) => v?.toLocaleString() + ' VNĐ'
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'next_due_date',
            width: 120
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: (s: string) => {
                const colors: any = {
                    Active: 'green',
                    Pending: 'orange',
                    Suspended: 'red',
                    Terminated: 'volcano',
                    Cancelled: 'default'
                };
                return <Tag color={colors[s]}>{s}</Tag>;
            }
        },
        {
            title: 'Hành động',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space>
                    {record.status === 'Active' && (
                        <Popconfirm
                            title="Tạm ngưng dịch vụ?"
                            onConfirm={() => suspendService(record.id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button type="link" icon={<PauseOutlined />} size="small">
                                Suspend
                            </Button>
                        </Popconfirm>
                    )}
                    {record.status === 'Suspended' && (
                        <Popconfirm
                            title="Kích hoạt lại dịch vụ?"
                            onConfirm={() => unsuspendService(record.id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button type="link" icon={<PlayCircleOutlined />} size="small">
                                Unsuspend
                            </Button>
                        </Popconfirm>
                    )}
                    {(record.status === 'Active' || record.status === 'Suspended') && (
                        <Popconfirm
                            title="Hủy dịch vụ vĩnh viễn?"
                            onConfirm={() => terminateService(record.id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button type="link" danger icon={<StopOutlined />} size="small">
                                Terminate
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Trạng thái"
                    style={{ width: 180 }}
                    allowClear
                    value={statusFilter}
                    onChange={(v) => { setStatusFilter(v); fetchData(1); }}
                >
                    <Option value="">Tất cả</Option>
                    <Option value="Active">Active</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="Suspended">Suspended</Option>
                    <Option value="Terminated">Terminated</Option>
                    <Option value="Cancelled">Cancelled</Option>
                </Select>
            </Space>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchData(p.current)}
                rowKey="id"
                scroll={{ x: 1400 }}
            />
        </div>
    );
};

export default ServiceList;
