import React from 'react';
import { Button, Dropdown, Space, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import axios from 'axios';

interface ExportButtonProps {
    endpoint: string;
    params?: Record<string, any>;
    formats?: ('csv' | 'excel' | 'pdf')[];
    onExportStart?: () => void;
    onExportComplete?: () => void;
    onExportError?: (error: Error) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
    endpoint,
    params = {},
    formats = ['csv', 'excel'],
    onExportStart,
    onExportComplete,
    onExportError,
}) => {
    const handleExport = async (format: string) => {
        try {
            onExportStart?.();
            message.loading({ content: `Đang xuất ${format.toUpperCase()}...`, key: 'export' });

            const response = await axios.post(
                endpoint,
                { ...params, format },
                { responseType: 'blob' }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `export_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            message.success({ content: 'Xuất file thành công!', key: 'export' });
            onExportComplete?.();
        } catch (error) {
            message.error({ content: 'Xuất file thất bại!', key: 'export' });
            onExportError?.(error as Error);
        }
    };

    const menuItems: MenuProps['items'] = formats.map((format) => ({
        key: format,
        icon: format === 'csv' ? <FileTextOutlined /> : format === 'excel' ? <FileExcelOutlined /> : <FilePdfOutlined />,
        label: format.toUpperCase(),
        onClick: () => handleExport(format),
    }));

    if (formats.length === 1) {
        return (
            <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExport(formats[0])}
            >
                Xuất {formats[0].toUpperCase()}
            </Button>
        );
    }

    return (
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button icon={<DownloadOutlined />}>
                Xuất file <Space />
            </Button>
        </Dropdown>
    );
};

export default ExportButton;
