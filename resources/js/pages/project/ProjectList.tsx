import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Progress,
    Input,
    Select,
    Card,
    message,
    Modal,
    Popconfirm,
    Drawer,
    Form,
    InputNumber,
    DatePicker,
    ColorPicker,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    ReloadOutlined,
    ProjectOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { projectApi, referenceApi } from '../../common/api/projectApi';
import { Project, ProjectFormData, ProjectFilter, ProjectStatusType, ProjectType, PriorityType } from '../../types/project';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ROUTE from '../../common/route';
import dayjs from 'dayjs';
import type { Color } from 'antd/es/color-picker';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ProjectList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    // Filters
    const [filters, setFilters] = useState<ProjectFilter>({});

    // Reference data
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatusType[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [priorities, setPriorities] = useState<PriorityType[]>([]);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedColor, setSelectedColor] = useState('#1890ff');

    useEffect(() => {
        loadReferenceData();
    }, []);

    useEffect(() => {
        loadProjects();
    }, [pagination.current, pagination.pageSize, filters]);

    // Handle edit from URL query param
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId && projects.length > 0) {
            const projectToEdit = projects.find(p => p.id === Number(editId));
            if (projectToEdit) {
                handleEdit(projectToEdit);
                // Remove edit param from URL
                searchParams.delete('edit');
                setSearchParams(searchParams);
            }
        }
    }, [searchParams, projects]);

    const loadReferenceData = async () => {
        try {
            const [statusesRes, typesRes, prioritiesRes] = await Promise.all([
                referenceApi.getProjectStatuses(),
                referenceApi.getProjectTypes(),
                referenceApi.getPriorities(),
            ]);

            if (statusesRes.data.success) setProjectStatuses(statusesRes.data.data);
            if (typesRes.data.success) setProjectTypes(typesRes.data.data);
            if (prioritiesRes.data.success) setPriorities(prioritiesRes.data.data);
        } catch (error) {
            console.error('Error loading reference data:', error);
        }
    };

    const loadProjects = async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                page: pagination.current,
                per_page: pagination.pageSize,
            };

            const response = await projectApi.getList(params);

            if (response.data.success) {
                const data = response.data.data;
                setProjects(data.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.total || 0,
                }));
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProject(null);
        setSelectedColor('#1890ff');
        form.resetFields();
        form.setFieldsValue({
            trang_thai_id: 1,
            uu_tien_id: 2,
            ngan_sach_du_kien: 0,
        });
        setModalVisible(true);
    };

    const handleEdit = (record: Project) => {
        setSelectedProject(record);
        setSelectedColor(record.mau_sac || '#1890ff');
        form.setFieldsValue({
            ten_du_an: record.ten_du_an,
            mo_ta: record.mo_ta,
            loai_du_an_id: record.loai_du_an_id,
            trang_thai_id: record.trang_thai_id,
            uu_tien_id: record.uu_tien_id,
            ten_khach_hang: record.ten_khach_hang,
            ngay_bat_dau: record.ngay_bat_dau ? dayjs(record.ngay_bat_dau) : null,
            ngay_ket_thuc_du_kien: record.ngay_ket_thuc_du_kien ? dayjs(record.ngay_ket_thuc_du_kien) : null,
            ngan_sach_du_kien: record.ngan_sach_du_kien,
            ghi_chu: record.ghi_chu,
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: ProjectFormData = {
                ...values,
                mau_sac: selectedColor,
                ngay_bat_dau: values.ngay_bat_dau?.format('YYYY-MM-DD'),
                ngay_ket_thuc_du_kien: values.ngay_ket_thuc_du_kien?.format('YYYY-MM-DD'),
            };

            let response;
            if (selectedProject) {
                response = await projectApi.update(selectedProject.id, payload);
            } else {
                response = await projectApi.create(payload);
            }

            if (response.data.success) {
                message.success(selectedProject ? 'Cập nhật dự án thành công' : 'Tạo dự án mới thành công');
                setModalVisible(false);
                loadProjects();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await projectApi.delete(id);
            if (response.data.success) {
                message.success('Xóa dự án thành công');
                loadProjects();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa dự án');
        }
    };

    const handleViewDetail = (record: Project) => {
        navigate(ROUTE.project_detail.replace(':id', String(record.id)) + '?p=projects');
    };

    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleResetFilters = () => {
        setFilters({});
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const columns = [
        {
            title: 'Dự án',
            key: 'project_info',
            width: 300,
            fixed: 'left' as const,
            render: (text: string, record: Project) => (
                <a onClick={() => handleViewDetail(record)}>
                    <div>
                        <Tag color={record.ma_mau}>{record.ma_du_an}</Tag>
                    </div>
                    <div><strong>{record.ten_du_an}</strong></div>
                </a>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'loai_du_an',
            key: 'loai_du_an',
            width: 120,
            render: (loai: ProjectType) => loai?.ten_loai || '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 150,
            render: (trangThai: ProjectStatusType) => (
                <Tag color={trangThai?.ma_mau}>{trangThai?.ten_trang_thai}</Tag>
            ),
        },
        {
            title: 'Ưu tiên',
            dataIndex: 'uu_tien',
            key: 'uu_tien',
            width: 120,
            render: (uuTien: PriorityType) => (
                <Tag color={uuTien?.ma_mau}>{uuTien?.ten_uu_tien}</Tag>
            ),
        },
        {
            title: 'Tiến độ',
            dataIndex: 'tien_do',
            key: 'tien_do',
            width: 150,
            render: (tienDo: number) => (
                <Progress
                    percent={tienDo}
                    size="small"
                    status={tienDo === 100 ? 'success' : tienDo >= 50 ? 'active' : 'normal'}
                />
            ),
        },
        {
            title: 'Người quản lý',
            dataIndex: 'quan_ly_du_an',
            key: 'quan_ly_du_an',
            width: 150,
            render: (quanLy: any) => quanLy?.name || '-',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'ngay_bat_dau',
            key: 'ngay_bat_dau',
            width: 120,
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Ngày hoàn thành DK',
            dataIndex: 'ngay_ket_thuc_du_kien',
            key: 'ngay_ket_thuc_du_kien',
            width: 150,
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right' as const,
            width: 150,
            render: (_: any, record: Project) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                        size="small"
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa dự án này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title={
                    <Space>
                        <ProjectOutlined />
                        <span>Danh sách dự án</span>
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            icon={<QuestionCircleOutlined />}
                            onClick={() => navigate(ROUTE.project_guide)}
                        >
                            Hướng Dẫn
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            Tạo dự án mới
                        </Button>
                    </Space>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }}>
                    <Input.Search
                        placeholder="Tìm kiếm tên, mã dự án..."
                        allowClear
                        style={{ width: 250 }}
                        onSearch={handleSearch}
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        mode="multiple"
                        placeholder="Trạng thái"
                        style={{ minWidth: 200 }}
                        allowClear
                        onChange={(value) => handleFilterChange('trang_thai_id', value)}
                        value={filters.trang_thai_id}
                    >
                        {projectStatuses.map(status => (
                            <Option key={status.id} value={status.id}>
                                <Tag color={status.ma_mau}>{status.ten_trang_thai}</Tag>
                            </Option>
                        ))}
                    </Select>
                    <Select
                        mode="multiple"
                        placeholder="Loại dự án"
                        style={{ minWidth: 200 }}
                        allowClear
                        onChange={(value) => handleFilterChange('loai_du_an_id', value)}
                        value={filters.loai_du_an_id}
                    >
                        {projectTypes.map(type => (
                            <Option key={type.id} value={type.id}>{type.ten_loai}</Option>
                        ))}
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
                        Reset
                    </Button>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={projects}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} dự án`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 20 }));
                        },
                    }}
                    scroll={{ x: 1500 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedProject ? 'Sửa dự án' : 'Tạo dự án mới'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={800}
                okText={selectedProject ? 'Cập nhật' : 'Tạo mới'}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ten_du_an"
                        label="Tên dự án"
                        rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
                    >
                        <Input placeholder="Nhập tên dự án" />
                    </Form.Item>

                    <Form.Item name="mo_ta" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả dự án" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="loai_du_an_id" label="Loại dự án" style={{ width: 200 }}>
                            <Select placeholder="Chọn loại" allowClear>
                                {projectTypes.map(type => (
                                    <Option key={type.id} value={type.id}>{type.ten_loai}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="trang_thai_id"
                            label="Trạng thái"
                            rules={[{ required: true }]}
                            style={{ width: 200 }}
                        >
                            <Select placeholder="Chọn trạng thái">
                                {projectStatuses.map(status => (
                                    <Option key={status.id} value={status.id}>
                                        <Tag color={status.ma_mau}>{status.ten_trang_thai}</Tag>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="uu_tien_id"
                            label="Ưu tiên"
                            rules={[{ required: true }]}
                            style={{ width: 200 }}
                        >
                            <Select placeholder="Chọn mức ưu tiên">
                                {priorities.map(priority => (
                                    <Option key={priority.id} value={priority.id}>
                                        <Tag color={priority.ma_mau}>{priority.ten_uu_tien}</Tag>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Form.Item name="ten_khach_hang" label="Tên khách hàng">
                        <Input placeholder="Nhập tên khách hàng" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="ngay_bat_dau" label="Ngày bắt đầu">
                            <DatePicker format="DD/MM/YYYY" style={{ width: 200 }} />
                        </Form.Item>

                        <Form.Item name="ngay_ket_thuc_du_kien" label="Ngày hoàn thành dự kiến">
                            <DatePicker format="DD/MM/YYYY" style={{ width: 200 }} />
                        </Form.Item>

                        <Form.Item name="ngan_sach_du_kien" label="Ngân sách dự kiến (VNĐ)">
                            <InputNumber
                                style={{ width: 200 }}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Màu sắc dự án">
                        <ColorPicker
                            value={selectedColor}
                            onChange={(color: Color) => setSelectedColor(color.toHexString())}
                            showText
                        />
                    </Form.Item>

                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <Input.TextArea rows={2} placeholder="Ghi chú thêm" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectList;
