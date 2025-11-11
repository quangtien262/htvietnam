import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Spin } from 'antd';
import {
    ProjectOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    RiseOutlined,
    FallOutlined,
} from '@ant-design/icons';
import { projectApi } from '../../common/api/projectApi';
import { DashboardStats, Project } from '../../types/project';
import { useNavigate } from 'react-router-dom';
import ROUTE from '../../common/route';

const ProjectDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        delayed_projects: 0,
    });
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, projectsRes] = await Promise.all([
                projectApi.getDashboard(),
                projectApi.getList({ per_page: 5, sort_by: 'updated_at', sort_order: 'desc' }),
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            if (projectsRes.data.success) {
                setRecentProjects(projectsRes.data.data.data || []);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Mã dự án',
            dataIndex: 'ma_du_an',
            key: 'ma_du_an',
            width: 120,
        },
        {
            title: 'Tên dự án',
            dataIndex: 'ten_du_an',
            key: 'ten_du_an',
            render: (text: string, record: Project) => (
                <div>
                    <a onClick={() => navigate(ROUTE.project_detail.replace(':id', String(record.id)) + '?p=projects')}>
                        {text}
                    </a>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 150,
            render: (trangThai: any) => (
                <Tag color={trangThai?.ma_mau}>{trangThai?.ten_trang_thai}</Tag>
            ),
        },
        {
            title: 'Tiến độ',
            dataIndex: 'tien_do',
            key: 'tien_do',
            width: 150,
            render: (tienDo: number) => (
                <Progress
                    percent={tienDo}
                    size="small"
                    status={tienDo === 100 ? 'success' : tienDo >= 50 ? 'active' : 'normal'}
                />
            ),
        },
        {
            title: 'Người quản lý',
            dataIndex: 'quan_ly_du_an',
            key: 'quan_ly_du_an',
            width: 150,
            render: (quanLy: any) => quanLy?.name || '-',
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ marginBottom: 24 }}>
                <ProjectOutlined /> Dashboard - Tổng quan dự án
            </h1>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số dự án"
                            value={stats.total_projects}
                            prefix={<ProjectOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang thực hiện"
                            value={stats.active_projects}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            suffix={
                                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                                    / {stats.total_projects}
                                </span>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed_projects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#13c2c2' }}
                            suffix={
                                stats.total_projects > 0 ? (
                                    <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                                        ({Math.round((stats.completed_projects / stats.total_projects) * 100)}%)
                                    </span>
                                ) : null
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Trễ tiến độ"
                            value={stats.delayed_projects}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: stats.delayed_projects > 0 ? '#ff4d4f' : '#8c8c8c' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Projects */}
            <Card
                title={
                    <Space>
                        <ProjectOutlined />
                        <span>Dự án gần đây</span>
                    </Space>
                }
                extra={
                    <a onClick={() => navigate(ROUTE.project_list + '?p=projects')}>
                        Xem tất cả →
                    </a>
                }
            >
                <Table
                    columns={columns}
                    dataSource={recentProjects}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default ProjectDashboard;
