import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Space,
  Popconfirm,
  Tabs,
  InputNumber,
  Switch,
  Tag,
  Divider,
  Drawer,
  Row,
  Col,
  Dropdown
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import API from '../../common/api';
import TextArea from 'antd/es/input/TextArea';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from '../../function/sun_config';
import { ActionDropdown } from '../../components/ActionDropdown';
import '../../../css/common-responsive.css';

const { TabPane } = Tabs;

interface Language {
  id: number;
  name: string;
  code: string;
  icon: string;
  is_key: number;
  sort_order: number;
}

interface ProductsData {
  name_data: string;
  description: string;
  content: string;
  content02: string;
  content03: string;
  meta_title: string;
  meta_keyword: string;
  meta_description: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  menu_id: number;
  product_group_id: number;
  product_application_id: number;
  product_status_id: number;
  is_hot: number;
  gia_ban: number;
  images: string;
  is_active: number;
  is_front: number;
  views: number;
  sort_order: number;
}

interface Menu {
  id: number;
  name: string;
}

interface ProductGroup {
  id: number;
  name: string;
}

interface ProductApplication {
  id: number;
  name: string;
}

interface ProductStatus {
  id: number;
  name: string;
}

const ProductsList: React.FC = () => {
  const [form] = Form.useForm();
  const editor = useRef<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [filterMenuId, setFilterMenuId] = useState<number | undefined>(undefined);
  const [filterGroupId, setFilterGroupId] = useState<number | undefined>(undefined);
  const [filterStatusId, setFilterStatusId] = useState<number | undefined>(undefined);
  const [filterIsActive, setFilterIsActive] = useState<number | undefined>(undefined);
  const [filterIsFront, setFilterIsFront] = useState<number | undefined>(undefined);
  const [filterIsHot, setFilterIsHot] = useState<number | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLanguageTab, setActiveLanguageTab] = useState<string>('');
  const [productsDataByLang, setProductsDataByLang] = useState<Record<number, ProductsData>>({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [productGroupList, setProductGroupList] = useState<ProductGroup[]>([]);
  const [productApplicationList, setProductApplicationList] = useState<ProductApplication[]>([]);
  const [productStatusList, setProductStatusList] = useState<ProductStatus[]>([]);

  // State cho mobile filter drawer
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  useEffect(() => {
    loadLanguages();
    loadMenuList();
    loadProductGroupList();
    loadProductApplicationList();
    loadProductStatusList();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, pageSize, search, filterMenuId, filterGroupId, filterStatusId, filterIsActive, filterIsFront, filterIsHot]);

  const loadLanguages = async () => {
    try {
      const res = await axios.post(API.productsLanguages, {});
      if (res.data.status_code === 200) {
        const langs = res.data.data;
        setLanguages(langs);
        if (langs.length > 0) {
          setActiveLanguageTab(langs[0].id.toString());
        }
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách ngôn ngữ');
    }
  };

  const loadMenuList = async () => {
    try {
      const res = await axios.post(API.menuList, {});
      if (res.data.status_code === 200) {
        // API trả về { datas: [...], total: ... }
        const menuData = res.data.data?.datas || [];
        // Flatten tree structure to flat list
        const flattenMenu = (items: any[], prefix = ''): any[] => {
          let result: any[] = [];
          items.forEach((item) => {
            result.push({
              id: item.id,
              name: prefix + item.name,
              parent_id: item.parent_id
            });
            if (item.children && item.children.length > 0) {
              result = result.concat(flattenMenu(item.children, prefix + '-- '));
            }
          });
          return result;
        };
        const flatMenuList = flattenMenu(Array.isArray(menuData) ? menuData : []);
        setMenuList(flatMenuList);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách menu:', error);
      setMenuList([]); // Set empty array on error
    }
  };

  const loadProductGroupList = async () => {
    try {
      // Giả sử có API hoặc dữ liệu tĩnh
      setProductGroupList([
        { id: 1, name: 'Nhóm 1' },
        { id: 2, name: 'Nhóm 2' },
      ]);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhóm sản phẩm:', error);
      setProductGroupList([]);
    }
  };

  const loadProductApplicationList = async () => {
    try {
      // Giả sử có API hoặc dữ liệu tĩnh
      setProductApplicationList([
        { id: 1, name: 'Ứng dụng 1' },
        { id: 2, name: 'Ứng dụng 2' },
      ]);
    } catch (error) {
      console.error('Lỗi khi tải danh sách ứng dụng:', error);
      setProductApplicationList([]);
    }
  };

  const loadProductStatusList = async () => {
    try {
      setProductStatusList([
        { id: 1, name: 'Còn hàng' },
        { id: 2, name: 'Hết hàng' },
        { id: 3, name: 'Ngừng kinh doanh' },
      ]);
    } catch (error) {
      console.error('Lỗi khi tải danh sách trạng thái:', error);
      setProductStatusList([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API.productsList, {
        searchData: {
          page,
          pageSize,
          search,
          menu_id: filterMenuId,
          product_group_id: filterGroupId,
          product_status_id: filterStatusId,
          is_active: filterIsActive,
          is_front: filterIsFront,
          is_hot: filterIsHot
        }
      });

      if (res.data.status_code === 200) {
        setDataSource(res.data.data.list);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setProductsDataByLang({});
    setFileList([]);
    setImageUrls([]);

    // Initialize empty data for all languages
    const emptyData: Record<number, ProductsData> = {};
    languages.forEach((lang) => {
      emptyData[lang.id] = {
        name_data: '',
        description: '',
        content: '',
        content02: '',
        content03: '',
        meta_title: '',
        meta_keyword: '',
        meta_description: ''
      };
    });
    setProductsDataByLang(emptyData);

    setIsModalVisible(true);
  };

  const handleEdit = async (record: Product) => {
    setEditingId(record.id);

    try {
      console.log('Loading product detail for ID:', record.id);
      const res = await axios.post(API.productsDetail, { id: record.id });
      console.log('Product detail response:', res.data);

      if (res.data.status_code === 200) {
        const { product, products_data } = res.data.data;

        console.log('Product data:', product);
        console.log('Products language data:', products_data);

        form.setFieldsValue({
          code: product.code,
          menu_id: product.menu_id,
          product_group_id: product.product_group_id,
          product_application_id: product.product_application_id,
          product_status_id: product.product_status_id,
          is_hot: product.is_hot,
          gia_ban: product.gia_ban,
          is_active: product.is_active,
          is_front: product.is_front === 1,
          views: product.views,
          sort_order: product.sort_order
        });

        // Parse images from JSON
        let images: string[] = [];
        if (product.images) {
          try {
            const parsed = JSON.parse(product.images);
            images = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // Nếu không parse được JSON, coi như string đơn
            images = product.images ? [product.images] : [];
          }
        }
        // Đảm bảo images luôn là array
        if (!Array.isArray(images)) {
          images = [];
        }

        // Filter ra chỉ những giá trị là string hợp lệ
        const validImages = images.filter(img => typeof img === 'string' && img.trim() !== '');
        setImageUrls(validImages);

        // Create file list for preview
        const files: UploadFile[] = validImages.map((url, index) => ({
          uid: `${index}`,
          name: `image-${index}`,
          status: 'done',
          url: url
        }));
        setFileList(files);

        setProductsDataByLang(products_data || {});
        setIsModalVisible(true);
      } else {
        message.error(res.data.message || 'Không thể tải chi tiết sản phẩm');
        console.error('API Error:', res.data);
      }
    } catch (error: any) {
      console.error('Error loading product detail:', error);
      console.error('Error response:', error?.response);
      message.error(`Lỗi khi tải chi tiết sản phẩm: ${error?.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (ids: number[]) => {
    try {
      const res = await axios.post(API.productsDelete, { ids });

      if (res.data.status_code === 200) {
        message.success('Xóa sản phẩm thành công');
        loadData();
      }
    } catch (error) {
      message.error('Lỗi khi xóa sản phẩm');
    }
  };

  const imageUploadHandler = (xmlHttpRequest: { response: any; }, info: any, core: any, langId: number, field: string) => {
    try {
      const result = JSON.parse(xmlHttpRequest.response);
      if (result.data) {
        for (const [key, val] of Object.entries(result.data)) {
          const imageUrl = (val as any).url;
          if (editor.current[`${field}_${langId}`]) {
            editor.current[`${field}_${langId}`].insertHTML(`<img src="${imageUrl}" />`, true, true);
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

      // Extract content from SunEditor for all languages and all 3 content fields
      const updatedProductsDataByLang = { ...productsDataByLang };
      languages.forEach(lang => {
        const content = editor.current[`content_${lang.id}`]
          ? editor.current[`content_${lang.id}`].getContents(false)
          : (productsDataByLang[lang.id]?.content || '');

        const content02 = editor.current[`content02_${lang.id}`]
          ? editor.current[`content02_${lang.id}`].getContents(false)
          : (productsDataByLang[lang.id]?.content02 || '');

        const content03 = editor.current[`content03_${lang.id}`]
          ? editor.current[`content03_${lang.id}`].getContents(false)
          : (productsDataByLang[lang.id]?.content03 || '');

        if (updatedProductsDataByLang[lang.id]) {
          updatedProductsDataByLang[lang.id] = {
            ...updatedProductsDataByLang[lang.id],
            content: content,
            content02: content02,
            content03: content03
          };
        }
      });

      const productData = {
        code: values.code || '',
        menu_id: values.menu_id || 0,
        product_group_id: values.product_group_id || 0,
        product_application_id: values.product_application_id || 0,
        product_status_id: values.product_status_id || 1,
        is_hot: values.is_hot || 2,
        gia_ban: values.gia_ban || 0,
        images: JSON.stringify(imageUrls),
        is_active: values.is_active,
        is_front: values.is_front ? 1 : 0,
        views: values.views || 0,
        sort_order: values.sort_order || 0,
        parent_id: 0
      };

      const payload = {
        product: productData,
        products_data: updatedProductsDataByLang
      };

      if (editingId) {
        const res = await axios.post(API.productsUpdate, { id: editingId, ...payload });
        if (res.data.status_code === 200) {
          message.success('Cập nhật sản phẩm thành công');
        }
      } else {
        const res = await axios.post(API.productsAdd, payload);
        if (res.data.status_code === 200) {
          message.success('Thêm sản phẩm thành công');
        }
      }

      setIsModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleProductsDataChange = (langId: number, field: keyof ProductsData, value: string) => {
    setProductsDataByLang((prev) => ({
      ...prev,
      [langId]: {
        ...(prev[langId] || {
          name_data: '',
          description: '',
          content: '',
          content02: '',
          content03: '',
          meta_title: '',
          meta_keyword: '',
          meta_description: ''
        }),
        [field]: value
      }
    }));
  };

  const customUploadRequest = async ({ file, onSuccess, onError }: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'products');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (result.status_code === 200) {
        const newUrl = result.data.url;
        setImageUrls((prev) => [...prev, newUrl]);
        onSuccess(result);
        message.success('Upload ảnh thành công');
      } else {
        onError(new Error('Upload failed'));
        message.error('Upload ảnh thất bại');
      }
    } catch (error) {
      onError(error);
      message.error('Lỗi khi upload ảnh');
    }
  };

  const handleRemoveImage = (file: UploadFile) => {
    const index = fileList.findIndex((item) => item.uid === file.uid);
    if (index > -1) {
      const newImageUrls = [...imageUrls];
      newImageUrls.splice(index, 1);
      setImageUrls(newImageUrls);
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Mã SP',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string) => {
        let imageArray: string[] = [];
        try {
          imageArray = JSON.parse(images);
        } catch {
          imageArray = images ? [images] : [];
        }
        return imageArray.length > 0 ? (
          <img src={imageArray[0]} alt="" style={{ width: 60, height: 60, objectFit: 'cover' }} />
        ) : null;
      }
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Giá bán',
      dataIndex: 'gia_ban',
      key: 'gia_ban',
      width: 120,
      render: (price: number) => price?.toLocaleString() + ' đ'
    },
    {
      title: 'Nổi bật',
      dataIndex: 'is_hot',
      key: 'is_hot',
      width: 100,
      render: (is_hot: number) => (
        <Tag color={is_hot === 1 ? 'red' : 'default'}>
          {is_hot === 1 ? 'Hot' : 'Bình thường'}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (is_active: number) => (
        <Tag color={is_active === 1 ? 'green' : 'red'}>
          {is_active === 1 ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Sửa',
            onClick: () => handleEdit(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa',
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: `Bạn có chắc chắn muốn xóa sản phẩm "${record.name}"?`,
                okText: 'Có',
                cancelText: 'Không',
                onOk: () => handleDelete([record.id])
              });
            }
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />}>
              Thao tác
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <div className="page-container" style={{ padding: 24 }}>
      <Divider orientation="left" style={{ fontSize: 20, fontWeight: 'bold' }}>
        Quản lý Sản phẩm
      </Divider>

      {/* Mobile Filter Button */}
      <div className="mobile-only" style={{ marginBottom: 16 }}>
        <Button
          icon={<FilterOutlined />}
          onClick={() => setFilterDrawerVisible(true)}
          block
          size="large"
        >
          Bộ lọc & Tìm kiếm
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Filter Panel - Desktop Only */}
        <div className="desktop-only" style={{ width: 280, flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            padding: 16,
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <Divider orientation="left" style={{ marginTop: 0 }}>Bộ lọc</Divider>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm</label>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Menu</label>
              <Select
                placeholder="Chọn menu"
                value={filterMenuId}
                onChange={setFilterMenuId}
                allowClear
                style={{ width: '100%' }}
              >
                {Array.isArray(menuList) && menuList.map((menu) => (
                  <Select.Option key={menu.id} value={menu.id}>
                    {menu.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nhóm sản phẩm</label>
              <Select
                placeholder="Chọn nhóm"
                value={filterGroupId}
                onChange={setFilterGroupId}
                allowClear
                style={{ width: '100%' }}
              >
                {Array.isArray(productGroupList) && productGroupList.map((group) => (
                  <Select.Option key={group.id} value={group.id}>
                    {group.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái SP</label>
              <Select
                placeholder="Chọn trạng thái"
                value={filterStatusId}
                onChange={setFilterStatusId}
                allowClear
                style={{ width: '100%' }}
              >
                {Array.isArray(productStatusList) && productStatusList.map((status) => (
                  <Select.Option key={status.id} value={status.id}>
                    {status.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
              <Select
                placeholder="Chọn trạng thái"
                value={filterIsActive}
                onChange={setFilterIsActive}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value={1}>Hoạt động</Select.Option>
                <Select.Option value={0}>Không hoạt động</Select.Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Hiển thị trang chủ</label>
              <Select
                placeholder="Chọn hiển thị"
                value={filterIsFront}
                onChange={setFilterIsFront}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value={1}>Hiển thị</Select.Option>
                <Select.Option value={0}>Ẩn</Select.Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Sản phẩm nổi bật</label>
              <Select
                placeholder="Chọn"
                value={filterIsHot}
                onChange={setFilterIsHot}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value={1}>Có</Select.Option>
                <Select.Option value={2}>Không</Select.Option>
              </Select>
            </div>

            <Button
              block
              onClick={() => {
                setSearch('');
                setFilterMenuId(undefined);
                setFilterGroupId(undefined);
                setFilterStatusId(undefined);
                setFilterIsActive(undefined);
                setFilterIsFront(undefined);
                setFilterIsHot(undefined);
                setPage(1);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          title="Bộ lọc & Tìm kiếm"
          placement="left"
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          width={300}
          footer={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block type="primary" onClick={() => setFilterDrawerVisible(false)}>
                Áp dụng
              </Button>
              <Button block onClick={() => {
                setSearch('');
                setFilterMenuId(undefined);
                setFilterGroupId(undefined);
                setFilterStatusId(undefined);
                setFilterIsActive(undefined);
                setFilterIsFront(undefined);
                setFilterIsHot(undefined);
                setPage(1);
                setFilterDrawerVisible(false);
              }}>
                Xóa bộ lọc
              </Button>
            </Space>
          }
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm</label>
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Menu</label>
            <Select
              placeholder="Chọn menu"
              value={filterMenuId}
              onChange={setFilterMenuId}
              allowClear
              style={{ width: '100%' }}
            >
              {Array.isArray(menuList) && menuList.map((menu) => (
                <Select.Option key={menu.id} value={menu.id}>
                  {menu.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nhóm sản phẩm</label>
            <Select
              placeholder="Chọn nhóm"
              value={filterGroupId}
              onChange={setFilterGroupId}
              allowClear
              style={{ width: '100%' }}
            >
              {Array.isArray(productGroupList) && productGroupList.map((group) => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái SP</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filterStatusId}
              onChange={setFilterStatusId}
              allowClear
              style={{ width: '100%' }}
            >
              {Array.isArray(productStatusList) && productStatusList.map((status) => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filterIsActive}
              onChange={setFilterIsActive}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={1}>Hoạt động</Select.Option>
              <Select.Option value={0}>Không hoạt động</Select.Option>
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Hiển thị trang chủ</label>
            <Select
              placeholder="Chọn hiển thị"
              value={filterIsFront}
              onChange={setFilterIsFront}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={1}>Hiển thị</Select.Option>
              <Select.Option value={0}>Ẩn</Select.Option>
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Sản phẩm nổi bật</label>
            <Select
              placeholder="Chọn"
              value={filterIsHot}
              onChange={setFilterIsHot}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={1}>Có</Select.Option>
              <Select.Option value={2}>Không</Select.Option>
            </Select>
          </div>
        </Drawer>

        {/* Main Content - Bên phải */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm sản phẩm
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize || 20);
              },
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} sản phẩm`
            }}
          />
        </div>
      </div>

      <Modal
        title={editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        okText={editingId ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Mã sản phẩm" name="code">
            <Input placeholder="Nhập mã sản phẩm (tự động nếu để trống)" />
          </Form.Item>

          <Form.Item label="Menu" name="menu_id">
            <Select placeholder="Chọn menu" allowClear showSearch optionFilterProp="children">
              {Array.isArray(menuList) && menuList.map((menu) => (
                <Select.Option key={menu.id} value={menu.id}>
                  {menu.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Nhóm sản phẩm" name="product_group_id">
            <Select placeholder="Chọn nhóm sản phẩm" allowClear showSearch optionFilterProp="children">
              {Array.isArray(productGroupList) && productGroupList.map((group) => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái sản phẩm" name="product_status_id" initialValue={1}>
            <Select placeholder="Chọn trạng thái">
              {Array.isArray(productStatusList) && productStatusList.map((status) => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Sản phẩm nổi bật" name="is_hot" initialValue={2}>
            <Select>
              <Select.Option value={1}>Có</Select.Option>
              <Select.Option value={2}>Không</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Giá bán" name="gia_ban" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item label="Ảnh sản phẩm">
            <Upload
              customRequest={customUploadRequest}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              onRemove={handleRemoveImage}
              accept="image/*"
              multiple
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="Trạng thái" name="is_active" initialValue={1}>
            <Select>
              <Select.Option value={1}>Hoạt động</Select.Option>
              <Select.Option value={0}>Không hoạt động</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Hiển thị trang chủ" name="is_front" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>

          <Tabs activeKey={activeLanguageTab} onChange={setActiveLanguageTab}>
            {languages.map((lang) => (
              <TabPane tab={lang.name} key={lang.id.toString()}>
                <Form.Item label="Tiêu đề" required>
                  <Input
                    value={productsDataByLang[lang.id]?.name_data || ''}
                    onChange={(e) => handleProductsDataChange(lang.id, 'name_data', e.target.value)}
                    placeholder="Nhập tiêu đề"
                  />
                </Form.Item>

                <Form.Item label="Mô tả ngắn">
                  <TextArea
                    rows={3}
                    value={productsDataByLang[lang.id]?.description || ''}
                    onChange={(e) => handleProductsDataChange(lang.id, 'description', e.target.value)}
                    placeholder="Nhập mô tả ngắn"
                  />
                </Form.Item>

                <Form.Item label="Ứng dụng">
                  <SunEditor
                    getSunEditorInstance={(sunEditor) => {
                      editor.current[`content_${lang.id}`] = sunEditor;
                    }}
                    setContents={productsDataByLang[lang.id]?.content || ''}
                    imageUploadHandler={(xmlHttpRequest: any, info: any, core: any) =>
                      imageUploadHandler(xmlHttpRequest, info, core, lang.id, 'content')
                    }
                    setOptions={optionSunEditor}
                    height="300px"
                  />
                </Form.Item>

                <Form.Item label="Mô tả sản phẩm">
                  <SunEditor
                    getSunEditorInstance={(sunEditor) => {
                      editor.current[`content02_${lang.id}`] = sunEditor;
                    }}
                    setContents={productsDataByLang[lang.id]?.content02 || ''}
                    imageUploadHandler={(xmlHttpRequest: any, info: any, core: any) =>
                      imageUploadHandler(xmlHttpRequest, info, core, lang.id, 'content02')
                    }
                    setOptions={optionSunEditor}
                    height="300px"
                  />
                </Form.Item>

                <Form.Item label="Thông số kỹ thuật">
                  <SunEditor
                    getSunEditorInstance={(sunEditor) => {
                      editor.current[`content03_${lang.id}`] = sunEditor;
                    }}
                    setContents={productsDataByLang[lang.id]?.content03 || ''}
                    imageUploadHandler={(xmlHttpRequest: any, info: any, core: any) =>
                      imageUploadHandler(xmlHttpRequest, info, core, lang.id, 'content03')
                    }
                    setOptions={optionSunEditor}
                    height="300px"
                  />
                </Form.Item>

                <Form.Item label="[SEO] Meta Title">
                  <Input
                    value={productsDataByLang[lang.id]?.meta_title || ''}
                    onChange={(e) => handleProductsDataChange(lang.id, 'meta_title', e.target.value)}
                    placeholder="Nhập meta title"
                  />
                </Form.Item>

                <Form.Item label="[SEO] Meta Keyword">
                  <TextArea
                    rows={2}
                    value={productsDataByLang[lang.id]?.meta_keyword || ''}
                    onChange={(e) => handleProductsDataChange(lang.id, 'meta_keyword', e.target.value)}
                    placeholder="Nhập meta keyword"
                  />
                </Form.Item>

                <Form.Item label="[SEO] Meta Description">
                  <TextArea
                    rows={3}
                    value={productsDataByLang[lang.id]?.meta_description || ''}
                    onChange={(e) => handleProductsDataChange(lang.id, 'meta_description', e.target.value)}
                    placeholder="Nhập meta description"
                  />
                </Form.Item>
              </TabPane>
            ))}
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsList;
