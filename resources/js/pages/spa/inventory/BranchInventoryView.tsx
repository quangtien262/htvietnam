import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Tag, Space, Modal, message, Statistic, Row, Col } from 'antd';
import { SearchOutlined, SyncOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API } from '../../../common/api';

const { Option } = Select;

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Product {
    id: number;
    ma_san_pham: string;
    ten_san_pham: string;
    don_vi_tinh: string;
}

interface BranchInventory {
    id: number;
    chi_nhanh_id: number;
    san_pham_id: number;
    so_luong_ton: number;
    so_luong_dat_truoc: number;
    so_luong_kha_dung: number;
    gia_von_binh_quan: number;
    gia_tri_ton_kho: number;
    ngay_cap_nhat_cuoi: string;
    chi_nhanh?: Branch;
    san_pham?: Product;
}

const BranchInventoryView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState<BranchInventory[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const [statistics, setStatistics] = useState<any>(null);

    useEffect(() => {
        loadBranches();
        loadStatistics();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            loadInventoryByBranch(selectedBranch);
        } else {
            loadInventory();
        }
    }, [selectedBranch]);

    const loadBranches = async () => {
        try {
            const response = await axios.get(API.spaBranchList);
            console.log('Branches response:', response.data);
            if (response.data.success) {
                const data = response.data.data;
                const branchList = data.data || data || [];
                const activeBranches = Array.isArray(branchList) ? branchList.filter((b: any) => b.trang_thai === 'active') : [];
                setBranches(activeBranches.map((b: any) => ({ id: b.id, name: b.ten_chi_nhanh, code: b.ma_chi_nhanh || '' })));
            }
        } catch (error) {
            console.error('Load branches error:', error);
            message.error('Không thể tải danh sách chi nhánh');
        }
    };

    const loadInventory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.tonKhoChiNhanhList);
            console.log('Inventory response:', response.data);
            const data = response.data?.data || response.data || [];
            setInventoryData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Load inventory error:', error);
            message.error('Không thể tải dữ liệu tồn kho');
            setInventoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadInventoryByBranch = async (branchId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(API.tonKhoChiNhanhByBranch(branchId));
            console.log('Inventory by branch response:', response.data);
            const data = response.data?.data || response.data || [];
            setInventoryData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Load inventory by branch error:', error);
            message.error('Không thể tải dữ liệu tồn kho chi nhánh');
            setInventoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await axios.get(API.tonKhoChiNhanhStatistics);
            console.log('Statistics response:', response.data);
            setStatistics(response.data);
        } catch (error) {
            console.error('Load statistics error:', error);
        }
    };

    const handleSync = async () => {
        Modal.confirm({
            title: 'Đồng bộ tồn kho',
            content: 'Bạn có chắc muốn đồng bộ lại tổng tồn kho từ các chi nhánh?',
            onOk: async () => {
                try {
                    await axios.post('/spa/ton-kho-chi-nhanh/sync');
                    message.success('Đồng bộ tồn kho thành công');
                    loadInventory();
                    loadStatistics();
                } catch (error) {
                    message.error('Đồng bộ thất bại');
                }
            }
        });
    };

    const handleUpdateReserved = async (record: BranchInventory, newReserved: number) => {
        try {
            await axios.post('/spa/ton-kho-chi-nhanh/update-reserved', {
                chi_nhanh_id: record.chi_nhanh_id,
                san_pham_id: record.san_pham_id,
                so_luong_dat_truoc: newReserved
            });
            message.success('Cập nhật đặt trước thành công');
            if (selectedBranch) {
                loadInventoryByBranch(selectedBranch);
            } else {
                loadInventory();
            }
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    };

    const filteredData = inventoryData.filter(item => {
        const productName = item.san_pham?.ten_san_pham?.toLowerCase() || '';
        const productCode = item.san_pham?.ma_san_pham?.toLowerCase() || '';
        const branchName = item.chi_nhanh?.name?.toLowerCase() || '';
        const search = searchText.toLowerCase();

        return productName.includes(search) ||
               productCode.includes(search) ||
               branchName.includes(search);
    });

    const columns = [
        {
            title: 'Chi nhánh',
            dataIndex: ['chi_nhanh', 'name'],
            key: 'chi_nhanh',
            width: 150,
            fixed: 'left' as const,
            render: (text: string, record: BranchInventory) => (
                <Tag color="blue">{record.chi_nhanh?.code || text}</Tag>
            )
        },
        {
            title: 'Mã SP',
            dataIndex: ['san_pham', 'ma_san_pham'],
            key: 'ma_san_pham',
            width: 100,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: ['san_pham', 'ten_san_pham'],
            key: 'ten_san_pham',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'ĐVT',
            dataIndex: ['san_pham', 'don_vi_tinh'],
            key: 'don_vi_tinh',
            width: 80,
            align: 'center' as const,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'so_luong_ton',
            key: 'so_luong_ton',
            width: 100,
            align: 'right' as const,
            render: (value: number, record: BranchInventory) => (
                <span style={{
                    fontWeight: 'bold',
                    color: value <= 10 ? '#ff4d4f' : value <= 50 ? '#faad14' : '#52c41a'
                }}>
                    {value.toLocaleString()}
                    {value <= 10 && <WarningOutlined style={{ marginLeft: 4, color: '#ff4d4f' }} />}
                </span>
            )
        },
        {
            title: 'Đã đặt trước',
            dataIndex: 'so_luong_dat_truoc',
            key: 'so_luong_dat_truoc',
            width: 120,
            align: 'right' as const,
            render: (value: number) => (
                <span style={{ color: value > 0 ? '#faad14' : undefined }}>
                    {value.toLocaleString()}
                </span>
            )
        },
        {
            title: 'Khả dụng',
            dataIndex: 'so_luong_kha_dung',
            key: 'so_luong_kha_dung',
            width: 100,
            align: 'right' as const,
            render: (value: number) => (
                <Tag color={value > 0 ? 'green' : 'red'}>
                    {value.toLocaleString()}
                </Tag>
            )
        },
        {
            title: 'Giá vốn TB',
            dataIndex: 'gia_von_binh_quan',
            key: 'gia_von_binh_quan',
            width: 120,
            align: 'right' as const,
            render: (value: number) => `${value.toLocaleString()} đ`
        },
        {
            title: 'Giá trị tồn',
            dataIndex: 'gia_tri_ton_kho',
            key: 'gia_tri_ton_kho',
            width: 140,
            align: 'right' as const,
            render: (value: number) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {value.toLocaleString()} đ
                </span>
            )
        },
        {
            title: 'Cập nhật',
            dataIndex: 'ngay_cap_nhat_cuoi',
            key: 'ngay_cap_nhat_cuoi',
            width: 150,
            render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '-'
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title="Tồn kho theo chi nhánh" bordered={false}>
                {statistics && (
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng chi nhánh"
                                    value={statistics.tong_chi_nhanh || 0}
                                    prefix={<SyncOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng sản phẩm"
                                    value={statistics.tong_san_pham || 0}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng tồn kho"
                                    value={statistics.tong_ton_kho || 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Giá trị tồn"
                                    value={statistics.tong_gia_tri || 0}
                                    suffix="đ"
                                    precision={0}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            placeholder="Chọn chi nhánh"
                            allowClear
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                        >
                            {branches.map(branch => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.code} - {branch.name}
                                </Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </Space>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => selectedBranch ? loadInventoryByBranch(selectedBranch) : loadInventory()}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            icon={<SyncOutlined />}
                            onClick={handleSync}
                        >
                            Đồng bộ tổng tồn
                        </Button>
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1500 }}
                    pagination={{
                        pageSize: 20,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        showSizeChanger: true,
                        showQuickJumper: true
                    }}
                />
            </Card>
        </div>
    );
};

export default BranchInventoryView;
