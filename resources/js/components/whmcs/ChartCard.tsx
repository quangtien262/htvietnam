import React from 'react';
import { Card, Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    extra?: React.ReactNode;
    loading?: boolean;
    onExport?: () => void;
}

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    children,
    extra,
    loading = false,
    onExport,
}) => {
    return (
        <Card
            title={title}
            loading={loading}
            extra={
                <Space>
                    {extra}
                    {onExport && (
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={onExport}
                            size="small"
                        >
                            Xuất
                        </Button>
                    )}
                </Space>
            }
        >
            {children}
        </Card>
    );
};

export default ChartCard;
