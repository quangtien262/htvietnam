import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Form, message, Descriptions } from 'antd';
import { LockOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from '../../utils/axiosConfig';
import { useParams } from 'react-router-dom';
import API from '../../common/api';

interface ShareLinkData {
    link: any;
    data: any;
    permission: string;
}

export default function ShareLinkPage() {
    const { hash } = useParams<{ hash: string }>();
    const [shareData, setShareData] = useState<ShareLinkData | null>(null);
    const [loading, setLoading] = useState(false);
    const [requirePassword, setRequirePassword] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (hash) loadShareLink();
    }, [hash]);

    const loadShareLink = async (pwd?: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/share/${hash}`, {
                params: pwd ? { mat_khau: pwd } : {}
            });
            setShareData(res.data);
            setRequirePassword(false);
        } catch (error: any) {
            if (error.response?.status === 401) {
                setRequirePassword(true);
                message.error('Yêu cầu nhập mật khẩu');
            } else {
                message.error(error.response?.data?.error || 'Link không hợp lệ hoặc đã hết hạn');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = () => {
        loadShareLink(password);
    };

    if (requirePassword) {
        return (
            <div style={{ padding: 24, maxWidth: 400, margin: '100px auto' }}>
                <Card title={<><LockOutlined /> Link được bảo vệ</>}>
                    <Form onFinish={handlePasswordSubmit}>
                        <Form.Item label="Mật khẩu">
                            <Input.Password
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                            />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Truy cập
                        </Button>
                    </Form>
                </Card>
            </div>
        );
    }

    if (!shareData) {
        return <div style={{ padding: 24, textAlign: 'center' }}>Đang tải...</div>;
    }

    const file = shareData.data;

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '50px auto' }}>
            <Card
                title="File được chia sẻ"
                extra={
                    <Button type="primary" icon={<DownloadOutlined />} onClick={() => window.open(API.documentFileDownload(file.id), '_blank')}>
                        Tải xuống
                    </Button>
                }
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tên file">{file.ten_file}</Descriptions.Item>
                    <Descriptions.Item label="Kích thước">
                        {file.kich_thuoc >= 1048576
                            ? (file.kich_thuoc / 1048576).toFixed(2) + ' MB'
                            : (file.kich_thuoc / 1024).toFixed(2) + ' KB'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại file">{file.mime_type}</Descriptions.Item>
                    <Descriptions.Item label="Quyền truy cập">
                        {shareData.permission === 'viewer' ? 'Chỉ xem' : shareData.permission === 'editor' ? 'Chỉnh sửa' : 'Bình luận'}
                    </Descriptions.Item>
                </Descriptions>

                {file.mime_type?.startsWith('image/') && (
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <img src={`/storage/${file.duong_dan}`} alt={file.ten_file} style={{ maxWidth: '100%', maxHeight: 500 }} />
                    </div>
                )}

                {shareData.permission !== 'viewer' && (
                    <Button icon={<EyeOutlined />} onClick={() => window.open(API.documentFilePreview(file.id), '_blank')} style={{ marginTop: 16 }}>
                        Xem trước
                    </Button>
                )}
            </Card>
        </div>
    );
}
