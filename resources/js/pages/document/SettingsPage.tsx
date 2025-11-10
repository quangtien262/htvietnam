import React, { useState, useEffect } from 'react';
import { Card, Progress, Statistic, Row, Col, message, Alert } from 'antd';
import { DatabaseOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';
import axios from '../../utils/axiosConfig';

interface QuotaInfo {
    dung_luong_gioi_han: number;
    dung_luong_su_dung: number;
    ty_le_su_dung: number;
}

export default function SettingsPage() {
    const [quota, setQuota] = useState<QuotaInfo | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadQuota();
    }, []);

    const loadQuota = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/aio/api/documents/quota/me');
            setQuota(res.data);
        } catch (error) {
            message.error('Lỗi tải quota');
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };

    return (
        <div style={{ padding: 24 }}>
            <h2><DatabaseOutlined style={{ marginRight: 8 }} />Cài đặt & Quota</h2>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Dung lượng lưu trữ">
                        {quota ? (
                            <>
                                <Progress
                                    percent={quota.ty_le_su_dung}
                                    status={quota.ty_le_su_dung > 80 ? 'exception' : 'active'}
                                />
                                <Row gutter={16} style={{ marginTop: 16 }}>
                                    <Col span={12}>
                                        <Statistic title="Đã sử dụng" value={formatBytes(quota.dung_luong_su_dung)} />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic title="Giới hạn" value={formatBytes(quota.dung_luong_gioi_han)} />
                                    </Col>
                                </Row>
                                {quota.ty_le_su_dung > 80 && (
                                    <Alert
                                        message="Cảnh báo dung lượng"
                                        description="Bạn đã sử dụng hơn 80% dung lượng. Vui lòng dọn dẹp file cũ hoặc yêu cầu tăng quota."
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: 16 }}
                                    />
                                )}
                            </>
                        ) : (
                            <Alert message="Chưa có thông tin quota" type="info" />
                        )}
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Hướng dẫn sử dụng">
                        <p><FileOutlined /> <strong>Upload file:</strong> Kéo thả hoặc click nút Upload</p>
                        <p><FolderOutlined /> <strong>Tạo thư mục:</strong> Click "Tạo thư mục" trên sidebar</p>
                        <p><DatabaseOutlined /> <strong>OCR:</strong> Hệ thống tự động nhận diện text trong ảnh/PDF</p>
                        <p><strong>Quota:</strong> Mỗi user có giới hạn 10GB (mặc định)</p>
                        <p><strong>Trash:</strong> File xóa sẽ tự động xóa vĩnh viễn sau 30 ngày</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
