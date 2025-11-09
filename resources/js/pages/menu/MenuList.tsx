import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Button, Space, message, Modal, Form, Input, Tree, Tabs, Upload, Select, Checkbox, Row, Col, Divider
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    MenuOutlined, UploadOutlined, PlusSquareOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';
import icon from '../../components/comp_icon';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from '../../function/sun_config';

const { TextArea } = Input;
const { Option } = Select;

interface MenuItem {
    id: number;
    name: string;
    images?: string;
    parent_id: number;
    current_link?: string;
    icon?: string;
    is_active: number;
    is_front: number;
    sort_order: number;
    children?: MenuItem[];
}

interface MenuData {
    name_data: string;
    name_data_description?: string;
    description?: string;
    content?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keyword?: string;
}

interface Language {
    id: number;
    name: string;
    code: string;
    icon?: string;
}

interface SearchParams {
    keyword?: string;
}

const iconList = Object.keys(icon);

const MenuList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useState<SearchParams>({});

    // Languages
    const [languages, setLanguages] = useState<Language[]>([]);
    const [activeLanguageTab, setActiveLanguageTab] = useState<string>('');
    const [menuDataByLang, setMenuDataByLang] = useState<Record<number, MenuData>>({});

    // SunEditor ref
    const editor = useRef<{ [key: string]: any }>({});

    // Upload images
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    useEffect(() => {
        loadLanguages();
        fetchData();
    }, [searchParams]);

    const loadLanguages = async () => {
        try {
            const res = await axios.post(API.menuLanguages, {});
            if (res?.data?.status_code === 200) {
                const langs = res.data.data.datas || [];
                setLanguages(langs);
                if (langs.length > 0) {
                    setActiveLanguageTab(String(langs[0].id));
                }
            }
        } catch (error) {
            console.error('Error loading languages:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API.menuList, {
                searchData: searchParams
            });

            if (res?.data?.status_code === 200) {
                const menus = res.data.data.datas || [];
                const tree = convertToTreeData(menus);
                setTreeData(tree);
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            message.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const convertToTreeData = (menus: MenuItem[]): DataNode[] => {
        return menus.map(menu => ({
            title: (
                <Space>
                    {menu.icon && icon[menu.icon as keyof typeof icon]}
                    <span>{menu.name}</span>
                    {menu.is_active === 0 && <span style={{ color: 'red' }}>(Ẩn)</span>}
                </Space>
            ),
            key: menu.id,
            children: menu.children ? convertToTreeData(menu.children) : undefined,
            menu: menu, // Store original data
        }));
    };

    const handleAdd = (parentId: number = 0) => {
        setModalMode('add');
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            parent_id: parentId,
            is_active: 1,
            is_front: 0,
        });
        setFileList([]);
        setUploadedImages([]);
        setMenuDataByLang({});
        setIsModalVisible(true);
    };

    const handleEdit = async (record: any) => {
        setModalMode('edit');
        setEditingRecord(record);

        // Load chi tiết menu
        try {
            const res = await axios.post(API.menuDetail, { id: record.id });
            if (res?.data?.status_code === 200) {
                const { menu, menu_data } = res.data.data;

                // Parse images
                let images: string[] = [];
                try {
                    images = menu.images ? JSON.parse(menu.images) : [];
                } catch (e) {
                    images = [];
                }

                form.setFieldsValue({
                    name: menu.name,
                    current_link: menu.current_link,
                    icon: menu.icon,
                    is_active: menu.is_active,
                    is_front: menu.is_front,
                });

                setUploadedImages(images);
                setFileList(images.map((url: string, index: number) => ({
                    uid: String(index),
                    name: `image-${index}`,
                    status: 'done',
                    url: url,
                })));

                // Set menu data by language
                setMenuDataByLang(menu_data || {});

                setIsModalVisible(true);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi tải chi tiết menu');
        }
    };

    const handleDelete = async (ids: number[]) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa menu này? Tất cả menu con cũng sẽ bị xóa.',
            onOk: async () => {
                try {
                    const res = await axios.post(API.menuDelete, { ids });
                    if (res?.data?.status_code === 200) {
                        message.success('Xóa thành công');
                        fetchData();
                    }
                } catch (error: any) {
                    message.error('Có lỗi xảy ra khi xóa');
                }
            },
        });
    };

    // SunEditor image upload handler
    const imageUploadHandler = (xmlHttpRequest: { response: any; }, info: any, core: any, langId: number) => {
        try {
            const result = JSON.parse(xmlHttpRequest.response);
            if (result.data) {
                for (const [key, val] of Object.entries(result.data)) {
                    const imageUrl = (val as any).url;
                    if (editor.current[`content_${langId}`]) {
                        editor.current[`content_${langId}`].insertHTML(`<img src="${imageUrl}" />`, true, true);
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing upload response:', e);
        }
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();

            // Prepare menu_data - get content from SunEditor
            const menuData: Record<number, MenuData> = {};
            languages.forEach(lang => {
                const data = menuDataByLang[lang.id];
                if (data && data.name_data) {
                    // Get content from SunEditor
                    const content = editor.current[`content_${lang.id}`]
                        ? editor.current[`content_${lang.id}`].getContents(false)
                        : (data.content || '');

                    menuData[lang.id] = {
                        ...data,
                        content: content
                    };
                }
            });

            const data = {
                ...values,
                images: uploadedImages,
                menu_data: menuData,
                id: editingRecord?.id,
            };

            const endpoint = modalMode === 'add' ? API.menuAdd : API.menuUpdate;
            const res = await axios.post(endpoint, data);

            if (res?.data?.status_code === 200) {
                message.success(modalMode === 'add' ? 'Thêm mới thành công' : 'Cập nhật thành công');
                setIsModalVisible(false);
                form.resetFields();
                fetchData();
            }
        } catch (error: any) {
            if (error.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin');
            } else {
                message.error('Có lỗi xảy ra');
            }
        }
    };

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(API.uploadImages, formData);
            if (res?.data?.status_code === 200) {
                const imageUrl = res.data.data.url;
                setUploadedImages(prev => [...prev, imageUrl]);
                onSuccess('ok');
                message.success('Upload thành công');
            }
        } catch (error) {
            onError(error);
            message.error('Upload thất bại');
        }
    };

    const handleRemoveImage = (file: any) => {
        const newImages = uploadedImages.filter(url => url !== file.url);
        setUploadedImages(newImages);
        setFileList(fileList.filter(f => f.uid !== file.uid));
    };

    const onDrop = (info: any) => {
        const dropKey = info.node.key;
        const dragKey = info.dragNode.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        // Build new tree structure
        const loop = (data: DataNode[], key: React.Key, callback: (node: DataNode, i: number, data: DataNode[]) => void) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children!, key, callback);
                }
            }
        };

        const data = [...treeData];
        let dragObj: DataNode;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.unshift(dragObj!);
            });
        } else if (
            (info.node.children || []).length > 0 &&
            info.node.expanded &&
            dropPosition === 1
        ) {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.unshift(dragObj!);
            });
        } else {
            let ar: DataNode[] = [];
            let i: number;
            loop(data, dropKey, (_item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i!, 0, dragObj!);
            } else {
                ar.splice(i! + 1, 0, dragObj!);
            }
        }

        setTreeData(data);

        // Update sort order on server
        updateSortOrderFromTree(data);
    };

    const updateSortOrderFromTree = async (data: DataNode[], parentId: number = 0) => {
        const items: any[] = [];

        const traverse = (nodes: DataNode[], parent: number, startOrder: number = 1) => {
            nodes.forEach((node, index) => {
                items.push({
                    id: node.key,
                    parent_id: parent,
                    sort_order: startOrder + index
                });

                if (node.children && node.children.length > 0) {
                    traverse(node.children, Number(node.key), 1);
                }
            });
        };

        traverse(data, parentId);

        try {
            await axios.post(API.menuUpdateSortOrder, { items });
            message.success('Cập nhật thứ tự thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật thứ tự');
            fetchData(); // Reload if error
        }
    };

    const handleMenuDataChange = (langId: number, field: string, value: any) => {
        setMenuDataByLang(prev => ({
            ...prev,
            [langId]: {
                ...(prev[langId] || {}),
                [field]: value
            }
        }));
    };

    const handleSearch = () => {
        fetchData();
    };

    const handleReset = () => {
        setSearchParams({});
    };

    const renderTreeTitle = (node: any) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Space>
                    {node.menu.icon && icon[node.menu.icon as keyof typeof icon]}
                    <span>{node.menu.name}</span>
                    {node.menu.is_active === 0 && <span style={{ color: 'red', fontSize: 12 }}>(Ẩn)</span>}
                </Space>
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<PlusSquareOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(node.menu.id);
                        }}
                    >
                        Thêm con
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(node.menu);
                        }}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete([node.menu.id]);
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        );
    };

    // Re-render tree with custom title
    const renderTree = (nodes: DataNode[]): DataNode[] => {
        return nodes.map(node => ({
            ...node,
            title: renderTreeTitle(node),
            children: node.children ? renderTree(node.children) : undefined,
        }));
    };

    return (
        <div style={{ padding: 24 }}>
            <Divider orientation="left" style={{ fontSize: 20, fontWeight: 'bold' }}>
                Quản lý Menu
            </Divider>

            <Card
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(0)}>
                        Thêm menu gốc
                    </Button>
                }
            >
                {/* Search */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder="Tìm kiếm menu..."
                            value={searchParams.keyword}
                            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                            onPressEnter={handleSearch}
                        />
                    </Col>
                    <Col span={8}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                Tìm kiếm
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Tree */}
                <Tree
                    className="draggable-tree"
                    draggable
                    blockNode
                    onDrop={onDrop}
                    treeData={renderTree(treeData)}
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                    autoExpandParent={autoExpandParent}
                    onExpand={(keys) => {
                        setExpandedKeys(keys);
                        setAutoExpandParent(false);
                    }}
                    onSelect={(keys) => setSelectedKeys(keys)}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={modalMode === 'add' ? 'Thêm menu mới' : 'Chỉnh sửa menu'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item name="parent_id" hidden>
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="current_link" label="Link">
                                <Input placeholder="Nhập link" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="icon" label="Icon">
                                <Select
                                    showSearch
                                    placeholder="Chọn icon"
                                    allowClear
                                >
                                    {iconList.map((iconName) => (
                                        <Option key={iconName} value={iconName}>
                                            <Space>
                                                {icon[iconName as keyof typeof icon]}
                                                {iconName}
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="is_active" label="Hiển thị" valuePropName="checked">
                                <Checkbox>Kích hoạt</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="is_front" label="Hiển thị frontend" valuePropName="checked">
                                <Checkbox>Hiển thị ngoài trang chủ</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Hình ảnh">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            customRequest={handleUpload}
                            onRemove={handleRemoveImage}
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            {fileList.length >= 8 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    {/* Multi-language tabs */}
                    <Tabs
                        activeKey={activeLanguageTab}
                        onChange={setActiveLanguageTab}
                        items={languages.map(lang => ({
                            key: String(lang.id),
                            label: lang.name,
                            children: (
                                <div>
                                    <Form.Item label="Tiêu đề menu" required>
                                        <Input
                                            placeholder="Nhập tiêu đề menu"
                                            value={menuDataByLang[lang.id]?.name_data || ''}
                                            onChange={(e) => handleMenuDataChange(lang.id, 'name_data', e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item label="Mô tả cho tiêu đề">
                                        <Input
                                            placeholder="Nhập mô tả"
                                            value={menuDataByLang[lang.id]?.name_data_description || ''}
                                            onChange={(e) => handleMenuDataChange(lang.id, 'name_data_description', e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item label="Mô tả ngắn">
                                        <TextArea
                                            rows={3}
                                            placeholder="Nhập mô tả ngắn"
                                            value={menuDataByLang[lang.id]?.description || ''}
                                            onChange={(e) => handleMenuDataChange(lang.id, 'description', e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item label="Nội dung">
                                        <SunEditor
                                            getSunEditorInstance={(sunEditor) => {
                                                editor.current[`content_${lang.id}`] = sunEditor;
                                            }}
                                            setContents={menuDataByLang[lang.id]?.content || ''}
                                            imageUploadHandler={(xmlHttpRequest: any, info: any, core: any) =>
                                                imageUploadHandler(xmlHttpRequest, info, core, lang.id)
                                            }
                                            setOptions={optionSunEditor}
                                            height="300px"
                                        />
                                    </Form.Item>

                                    <Form.Item label="[SEO] Meta Title">
                                        <TextArea
                                            rows={2}
                                            placeholder="Nhập meta title"
                                            value={menuDataByLang[lang.id]?.meta_title || ''}
                                            onChange={(e) => handleMenuDataChange(lang.id, 'meta_title', e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item label="[SEO] Meta Description">
                                        <TextArea
                                            rows={3}
                                            placeholder="Nhập meta description"
                                            value={menuDataByLang[lang.id]?.meta_description || ''}
                                            onChange={(e) => handleMenuDataChange(lang.id, 'meta_description', e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item label="[SEO] Meta Keyword">
                                        <TextArea
                                            rows={2}
                                            placeholder="Nhập meta keyword"
                                            value={menuDataByLang[lang.id]?.meta_keyword || ''}
                                            onChange={(e) => handleMenuDataChange(lang.id, 'meta_keyword', e.target.value)}
                                        />
                                    </Form.Item>
                                </div>
                            ),
                        }))}
                    />

                    <Form.Item>
                        <Space>
                            <Button type="primary" onClick={handleSubmit}>
                                {modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuList;
