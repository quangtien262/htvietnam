import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Tag, Button, message, Divider } from 'antd';
import { ArrowLeftOutlined, LikeOutlined, DislikeOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const { Title, Paragraph } = Typography;

interface Article {
    id: number;
    title: string;
    content: string;
    category_name: string;
    author_name: string;
    views: number;
    helpful_votes: number;
    unhelpful_votes: number;
    created_at: string;
    updated_at: string;
}

const KBArticleView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/knowledgebase/articles/${id}`);
            if (response.data.success) {
                setArticle(response.data.data);
                // Track view
                await axios.post(`/aio/api/whmcs/knowledgebase/articles/${id}/view`);
            }
        } catch {
            message.error('Không thể tải bài viết!');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (isHelpful: boolean) => {
        if (voted) {
            message.warning('Bạn đã vote cho bài viết này!');
            return;
        }

        try {
            await axios.post(`/aio/api/whmcs/knowledgebase/articles/${id}/vote`, {
                is_helpful: isHelpful,
            });
            message.success('Cảm ơn đánh giá của bạn!');
            setVoted(true);
            fetchArticle();
        } catch {
            message.error('Không thể gửi đánh giá!');
        }
    };

    if (loading || !article) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay Lại
                    </Button>
                </div>

                <Card>
                    <Space style={{ marginBottom: 16 }}>
                        <Tag color="blue">{article.category_name}</Tag>
                        <span>
                            <EyeOutlined /> {article.views} lượt xem
                        </span>
                    </Space>

                    <Title level={2}>{article.title}</Title>

                    <Space style={{ marginBottom: 24, color: '#666' }}>
                        <span>Tác giả: {article.author_name}</span>
                        <Divider type="vertical" />
                        <span>Ngày tạo: {article.created_at}</span>
                        {article.updated_at && (
                            <>
                                <Divider type="vertical" />
                                <span>Cập nhật: {article.updated_at}</span>
                            </>
                        )}
                    </Space>

                    <Divider />

                    <div
                        dangerouslySetInnerHTML={{ __html: article.content }}
                        style={{ minHeight: 300, lineHeight: 1.8 }}
                    />

                    <Divider />

                    <Card
                        title="Bài viết này có hữu ích không?"
                        style={{ backgroundColor: '#f5f5f5' }}
                    >
                        <Space>
                            <Button
                                icon={<LikeOutlined />}
                                onClick={() => handleVote(true)}
                                disabled={voted}
                            >
                                Hữu ích ({article.helpful_votes})
                            </Button>
                            <Button
                                icon={<DislikeOutlined />}
                                onClick={() => handleVote(false)}
                                disabled={voted}
                            >
                                Không hữu ích ({article.unhelpful_votes})
                            </Button>
                        </Space>
                    </Card>
                </Card>
            </Space>
        </div>
    );
};

export default KBArticleView;
