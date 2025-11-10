import React, { useState, useEffect } from 'react';
import { Layout, Tree, Button, Upload, Table, Modal, Form, Input, Select, message, Dropdown, Space, Progress, Tag, Typography, Card, Tooltip, Badge, Divider, Radio, Drawer } from 'antd';
import {
    FolderOutlined, FileOutlined, StarFilled, StarOutlined, DownloadOutlined,
    DeleteOutlined, ShareAltOutlined, EyeOutlined, MoreOutlined, PlusOutlined,
    UploadOutlined, CopyOutlined, ScissorOutlined, FileImageOutlined, FilePdfOutlined,
    FileWordOutlined, FileExcelOutlined, FileTextOutlined, FolderOpenOutlined, SearchOutlined,
    SortAscendingOutlined, SortDescendingOutlined, CalendarOutlined, DragOutlined, ArrowLeftOutlined, CommentOutlined
} from '@ant-design/icons';
import axios from '../../utils/axiosConfig';
import API from '../../common/api';
import type { DataNode } from 'antd/es/tree';
import DocumentHelpButton from '../../components/document/DocumentHelpButton';
import CommentsPanel from '../../components/document/CommentsPanel';

const { Sider, Content, Header } = Layout;
const { DirectoryTree } = Tree;
const { Title, Text } = Typography;

interface FileItem {
    id: number;
    ma_tai_lieu: string;
    ten_file: string;
    kich_thuoc: number;
    mime_type: string;
    extension: string;
    duong_dan: string;
    is_starred: boolean;
    created_at: string;
    nguoi_tai_len: { ten_nhan_vien: string; name?: string };
}

interface FolderItem {
    id: number;
    ma_thu_muc: string;
    ten_thu_muc: string;
    parent_id: number | null;
    mau_sac?: string;
    icon?: string;
    thu_tu_sap_xep?: number;
    created_at?: string;
    children?: FolderItem[];
}

export default function DocumentExplorerPage() {
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [folderModalVisible, setFolderModalVisible] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [shareFolderModalVisible, setShareFolderModalVisible] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [commentsDrawerVisible, setCommentsDrawerVisible] = useState(false);
    const [commentsTarget, setCommentsTarget] = useState<{ fileId?: number; folderId?: number }>({});
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; record: FileItem | null }>({
        visible: false,
        x: 0,
        y: 0,
        record: null
    });
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [renameForm] = Form.useForm();
    const [moveForm] = Form.useForm();

    // Tab view: 'my' | 'shared' | 'public'
    const [activeTab, setActiveTab] = useState<'my' | 'shared' | 'public'>('my');

    // Clipboard system
    const [clipboard, setClipboard] = useState<{ files: FileItem[]; action: 'copy' | 'cut' } | null>(null);

    // Folder context menu
    const [folderContextMenu, setFolderContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        folder: FolderItem | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        folder: null
    });

    // Rename folder modal
    const [renameFolderModalVisible, setRenameFolderModalVisible] = useState(false);
    const [renameFolderForm] = Form.useForm();
    const [selectedFolderForAction, setSelectedFolderForAction] = useState<FolderItem | null>(null);

    // Drag and drop state
    const [draggedFile, setDraggedFile] = useState<FileItem | null>(null);
    const [dropTargetFolder, setDropTargetFolder] = useState<number | null>(null);

    // Sort state
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [sortType, setSortType] = useState<'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'custom'>('name_asc');
    const [sortingFolders, setSortingFolders] = useState<FolderItem[]>([]);

    // Users for sharing
    const [availableUsers, setAvailableUsers] = useState<Array<{ value: number; label: string }>>([]);

    const [form] = Form.useForm();
    const [shareForm] = Form.useForm();
    const [shareFolderForm] = Form.useForm();

    useEffect(() => {
        if (activeTab === 'my') {
            loadFolders();
            loadFiles();
        } else if (activeTab === 'shared') {
            loadSharedFolders();
        } else if (activeTab === 'public') {
            loadPublicFolders();
        }
        loadUsers(); // Load users for sharing
    }, [activeTab]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => {
            setContextMenu({ visible: false, x: 0, y: 0, record: null });
            setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Attach drag & drop events to folder nodes
    useEffect(() => {
        const attachDragEvents = () => {
            const folderNodes = document.querySelectorAll('.folder-tree-node');

            folderNodes.forEach((node) => {
                const element = node as HTMLElement;
                const folderId = element.getAttribute('data-folder-id');

                const handleDragOverNode = (e: DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedFile) {
                        setDropTargetFolder(folderId ? parseInt(folderId) : null);
                    }
                };

                const handleDragLeaveNode = (e: DragEvent) => {
                    e.stopPropagation();
                    setDropTargetFolder(null);
                };

                const handleDropNode = async (e: DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropTargetFolder(null);

                    if (!draggedFile) return;

                    try {
                        await axios.post(API.documentFileMove(draggedFile.id), {
                            thu_muc_id: folderId ? parseInt(folderId) : null
                        });
                        message.success('Di chuyển file thành công');
                        loadFiles(selectedFolder || undefined);
                        setDraggedFile(null);
                    } catch (error) {
                        message.error('Di chuyển file thất bại');
                    }
                };

                element.addEventListener('dragover', handleDragOverNode as any);
                element.addEventListener('dragleave', handleDragLeaveNode as any);
                element.addEventListener('drop', handleDropNode as any);
            });
        };

        // Attach after folders loaded
        if (folders.length > 0) {
            setTimeout(attachDragEvents, 100);
        }

        return () => {
            const folderNodes = document.querySelectorAll('.folder-tree-node');
            folderNodes.forEach((node) => {
                const element = node as HTMLElement;
                element.removeEventListener('dragover', () => { });
                element.removeEventListener('dragleave', () => { });
                element.removeEventListener('drop', () => { });
            });
        };
    }, [folders, draggedFile, selectedFolder]);

    // Debug: Log khi folders thay đổi
    useEffect(() => {
        console.log('Folders state updated:', folders);
    }, [folders]);

    const loadFolders = async () => {
        try {
            const res = await axios.get(API.documentFolders);
            console.log('Folders response:', res.data); // Debug log
            // Xử lý trường hợp API trả về object có property data hoặc trực tiếp array
            const foldersData = res.data.data || res.data;
            console.log('Folders data:', foldersData); // Debug log
            setFolders(Array.isArray(foldersData) ? foldersData : []);
        } catch (error) {
            console.error('Load folders error:', error);
            message.error('Lỗi tải thư mục');
            setFolders([]); // Set empty array nếu lỗi
        }
    };

    const loadFiles = async (folderId?: number) => {
        setLoading(true);
        try {
            const res = await axios.get(API.documentFiles, {
                params: { thu_muc_id: folderId }
            });
            const filesData = res.data.data || res.data;
            setFiles(Array.isArray(filesData) ? filesData : []);
        } catch (error) {
            message.error('Lỗi tải file');
            setFiles([]); // Set empty array nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    const loadSharedFolders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API.documentFoldersShared);
            const foldersData = res.data.data || res.data;
            setFolders(Array.isArray(foldersData) ? foldersData : []);
            setFiles([]); // Clear files khi view shared folders
        } catch (error) {
            message.error('Lỗi tải thư mục được chia sẻ');
            setFolders([]);
        } finally {
            setLoading(false);
        }
    };

    const loadPublicFolders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API.documentFoldersPublic);
            const foldersData = res.data.folders || [];
            setFolders(Array.isArray(foldersData) ? foldersData : []);
            setFiles([]); // Clear files khi view public folders
        } catch (error) {
            message.error('Lỗi tải thư mục chung');
            setFolders([]);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const res = await axios.get(API.documentUsers);
            const users = res.data.map((user: any) => ({
                value: user.id,
                label: `${user.name} (${user.email})`
            }));
            setAvailableUsers(users);
        } catch (error) {
            console.error('Lỗi tải danh sách người dùng:', error);
        }
    };

    const convertToTreeData = (folders: FolderItem[]): DataNode[] => {
        return folders.map(folder => {
            const nodeId = `folder-${folder.id}`;
            return {
                title: (
                    <span
                        id={nodeId}
                        className="folder-tree-node"
                        data-folder-id={folder.id}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFolderContextMenu({
                                visible: true,
                                x: e.clientX,
                                y: e.clientY,
                                folder
                            });
                        }}
                        style={{
                            display: 'inline-block',
                            width: '100%',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: dropTargetFolder === folder.id ? '#e6f7ff' : 'transparent',
                            border: dropTargetFolder === folder.id ? '2px dashed #1890ff' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FolderOutlined style={{ color: folder.mau_sac || '#1890ff' }} /> {folder.ten_thu_muc}
                    </span>
                ),
                key: folder.id.toString(),
                icon: null,
                children: folder.children ? convertToTreeData(folder.children) : []
            };
        });
    };

    const handleFolderSelect = (selectedKeys: React.Key[]) => {
        const folderId = selectedKeys[0] ? parseInt(selectedKeys[0] as string) : null;
        setSelectedFolder(folderId);
        loadFiles(folderId || undefined);
    };

    const getCurrentFolderName = (): string => {
        if (!selectedFolder) return 'Tất cả tài liệu';
        const findFolder = (folders: FolderItem[], id: number): FolderItem | null => {
            for (const folder of folders) {
                if (folder.id === id) return folder;
                if (folder.children) {
                    const found = findFolder(folder.children, id);
                    if (found) return found;
                }
            }
            return null;
        };
        const folder = findFolder(folders, selectedFolder);
        return folder ? folder.ten_thu_muc : `Thư mục #${selectedFolder}`;
    };

    const getParentFolder = (): FolderItem | null => {
        if (!selectedFolder) return null;
        const findParent = (folders: FolderItem[], id: number, parent: FolderItem | null = null): FolderItem | null => {
            for (const folder of folders) {
                if (folder.id === id) return parent;
                if (folder.children) {
                    const found = findParent(folder.children, id, folder);
                    if (found !== undefined) return found;
                }
            }
            return undefined as any;
        };
        return findParent(folders, selectedFolder);
    };

    const handleBackToParent = () => {
        const parent = getParentFolder();
        setSelectedFolder(parent?.id || null);
        loadFiles(parent?.id || undefined);
    };

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        if (selectedFolder) formData.append('thu_muc_id', selectedFolder.toString());

        try {
            await axios.post(API.documentFileUpload, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Upload thành công');
            loadFiles(selectedFolder || undefined);
            setUploadModalVisible(false);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Upload thất bại');
        }
        return false; // Prevent default upload
    };

    const handleCreateFolder = async (values: any) => {
        // Check duplicate name
        const isDuplicate = folders.some(
            f => f.ten_thu_muc === values.ten_thu_muc && f.parent_id === selectedFolder
        );

        if (isDuplicate) {
            message.error('Tên thư mục đã tồn tại');
            return;
        }

        try {
            await axios.post(API.documentFolderStore, {
                ...values,
                parent_id: selectedFolder
            }).then((res) => {
                console.log('Create folder response:', res.data);
                message.success('Tạo thư mục thành công');
                loadFolders();
                setFolderModalVisible(false);
                form.resetFields();
            });
        } catch (error: any) {
            console.error('Create folder error:', error.response?.data);
            message.error(error.response?.data?.message || error.response?.data?.error || 'Tạo thư mục thất bại');
        }
    };

    const handleToggleStar = async (fileId: number) => {
        try {
            await axios.post(API.documentFileStar(fileId));
            loadFiles(selectedFolder || undefined);
        } catch (error) {
            message.error('Lỗi');
        }
    };

    const handleDownload = async (fileId: number) => {
        window.open(API.documentFileDownload(fileId), '_blank');
    };

    const handleShare = async (values: any) => {
        try {
            await axios.post(API.documentPermissionShare, {
                loai_doi_tuong: 'file',
                doi_tuong_id: selectedFile?.id,
                ...values
            });
            message.success('Chia sẻ thành công');
            setShareModalVisible(false);
            shareForm.resetFields();
        } catch (error) {
            message.error('Chia sẻ thất bại');
        }
    };

    const handleDelete = async (fileId: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa?',
            content: 'File sẽ được chuyển vào thùng rác',
            onOk: async () => {
                try {
                    await axios.post(API.documentFileDelete(fileId));
                    message.success('Đã xóa');
                    loadFiles(selectedFolder || undefined);
                } catch (error) {
                    message.error('Lỗi xóa');
                }
            }
        });
    };

    const handleRename = async (values: any) => {
        if (!selectedFile) return;
        try {
            await axios.post(API.documentFileUpdate(selectedFile.id), {
                ten_file: values.ten_file
            });
            message.success('Đổi tên thành công');
            setRenameModalVisible(false);
            renameForm.resetFields();
            loadFiles(selectedFolder || undefined);
        } catch (error) {
            message.error('Đổi tên thất bại');
        }
    };

    const handleMove = async (values: any) => {
        if (!selectedFile) return;
        try {
            await axios.post(API.documentFileMove(selectedFile.id), {
                thu_muc_id: values.thu_muc_id
            });
            message.success('Di chuyển thành công');
            setMoveModalVisible(false);
            moveForm.resetFields();
            loadFiles(selectedFolder || undefined);
        } catch (error) {
            message.error('Di chuyển thất bại');
        }
    };

    const handleCopy = async (fileId: number) => {
        try {
            await axios.post(API.documentFileCopy(fileId));
            message.success('Sao chép thành công');
            loadFiles(selectedFolder || undefined);
        } catch (error) {
            message.error('Sao chép thất bại');
        }
    };

    // Clipboard operations
    const handleCopyToClipboard = (files: FileItem[]) => {
        setClipboard({ files, action: 'copy' });
        message.info(`Đã copy ${files.length} file`);
    };

    const handleCutToClipboard = (files: FileItem[]) => {
        setClipboard({ files, action: 'cut' });
        message.info(`Đã cut ${files.length} file`);
    };

    const handlePasteToFolder = async (folderId: number | null) => {
        if (!clipboard) {
            message.warning('Clipboard trống');
            return;
        }

        try {
            if (clipboard.action === 'copy') {
                // Copy files
                for (const file of clipboard.files) {
                    await axios.post(API.documentFileCopy(file.id), {
                        thu_muc_id: folderId
                    });
                }
                message.success(`Đã sao chép ${clipboard.files.length} file`);
            } else {
                // Move files
                for (const file of clipboard.files) {
                    await axios.post(API.documentFileMove(file.id), {
                        thu_muc_id: folderId
                    });
                }
                message.success(`Đã di chuyển ${clipboard.files.length} file`);
                setClipboard(null); // Clear clipboard after cut
            }
            loadFiles(selectedFolder || undefined);
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    // Folder operations
    const handleRenameFolder = async (values: any) => {
        if (!selectedFolderForAction) return;

        // Check duplicate name
        const isDuplicate = folders.some(
            f => f.ten_thu_muc === values.ten_thu_muc && f.id !== selectedFolderForAction.id
        );

        if (isDuplicate) {
            message.error('Tên thư mục đã tồn tại');
            return;
        }

        try {
            await axios.post(API.documentFolderUpdate(selectedFolderForAction.id), {
                ten_thu_muc: values.ten_thu_muc
            });
            message.success('Đổi tên thư mục thành công');
            setRenameFolderModalVisible(false);
            renameFolderForm.resetFields();
            loadFolders();
        } catch (error) {
            message.error('Đổi tên thư mục thất bại');
        }
    };

    const handleDeleteFolder = async (folderId: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa thư mục?',
            content: 'Thư mục và tất cả nội dung bên trong sẽ bị xóa',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axios.post(API.documentFolderDelete(folderId));
                    message.success('Đã xóa thư mục');
                    loadFolders();
                    if (selectedFolder === folderId) {
                        setSelectedFolder(null);
                        loadFiles();
                    }
                } catch (error) {
                    message.error('Xóa thư mục thất bại');
                }
            }
        });
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, file: FileItem) => {
        setDraggedFile(file);
        e.dataTransfer.effectAllowed = 'move';
    };

    // Sort folders handlers
    const handleOpenSortModal = () => {
        setSortingFolders([...folders]);
        setSortModalVisible(true);
    };

    const handleSortFolders = async () => {
        let sorted = [...sortingFolders];

        switch (sortType) {
            case 'name_asc':
                sorted.sort((a, b) => a.ten_thu_muc.localeCompare(b.ten_thu_muc, 'vi'));
                break;
            case 'name_desc':
                sorted.sort((a, b) => b.ten_thu_muc.localeCompare(a.ten_thu_muc, 'vi'));
                break;
            case 'date_asc':
                sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                break;
            case 'date_desc':
                sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                break;
            case 'custom':
                // Keep manual order
                break;
        }

        // Update thu_tu_sap_xep for each folder
        const updates = sorted.map((folder, index) => ({
            id: folder.id,
            thu_tu_sap_xep: index
        }));

        try {
            await axios.post(API.documentFolderSortOrder, { folders: updates });
            message.success('Đã cập nhật thứ tự sắp xếp');
            setSortModalVisible(false);
            loadFolders();
        } catch (error) {
            message.error('Cập nhật thứ tự thất bại');
        }
    };

    const moveFolderUp = (index: number) => {
        if (index === 0) return;
        const newFolders = [...sortingFolders];
        [newFolders[index - 1], newFolders[index]] = [newFolders[index], newFolders[index - 1]];
        setSortingFolders(newFolders);
    };

    const moveFolderDown = (index: number) => {
        if (index === sortingFolders.length - 1) return;
        const newFolders = [...sortingFolders];
        [newFolders[index], newFolders[index + 1]] = [newFolders[index + 1], newFolders[index]];
        setSortingFolders(newFolders);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };

    const getFileIcon = (mimeType: string, extension: string) => {
        if (mimeType?.startsWith('image/')) return <FileImageOutlined style={{ fontSize: 18, color: '#52c41a' }} />;
        if (mimeType === 'application/pdf') return <FilePdfOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />;
        if (mimeType?.includes('word') || extension === 'docx') return <FileWordOutlined style={{ fontSize: 18, color: '#1890ff' }} />;
        if (mimeType?.includes('excel') || extension === 'xlsx') return <FileExcelOutlined style={{ fontSize: 18, color: '#52c41a' }} />;
        return <FileTextOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />;
    };

    const columns = [
        {
            title: 'Tên file',
            dataIndex: 'ten_file',
            key: 'ten_file',
            width: '40%',
            render: (text: string, record: FileItem) => (
                <Space size={12}>
                    {getFileIcon(record.mime_type, record.extension)}
                    <div>
                        <a
                            onClick={() => {
                                setSelectedFile(record);
                                setPreviewModalVisible(true);
                            }}
                            style={{ fontWeight: 500, fontSize: 14 }}
                        >
                            {text}
                        </a>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                            {record.extension?.toUpperCase()} • {formatFileSize(record.kich_thuoc)}
                        </div>
                    </div>
                    {record.is_starred && <StarFilled style={{ color: '#faad14' }} />}
                </Space>
            )
        },
        {
            title: 'Kích thước',
            dataIndex: 'kich_thuoc',
            key: 'kich_thuoc',
            render: (size: number) => formatFileSize(size)
        },
        {
            title: 'Người tải',
            dataIndex: 'nguoi_tai_len',
            key: 'nguoi_tai_len',
            width: '15%',
            render: (user: any) => (
                <Text ellipsis style={{ fontSize: 13 }}>
                    {user?.name || user?.ten_nhan_vien || 'N/A'}
                </Text>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: '15%',
            render: (date: string) => (
                <Text style={{ fontSize: 13 }}>
                    {new Date(date).toLocaleDateString('vi-VN')}
                </Text>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: '80px',
            align: 'center' as const,
            render: (_: any, record: FileItem) => (
                <Dropdown menu={{
                    items: [
                        {
                            key: 'star',
                            icon: record.is_starred ? <StarOutlined /> : <StarFilled />,
                            label: record.is_starred ? 'Bỏ gắn sao' : 'Gắn sao',
                            onClick: () => handleToggleStar(record.id)
                        },
                        {
                            key: 'rename',
                            icon: <FileOutlined />,
                            label: 'Đổi tên',
                            onClick: () => {
                                setSelectedFile(record);
                                renameForm.setFieldValue('ten_file', record.ten_file);
                                setRenameModalVisible(true);
                            }
                        },
                        {
                            key: 'copy-clipboard',
                            icon: <CopyOutlined />,
                            label: 'Sao chép (Copy)',
                            onClick: () => handleCopyToClipboard([record])
                        },
                        {
                            key: 'cut-clipboard',
                            icon: <ScissorOutlined />,
                            label: 'Cắt (Cut)',
                            onClick: () => handleCutToClipboard([record])
                        },
                        {
                            key: 'move',
                            icon: <ScissorOutlined />,
                            label: 'Di chuyển',
                            onClick: () => {
                                setSelectedFile(record);
                                setMoveModalVisible(true);
                            }
                        },
                        {
                            key: 'copy',
                            icon: <CopyOutlined />,
                            label: 'Sao chép',
                            onClick: () => handleCopy(record.id)
                        },
                        {
                            key: 'download',
                            icon: <DownloadOutlined />,
                            label: 'Tải xuống',
                            onClick: () => handleDownload(record.id)
                        },
                        {
                            key: 'share',
                            icon: <ShareAltOutlined />,
                            label: 'Chia sẻ',
                            onClick: () => { setSelectedFile(record); setShareModalVisible(true); }
                        },
                        {
                            key: 'comments',
                            icon: <CommentOutlined />,
                            label: 'Bình luận',
                            onClick: () => {
                                setCommentsTarget({ fileId: record.id });
                                setCommentsDrawerVisible(true);
                            }
                        },
                        {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: 'Xóa',
                            danger: true,
                            onClick: () => handleDelete(record.id)
                        }
                    ]
                }}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            )
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Sidebar - Folder Tree */}
            <Sider
                width={280}
                style={{
                    background: '#fff',
                    borderRight: '1px solid #e8e8e8',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.03)'
                }}
            >
                {/* Sidebar Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    background: '#fafafa'
                }}>
                    <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                        <FolderOpenOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        Thư Mục Của Tôi
                    </Title>

                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setFolderModalVisible(true)}
                            block
                            size="middle"
                        >
                            Tạo thư mục
                        </Button>
                        <Button
                            icon={<UploadOutlined />}
                            onClick={() => setUploadModalVisible(true)}
                            block
                            size="middle"
                        >
                            Tải file lên
                        </Button>
                    </Space>
                </div>

                {/* Folder Tree */}
                <div style={{ padding: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    <style>
                        {`
                            .ant-tree-directory div:first-child {
                                margin-top: -10px !important;
                            }
                        `}
                    </style>

                    {/* Root folder drop zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedFile) {
                                setDropTargetFolder(null);
                            }
                        }}
                        onDragLeave={() => setDropTargetFolder(-1)}
                        onDrop={async (e) => {
                            e.preventDefault();
                            setDropTargetFolder(-1);

                            if (!draggedFile) return;

                            try {
                                await axios.post(API.documentFileMove(draggedFile.id), {
                                    thu_muc_id: null
                                });
                                message.success('Di chuyển file về thư mục gốc thành công');
                                loadFiles(selectedFolder || undefined);
                                setDraggedFile(null);
                            } catch (error) {
                                message.error('Di chuyển file thất bại');
                            }
                        }}
                        style={{
                            padding: '12px',
                            marginBottom: 12,
                            borderRadius: 4,
                            backgroundColor: dropTargetFolder === null && draggedFile ? '#e6f7ff' : 'transparent',
                            border: dropTargetFolder === null && draggedFile ? '2px dashed #1890ff' : '2px solid transparent',
                            transition: 'all 0.2s',
                            cursor: draggedFile ? 'copy' : 'default'
                        }}
                    >
                        <Space>
                            <FolderOutlined style={{ color: '#1890ff' }} />
                            <Text strong>Thư mục gốc</Text>
                        </Space>
                    </div>

                    <DirectoryTree
                        // showIcon
                        icon={null}
                        defaultExpandAll
                        onSelect={handleFolderSelect}
                        treeData={convertToTreeData(folders)}
                        style={{ background: 'transparent' }}
                    />
                    {folders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bfbfbf' }}>
                            <FolderOutlined style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                            <Text type="secondary">Chưa có thư mục nào</Text>
                        </div>
                    )}
                </div>
            </Sider>

            {/* Main Content */}
            <Layout>
                {/* Content Header */}
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    borderBottom: '1px solid #e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    flexDirection: 'column',
                    height: 'auto'
                }}>
                    {/* Tab Navigation */}
                    <div style={{ width: '100%', borderBottom: '1px solid #f0f0f0', paddingTop: 12 }}>
                        <Radio.Group
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            buttonStyle="solid"
                        >
                            <Radio.Button value="my">
                                <FolderOutlined /> Thư mục của tôi
                            </Radio.Button>
                            <Radio.Button value="shared">
                                <ShareAltOutlined /> Được chia sẻ
                            </Radio.Button>
                            <Radio.Button value="public">
                                <FolderOpenOutlined /> Thư mục chung
                            </Radio.Button>
                        </Radio.Group>
                    </div>

                    {/* Title & Actions */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 12,
                        paddingBottom: 12
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {selectedFolder && activeTab === 'my' && (
                                <Button
                                    type="text"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handleBackToParent}
                                    style={{ marginRight: 8 }}
                                >
                                    Quay lại
                                </Button>
                            )}
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {activeTab === 'my' ? getCurrentFolderName() :
                                        activeTab === 'shared' ? 'Thư mục được chia sẻ với tôi' :
                                            'Thư mục chung'}
                                </Title>
                                <Space size={12}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        {activeTab === 'my' ? `${files.length} file` : `${folders.length} thư mục`}
                                    </Text>
                                    {clipboard && clipboard.files.length > 0 && (
                                        <Badge count={clipboard.files.length} showZero>
                                            <Tag color={clipboard.action === 'copy' ? 'blue' : 'orange'}>
                                                {clipboard.action === 'copy' ? '📋 Copied' : '✂️ Cut'}
                                            </Tag>
                                        </Badge>
                                    )}
                                </Space>
                            </div>
                        </div>
                        <Space size={12}>
                            <Input
                                placeholder="Tìm kiếm file..."
                                prefix={<SearchOutlined />}
                                style={{ width: 300 }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                            <Select
                                value={filterType}
                                onChange={setFilterType}
                                style={{ width: 150 }}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="image">Hình ảnh</Select.Option>
                                <Select.Option value="pdf">PDF</Select.Option>
                                <Select.Option value="word">Word</Select.Option>
                                <Select.Option value="excel">Excel</Select.Option>
                            </Select>
                            <DocumentHelpButton />
                        </Space>
                    </div>
                </Header>

                {/* File Table */}
                <Content style={{ padding: 24, background: '#f5f5f5' }}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <Table
                            columns={columns}
                            dataSource={files.filter(file => {
                                // Search filter
                                if (searchText && !file.ten_file.toLowerCase().includes(searchText.toLowerCase())) {
                                    return false;
                                }
                                // Type filter
                                if (filterType === 'image' && !file.mime_type?.startsWith('image/')) return false;
                                if (filterType === 'pdf' && file.mime_type !== 'application/pdf') return false;
                                if (filterType === 'word' && !file.mime_type?.includes('word') && file.extension !== 'docx') return false;
                                if (filterType === 'excel' && !file.mime_type?.includes('excel') && file.extension !== 'xlsx') return false;
                                return true;
                            })}
                            loading={loading}
                            rowKey="id"
                            onRow={(record) => ({
                                draggable: true,
                                onDragStart: (e) => handleDragStart(e, record),
                                onContextMenu: (e) => {
                                    e.preventDefault();
                                    setContextMenu({
                                        visible: true,
                                        x: e.clientX,
                                        y: e.clientY,
                                        record
                                    });
                                },
                                style: {
                                    cursor: 'grab',
                                    opacity: draggedFile?.id === record.id ? 0.5 : 1
                                }
                            })}
                            pagination={{
                                pageSize: 20,
                                showTotal: (total) => `Tổng ${total} file`,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100']
                            }}
                            locale={{
                                emptyText: (
                                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                        <FileOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 16 }}>
                                                Chưa có file nào
                                            </Text>
                                        </div>
                                        <Button
                                            type="primary"
                                            icon={<UploadOutlined />}
                                            onClick={() => setUploadModalVisible(true)}
                                            style={{ marginTop: 16 }}
                                        >
                                            Tải file lên
                                        </Button>
                                    </div>
                                )
                            }}
                        />
                    </Card>
                </Content>
            </Layout>            {/* Upload Modal */}
            <Modal
                title={
                    <Space>
                        <UploadOutlined style={{ color: '#1890ff' }} />
                        <span>Tải file lên</span>
                    </Space>
                }
                open={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                footer={null}
                width={600}
            >
                <Upload.Dragger
                    beforeUpload={handleUpload}
                    multiple
                    showUploadList={true}
                    style={{ padding: '20px' }}
                >
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                        Kéo thả file vào đây hoặc click để chọn
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                        Hỗ trợ upload nhiều file cùng lúc. Chấp nhận tất cả định dạng file.
                    </p>
                </Upload.Dragger>
                {selectedFolder && (
                    <div style={{ marginTop: 16, padding: 12, background: '#f0f9ff', borderRadius: 4, border: '1px solid #91d5ff' }}>
                        <Text type="secondary">
                            <FolderOutlined style={{ marginRight: 8 }} />
                            File sẽ được lưu vào thư mục đã chọn
                        </Text>
                    </div>
                )}
            </Modal>

            {/* Create Folder Modal */}
            <Modal
                title={
                    <Space>
                        <FolderOutlined style={{ color: '#1890ff' }} />
                        <span>Tạo thư mục mới</span>
                    </Space>
                }
                open={folderModalVisible}
                onCancel={() => {
                    setFolderModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Tạo"
                cancelText="Hủy"
                width={500}
            >
                <Form form={form} onFinish={handleCreateFolder} layout="vertical">
                    <Form.Item
                        name="ten_thu_muc"
                        label="Tên thư mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thư mục' }]}
                    >
                        <Input
                            placeholder="Nhập tên thư mục..."
                            size="large"
                            prefix={<FolderOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Form.Item>
                    <Form.Item
                        name="loai"
                        label="Loại thư mục"
                        rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                    >
                        <Select placeholder="Chọn loại thư mục" size="large">
                            <Select.Option value="ca_nhan">
                                <Space>
                                    <FileOutlined />
                                    Cá nhân
                                </Space>
                            </Select.Option>
                            <Select.Option value="phong_ban">
                                <Space>
                                    <FolderOutlined />
                                    Phòng ban
                                </Space>
                            </Select.Option>
                            <Select.Option value="cong_ty">
                                <Space>
                                    <FolderOpenOutlined />
                                    Công ty
                                </Space>
                            </Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="mau_sac" label="Màu sắc (tùy chọn)">
                        <Input type="color" style={{ width: 100, height: 40 }} />
                    </Form.Item>
                    <Form.Item name="mo_ta" label="Mô tả (tùy chọn)">
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập mô tả cho thư mục..."
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Share Modal */}
            <Modal
                title={
                    <Space>
                        <ShareAltOutlined style={{ color: '#1890ff' }} />
                        <span>Chia sẻ file</span>
                    </Space>
                }
                open={shareModalVisible}
                onCancel={() => {
                    setShareModalVisible(false);
                    shareForm.resetFields();
                }}
                onOk={() => shareForm.submit()}
                okText="Chia sẻ"
                cancelText="Hủy"
            >
                <Form form={shareForm} onFinish={handleShare} layout="vertical">
                    <Form.Item name="loai_chia_se" label="Loại chia sẻ" initialValue="user">
                        <Radio.Group>
                            <Radio value="user">Chia sẻ cho người dùng</Radio>
                            <Radio value="public">Công khai (ai cũng xem được)</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.loai_chia_se !== currentValues.loai_chia_se}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('loai_chia_se') === 'user' ? (
                                <Form.Item
                                    name="users"
                                    label="Chọn người dùng"
                                    rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn người dùng để chia sẻ"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={availableUsers}
                                        loading={availableUsers.length === 0}
                                    />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item name="quyen" label="Quyền truy cập" rules={[{ required: true, message: 'Vui lòng chọn quyền' }]}>
                        <Select>
                            <Select.Option value="viewer">Xem</Select.Option>
                            <Select.Option value="commenter">Bình luận</Select.Option>
                            <Select.Option value="editor">Chỉnh sửa</Select.Option>
                            <Select.Option value="manager">Quản lý</Select.Option>
                            <Select.Option value="owner">Chủ sở hữu</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Preview Modal */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: '#1890ff' }} />
                        <span>{selectedFile?.ten_file}</span>
                    </Space>
                }
                open={previewModalVisible}
                onCancel={() => setPreviewModalVisible(false)}
                footer={[
                    <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedFile && handleDownload(selectedFile.id)}>
                        Tải xuống
                    </Button>,
                    <Button key="close" onClick={() => setPreviewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={900}
                centered
            >
                {selectedFile && (
                    <div style={{ minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
                        {selectedFile.mime_type?.startsWith('image/') ? (
                            <img
                                src={`/files/${selectedFile.duong_dan}`}
                                alt={selectedFile.ten_file}
                                style={{ width: '100%', height: 'auto' }}
                            />
                        ) : selectedFile.mime_type === 'application/pdf' ? (
                            <iframe
                                src={`/files/${selectedFile.duong_dan}`}
                                style={{ width: '100%', height: 600, border: 'none' }}
                                title={selectedFile.ten_file}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <FileOutlined style={{ fontSize: 64, color: '#bfbfbf', marginBottom: 16 }} />
                                <div>
                                    <Text type="secondary">Không thể xem trước file này</Text>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownload(selectedFile.id)}
                                    style={{ marginTop: 16 }}
                                >
                                    Tải xuống để xem
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Context Menu */}
            {contextMenu.visible && contextMenu.record && (
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        zIndex: 9999,
                        background: '#fff',
                        boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)',
                        borderRadius: 4,
                        padding: '4px 0',
                        minWidth: 180
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            setSelectedFile(contextMenu.record);
                            setPreviewModalVisible(true);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <EyeOutlined style={{ marginRight: 8 }} />
                        Xem trước
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            contextMenu.record && handleDownload(contextMenu.record.id);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <DownloadOutlined style={{ marginRight: 8 }} />
                        Tải xuống
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            contextMenu.record && handleToggleStar(contextMenu.record.id);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        {contextMenu.record.is_starred ? <StarOutlined style={{ marginRight: 8 }} /> : <StarFilled style={{ marginRight: 8 }} />}
                        {contextMenu.record.is_starred ? 'Bỏ gắn sao' : 'Gắn sao'}
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            setSelectedFile(contextMenu.record);
                            renameForm.setFieldValue('ten_file', contextMenu.record!.ten_file);
                            setRenameModalVisible(true);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <FileOutlined style={{ marginRight: 8 }} />
                        Đổi tên
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            contextMenu.record && handleCopyToClipboard([contextMenu.record]);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <CopyOutlined style={{ marginRight: 8 }} />
                        Sao chép (Copy)
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            contextMenu.record && handleCutToClipboard([contextMenu.record]);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <ScissorOutlined style={{ marginRight: 8 }} />
                        Cắt (Cut)
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            setSelectedFile(contextMenu.record);
                            setShareModalVisible(true);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <ShareAltOutlined style={{ marginRight: 8 }} />
                        Chia sẻ
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            setCommentsTarget({ fileId: contextMenu.record?.id });
                            setCommentsDrawerVisible(true);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <CommentOutlined style={{ marginRight: 8 }} />
                        Bình luận
                    </div>
                    <Divider style={{ margin: '4px 0' }} />
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s', color: '#ff4d4f' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            contextMenu.record && handleDelete(contextMenu.record.id);
                            setContextMenu({ visible: false, x: 0, y: 0, record: null });
                        }}
                    >
                        <DeleteOutlined style={{ marginRight: 8 }} />
                        Xóa
                    </div>
                </div>
            )}

            {/* Folder Context Menu */}
            {folderContextMenu.visible && folderContextMenu.folder && (
                <div
                    style={{
                        position: 'fixed',
                        left: folderContextMenu.x,
                        top: folderContextMenu.y,
                        zIndex: 9999,
                        background: '#fff',
                        boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)',
                        borderRadius: 4,
                        padding: '4px 0',
                        minWidth: 180
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            setSelectedFolderForAction(folderContextMenu.folder);
                            renameFolderForm.setFieldValue('ten_thu_muc', folderContextMenu.folder!.ten_thu_muc);
                            setRenameFolderModalVisible(true);
                            setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
                        }}
                    >
                        <FileOutlined style={{ marginRight: 8 }} />
                        Đổi tên thư mục
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            handleOpenSortModal();
                            setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
                        }}
                    >
                        <SortAscendingOutlined style={{ marginRight: 8 }} />
                        Sắp xếp thư mục
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            setSelectedFolderForAction(folderContextMenu.folder);
                            setShareFolderModalVisible(true);
                            setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
                        }}
                    >
                        <ShareAltOutlined style={{ marginRight: 8 }} />
                        Chia sẻ thư mục
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            setCommentsTarget({ folderId: folderContextMenu.folder?.id });
                            setCommentsDrawerVisible(true);
                            setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
                        }}
                    >
                        <CommentOutlined style={{ marginRight: 8 }} />
                        Bình luận thư mục
                    </div>
                    {clipboard && clipboard.files.length > 0 && (
                        <div
                            style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => {
                                handlePasteToFolder(folderContextMenu.folder!.id);
                                setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
                            }}
                        >
                            <CopyOutlined style={{ marginRight: 8 }} />
                            Dán ({clipboard.files.length} file) - {clipboard.action === 'copy' ? 'Copy' : 'Cut'}
                        </div>
                    )}
                    <Divider style={{ margin: '4px 0' }} />
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s', color: '#ff4d4f' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                            handleDeleteFolder(folderContextMenu.folder!.id);
                            setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
                        }}
                    >
                        <DeleteOutlined style={{ marginRight: 8 }} />
                        Xóa thư mục
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            <Modal
                title={
                    <Space>
                        <FileOutlined style={{ color: '#1890ff' }} />
                        <span>Đổi tên file</span>
                    </Space>
                }
                open={renameModalVisible}
                onCancel={() => {
                    setRenameModalVisible(false);
                    renameForm.resetFields();
                }}
                onOk={() => renameForm.submit()}
                okText="Đổi tên"
                cancelText="Hủy"
            >
                <Form form={renameForm} onFinish={handleRename} layout="vertical">
                    <Form.Item
                        name="ten_file"
                        label="Tên file mới"
                        rules={[{ required: true, message: 'Vui lòng nhập tên file' }]}
                    >
                        <Input size="large" placeholder="Nhập tên file..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Move Modal */}
            <Modal
                title={
                    <Space>
                        <ScissorOutlined style={{ color: '#1890ff' }} />
                        <span>Di chuyển file</span>
                    </Space>
                }
                open={moveModalVisible}
                onCancel={() => {
                    setMoveModalVisible(false);
                    moveForm.resetFields();
                }}
                onOk={() => moveForm.submit()}
                okText="Di chuyển"
                cancelText="Hủy"
            >
                <Form form={moveForm} onFinish={handleMove} layout="vertical">
                    <Form.Item
                        name="thu_muc_id"
                        label="Chọn thư mục đích"
                        rules={[{ required: true, message: 'Vui lòng chọn thư mục' }]}
                    >
                        <Select size="large" placeholder="Chọn thư mục...">
                            <Select.Option value={null}>Thư mục gốc</Select.Option>
                            {folders.map(folder => (
                                <Select.Option key={folder.id} value={folder.id}>
                                    <FolderOutlined style={{ marginRight: 8, color: folder.mau_sac || '#1890ff' }} />
                                    {folder.ten_thu_muc}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Rename Folder Modal */}
            <Modal
                title={
                    <Space>
                        <FolderOutlined style={{ color: '#1890ff' }} />
                        <span>Đổi tên thư mục</span>
                    </Space>
                }
                open={renameFolderModalVisible}
                onCancel={() => {
                    setRenameFolderModalVisible(false);
                    renameFolderForm.resetFields();
                }}
                onOk={() => renameFolderForm.submit()}
                okText="Đổi tên"
                cancelText="Hủy"
            >
                <Form form={renameFolderForm} onFinish={handleRenameFolder} layout="vertical">
                    <Form.Item
                        name="ten_thu_muc"
                        label="Tên thư mục mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên thư mục' },
                            {
                                validator: async (_, value) => {
                                    if (!value) return;
                                    const isDuplicate = folders.some(
                                        f => f.ten_thu_muc === value && f.id !== selectedFolderForAction?.id
                                    );
                                    if (isDuplicate) {
                                        throw new Error('Tên thư mục đã tồn tại');
                                    }
                                }
                            }
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Nhập tên thư mục..."
                            prefix={<FolderOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Sort Folders Modal */}
            <Modal
                title={
                    <Space>
                        <SortAscendingOutlined style={{ color: '#1890ff' }} />
                        <span>Sắp xếp thư mục</span>
                    </Space>
                }
                open={sortModalVisible}
                onCancel={() => setSortModalVisible(false)}
                onOk={handleSortFolders}
                okText="Áp dụng"
                cancelText="Hủy"
                width={600}
            >
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                    <div>
                        <Text strong>Chọn kiểu sắp xếp:</Text>
                        <Radio.Group
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                            style={{ marginTop: 12, display: 'block' }}
                        >
                            <Space direction="vertical" size={8}>
                                <Radio value="name_asc">
                                    <Space>
                                        <SortAscendingOutlined />
                                        Tên A → Z
                                    </Space>
                                </Radio>
                                <Radio value="name_desc">
                                    <Space>
                                        <SortDescendingOutlined />
                                        Tên Z → A
                                    </Space>
                                </Radio>
                                <Radio value="date_asc">
                                    <Space>
                                        <CalendarOutlined />
                                        Ngày tạo (Cũ → Mới)
                                    </Space>
                                </Radio>
                                <Radio value="date_desc">
                                    <Space>
                                        <CalendarOutlined />
                                        Ngày tạo (Mới → Cũ)
                                    </Space>
                                </Radio>
                                <Radio value="custom">
                                    <Space>
                                        <DragOutlined />
                                        Tùy chỉnh (Kéo thả để sắp xếp)
                                    </Space>
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </div>

                    {sortType === 'custom' && (
                        <div>
                            <Divider />
                            <Text strong>Kéo thả để sắp xếp lại:</Text>
                            <div style={{ marginTop: 12, maxHeight: 300, overflowY: 'auto' }}>
                                {sortingFolders.map((folder, index) => (
                                    <div
                                        key={folder.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            marginBottom: 8,
                                            background: '#f5f5f5',
                                            borderRadius: 4,
                                            border: '1px solid #d9d9d9'
                                        }}
                                    >
                                        <Space>
                                            <DragOutlined style={{ color: '#8c8c8c', cursor: 'move' }} />
                                            <FolderOutlined style={{ color: folder.mau_sac || '#1890ff' }} />
                                            <Text>{folder.ten_thu_muc}</Text>
                                        </Space>
                                        <Space>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<SortAscendingOutlined />}
                                                onClick={() => moveFolderUp(index)}
                                                disabled={index === 0}
                                            />
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<SortDescendingOutlined />}
                                                onClick={() => moveFolderDown(index)}
                                                disabled={index === sortingFolders.length - 1}
                                            />
                                        </Space>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Space>
            </Modal>

            {/* Share Folder Modal */}
            <Modal
                title={
                    <Space>
                        <ShareAltOutlined style={{ color: '#1890ff' }} />
                        <span>Chia sẻ thư mục</span>
                    </Space>
                }
                open={shareFolderModalVisible}
                onCancel={() => {
                    setShareFolderModalVisible(false);
                    shareFolderForm.resetFields();
                }}
                onOk={async () => {
                    try {
                        const values = await shareFolderForm.validateFields();

                        if (!selectedFolderForAction) {
                            message.error('Không có thư mục được chọn');
                            return;
                        }

                        await axios.post(API.documentFolderShare(selectedFolderForAction.id), {
                            loai_chia_se: values.loai_chia_se,
                            users: values.users || [],
                            quyen: values.quyen,
                            ngay_het_han: values.ngay_het_han || null,
                        });

                        message.success('Chia sẻ thư mục thành công');
                        setShareFolderModalVisible(false);
                        shareFolderForm.resetFields();
                        loadFolders();
                    } catch (error) {
                        message.error('Chia sẻ thư mục thất bại');
                    }
                }}
                width={500}
            >
                <Form form={shareFolderForm} layout="vertical" initialValues={{ loai_chia_se: 'user', quyen: 'viewer' }}>
                    <Form.Item name="loai_chia_se" label="Loại chia sẻ">
                        <Radio.Group>
                            <Radio value="user">Chia sẻ cho người dùng</Radio>
                            <Radio value="public">Công khai (ai cũng xem được)</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.loai_chia_se !== currentValues.loai_chia_se}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('loai_chia_se') === 'user' ? (
                                <Form.Item
                                    name="users"
                                    label="Chọn người dùng"
                                    rules={[{ required: true, message: 'Vui lòng chọn người dùng!' }]}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn người dùng"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={availableUsers}
                                        loading={availableUsers.length === 0}
                                    />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item name="quyen" label="Quyền truy cập" rules={[{ required: true }]}>
                        <Select placeholder="Chọn quyền">
                            <Select.Option value="viewer">Xem</Select.Option>
                            <Select.Option value="commenter">Bình luận</Select.Option>
                            <Select.Option value="editor">Chỉnh sửa</Select.Option>
                            <Select.Option value="manager">Quản lý</Select.Option>
                            <Select.Option value="owner">Chủ sở hữu</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Comments Drawer */}
            <Drawer
                title="Bình luận"
                placement="right"
                width={500}
                onClose={() => setCommentsDrawerVisible(false)}
                open={commentsDrawerVisible}
            >
                <CommentsPanel
                    fileId={commentsTarget.fileId}
                    folderId={commentsTarget.folderId}
                    onClose={() => setCommentsDrawerVisible(false)}
                />
            </Drawer>
        </Layout>
    );
}
