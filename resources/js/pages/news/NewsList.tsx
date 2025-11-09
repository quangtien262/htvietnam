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
  Dropdown,
  Row,
  Col
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
import axios from 'axios';
import API from '../../common/api';
import TextArea from 'antd/es/input/TextArea';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import '../../../css/common-responsive.css';
import { optionSunEditor } from '../../function/sun_config';

const { TabPane } = Tabs;

interface Language {
  id: number;
  name: string;
  code: string;
  icon: string;
  is_key: number;
  sort_order: number;
}

interface NewsData {
  name_data: string;
  description: string;
  embed_code: string;
  content: string;
  meta_title: string;
  meta_keyword: string;
  meta_description: string;
}

interface News {
  id: number;
  name: string;
  menu_id: number;
  tags_id: number;
  tags: string;
  image: string;
  is_active: number;
  is_front: number;
  is_translate: number;
  views: number;
  sort_order: number;
  parent_id: number;
}

interface Menu {
  id: number;
  name: string;
}

const NewsList: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [filterMenuId, setFilterMenuId] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [filterFront, setFilterFront] = useState<number | undefined>(undefined);
  const [filterTags, setFilterTags] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLanguageTab, setActiveLanguageTab] = useState<string>('');
  const [newsDataByLang, setNewsDataByLang] = useState<Record<number, NewsData>>({});
  const [imageUrl, setImageUrl] = useState<string>('');
  const [menuList, setMenuList] = useState<Menu[]>([]);

  // State cho mobile filter drawer
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // SunEditor ref
  const editor = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    loadLanguages();
    loadMenuList();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, pageSize, search, filterMenuId, filterStatus, filterFront, filterTags]);

  const loadLanguages = async () => {
    try {
      const res = await axios.post(API.newsLanguages, {});
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
        const menuData = res.data.data?.datas || [];
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
      setMenuList([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API.newsList, {
        searchData: {
          page,
          pageSize,
          search,
          menu_id: filterMenuId,
          is_active: filterStatus,
          is_front: filterFront,
          tags: filterTags
        }
      });

      if (res.data.status_code === 200) {
        setDataSource(res.data.data.list);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setNewsDataByLang({});
    setImageUrl('');

    // Initialize empty data for all languages
    const emptyData: Record<number, NewsData> = {};
    languages.forEach((lang) => {
      emptyData[lang.id] = {
        name_data: '',
        description: '',
        embed_code: '',
        content: '',
        meta_title: '',
        meta_keyword: '',
        meta_description: ''
      };
    });
    setNewsDataByLang(emptyData);

    setIsModalVisible(true);
  };

  const handleEdit = async (record: News) => {
    setEditingId(record.id);

    try {
      const res = await axios.post(API.newsDetail, { id: record.id });

      if (res.data.status_code === 200) {
        const { news, news_data } = res.data.data;

        form.setFieldsValue({
          menu_id: news.menu_id,
          tags_id: news.tags_id,
          tags: news.tags ? news.tags.split(',').filter((tag: string) => tag.trim() !== '') : [],
          is_active: news.is_active,
          is_front: news.is_front === 1,
          is_translate: news.is_translate === 1,
          views: news.views,
          sort_order: news.sort_order
        });

        setImageUrl(news.image || '');
        setNewsDataByLang(news_data || {});
        setIsModalVisible(true);
      }
    } catch (error) {
      message.error('Lỗi khi tải chi tiết tin tức');
    }
  };

  const handleDelete = async (ids: number[]) => {
    try {
      const res = await axios.post(API.newsDelete, { ids });

      if (res.data.status_code === 200) {
        message.success('Xóa tin tức thành công');
        loadData();
      }
    } catch (error) {
      message.error('Lỗi khi xóa tin tức');
    }
  };

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

      // Extract content from SunEditor for all languages
      const updatedNewsDataByLang = { ...newsDataByLang };
      languages.forEach(lang => {
        const content = editor.current[`content_${lang.id}`]
          ? editor.current[`content_${lang.id}`].getContents(false)
          : (newsDataByLang[lang.id]?.content || '');

        if (updatedNewsDataByLang[lang.id]) {
          updatedNewsDataByLang[lang.id] = {
            ...updatedNewsDataByLang[lang.id],
            content: content
          };
        }
      });

      const newsData = {
        menu_id: values.menu_id || 0,
        tags_id: values.tags_id || 0,
        tags: Array.isArray(values.tags) ? values.tags.join(',') : (values.tags || ''),
        image: imageUrl,
        is_active: values.is_active,
        is_front: values.is_front ? 1 : 0,
        is_translate: values.is_translate ? 1 : 0,
        views: values.views || 0,
        sort_order: values.sort_order || 0,
        parent_id: 0
      };

      const payload = {
        news: newsData,
        news_data: updatedNewsDataByLang
      };

      if (editingId) {
        const res = await axios.post(API.newsUpdate, { id: editingId, ...payload });
        if (res.data.status_code === 200) {
          message.success('Cập nhật tin tức thành công');
        }
      } else {
        const res = await axios.post(API.newsAdd, payload);
        if (res.data.status_code === 200) {
          message.success('Thêm tin tức thành công');
        }
      }

      setIsModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleNewsDataChange = (langId: number, field: keyof NewsData, value: string) => {
    setNewsDataByLang((prev) => ({
      ...prev,
      [langId]: {
        ...(prev[langId] || {
          name_data: '',
          description: '',
          embed_code: '',
          content: '',
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
    formData.append('type', 'news');

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
        setImageUrl(result.data.url);
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

  const columns: ColumnsType<News> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) =>
        image ? <img src={image} alt="" style={{ width: 60, height: 60, objectFit: 'cover' }} /> : null
    },
    {
      title: 'Tên tin tức',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string) => (tags ? <Tag>{tags}</Tag> : null)
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
      title: 'Hiển thị',
      dataIndex: 'is_front',
      key: 'is_front',
      width: 100,
      render: (is_front: number) => (
        <Tag color={is_front === 1 ? 'blue' : 'default'}>
          {is_front === 1 ? 'Hiển thị' : 'Ẩn'}
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
                content: `Bạn có chắc chắn muốn xóa tin tức "${record.name}"?`,
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
        Quản lý Tin tức
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
                placeholder="Tìm kiếm tin tức..."
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
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
              <Select
                placeholder="Chọn trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
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
                value={filterFront}
                onChange={setFilterFront}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value={1}>Hiển thị</Select.Option>
                <Select.Option value={0}>Ẩn</Select.Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tags</label>
              <Input
                placeholder="Nhập tags"
                value={filterTags}
                onChange={(e) => setFilterTags(e.target.value)}
                allowClear
              />
            </div>

            <Button
              block
              onClick={() => {
                setSearch('');
                setFilterMenuId(undefined);
                setFilterStatus(undefined);
                setFilterFront(undefined);
                setFilterTags('');
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
                setFilterStatus(undefined);
                setFilterFront(undefined);
                setFilterTags('');
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
              placeholder="Tìm kiếm tin tức..."
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
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
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
              value={filterFront}
              onChange={setFilterFront}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={1}>Hiển thị</Select.Option>
              <Select.Option value={0}>Ẩn</Select.Option>
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tags</label>
            <Input
              placeholder="Nhập tags"
              value={filterTags}
              onChange={(e) => setFilterTags(e.target.value)}
              allowClear
            />
          </div>
        </Drawer>

        {/* Main Content - Bên phải */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm tin tức
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
              showTotal: (total) => `Tổng ${total} tin tức`
            }}
          />
        </div>
      </div>

      <Modal
        title={editingId ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        okText={editingId ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Menu" name="menu_id">
            <Select placeholder="Chọn menu" allowClear showSearch optionFilterProp="children">
              {menuList.map((menu) => (
                <Select.Option key={menu.id} value={menu.id}>
                  {menu.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Select
              mode="tags"
              placeholder="Nhập và chọn tags"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <Upload
              customRequest={customUploadRequest}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload ảnh</Button>
            </Upload>
            {imageUrl && (
              <div style={{ marginTop: 10 }}>
                <img src={imageUrl} alt="" style={{ width: 200, height: 200, objectFit: 'cover' }} />
              </div>
            )}
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

          <Form.Item label="Đã dịch" name="is_translate" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>

          <Tabs activeKey={activeLanguageTab} onChange={setActiveLanguageTab}>
            {languages.map((lang) => (
              <TabPane tab={lang.name} key={lang.id.toString()}>
                <Form.Item label="Tiêu đề" required>
                  <Input
                    value={newsDataByLang[lang.id]?.name_data || ''}
                    onChange={(e) => handleNewsDataChange(lang.id, 'name_data', e.target.value)}
                    placeholder="Nhập tiêu đề"
                  />
                </Form.Item>

                <Form.Item label="Mô tả ngắn">
                  <TextArea
                    rows={3}
                    value={newsDataByLang[lang.id]?.description || ''}
                    onChange={(e) => handleNewsDataChange(lang.id, 'description', e.target.value)}
                    placeholder="Nhập mô tả ngắn"
                  />
                </Form.Item>

                <Form.Item label="Nội dung">
                  <SunEditor
                    getSunEditorInstance={(sunEditor) => {
                      editor.current[`content_${lang.id}`] = sunEditor;
                    }}
                    setContents={newsDataByLang[lang.id]?.content || ''}
                    imageUploadHandler={(xmlHttpRequest: any, info: any, core: any) =>
                      imageUploadHandler(xmlHttpRequest, info, core, lang.id)
                    }
                    setOptions={optionSunEditor}
                    height="300px"
                  />
                </Form.Item>

                <Form.Item label="[SEO] Meta Title">
                  <Input
                    value={newsDataByLang[lang.id]?.meta_title || ''}
                    onChange={(e) => handleNewsDataChange(lang.id, 'meta_title', e.target.value)}
                    placeholder="Nhập meta title"
                  />
                </Form.Item>

                <Form.Item label="[SEO] Meta Keyword">
                  <TextArea
                    rows={2}
                    value={newsDataByLang[lang.id]?.meta_keyword || ''}
                    onChange={(e) => handleNewsDataChange(lang.id, 'meta_keyword', e.target.value)}
                    placeholder="Nhập meta keyword"
                  />
                </Form.Item>

                <Form.Item label="[SEO] Meta Description">
                  <TextArea
                    rows={3}
                    value={newsDataByLang[lang.id]?.meta_description || ''}
                    onChange={(e) => handleNewsDataChange(lang.id, 'meta_description', e.target.value)}
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

export default NewsList;
