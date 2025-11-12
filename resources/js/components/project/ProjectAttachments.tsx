import React, { useState } from 'react';
import {
    Button,
    List,
    Empty,
    Tooltip,
    Popconfirm,
    message,
    Space,
    Modal,
    Form,
    Input,
    Upload,
    Image,
} from 'antd';
import {
    UploadOutlined,
    DownloadOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    FileWordOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { projectApi } from '../../common/api/projectApi';
import { ProjectAttachment } from '../../types/project';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ProjectAttachmentsProps {
    projectId: number;
    attachments: ProjectAttachment[];
    onUpdate: () => void;
}

const ProjectAttachments: React.FC<ProjectAttachmentsProps> = ({ projectId, attachments, onUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [editingAttachment, setEditingAttachment] = useState<ProjectAttachment | null>(null);
    const [descriptionForm] = Form.useForm();

    const handleFileUpload = async (file: File, description?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('mo_ta', description);
        }

        setUploading(true);
        try {
            const response = await projectApi.uploadAttachment(projectId, formData);

            if (response.data.success) {
                message.success('Tải file thành công');
                onUpdate();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setUploading(false);
        }

        return false;
    };

    const handleEditDescription = async () => {
        try {
            const values = await descriptionForm.validateFields();
            const response = await projectApi.updateAttachment(editingAttachment!.id, values.mo_ta);

            if (response.data.success) {
                message.success('Cập nhật mô tả thành công');
                setEditingAttachment(null);
                descriptionForm.resetFields();
                onUpdate();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
        try {
            const response = await projectApi.downloadAttachment(attachmentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            message.error('Không thể tải file');
        }
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        try {
            const response = await projectApi.deleteAttachment(attachmentId);

            if (response.data.success) {
                message.success('Xóa file thành công');
                onUpdate();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const getFileIcon = (extension: string) => {
        const ext = extension?.toLowerCase();
        if (ext === 'pdf') return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <FileImageOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
        if (['doc', 'docx'].includes(ext)) return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
        if (['xls', 'xlsx'].includes(ext)) return <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
        return <FileOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />;
    };

    const isImageFile = (extension: string) => {
        const ext = extension?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
    };

    const getImageUrl = (attachment: ProjectAttachment) => {
        return `/storage/${attachment.duong_dan}`;
    };

    return (
        <div>
            <Upload
                beforeUpload={(file) => {
                    Modal.confirm({
                        title: 'Thêm mô tả cho file (tùy chọn)',
                        content: (
                            <Input.TextArea
                                id="upload-description-project"
                                placeholder="Nhập mô tả cho file..."
                                rows={3}
                            />
                        ),
                        onOk: () => {
                            const description = (document.getElementById('upload-description-project') as HTMLTextAreaElement)?.value;
                            handleFileUpload(file, description);
                        },
                        okText: 'Upload',
                        cancelText: 'Hủy',
                    });
                    return false;
                }}
                showUploadList={false}
            >
                <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    loading={uploading}
                    style={{ marginBottom: 16 }}
                >
                    Tải file lên
                </Button>
            </Upload>

            <List
                dataSource={attachments || []}
                locale={{ emptyText: <Empty description="Chưa có file đính kèm" /> }}
                renderItem={(attachment) => (
                    <List.Item
                        actions={[
                            isImageFile(attachment.extension!) && (
                                <Tooltip title="Xem ảnh">
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => {
                                            Modal.info({
                                                title: attachment.ten_file,
                                                content: (
                                                    <Image
                                                        src={getImageUrl(attachment)}
                                                        alt={attachment.ten_file}
                                                        style={{ width: '100%' }}
                                                    />
                                                ),
                                                width: 800,
                                                okText: 'Đóng',
                                            });
                                        }}
                                    />
                                </Tooltip>
                            ),
                            <Tooltip title="Sửa mô tả">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setEditingAttachment(attachment);
                                        descriptionForm.setFieldsValue({ mo_ta: attachment.mo_ta || '' });
                                    }}
                                />
                            </Tooltip>,
                            <Tooltip title="Tải xuống">
                                <Button
                                    type="text"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownloadAttachment(attachment.id, attachment.ten_file)}
                                />
                            </Tooltip>,
                            <Popconfirm
                                title="Xác nhận xóa file này?"
                                onConfirm={() => handleDeleteAttachment(attachment.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Tooltip title="Xóa">
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Tooltip>
                            </Popconfirm>,
                        ].filter(Boolean)}
                    >
                        <List.Item.Meta
                            avatar={
                                isImageFile(attachment.extension!) ? (
                                    <Image
                                        src={getImageUrl(attachment)}
                                        alt={attachment.ten_file}
                                        width={50}
                                        height={50}
                                        style={{ objectFit: 'cover', borderRadius: 4 }}
                                        preview={false}
                                    />
                                ) : (
                                    getFileIcon(attachment.extension!)
                                )
                            }
                            title={attachment.ten_file}
                            description={
                                <div>
                                    {attachment.mo_ta && (
                                        <div style={{ marginBottom: 4, color: '#595959' }}>
                                            {attachment.mo_ta}
                                        </div>
                                    )}
                                    <Space size="small">
                                        <span>{attachment.formatted_size}</span>
                                        <span>•</span>
                                        <span>{attachment.uploader?.name || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{dayjs(attachment.created_at).fromNow()}</span>
                                    </Space>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />

            {/* Edit Description Modal */}
            <Modal
                title="Sửa mô tả file"
                open={!!editingAttachment}
                onOk={handleEditDescription}
                onCancel={() => {
                    setEditingAttachment(null);
                    descriptionForm.resetFields();
                }}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={descriptionForm} layout="vertical">
                    <Form.Item name="mo_ta" label="Mô tả">
                        <Input.TextArea rows={4} placeholder="Nhập mô tả cho file..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectAttachments;
