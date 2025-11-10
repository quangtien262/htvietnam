import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { StarFilled, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from '../../utils/axiosConfig';
import API from '../../common/api';

interface FileItem {
    id: number;
    ten_file: string;
    kich_thuoc: number;
    created_at: string;
    nguoi_tai_len: { ten_nhan_vien: string };
}

export default function StarredPage() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API.documentFilesStarred);
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
                <Space>
                    <StarFilled style={{ color: '#faad14' }} />
                    <a onClick={() => window.open(API.documentFilePreview(record.id), '_blank')}>{text}</a>
                </Space>
            )
        },
        {
            title: 'Kích thước',
            dataIndex: 'kich_thuoc',
            key: 'kich_thuoc',
            render: (size: number) => formatFileSize(size)
        },
        {
            title: 'Người tải',
            dataIndex: 'nguoi_tai_len',
            key: 'nguoi_tai_len',
            render: (user: any) => user?.ten_nhan_vien || 'N/A'
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
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
            <h2><StarFilled style={{ color: '#faad14', marginRight: 8 }} />File đã gắn sao</h2>
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
