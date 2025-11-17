import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, DatePicker, Space, Statistic, Tag, message, Select } from 'antd';
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, GiftOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

interface WalletStats {
    total_gift_card_revenue: number;
    total_deposits: number;
    total_withdrawals: number;
    total_refunds: number;
    net_wallet_balance: number;
    gift_card_count: number;
    active_wallet_count: number;
}

interface TopCustomer {
    id: number;
    ho_ten: string;
    sdt: string;
    so_du: number;
    tong_nap: number;
    tong_rut: number;
}

interface GiftCardRevenue {
    id: number;
    ten_the: number;
    gia_ban: number;
    menh_gia: number;
    ti_le_thuong: number;
    so_luong_ban: number;
    doanh_thu: number;
}

interface WalletTransaction {
    id: number;
    ma_giao_dich: string;
    khach_hang: any;
    loai_giao_dich: string;
    so_tien: number;
    the_gia_tri?: any;
    created_at: string;
    ghi_chu?: string;
}

const WalletReportPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month'),
    ]);
    const [stats, setStats] = useState<WalletStats>({
        total_gift_card_revenue: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        total_refunds: 0,
        net_wallet_balance: 0,
        gift_card_count: 0,
        active_wallet_count: 0,
    });
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
    const [giftCardRevenue, setGiftCardRevenue] = useState<GiftCardRevenue[]>([]);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [reportType, setReportType] = useState<'all' | 'gift_card' | 'top_customers'>('all');

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
            };

            // Fetch stats
            const statsRes = await axios.get('/aio/api/spa/wallet/reports/stats', { params });
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            // Fetch top customers
            const topRes = await axios.get('/aio/api/spa/wallet/reports/top-customers', { params });
            if (topRes.data.success) {
                setTopCustomers(topRes.data.data);
            }

            // Fetch gift card revenue
            const giftRes = await axios.get('/aio/api/spa/wallet/reports/gift-card-revenue', { params });
            if (giftRes.data.success) {
                setGiftCardRevenue(giftRes.data.data);
            }

            // Fetch transactions
            const txRes = await axios.get('/aio/api/spa/wallet/reports/transactions', { params });
            if (txRes.data.success) {
                setTransactions(txRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            message.error('Lỗi khi tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const exportToExcel = () => {
        let data: any[] = [];
        let filename = '';

        if (reportType === 'all') {
            data = transactions.map(t => ({
                'Mã GD': t.ma_giao_dich,
                'Khách hàng': t.khach_hang?.ho_ten || 'N/A',
                'SĐT': t.khach_hang?.sdt || 'N/A',
                'Loại GD': t.loai_giao_dich === 'NAP' ? 'Nạp tiền' : t.loai_giao_dich === 'RUT' ? 'Rút tiền' : 'Hoàn tiền',
                'Số tiền': t.so_tien,
                'Thẻ giá trị': t.the_gia_tri?.ten_the || '',
                'Ghi chú': t.ghi_chu || '',
                'Ngày tạo': dayjs(t.created_at).format('DD/MM/YYYY HH:mm'),
            }));
            filename = `giao_dich_vi_${dateRange[0].format('DDMMYYYY')}_${dateRange[1].format('DDMMYYYY')}.xlsx`;
        } else if (reportType === 'gift_card') {
            data = giftCardRevenue.map(g => ({
                'Tên thẻ': g.ten_the,
                'Giá bán': g.gia_ban,
                'Mệnh giá': g.menh_gia,
                'Tỷ lệ thưởng': `${g.ti_le_thuong}%`,
                'Số lượng bán': g.so_luong_ban,
                'Doanh thu': g.doanh_thu,
            }));
            filename = `doanh_thu_the_gia_tri_${dateRange[0].format('DDMMYYYY')}_${dateRange[1].format('DDMMYYYY')}.xlsx`;
        } else if (reportType === 'top_customers') {
            data = topCustomers.map(c => ({
                'Khách hàng': c.ho_ten,
                'SĐT': c.sdt,
                'Số dư': c.so_du,
                'Tổng nạp': c.tong_nap,
                'Tổng rút': c.tong_rut,
            }));
            filename = `top_khach_hang_vi_${dateRange[0].format('DDMMYYYY')}_${dateRange[1].format('DDMMYYYY')}.xlsx`;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, filename);
        message.success('Xuất Excel thành công!');
    };

    const topCustomerColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
        },
        {
            title: 'SĐT',
            dataIndex: 'sdt',
            key: 'sdt',
            width: 120,
        },
        {
            title: 'Số dư',
            dataIndex: 'so_du',
            key: 'so_du',
            width: 150,
            render: (val: number) => <Tag color="green">{formatCurrency(val)}</Tag>,
        },
        {
            title: 'Tổng nạp',
            dataIndex: 'tong_nap',
            key: 'tong_nap',
            width: 150,
            render: (val: number) => formatCurrency(val),
        },
        {
            title: 'Tổng rút',
            dataIndex: 'tong_rut',
            key: 'tong_rut',
            width: 150,
            render: (val: number) => formatCurrency(val),
        },
    ];

    const giftCardColumns = [
        {
            title: 'Tên thẻ',
            dataIndex: 'ten_the',
            key: 'ten_the',
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 130,
            render: (val: number) => formatCurrency(val),
        },
        {
            title: 'Mệnh giá',
            dataIndex: 'menh_gia',
            key: 'menh_gia',
            width: 130,
            render: (val: number) => formatCurrency(val),
        },
        {
            title: 'Tỷ lệ thưởng',
            dataIndex: 'ti_le_thuong',
            key: 'ti_le_thuong',
            width: 100,
            render: (val: number) => <Tag color="gold">{val}%</Tag>,
        },
        {
            title: 'SL bán',
            dataIndex: 'so_luong_ban',
            key: 'so_luong_ban',
            width: 80,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            width: 150,
            render: (val: number) => <strong style={{ color: '#52c41a' }}>{formatCurrency(val)}</strong>,
        },
    ];

    const transactionColumns = [
        {
            title: 'Mã GD',
            dataIndex: 'ma_giao_dich',
            key: 'ma_giao_dich',
            width: 160,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'khach_hang',
            key: 'khach_hang',
            render: (kh: any) => kh?.ho_ten || 'N/A',
        },
        {
            title: 'Loại GD',
            dataIndex: 'loai_giao_dich',
            key: 'loai_giao_dich',
            width: 100,
            render: (type: string) => {
                const config: any = {
                    NAP: { color: 'green', text: 'Nạp tiền' },
                    RUT: { color: 'red', text: 'Rút tiền' },
                    HOAN: { color: 'blue', text: 'Hoàn tiền' },
                };
                const c = config[type] || { color: 'default', text: type };
                return <Tag color={c.color}>{c.text}</Tag>;
            },
        },
        {
            title: 'Số tiền',
            dataIndex: 'so_tien',
            key: 'so_tien',
            width: 130,
            render: (amount: number, record: WalletTransaction) => (
                <span style={{ color: record.loai_giao_dich === 'NAP' || record.loai_giao_dich === 'HOAN' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {record.loai_giao_dich === 'NAP' || record.loai_giao_dich === 'HOAN' ? '+' : '-'}{formatCurrency(amount)}
                </span>
            ),
        },
        {
            title: 'Thẻ giá trị',
            dataIndex: 'the_gia_tri',
            key: 'the_gia_tri',
            render: (the: any) => the?.ten_the || '-',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1>Báo cáo Ví & Thẻ Giá Trị</h1>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                        format="DD/MM/YYYY"
                    />
                    <Select
                        value={reportType}
                        onChange={setReportType}
                        style={{ width: 200 }}
                    >
                        <Select.Option value="all">Tất cả giao dịch</Select.Option>
                        <Select.Option value="gift_card">Doanh thu thẻ</Select.Option>
                        <Select.Option value="top_customers">Top khách hàng</Select.Option>
                    </Select>
                    <Button type="primary" icon={<FileExcelOutlined />} onClick={exportToExcel}>
                        Xuất Excel
                    </Button>
                </Space>
            </Card>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu thẻ giá trị"
                            value={stats.total_gift_card_revenue}
                            prefix={<GiftOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                            formatter={(value) => formatCurrency(Number(value))}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng tiền nạp vào ví"
                            value={stats.total_deposits}
                            prefix={<ArrowUpOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            formatter={(value) => formatCurrency(Number(value))}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng tiền rút từ ví"
                            value={stats.total_withdrawals}
                            prefix={<ArrowDownOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                            formatter={(value) => formatCurrency(Number(value))}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Số dư ví hiện tại"
                            value={stats.net_wallet_balance}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            formatter={(value) => formatCurrency(Number(value))}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Số lượng thẻ đã bán"
                            value={stats.gift_card_count}
                            suffix="thẻ"
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Số ví đang hoạt động"
                            value={stats.active_wallet_count}
                            suffix="ví"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Tables based on reportType */}
            {reportType === 'all' && (
                <Card title="Chi tiết giao dịch">
                    <Table
                        dataSource={transactions}
                        columns={transactionColumns}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 20 }}
                    />
                </Card>
            )}

            {reportType === 'gift_card' && (
                <Card title="Doanh thu theo thẻ giá trị">
                    <Table
                        dataSource={giftCardRevenue}
                        columns={giftCardColumns}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 20 }}
                    />
                </Card>
            )}

            {reportType === 'top_customers' && (
                <Card title="Top khách hàng sử dụng ví">
                    <Table
                        dataSource={topCustomers}
                        columns={topCustomerColumns}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 20 }}
                    />
                </Card>
            )}
        </div>
    );
};

export default WalletReportPage;
