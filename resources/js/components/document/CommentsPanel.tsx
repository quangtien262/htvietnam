import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Input, Button, Space, message, Popconfirm, Badge, Checkbox, Empty, Typography } from 'antd';
import { UserOutlined, SendOutlined, DeleteOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';

const { TextArea } = Input;
const { Text } = Typography;

interface Comment {
    id: number;
    file_id?: number;
    thu_muc_id?: number;
    user_id: number;
    noi_dung: string;
    is_resolved: boolean;
    parent_comment_id?: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    replies?: Comment[];
}

interface CommentsPanelProps {
    fileId?: number;
    folderId?: number;
    onClose?: () => void;
}

export default function CommentsPanel({ fileId, folderId, onClose }: CommentsPanelProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [unresolvedCount, setUnresolvedCount] = useState(0);
    const [showResolvedOnly, setShowResolvedOnly] = useState(false);

    useEffect(() => {
        loadComments();
        loadUnresolvedCount();
    }, [fileId, folderId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (fileId) params.file_id = fileId;
            if (folderId) params.thu_muc_id = folderId;

            const res = await axios.get(API.documentComments, { params });
            setComments(res.data);
        } catch (error) {
            message.error('Lỗi tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    const loadUnresolvedCount = async () => {
        try {
            const params: any = {};
            if (fileId) params.file_id = fileId;
            if (folderId) params.thu_muc_id = folderId;

            const res = await axios.get(API.documentCommentUnresolvedCount, { params });
            setUnresolvedCount(res.data.count);
        } catch (error) {
            console.error('Error loading unresolved count:', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            message.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        try {
            const payload: any = {
                noi_dung: newComment,
            };

            if (fileId) payload.file_id = fileId;
            if (folderId) payload.thu_muc_id = folderId;
            if (replyTo) payload.parent_comment_id = replyTo;

            await axios.post(API.documentCommentStore, payload);
            message.success('Đã thêm bình luận');
            setNewComment('');
            setReplyTo(null);
            loadComments();
            loadUnresolvedCount();
        } catch (error) {
            message.error('Lỗi thêm bình luận');
        }
    };

    const handleEdit = async (id: number) => {
        if (!editContent.trim()) {
            message.warning('Nội dung không được để trống');
            return;
        }

        try {
            await axios.post(API.documentCommentUpdate(id), {
                noi_dung: editContent,
            });
            message.success('Đã cập nhật bình luận');
            setEditingId(null);
            setEditContent('');
            loadComments();
        } catch (error) {
            message.error('Lỗi cập nhật bình luận');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.post(API.documentCommentDelete(id));
            message.success('Đã xóa bình luận');
            loadComments();
            loadUnresolvedCount();
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Lỗi xóa bình luận');
        }
    };

    const handleToggleResolve = async (id: number) => {
        try {
            await axios.post(API.documentCommentToggleResolve(id));
            loadComments();
            loadUnresolvedCount();
        } catch (error) {
            message.error('Lỗi thay đổi trạng thái');
        }
    };

    const renderComment = (comment: Comment, isReply = false) => {
        const isEditing = editingId === comment.id;

        return (
            <List.Item
                key={comment.id}
                style={{
                    paddingLeft: isReply ? 40 : 0,
                    background: isReply ? '#fafafa' : 'transparent',
                    borderRadius: 4,
                }}
            >
                <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                        <Space>
                            <Text strong>{comment.user.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {new Date(comment.created_at).toLocaleString('vi-VN')}
                            </Text>
                            {comment.is_resolved && (
                                <Badge
                                    count="Resolved"
                                    style={{ backgroundColor: '#52c41a' }}
                                />
                            )}
                        </Space>
                    }
                    description={
                        <div>
                            {isEditing ? (
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <TextArea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={2}
                                        autoFocus
                                    />
                                    <Space>
                                        <Button
                                            size="small"
                                            type="primary"
                                            onClick={() => handleEdit(comment.id)}
                                        >
                                            Lưu
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditContent('');
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    </Space>
                                </Space>
                            ) : (
                                <>
                                    <div style={{ marginBottom: 8 }}>
                                        {comment.noi_dung}
                                    </div>
                                    <Space size={12}>
                                        {!isReply && (
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => setReplyTo(comment.id)}
                                                style={{ padding: 0 }}
                                            >
                                                Trả lời
                                            </Button>
                                        )}
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => {
                                                setEditingId(comment.id);
                                                setEditContent(comment.noi_dung);
                                            }}
                                            style={{ padding: 0 }}
                                        >
                                            Sửa
                                        </Button>
                                        <Popconfirm
                                            title="Xác nhận xóa?"
                                            onConfirm={() => handleDelete(comment.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                        >
                                            <Button
                                                type="link"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                style={{ padding: 0 }}
                                            >
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={
                                                comment.is_resolved ? (
                                                    <CloseCircleOutlined />
                                                ) : (
                                                    <CheckCircleOutlined />
                                                )
                                            }
                                            onClick={() => handleToggleResolve(comment.id)}
                                            style={{ padding: 0, color: comment.is_resolved ? '#999' : '#52c41a' }}
                                        >
                                            {comment.is_resolved ? 'Mở lại' : 'Đánh dấu giải quyết'}
                                        </Button>
                                    </Space>
                                </>
                            )}
                        </div>
                    }
                />
                {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                        {comment.replies.map((reply) => renderComment(reply, true))}
                    </div>
                )}
            </List.Item>
        );
    };

    const filteredComments = showResolvedOnly
        ? comments.filter((c) => c.is_resolved)
        : comments;

    return (
        <Card
            title={
                <Space>
                    <span>Bình luận</span>
                    {unresolvedCount > 0 && (
                        <Badge count={unresolvedCount} style={{ backgroundColor: '#faad14' }} />
                    )}
                </Space>
            }
            extra={
                <Checkbox
                    checked={showResolvedOnly}
                    onChange={(e) => setShowResolvedOnly(e.target.checked)}
                >
                    Chỉ hiển thị đã giải quyết
                </Checkbox>
            }
            style={{ maxHeight: '600px', overflowY: 'auto' }}
        >
            {/* New comment input */}
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                {replyTo && (
                    <div style={{ padding: 8, background: '#f0f9ff', borderRadius: 4 }}>
                        <Text type="secondary">Đang trả lời...</Text>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => setReplyTo(null)}
                            style={{ marginLeft: 8 }}
                        >
                            Hủy
                        </Button>
                    </div>
                )}
                <TextArea
                    rows={3}
                    placeholder="Nhập bình luận của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onPressEnter={(e) => {
                        if (e.ctrlKey) {
                            handleAddComment();
                        }
                    }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                >
                    Gửi bình luận
                </Button>
            </Space>

            {/* Comments list */}
            <List
                loading={loading}
                dataSource={filteredComments}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                showResolvedOnly
                                    ? 'Chưa có bình luận nào được giải quyết'
                                    : 'Chưa có bình luận nào'
                            }
                        />
                    ),
                }}
                renderItem={(comment) => renderComment(comment, false)}
            />
        </Card>
    );
}
