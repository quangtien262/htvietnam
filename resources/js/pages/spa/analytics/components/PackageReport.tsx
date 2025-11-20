import React, { useState, useEffect } from 'react';
import { Card, Table, Progress, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';

const PackageReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsPackages);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const packages = data?.packages || [
        { name: 'Gói 10 lần Massage', sold: 45, used: 65, revenue: 180000000 },
        { name: 'Gói chăm sóc da 1 tháng', sold: 32, used: 78, revenue: 128000000 },
    ];

    return (
        <Card title="Gói Dịch vụ">
            <Table
                dataSource={packages}
                columns={[
                    { title: 'Gói dịch vụ', dataIndex: 'name', key: 'name' },
                    { title: 'Đã bán', dataIndex: 'sold', key: 'sold' },
                    { title: 'Tỷ lệ sử dụng', dataIndex: 'used', key: 'used', render: (v: number) => <Progress percent={v} /> },
                    { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `${(v/1000000).toFixed(1)}M` },
                ]}
                pagination={false}
            />
        </Card>
    );
};

export default PackageReport;
