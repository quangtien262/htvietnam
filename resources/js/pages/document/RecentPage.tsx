import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag } from 'antd';
import { ClockCircleOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from '../../utils/axiosConfig';
import API from '../../common/api';

interface FileItem {
    id: number;
    ten_file: string;
    kich_thuoc: number;
    ngay_truy_cap_cuoi: string;
    luot_xem: number;
    nguoi_tai_len: { ten_nhan_vien: string };
}

export default function RecentPage() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API.documentFilesRecent);
            const filesData = res.data.data || res.data;
            setFiles(Array.isArray(filesData) ? filesData : []);
        } catch (error) {
            message.error('Lỗi tải file');
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };

    const columns = [
        {
            title: 'Tên file',
            dataIndex: 'ten_file',
            key: 'ten_file',
            render: (text: string, record: FileItem) => (
                <a onClick={() => window.open(API.documentFilePreview(record.id), '_blank')}>{text}</a>
            )
        },
        {
            title: 'Kích thước',
            dataIndex: 'kich_thuoc',
            key: 'kich_thuoc',
            render: (size: number) => formatFileSize(size)
        },
        {
            title: 'Lượt xem',
            dataIndex: 'luot_xem',
            key: 'luot_xem',
            render: (views: number) => <Tag color="blue">{views} lần</Tag>
        },
        {
            title: 'Truy cập lần cuối',
            dataIndex: 'ngay_truy_cap_cuoi',
            key: 'ngay_truy_cap_cuoi',
            render: (date: string) => new Date(date).toLocaleString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: FileItem) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(API.documentFilePreview(record.id), '_blank')}>
                        Xem
                    </Button>
                    <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(API.documentFileDownload(record.id), '_blank')}>
                        Tải xuống
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2><ClockCircleOutlined style={{ marginRight: 8 }} />File truy cập gần đây</h2>
            <Table
                columns={columns}
                dataSource={files}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 20 }}
            />
        </div>
    );
}
