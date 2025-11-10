import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Modal } from 'antd';
import { DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import axios from '../../utils/axiosConfig';
import API from '../../common/api';

interface FileItem {
    id: number;
    ten_file: string;
    kich_thuoc: number;
    deleted_at: string;
    nguoi_tai_len: { ten_nhan_vien: string };
}

export default function TrashPage() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API.documentFilesTrash);
            const filesData = res.data.data || res.data;
            setFiles(Array.isArray(filesData) ? filesData : []);
        } catch (error) {
            message.error('Lỗi tải thùng rác');
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (fileId: number) => {
        try {
            await axios.post(API.documentFileRestore(fileId));
            message.success('Đã khôi phục file');
            loadFiles();
        } catch (error) {
            message.error('Lỗi khôi phục');
        }
    };

    const handlePermanentDelete = (fileId: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa vĩnh viễn?',
            content: 'File sẽ bị xóa hoàn toàn và không thể khôi phục!',
            okText: 'Xóa vĩnh viễn',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axios.post(API.documentFileForceDelete(fileId));
                    message.success('Đã xóa vĩnh viễn file');
                    loadFiles();
                } catch (error) {
                    message.error('Lỗi xóa vĩnh viễn');
                }
            }
        });
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
            key: 'ten_file'
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
            title: 'Ngày xóa',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            render: (date: string) => new Date(date).toLocaleString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: FileItem) => (
                <Space>
                    <Button type="link" icon={<RollbackOutlined />} onClick={() => handleRestore(record.id)}>
                        Khôi phục
                    </Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handlePermanentDelete(record.id)}>
                        Xóa vĩnh viễn
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2><DeleteOutlined style={{ marginRight: 8 }} />Thùng rác (30 ngày tự xóa)</h2>
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
