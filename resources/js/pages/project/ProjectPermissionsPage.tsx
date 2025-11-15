import React, { useEffect, useState } from 'react';
import { Card, Table, Button, message, Tag, Modal, Select, Tooltip, Empty, Radio, Space, Popconfirm } from 'antd';
import { UserAddOutlined, EditOutlined, KeyOutlined, InfoCircleOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

import { showInfo } from '@/function/common';

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

interface AdminUser {
    id: number;
    name: string;
    email: string;
}

const ProjectPermissionsPage: React.FC<ProjectPermissionsPageProps> = ({ projectId }) => {
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]); // For multiple selection

    // Get projectId from URL if not provided
    const currentProjectId = projectId || parseInt(window.location.pathname.split('/')[3]) || 1;

    useEffect(() => {
        fetchData();
    }, [currentProjectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch project members
            const membersRes = await axios.get(`/project/api/rbac/projects/${currentProjectId}/members`);
            setMembers(membersRes.data.data || []);

            // Fetch available roles
            const rolesRes = await axios.get('/project/api/rbac/roles');
            console.log('🔍 Roles API Response:', rolesRes.data);
            const rolesData = rolesRes.data.data || [];
            console.log('📋 Roles Data:', rolesData, 'Length:', rolesData.length);
            setRoles(rolesData);

            // Fetch permissions (for info only)
            const permissionsRes = await axios.get('/project/api/rbac/permissions');
            setPermissions(permissionsRes.data.data || []);

            // Fetch all admin users for adding new members
            const usersRes = await axios.get('/project/api/admin-users');
            setAllUsers(usersRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Không thể tải dữ liệu phân quyền');
        } finally {
            setLoading(false);
        }
    };

    const showAddMemberModal = () => {
        setSelectedUserIds([]);
        setSelectedRole(null);
        setIsAddMemberModalVisible(true);
    };

    const showAssignRoleModal = (member: ProjectMember) => {
        setSelectedMember(member);
        setSelectedRole(member.role_id);
        setIsModalVisible(true);
    };

    const handleAddMember = async () => {
        if (!selectedUserIds.length || !selectedRole) {
            message.error('Vui lòng chọn ít nhất một thành viên và role');
            return;
        }

        setLoading(true);
        try {
            let successCount = 0;
            let errorCount = 0;

            // Add each selected user
            for (const userId of selectedUserIds) {
                try {
                    // First add member to project with a default vai_tro
                    await axios.post(`/project/api/projects/${currentProjectId}/members`, {
                        admin_user_id: userId,
                        vai_tro: 'thanh_vien', // Required field: must be 'quan_ly', 'thanh_vien', or 'xem'
                    });

                    // Get the newly added member
                    const updatedMembers = await axios.get(`/project/api/rbac/projects/${currentProjectId}/members`);
                    const newMember = updatedMembers.data.data.find((m: ProjectMember) => m.admin_user_id === userId);

                    if (newMember) {
                        // Assign RBAC role
                        await axios.post(`/project/api/rbac/projects/${currentProjectId}/members/${newMember.id}/assign-role`, {
                            role_id: selectedRole,
                        });
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Error adding user ${userId}:`, error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                message.success(`Đã thêm ${successCount} thành viên thành công!`);
            }
            if (errorCount > 0) {
                message.warning(`${errorCount} thành viên thêm thất bại`);
            }

            setIsAddMemberModalVisible(false);
            fetchData();
        } catch (error: any) {
            console.error('Error adding members:', error);
            message.error(error.response?.data?.message || 'Không thể thêm thành viên');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async () => {
        if (!selectedMember || !selectedRole) {
            message.error('Vui lòng chọn role');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/project/api/rbac/projects/${currentProjectId}/members/${selectedMember.id}/assign-role`, {
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

    const handleDeleteMember = async (memberId: number, memberName: string) => {
        try {
            await axios.delete(`/project/api/projects/${currentProjectId}/members/${memberId}`);
            message.success(`Đã xóa thành viên ${memberName}`);
            fetchData();
        } catch (error: any) {
            console.error('Error deleting member:', error);
            message.error(error.response?.data?.message || 'Không thể xóa thành viên');
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
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showAssignRoleModal(record)}
                        size="small"
                    >
                        Phân quyền
                    </Button>
                    <Popconfirm
                        title="Xóa thành viên"
                        description={`Bạn có chắc muốn xóa ${record.admin_user_name} khỏi dự án?`}
                        onConfirm={() => handleDeleteMember(record.id, record.admin_user_name)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
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
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold mb-2">
                        <KeyOutlined className="mr-2" />
                        Quản lý phân quyền dự án
                    </h1>
                    <p className="text-gray-600">
                        Quản lý vai trò và quyền hạn của thành viên trong dự án
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={showAddMemberModal}
                    size="large"
                >
                    Thêm thành viên & phân quyền
                </Button>
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
                        <span>
                            <TeamOutlined className="mr-2" />
                            Danh sách thành viên ({members.length})
                        </span>
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
                {members.length === 0 && !loading ? (
                    <Empty
                        description={
                            <div>
                                <p className="mb-2">Chưa có thành viên nào trong dự án</p>
                                <Button type="primary" icon={<UserAddOutlined />} onClick={showAddMemberModal}>
                                    Thêm thành viên đầu tiên
                                </Button>
                            </div>
                        }
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={members}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                )}
            </Card>

            {/* Add Member Modal */}
            <Modal
                title={
                    <span>
                        <UserAddOutlined className="mr-2" />
                        Thêm thành viên vào dự án
                    </span>
                }
                open={isAddMemberModalVisible}
                onOk={handleAddMember}
                onCancel={() => setIsAddMemberModalVisible(false)}
                okText="Thêm & Phân quyền"
                cancelText="Hủy"
                maskClosable={false}
                confirmLoading={loading}
                width={600}
            >
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded">
                        <a><InfoCircleOutlined className="mr-2" /> </a>
                        <em> Chọn một hoặc nhiều nhân viên và role để thêm vào dự án. Tất cả sẽ được phân quyền cùng role đã chọn.</em>
                    </div>

                    <div>
                        <br />
                        <b className="block mb-2 font-medium">Chọn nhân viên:</b>
                        <Select
                            mode="multiple"
                            value={selectedUserIds}
                            onChange={setSelectedUserIds}
                            style={{ width: '100%' }}
                            placeholder="Chọn một hoặc nhiều nhân viên..."
                            showSearch
                            filterOption={(input, option) => {
                                const label = option?.label || '';
                                return String(label).toLowerCase().includes(input.toLowerCase());
                            }}
                            options={allUsers
                                .filter(user => !members.some(m => m.admin_user_id === user.id))
                                .map((user) => ({
                                    value: user.id,
                                    label: `${user.name} (${user.email})`,
                                }))}
                            maxTagCount="responsive"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            <em>Chỉ hiển thị nhân viên chưa có trong dự án. Có thể chọn nhiều người cùng lúc.</em>
                        </p>
                    </div>

                    <div>
                        <p><b className="block mb-3 font-medium">Chọn Role:</b></p>

                        {roles.length === 0 ? (
                            <div className="p-4 bg-gray-50 rounded text-center">
                                <Empty
                                    description="Không có role nào khả dụng. Vui lòng kiểm tra cấu hình RBAC."
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            </div>
                        ) : (
                            <Radio.Group
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full"
                            >
                                <Space direction="vertical" className="w-full">
                                    {roles.map((role) => (
                                        <Radio key={role.id} value={role.id} className="w-full">
                                            <div className="flex items-start justify-between w-full py-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{role.display_name}</span>
                                                        <Tag color={getRolePriorityColor(role.priority)} className="ml-2">
                                                            Priority: {role.priority}
                                                        </Tag>

                                                        {showInfo(role.description)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Radio>
                                    ))}
                                </Space>
                            </Radio.Group>
                        )}
                    </div>

                    <div className="p-3 bg-yellow-50 rounded">
                        <p className="text-xs text-yellow-700">
                            <strong>Lưu ý:</strong> Chỉ có thể phân quyền role có priority thấp hơn role của bạn.
                            Tất cả thành viên được chọn sẽ nhận cùng một role.
                        </p>
                    </div>
                </div>
            </Modal>

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
                        style={{ width: '100%', height: 100 }}
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
