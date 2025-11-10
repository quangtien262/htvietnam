import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Input, Tag, Space } from 'antd';
import { FileTextOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';
import { ROUTE } from '@/common/route';

const { Search } = Input;

interface KBData {
    total_categories: number;
    total_articles: number;
    total_views: number;
    popular_articles: {
        id: number;
        title: string;
        category: string;
        views: number;
        votes: number;
    }[];
    recent_articles: {
        id: number;
        title: string;
        category: string;
        created_at: string;
    }[];
}

const KBDashboard: React.FC = () => {
    const [data, setData] = useState<KBData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/knowledgebase/dashboard');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        if (value.trim()) {
            navigate(`${ROUTE.whmcsKnowledgeBase}/search?q=${encodeURIComponent(value)}`);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Search
                        placeholder="Tìm kiếm bài viết..."
                        size="large"
                        onSearch={handleSearch}
                        enterButton
                    />
                </Card>

                <Row gutter={16}>
                    <Col span={8}>
                        <StatCard
                            title="Tổng Danh Mục"
                            value={data?.total_categories || 0}
                            prefix=""
                            loading={loading}
                        />
                    </Col>
                    <Col span={8}>
                        <StatCard
                            title="Tổng Bài Viết"
                            value={data?.total_articles || 0}
                            prefix=""
                            loading={loading}
                        />
                    </Col>
                    <Col span={8}>
                        <StatCard
                            title="Tổng Lượt Xem"
                            value={data?.total_views || 0}
                            prefix=""
                            loading={loading}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Bài Viết Phổ Biến" loading={loading}>
                            <List
                                dataSource={data?.popular_articles || []}
                                renderItem={(item) => (
                                    <List.Item
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/articles/${item.id}`)}
                                    >
                                        <List.Item.Meta
                                            avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                                            title={item.title}
                                            description={
                                                <Space>
                                                    <Tag>{item.category}</Tag>
                                                    <span>
                                                        <EyeOutlined /> {item.views}
                                                    </span>
                                                    <span>
                                                        <LikeOutlined /> {item.votes}
                                                    </span>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card title="Bài Viết Mới Nhất" loading={loading}>
                            <List
                                dataSource={data?.recent_articles || []}
                                renderItem={(item) => (
                                    <List.Item
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/articles/${item.id}`)}
                                    >
                                        <List.Item.Meta
                                            avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                                            title={item.title}
                                            description={
                                                <Space>
                                                    <Tag>{item.category}</Tag>
                                                    <span>{item.created_at}</span>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default KBDashboard;
