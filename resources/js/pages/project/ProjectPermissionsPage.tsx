import React, { useEffect, useState } from 'react';
import { Card, Table, Button, message, Tag, Modal, Select, Tooltip } from 'antd';
import { UserAddOutlined, EditOutlined, KeyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    priority: number;
}

interface Permission {
    id: number;
    name: string;
    display_name: string;
    group: string;
    description: string;
}

interface ProjectMember {
    id: number;
    admin_user_id: number;
    admin_user_name: string;
    vai_tro: string;
    role_id: number | null;
    role_name: string | null;
    role_display_name: string | null;
    role_priority: number | null;
    is_active: boolean;
}

interface ProjectPermissionsPageProps {
    projectId?: number;
}

const ProjectPermissionsPage: React.FC<ProjectPermissionsPageProps> = ({ projectId }) => {
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);

    // Get projectId from URL if not provided
    const currentProjectId = projectId || parseInt(window.location.pathname.split('/')[3]) || 1;

    useEffect(() => {
        fetchData();
    }, [currentProjectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch project members
            const membersRes = await axios.get(`/api/admin/projects/${currentProjectId}/members`);
            setMembers(membersRes.data.data || []);

            // Fetch available roles
            const rolesRes = await axios.get('/api/admin/projects/roles');
            setRoles(rolesRes.data.data || []);

            // Fetch permissions (for info only)
            const permissionsRes = await axios.get('/api/admin/projects/permissions');
            setPermissions(permissionsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Không thể tải dữ liệu phân quyền');
        } finally {
            setLoading(false);
        }
    };

    const showAssignRoleModal = (member: ProjectMember) => {
        setSelectedMember(member);
        setSelectedRole(member.role_id);
        setIsModalVisible(true);
    };

    const handleAssignRole = async () => {
        if (!selectedMember || !selectedRole) {
            message.error('Vui lòng chọn role');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/api/admin/projects/${currentProjectId}/members/${selectedMember.id}/assign-role`, {
                role_id: selectedRole,
            });

            message.success('Phân quyền thành công');
            setIsModalVisible(false);
            fetchData();
        } catch (error: any) {
            console.error('Error assigning role:', error);
            message.error(error.response?.data?.message || 'Không thể phân quyền');
        } finally {
            setLoading(false);
        }
    };

    const getRolePriorityColor = (priority: number | null) => {
        if (!priority) return 'default';
        if (priority >= 100) return 'red';
        if (priority >= 80) return 'orange';
        if (priority >= 50) return 'blue';
        return 'green';
    };

    const columns = [
        {
            title: 'Thành viên',
            dataIndex: 'admin_user_name',
            key: 'admin_user_name',
            render: (text: string, record: ProjectMember) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">Vai trò cũ: {record.vai_tro || 'Không có'}</div>
                </div>
            ),
        },
        {
            title: 'Role hiện tại',
            dataIndex: 'role_display_name',
            key: 'role',
            render: (text: string | null, record: ProjectMember) => {
                if (!text) {
                    return <Tag color="default">Chưa phân quyền</Tag>;
                }
                return (
                    <div>
                        <Tag color={getRolePriorityColor(record.role_priority)}>
                            {text}
                        </Tag>
                        <div className="text-xs text-gray-500 mt-1">
                            Priority: {record.role_priority}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: ProjectMember) => (
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => showAssignRoleModal(record)}
                    size="small"
                >
                    Phân quyền
                </Button>
            ),
        },
    ];

    const permissionGroups = permissions.reduce((acc, perm) => {
        if (!acc[perm.group]) {
            acc[perm.group] = [];
        }
        acc[perm.group].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Quản lý phân quyền dự án</h1>
                <p className="text-gray-600">
                    Quản lý vai trò và quyền hạn của thành viên trong dự án
                </p>
            </div>

            {/* Roles Information */}
            <Card title="Thông tin các Role" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            size="small"
                            className="border-l-4"
                            style={{ borderLeftColor: getRolePriorityColor(role.priority) }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{role.display_name}</h3>
                                <Tag color={getRolePriorityColor(role.priority)}>
                                    {role.priority}
                                </Tag>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{role.description}</p>
                            <div className="text-xs">
                                <span className="font-medium">Name:</span> {role.name}
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>

            {/* Members Table */}
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <span>Danh sách thành viên ({members.length})</span>
                        <Button
                            type="default"
                            icon={<InfoCircleOutlined />}
                            onClick={() => {
                                Modal.info({
                                    title: 'Hướng dẫn phân quyền',
                                    width: 700,
                                    content: (
                                        <div className="space-y-4">
                                            <h3 className="font-bold">Các Role và quyền hạn:</h3>
                                            {roles.map((role) => (
                                                <div key={role.id} className="border-l-4 pl-3 py-2" style={{ borderLeftColor: getRolePriorityColor(role.priority) }}>
                                                    <div className="font-bold">{role.display_name} (Priority: {role.priority})</div>
                                                    <div className="text-sm text-gray-600">{role.description}</div>
                                                </div>
                                            ))}
                                            <h3 className="font-bold mt-4">Nhóm quyền:</h3>
                                            {Object.entries(permissionGroups).map(([group, perms]) => (
                                                <div key={group} className="mb-3">
                                                    <div className="font-bold capitalize mb-1">{group}:</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {perms.map((p) => (
                                                            <Tag key={p.id} color="blue" title={p.description}>
                                                                {p.display_name}
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                });
                            }}
                        >
                            Xem chi tiết quyền
                        </Button>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={members}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Assign Role Modal */}
            <Modal
                title={`Phân quyền cho: ${selectedMember?.admin_user_name}`}
                open={isModalVisible}
                onOk={handleAssignRole}
                onCancel={() => setIsModalVisible(false)}
                okText="Phân quyền"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Vai trò hiện tại: <strong>{selectedMember?.role_display_name || 'Chưa có'}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        Vai trò cũ (legacy): <strong>{selectedMember?.vai_tro || 'Không có'}</strong>
                    </p>
                </div>

                <div>
                    <label className="block mb-2 font-medium">Chọn Role mới:</label>
                    <Select
                        value={selectedRole}
                        onChange={setSelectedRole}
                        style={{ width: '100%' }}
                        placeholder="Chọn role..."
                    >
                        {roles.map((role) => (
                            <Select.Option key={role.id} value={role.id}>
                                <div className="flex justify-between items-center">
                                    <span>{role.display_name}</span>
                                    <Tag color={getRolePriorityColor(role.priority)} className="ml-2">
                                        Priority: {role.priority}
                                    </Tag>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {role.description}
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">
                        <strong>Lưu ý:</strong> Việc thay đổi role sẽ ảnh hưởng đến quyền hạn của thành viên trong dự án này.
                        Chỉ có thể phân quyền role có priority thấp hơn role của bạn.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectPermissionsPage;
