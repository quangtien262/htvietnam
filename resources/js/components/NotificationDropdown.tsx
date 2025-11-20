import React, { useEffect, useState } from 'react';
import { Badge, Button, Dropdown, List, Spin, Typography, Space, Tag, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { notificationApi } from '../common/api/projectApi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

interface Notification {
    id: number;
    type: string;
    message: string;
    data: any;
    read_at: string | null;
    created_at: string;
    created_by_name?: string;
    notifiable_type?: string;
    notifiable_id?: number;
}

const NotificationDropdown: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch unread count on mount and every 30 seconds
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (dropdownOpen) {
            fetchNotifications();
        }
    }, [dropdownOpen]);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationApi.getUnreadCount();
            setUnreadCount(response.data.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationApi.getNotifications('all');
            setNotifications(response.data.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_at: dayjs().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: dayjs().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        if (type.includes('comment')) return '💬';
        if (type.includes('checklist')) return '✅';
        if (type.includes('file')) return '📎';
        if (type.includes('member')) return '👥';
        if (type.includes('date')) return '📅';
        if (type.includes('status')) return '🔄';
        if (type.includes('priority')) return '🔥';
        return '🔔';
    };

    const handleNotificationClick = (item: Notification) => {
        // Mark as read if unread
        if (!item.read_at) {
            markAsRead(item.id);
        }

        // Close dropdown
        setDropdownOpen(false);

        // Navigate based on notification type
        if (item.notifiable_type && item.notifiable_id) {
            if (item.notifiable_type.includes('Task')) {
                // Navigate to project detail with task modal open
                if (item.data?.project_id) {
                    navigate(`/project/${item.data.project_id}?p=projects&task=${item.notifiable_id}`);
                }
            } else if (item.notifiable_type.includes('Project')) {
                // Navigate to project detail
                navigate(`/project/${item.notifiable_id}?p=projects`);
            }
        }
    };

    const notificationList = (
        <div style={{ width: 380, maxHeight: 500, overflow: 'auto' }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: '#fff',
                zIndex: 1,
            }}>
                <Text strong>Thông báo</Text>
                {unreadCount > 0 && (
                    <Button
                        type="link"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={markAllAsRead}
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin />
                </div>
            ) : notifications.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có thông báo"
                    style={{ padding: '40px 0' }}
                />
            ) : (
                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                background: item.read_at ? '#fff' : '#f6ffed',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0',
                            }}
                            onClick={() => handleNotificationClick(item)}
                        >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                <Space>
                                    <span style={{ fontSize: 18 }}>{getNotificationIcon(item.type)}</span>
                                    <Text>{item.message}</Text>
                                </Space>
                                <Space size={8}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {dayjs(item.created_at).fromNow()}
                                    </Text>
                                    {!item.read_at && (
                                        <Tag color="blue" style={{ fontSize: 11 }}>Mới</Tag>
                                    )}
                                </Space>
                            </Space>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    return (
        <Dropdown
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            dropdownRender={() => notificationList}
            trigger={['click']}
            placement="bottomRight"
        >
            <Badge count={unreadCount} offset={[-5, 5]}>
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: '18px' }} />}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                />
            </Badge>
        </Dropdown>
    );
};

export default NotificationDropdown;
