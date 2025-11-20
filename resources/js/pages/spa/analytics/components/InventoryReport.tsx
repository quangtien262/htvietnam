import React, { useState, useEffect } from 'react';
import { Card, Table, Progress, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';

const InventoryReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsInventory);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const inventory = data?.inventory || [
        { name: 'Tinh dầu massage', used: 85, stock: 15, cost: 12500000 },
        { name: 'Kem dưỡng da', used: 92, stock: 8, cost: 8500000 },
        { name: 'Gel nail', used: 78, stock: 22, cost: 5200000 },
    ];

    return (
        <Card title="Tiêu thụ Nguyên liệu">
            <Table
                dataSource={inventory}
                columns={[
                    { title: 'Nguyên liệu', dataIndex: 'name', key: 'name' },
                    { title: 'Đã dùng (%)', dataIndex: 'used', key: 'used', render: (v: number) => <Progress percent={v} /> },
                    { title: 'Tồn kho', dataIndex: 'stock', key: 'stock' },
                    { title: 'Giá trị', dataIndex: 'cost', key: 'cost', render: (v: number) => `${(v/1000000).toFixed(1)}M` },
                ]}
                pagination={false}
            />
        </Card>
    );
};

export default InventoryReport;
