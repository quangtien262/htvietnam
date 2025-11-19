import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Row, Col, Divider, Drawer, Descriptions, Tabs,
    Switch, Badge, Statistic, Alert, Tooltip, Timeline, List
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, GiftOutlined,
    EyeOutlined, StarOutlined, DollarOutlined, TrophyOutlined, FireOutlined,
    PercentageOutlined, SwapOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import API_SPA from '../../common/api_spa';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface PointRule {
    id: number;
    ten_quy_tac: string;
    ma_quy_tac: string;
    loai_quy_tac: string; // 'tich_diem', 'quy_doi', 'su_dung'
    dieu_kien?: string;
    gia_tri: number;
    don_vi: string;
    mo_ta?: string;
    trang_thai: string;
    thu_tu: number;
    created_at: string;
}

interface PointTransaction {
    id: number;
    khach_hang_id: number;
    khach_hang?: {
        id: number;
        ho_ten: string;
        so_dien_thoai: string;
    };
    loai_giao_dich: string; // 'cong', 'tru', 'quy_doi'
    so_diem: number;
    ly_do: string;
    don_hang_id?: number;
    nhan_vien_id?: number;
    trang_thai: string;
    created_at: string;
}

interface RewardItem {
    id: number;
    ten_qua: string;
    ma_qua: string;
    diem_doi: number;
    gia_tri_qua?: number;
    so_luong_con_lai: number;
    hinh_anh?: string;
    mo_ta?: string;
    trang_thai: string;
    so_luong_da_doi: number;
    created_at: string;
}

const LoyaltyProgram: React.FC = () => {
    const [activeTab, setActiveTab] = useState('rules');

    // Rules State
    const [rules, setRules] = useState<PointRule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(false);
    const [ruleModalVisible, setRuleModalVisible] = useState(false);
    const [selectedRule, setSelectedRule] = useState<PointRule | null>(null);
    const [ruleForm] = Form.useForm();

    // Transactions State
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [transactionDrawerVisible, setTransactionDrawerVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<PointTransaction | null>(null);

    // Rewards State
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [rewardsLoading, setRewardsLoading] = useState(false);
    const [rewardModalVisible, setRewardModalVisible] = useState(false);
    const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
    const [rewardForm] = Form.useForm();

    // Pagination
    const [rulesPagination, setRulesPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [transactionsPagination, setTransactionsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [rewardsPagination, setRewardsPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // Filters
    const [ruleTypeFilter, setRuleTypeFilter] = useState<string | null>(null);
    const [transactionTypeFilter, setTransactionTypeFilter] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalPoints: 0,
        totalMembers: 0,
        totalRedeemed: 0,
        activeRules: 0,
    });

    useEffect(() => {
        if (activeTab === 'rules') {
            loadRules();
        } else if (activeTab === 'transactions') {
            loadTransactions();
        } else if (activeTab === 'rewards') {
            loadRewards();
        }
    }, [activeTab, rulesPagination.current, transactionsPagination.current, rewardsPagination.current]);

    // Load Rules
    const loadRules = async () => {
        setRulesLoading(true);
        try {
            const response = await axios.post(API_SPA.spaLoyaltyRuleList, {
                page: rulesPagination.current,
                limit: rulesPagination.pageSize,
                loai_quy_tac: ruleTypeFilter,
            });

            if (response.data.success) {
                const data = response.data.data;
                setRules(data.data || []);
                setRulesPagination({ ...rulesPagination, total: data.total || 0 });
                if (data.stats) setStats(data.stats);
            }
        } catch (error) {
            message.error('Không thể tải quy tắc tích điểm');
        } finally {
            setRulesLoading(false);
        }
    };

    // Load Transactions
    const loadTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const response = await axios.post(API_SPA.spaLoyaltyTransactionList, {
                page: transactionsPagination.current,
                limit: transactionsPagination.pageSize,
                loai_giao_dich: transactionTypeFilter,
                search: searchText,
            });

            if (response.data.success) {
                const data = response.data.data;
                setTransactions(data.data || []);
                setTransactionsPagination({ ...transactionsPagination, total: data.total || 0 });
            }
        } catch (error) {
            message.error('Không thể tải lịch sử giao dịch');
        } finally {
            setTransactionsLoading(false);
        }
    };

    // Load Rewards
    const loadRewards = async () => {
        setRewardsLoading(true);
        try {
            const response = await axios.post(API_SPA.spaLoyaltyRewardList, {
                page: rewardsPagination.current,
                limit: rewardsPagination.pageSize,
            });

            if (response.data.success) {
                const data = response.data.data;
                setRewards(data.data || []);
                setRewardsPagination({ ...rewardsPagination, total: data.total || 0 });
            }
        } catch (error) {
            message.error('Không thể tải danh sách quà tặng');
        } finally {
            setRewardsLoading(false);
        }
    };

    // Rule Handlers
    const handleCreateRule = () => {
        ruleForm.resetFields();
        setSelectedRule(null);
        setRuleModalVisible(true);
    };

    const handleEditRule = (record: PointRule) => {
        setSelectedRule(record);
        ruleForm.setFieldsValue(record);
        setRuleModalVisible(true);
    };

    const handleSubmitRule = async () => {
        try {
            const values = await ruleForm.validateFields();
            const response = await axios.post(API_SPA.spaLoyaltyRuleCreateOrUpdate, {
                id: selectedRule?.id,
                ...values,
            });

            if (response.data.success) {
                message.success(selectedRule ? 'Cập nhật quy tắc thành công' : 'Tạo quy tắc mới thành công');
                setRuleModalVisible(false);
                loadRules();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteRule = async (id: number) => {
        try {
            const response = await axios.post(API_SPA.spaLoyaltyRuleDelete, { id });
            if (response.data.success) {
                message.success('Xóa quy tắc thành công');
                loadRules();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa quy tắc');
        }
    };

    // Reward Handlers
    const handleCreateReward = () => {
        rewardForm.resetFields();
        setSelectedReward(null);
        setRewardModalVisible(true);
    };

    const handleEditReward = (record: RewardItem) => {
        setSelectedReward(record);
        rewardForm.setFieldsValue(record);
        setRewardModalVisible(true);
    };

    const handleSubmitReward = async () => {
        try {
            const values = await rewardForm.validateFields();
            const response = await axios.post(API_SPA.spaLoyaltyRewardCreateOrUpdate, {
                id: selectedReward?.id,
                ...values,
            });

            if (response.data.success) {
                message.success(selectedReward ? 'Cập nhật quà tặng thành công' : 'Tạo quà tặng mới thành công');
                setRewardModalVisible(false);
                loadRewards();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteReward = async (id: number) => {
        try {
            const response = await axios.post(API_SPA.spaLoyaltyRewardDelete, { id });
            if (response.data.success) {
                message.success('Xóa quà tặng thành công');
                loadRewards();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa quà tặng');
        }
    };

    // Rule Type Labels
    const getRuleTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'tich_diem': 'Tích điểm',
            'quy_doi': 'Quy đổi',
            'su_dung': 'Sử dụng',
        };
        return labels[type] || type;
    };

    const getRuleTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'tich_diem': 'green',
            'quy_doi': 'blue',
            'su_dung': 'orange',
        };
        return colors[type] || 'default';
    };

    const getTransactionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'cong': 'Cộng điểm',
            'tru': 'Trừ điểm',
            'quy_doi': 'Quy đổi',
        };
        return labels[type] || type;
    };

    const getTransactionTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'cong': 'green',
            'tru': 'red',
            'quy_doi': 'blue',
        };
        return colors[type] || 'default';
    };

    // Rules Columns
    const rulesColumns: ColumnsType<PointRule> = [
        {
            title: 'Thứ tự',
            dataIndex: 'thu_tu',
            key: 'thu_tu',
            width: 80,
            align: 'center',
            sorter: (a, b) => a.thu_tu - b.thu_tu,
        },
        {
            title: 'Quy tắc',
            key: 'rule_info',
            width: 300,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.ten_quy_tac}</div>
                    <Space>
                        <Tag color="blue">{record.ma_quy_tac}</Tag>
                        <Tag color={getRuleTypeColor(record.loai_quy_tac)}>
                            {getRuleTypeLabel(record.loai_quy_tac)}
                        </Tag>
                    </Space>
                </div>
            ),
        },
        {
            title: 'Điều kiện',
            dataIndex: 'dieu_kien',
            key: 'dieu_kien',
            width: 200,
            render: (value?: string) => value || 'Không có điều kiện',
        },
        {
            title: 'Giá trị',
            key: 'value',
            width: 150,
            render: (_, record) => (
                <strong style={{ color: '#1890ff', fontSize: 14 }}>
                    {record.gia_tri} {record.don_vi}
                </strong>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record) => (
                <Tag color={record.trang_thai === 'hoat_dong' ? 'green' : 'red'}>
                    {record.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditRule(record)}>
                        Sửa
                    </Button>
                    <Popconfirm title="Xác nhận xóa quy tắc?" onConfirm={() => handleDeleteRule(record.id)}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Transactions Columns
    const transactionsColumns: ColumnsType<PointTransaction> = [
        {
            title: 'Ngày GD',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.khach_hang?.ho_ten || 'N/A'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{record.khach_hang?.so_dien_thoai}</div>
                </div>
            ),
        },
        {
            title: 'Loại GD',
            dataIndex: 'loai_giao_dich',
            key: 'loai_giao_dich',
            width: 120,
            render: (value: string) => (
                <Tag color={getTransactionTypeColor(value)}>
                    {getTransactionTypeLabel(value)}
                </Tag>
            ),
        },
        {
            title: 'Số điểm',
            dataIndex: 'so_diem',
            key: 'so_diem',
            width: 120,
            align: 'right',
            render: (value: number, record) => {
                const isNegative = record.loai_giao_dich === 'tru';
                return (
                    <strong style={{ color: isNegative ? '#f5222d' : '#52c41a', fontSize: 15 }}>
                        {isNegative ? '-' : '+'}{value}
                    </strong>
                );
            },
        },
        {
            title: 'Lý do',
            dataIndex: 'ly_do',
            key: 'ly_do',
            width: 250,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (value: string) => (
                <Tag color={value === 'thanh_cong' ? 'green' : 'orange'}>
                    {value === 'thanh_cong' ? 'Thành công' : 'Chờ xử lý'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedTransaction(record);
                        setTransactionDrawerVisible(true);
                    }}
                >
                    Xem
                </Button>
            ),
        },
    ];

    // Rewards Columns
    const rewardsColumns: ColumnsType<RewardItem> = [
        {
            title: 'Quà tặng',
            key: 'reward_info',
            width: 300,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.ten_qua}</div>
                    <Tag color="blue">{record.ma_qua}</Tag>
                </div>
            ),
        },
        {
            title: 'Điểm đổi',
            dataIndex: 'diem_doi',
            key: 'diem_doi',
            width: 120,
            align: 'center',
            render: (value: number) => (
                <Tag color="orange" icon={<StarOutlined />} style={{ fontSize: 14 }}>
                    {value} điểm
                </Tag>
            ),
            sorter: (a, b) => a.diem_doi - b.diem_doi,
        },
        {
            title: 'Giá trị',
            dataIndex: 'gia_tri_qua',
            key: 'gia_tri_qua',
            width: 130,
            align: 'right',
            render: (value?: number) => value ? `${value.toLocaleString()} VNĐ` : 'N/A',
        },
        {
            title: 'Còn lại',
            dataIndex: 'so_luong_con_lai',
            key: 'so_luong_con_lai',
            width: 100,
            align: 'center',
            render: (value: number) => (
                <Badge count={value} showZero color={value > 0 ? 'blue' : 'red'} />
            ),
        },
        {
            title: 'Đã đổi',
            dataIndex: 'so_luong_da_doi',
            key: 'so_luong_da_doi',
            width: 100,
            align: 'center',
            render: (value: number) => <Badge count={value} showZero color="green" />,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (value: string) => (
                <Tag color={value === 'con_hang' ? 'green' : 'red'}>
                    {value === 'con_hang' ? 'Còn hàng' : 'Hết hàng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditReward(record)}>
                        Sửa
                    </Button>
                    <Popconfirm title="Xác nhận xóa quà tặng?" onConfirm={() => handleDeleteReward(record.id)}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng điểm tích lũy"
                            value={stats.totalPoints}
                            prefix={<StarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Thành viên tham gia"
                            value={stats.totalMembers}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã quy đổi"
                            value={stats.totalRedeemed}
                            prefix={<GiftOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Quy tắc hoạt động"
                            value={stats.activeRules}
                            prefix={<FireOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    {/* Quy tắc tích điểm */}
                    <TabPane
                        tab={
                            <span>
                                <StarOutlined />
                                Quy tắc tích điểm
                            </span>
                        }
                        key="rules"
                    >
                        <Space style={{ marginBottom: 16 }}>
                            <Select
                                placeholder="Loại quy tắc"
                                allowClear
                                style={{ width: 200 }}
                                value={ruleTypeFilter}
                                onChange={(value) => {
                                    setRuleTypeFilter(value);
                                    loadRules();
                                }}
                            >
                                <Option value="tich_diem">Tích điểm</Option>
                                <Option value="quy_doi">Quy đổi</Option>
                                <Option value="su_dung">Sử dụng</Option>
                            </Select>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRule}>
                                Thêm quy tắc
                            </Button>
                        </Space>

                        <Table
                            columns={rulesColumns}
                            dataSource={rules}
                            rowKey="id"
                            loading={rulesLoading}
                            pagination={{
                                ...rulesPagination,
                                showTotal: (total) => `Tổng ${total} quy tắc`,
                                onChange: (page, pageSize) => setRulesPagination({ ...rulesPagination, current: page, pageSize }),
                            }}
                        />
                    </TabPane>

                    {/* Lịch sử giao dịch */}
                    <TabPane
                        tab={
                            <span>
                                <SwapOutlined />
                                Lịch sử giao dịch
                            </span>
                        }
                        key="transactions"
                    >
                        <Space style={{ marginBottom: 16 }}>
                            <Input.Search
                                placeholder="Tìm theo tên KH, SĐT..."
                                allowClear
                                style={{ width: 250 }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={loadTransactions}
                            />
                            <Select
                                placeholder="Loại giao dịch"
                                allowClear
                                style={{ width: 150 }}
                                value={transactionTypeFilter}
                                onChange={(value) => {
                                    setTransactionTypeFilter(value);
                                    loadTransactions();
                                }}
                            >
                                <Option value="cong">Cộng điểm</Option>
                                <Option value="tru">Trừ điểm</Option>
                                <Option value="quy_doi">Quy đổi</Option>
                            </Select>
                        </Space>

                        <Table
                            columns={transactionsColumns}
                            dataSource={transactions}
                            rowKey="id"
                            loading={transactionsLoading}
                            pagination={{
                                ...transactionsPagination,
                                showTotal: (total) => `Tổng ${total} giao dịch`,
                                onChange: (page, pageSize) => setTransactionsPagination({ ...transactionsPagination, current: page, pageSize }),
                            }}
                        />
                    </TabPane>

                    {/* Quà tặng đổi điểm */}
                    <TabPane
                        tab={
                            <span>
                                <GiftOutlined />
                                Quà tặng đổi điểm
                            </span>
                        }
                        key="rewards"
                    >
                        <Space style={{ marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateReward}>
                                Thêm quà tặng
                            </Button>
                        </Space>

                        <Table
                            columns={rewardsColumns}
                            dataSource={rewards}
                            rowKey="id"
                            loading={rewardsLoading}
                            pagination={{
                                ...rewardsPagination,
                                showTotal: (total) => `Tổng ${total} quà tặng`,
                                onChange: (page, pageSize) => setRewardsPagination({ ...rewardsPagination, current: page, pageSize }),
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Rule Modal */}
            <Modal
                title={selectedRule ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc mới'}
                open={ruleModalVisible}
                onCancel={() => setRuleModalVisible(false)}
                onOk={handleSubmitRule}
                width={700}
            >
                <Form form={ruleForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="ma_quy_tac" label="Mã quy tắc" rules={[{ required: true }]}>
                                <Input placeholder="VD: TD001" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="ten_quy_tac" label="Tên quy tắc" rules={[{ required: true }]}>
                                <Input placeholder="VD: Tích 1% giá trị đơn hàng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="loai_quy_tac" label="Loại quy tắc" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="tich_diem">Tích điểm</Option>
                                    <Option value="quy_doi">Quy đổi</Option>
                                    <Option value="su_dung">Sử dụng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="thu_tu" label="Thứ tự" initialValue={1}>
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gia_tri" label="Giá trị" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="don_vi" label="Đơn vị" rules={[{ required: true }]}>
                                <Input placeholder="VD: điểm/1000 VNĐ" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="dieu_kien" label="Điều kiện">
                                <TextArea rows={2} placeholder="VD: Áp dụng cho đơn hàng từ 500.000 VNĐ" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="mo_ta" label="Mô tả">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="hoat_dong">
                                <Select>
                                    <Option value="hoat_dong">Hoạt động</Option>
                                    <Option value="tam_dung">Tạm dừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Reward Modal */}
            <Modal
                title={selectedReward ? 'Chỉnh sửa quà tặng' : 'Thêm quà tặng mới'}
                open={rewardModalVisible}
                onCancel={() => setRewardModalVisible(false)}
                onOk={handleSubmitReward}
                width={700}
            >
                <Form form={rewardForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="ma_qua" label="Mã quà" rules={[{ required: true }]}>
                                <Input placeholder="VD: GIFT001" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="ten_qua" label="Tên quà tặng" rules={[{ required: true }]}>
                                <Input placeholder="VD: Voucher 100K" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="diem_doi" label="Điểm đổi" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="gia_tri_qua" label="Giá trị (VNĐ)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="so_luong_con_lai" label="Số lượng" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="mo_ta" label="Mô tả">
                                <TextArea rows={3} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="con_hang">
                                <Select>
                                    <Option value="con_hang">Còn hàng</Option>
                                    <Option value="het_hang">Hết hàng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Transaction Drawer */}
            <Drawer
                title="Chi tiết giao dịch điểm"
                placement="right"
                onClose={() => setTransactionDrawerVisible(false)}
                open={transactionDrawerVisible}
                width={500}
            >
                {selectedTransaction && (
                    <div>
                        <Alert
                            message={
                                <Space>
                                    {selectedTransaction.loai_giao_dich === 'cong' ? '+' : '-'}
                                    {selectedTransaction.so_diem} điểm
                                </Space>
                            }
                            type={selectedTransaction.loai_giao_dich === 'cong' ? 'success' : 'warning'}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Khách hàng">
                                {selectedTransaction.khach_hang?.ho_ten || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="SĐT">
                                {selectedTransaction.khach_hang?.so_dien_thoai}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại GD">
                                <Tag color={getTransactionTypeColor(selectedTransaction.loai_giao_dich)}>
                                    {getTransactionTypeLabel(selectedTransaction.loai_giao_dich)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điểm">
                                <strong style={{ fontSize: 16 }}>
                                    {selectedTransaction.loai_giao_dich === 'tru' ? '-' : '+'}
                                    {selectedTransaction.so_diem}
                                </strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do">
                                {selectedTransaction.ly_do}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedTransaction.trang_thai === 'thanh_cong' ? 'green' : 'orange'}>
                                    {selectedTransaction.trang_thai === 'thanh_cong' ? 'Thành công' : 'Chờ xử lý'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày GD">
                                {dayjs(selectedTransaction.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default LoyaltyProgram;
