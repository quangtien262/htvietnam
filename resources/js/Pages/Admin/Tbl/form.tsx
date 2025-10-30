import React, { useState, useEffect  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, Table, message, Modal, Form, Input,InputNumber, Popconfirm, Descriptions, Select, Card, Checkbox, Col, Row, Tree, Space } from 'antd';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { TYPE_EDIT } from '../../../Function/constant';
import { showCheckbox} from '../../../Function/table';
import { onDrop } from "../../../Function/common";
const { TextArea } = Input;
export default function formTable(props) {
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingColumnForm, setLoadingColumnForm] = useState(false);
    const [table, setTable] = useState(props.table);
    const [column, setColumn] = useState(props.column);
    const [gData, setGData] = useState(props.columnData);
    const [isShowTableConfig, setIsShowTableConfig] = useState(props.tableId > 0 ? 'none':'block');
    const [isShowColumn, setIsShowColumn] = useState(props.tableId == 0 ? 'none':'block');
    const [isShowArtisan, setIsShowArtisan] = useState('none');
    const [messageApi, contextHolder] = message.useMessage();
    const key = 'updatable';

    function onDropData(info) {
        const result = onDrop(info, gData);
        setGData(result);
        axios.post(route('column.update_sort_order'),{
            data:JSON.stringify(result)
        }).then(response => {
            message.success('Cập nhật thứ tự thành công');
        }).catch(error => {
            message.error('Cập nhật thứ tự thất bại');
        });
        
    }

    const confirmDelete = () => {
        setIsOpenConfirmDelete(true);
    };
    const handleCancelDelete = () => {
        setIsOpenConfirmDelete(false);
    };

    const onFinishColumn = (values) => {
        setLoadingBtn(true);
        setLoadingColumnForm(true);
        console.log('values:', values);
        if(props.columnId > 0) {
            axios.post(route('column.submit', [props.tableId, props.columnId]),values).then(response => {
                message.success('Lưu Column thành công');
                setLoadingBtn(false);
                setLoadingColumnForm(false);
            }).catch(error => {
                message.error('Lưu Column thất bại');
                setLoadingBtn(false);
                setLoadingColumnForm(false);
            });
        } else {
            console.log('create');
            router.post(route('column.submit', [props.tableId, props.columnId]), values);
            // axios.post(route('column.submit', [props.tableId, props.columnId]),values).then(response => {
            //     message.success('Thêm mới Column thành công');
            // }).catch(error => {
            //     message.error('Thêm mới Column thất bại');
            // });
        }

    };

    const onFinishColumnFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        setLoadingBtn(false);
        message.error('Lưu Column thất bại');
    };

    const onFinishTable = (values) => {
        
        setLoadingBtn(true);
        try {
            console.log('values:', values);
            router.post(route('table.submit', [props.tableId]), values);
            message.success('Lưu Thành công');
        } catch (error) {
            console.log('error', error);
            setLoadingBtn(false);
            message.error('Lưu thất bại');
        }
    };

    const onFinishTableFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Vui lòng nhập các giá trị bắt buộc');
    };
    
    function showsettingColumn(data) {
        let listDefault = ['edit', 'show_in_list','add2search','require','fast_edit','show_in_detail'];
        if(data.type_edit === 'select') {
            listDefault = ['edit', 'show_in_list','add2search','require','fast_edit', 'show_in_detail','add_express'];
        }
        return listDefault.map((name, displayName) => {
            return showCheckbox(data, name,'column.update.edit')
        });
    }

    function formatGdata() {
        return formatGdata_item(gData);
    }

    function formatGdata_item(values) {
        return values.map((val) => {
            let children;
            if(val.children && val.children.length > 0) { 
                children = formatGdata_item(val.children);
            }
            let title = <div>
                <a onClick={() => {router.get(route('table.form', [props.tableId, val.key]));}}>{val.title}</a>
                <hr/>
                {showsettingColumn(val)}
                </div>
            if(val.is_label === 1) {
                title = val.title;
            }
            return {
              'title': title,
              'key': val.key,
              'children': children
            };
        })
    }

    const onDragEnter = (info) => {
        console.log(info);
    };

    // isShowTableConfig
    const displayFormTable = () => {
        if(isShowTableConfig == 'none') {
            setIsShowTableConfig('block');
            return;
        }
        setIsShowTableConfig('none');
    }

    const displayFormColumn= () => {
        console.log('isShowColumn', isShowColumn);
        if(isShowColumn == 'none') {
            setIsShowColumn('block');
            return;
        }
        setIsShowColumn('none');
    }

    const migrate = (e) => {
        e.preventDefault();
        console.log('migrate');
        runArtisan('migrate');
    }

    const migrateRefresh = (e) => {
        e.preventDefault();
        console.log('refresh');
        runArtisan('migrate:refresh');
    }

    const seeder = (e) => {
        e.preventDefault();
        console.log('seeder');
        runArtisan('db:seed');
    }

    const artisanAll = (e) => {
        e.preventDefault();
        runArtisan('all');
    }

    const artisanCache = (e) => {
        e.preventDefault();
        runArtisan('cache');
    }

    function runArtisan(type) {
        setLoadingBtn(true);
        messageApi.open({
            key,
            type: 'loading',
            content: 'Runing ' + type + '....' ,
        });
        axios.post(route('artisan'),{
            type: type
        }).then(response => {
            console.log('response', response);
            setLoadingBtn(false);
            messageApi.open({
                key,
                type: 'success',
                content: 'Loaded!',
                duration: 2,
            });
        })
        .catch(error => {
            console.log('error', error);
            message.error('Có lỗi xảy ra');
            setLoadingBtn(false);
        });
    }

    const onFormLayoutChange = (size) => {
        console.log('size', size);
    };

    return (
        <AdminLayout
            auth={props.auth}
            header={'Cài đặt bảng'}
            tables={props.tables}
            content={
                <div>
                    {contextHolder}

                    {/* Migrate */}
                    <Card type="inner"
                            style={{ cursor:'pointer' }}
                            title={<Space  onClick={() => {setIsShowArtisan(isShowArtisan === 'none' ? 'block' : 'none')}}><a>Artisan </a> <em className='_em'>Click để Ẩn/Hiện</em></Space>}
                            extra={''}>
                                <Descriptions bordered  layout="vertical" style={{ display:isShowArtisan }}>
                                    <Descriptions.Item>
                                        <Space>
                                            <Input />
                                            <Button loading={loadingBtn} type="primary">Run query</Button>
                                            <Popconfirm title='Xác nhận migrate'
                                                    onConfirm={migrate}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>Migrate</Button>
                                            </Popconfirm>

                                            <Popconfirm title='Xác nhận migrate refresh'
                                                    onConfirm={migrateRefresh}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>Migrate Refresh</Button>
                                            </Popconfirm>

                                            <Popconfirm title='Xác nhận Seed'
                                                    onConfirm={seeder}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>Seed</Button>
                                            </Popconfirm>

                                            <Popconfirm title='Run ALL là bao gồm cả migrate:refresh và db:seed'
                                                    onConfirm={artisanAll}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>ALL</Button>
                                            </Popconfirm>

                                            {/* <Popconfirm title='Xóa Cache'
                                                    onConfirm={artisanCache}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" danger>Xóa cache</Button>
                                            </Popconfirm> */}
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                    </Card>
                     {/* end Migrate */}

                    {/* table */}
                    <Form
                        name="formTable"
                        onFinish={onFinishTable}
                        onFinishFailed={onFinishTableFailed}
                        autoComplete="off"
                        initialValues={table}
                        onValuesChange={onFormLayoutChange}
                        >
                        <Card type="inner"
                            style={{ cursor:'pointer' }}
                            title={<Space onClick={displayFormTable}><a>Config Table: <span className='_red'>{table ? table.name : ''}</span></a><em className='_em'>Click để Ẩn/Hiện</em></Space>}
                            extra={
                                <div>
                                    <Button loading={loadingBtn} type="primary" htmlType="submit">
                                        Submit
                                    </Button>

                                    <Link className='ant-btn css-dev-only-do-not-override-yp8pcc ant-btn-default' href={route('table.index')}>Quay lại</Link>
                                </div>
                            }>
                            <Descriptions bordered  layout="vertical" style={{ display:isShowTableConfig }}>
                                <Descriptions.Item label="Tên bảng">
                                    <Form.Item name="name" rules={[{ required: true, message: 'Field này không được bỏ trống!' }]}>
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Tên hiển thị">
                                    <Form.Item name="display_name" rules={[{ required: true, message: 'Field này không được bỏ trống!' }]}>
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Kiểu show data">
                                    <Form.Item name="type_show" rules={[{ required: true, message: 'Field này không được bỏ trống!' }]}>
                                    <Select allowClear={true}
                                        showSearch
                                        style={{ width: 200 }}
                                        placeholder="Search to Select"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                        filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                        options={[
                                            {value: 0, label: 'Table basic'},
                                            {value: 1, label: 'Kiểu kéo thả đa cấp'},
                                            {value: 5, label: 'Chỉ có 1 data master'},
                                            {value: 3, label: 'Landingpage'},
                                            {value: 4, label: 'Block for Landingpage'},
                                            {value: 6, label: 'Lịch hẹn'},
                                            {value: 7, label: 'File Manager'},
                                            {value: 8, label: 'Kéo thả bảng'},
                                        ]}
                                    />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Số lượng item/page">
                                    <Form.Item name="count_item_of_page">
                                        <TextArea rows={1} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="tab_table_id">
                                    <Form.Item name="tab_table_id">
                                    <Select allowClear={true}
                                            showSearch
                                            style={{ width: 200 }}
                                            placeholder="Chọn table tab"
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                            filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                            options={props.tableSelect}
                                        />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="tab_table_name">
                                    <Form.Item name="tab_table_name">
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="add_btn_from_route">
                                    <Form.Item name="add_btn_from_route">
                                        <TextArea rows={2} placeholder='{
    "0": {
        "name":"route_name",
        "display_name":""
    }
}' />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="custom_link">
                                    <Form.Item name="custom_link">
                                        <TextArea rows={1} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="link">
                                    <Form.Item name="link">
                                        <TextArea rows={1} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Config">
                                    <Form.Item name="config">
                                        <TextArea rows={1} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="thong_ke">
                                    <Form.Item name="thong_ke">
                                        <TextArea rows={3} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="config_show_data">
                                    <Form.Item name="config_show_data">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="data_related">
                                    <Form.Item name="data_related">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                
                                <Descriptions.Item label="statistical_select">
                                    <Form.Item name="statistical_select">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>


                                <Descriptions.Item label="parent_id">
                                    <Form.Item name="parent_id">
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Kiểu nhập data">
                                    <Form.Item name="form_data_type">
                                    <Select allowClear={true}
                                        showSearch
                                        style={{ width: 200 }}
                                        placeholder="Search to Select"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                        filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                        options={[
                                            {value: 1, label: 'Mở sang 1 cửa sổ mới'},
                                            {value: 2,label: 'Mở dưới dang popup'},
                                        ]}
                                    />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Vị trí tìm kiếm">
                                    <Form.Item name="search_position">
                                    <Select allowClear={true}
                                        showSearch
                                        style={{ width: 200 }}
                                        placeholder="Search to Select"
                                        defaultValue={1}
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                        filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                        options={[
                                            {value: 1, label: 'Top'},
                                            {value: 2,label: 'Left'},
                                        ]}
                                    />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="check_seo">
                                    <Form.Item name="check_seo">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="html">
                                    <Form.Item name="html">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="show_table_lien_quan">
                                    <Form.Item name="show_table_lien_quan">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="link">
                                    <Form.Item name="link">
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="route_name">
                                    <Form.Item name="route_name">
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="script_form_edit">
                                    <Form.Item name="script_form_edit">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="note">
                                    <Form.Item name="note">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="order_by">
                                    <Form.Item name="order_by">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="search_params_default">
                                    <Form.Item name="search_params_default">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="table_data (Multiple lang)">
                                    <Form.Item name="table_data">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="current_button">
                                    <Form.Item name="current_button">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>
                            </Descriptions>

                            <Descriptions bordered  style={{ display:isShowTableConfig }}>
                                <Descriptions.Item label="Cài đặt khác">

                                <Row>
                                    <Col span={4}>
                                        <Form.Item name="expandable" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox >expandable</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_label" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox >is_label</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="multiple_block" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox >multiple_block</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_edit" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox >is_edit</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_show_btn_edit"  valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Btn edit</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_show_btn_detail"  valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Btn detail</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="have_delete"  valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Btn Delete</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="have_add_new" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Btn Thêm mới</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_edit_express" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Sửa nhanh</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_add_express" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Thêm mới nhanh</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_show_clone_btn" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Btn Clone</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="have_insert_all" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>insert_all</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_multiple_language" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Multiple language</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="import" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>import</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="export" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Export</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="smart_search" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>smart_search</Checkbox>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                </Descriptions.Item>
                            </Descriptions>

                            {/* submit table */}
                            <Descriptions bordered  style={{ display:isShowTableConfig }}>
                                <Descriptions.Item>
                                    <Space>
                                        <Button loading={loadingBtn} type="primary" htmlType="submit">Submit Table</Button>
                                        <Link className='ant-btn css-dev-only-do-not-override-yp8pcc ant-btn-default' href={route('table.index')}>Back to Config</Link>
                                    </Space>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Form>

                    {/* Column */}
                    <Form
                        name="basic"
                        onFinish={onFinishColumn}
                        onFinishFailed={onFinishColumnFailed}
                        autoComplete="off"
                        initialValues={column}
                        onValuesChange={onFormLayoutChange}
                        >
                        <Card type="inner"
                            title= {<Space onClick={displayFormTable}><a className='_red'>{column ? column.display_name + ' ('+ column.name +')' : 'Thêm mới Column'}</a><em className='_em'>Click để Ẩn/Hiện</em></Space>}
                            style={{ cursor:'pointer' }}
                            extra={
                                <div>
                                    <div>
                                        <Button type="primary" htmlType="submit" loading={loadingBtn}>
                                            {props.columnId === '0' ? 'Thêm mới':'Cập nhật'}
                                        </Button>
                                        <Link href={route('table.form', [props.tableId, 0])} className='ant-btn css-dev-only-do-not-override-yp8pcc ant-btn-default'>
                                            Hủy
                                        </Link>
                                    </div>
                                </div>
                            }>
                            <Descriptions bordered  layout="vertical" style={{ display:isShowColumn }}>
                                <Descriptions.Item label="Tên Col">
                                    <Form.Item name="name" rules={[{ required: true, message: 'Field này không được bỏ trống!' }]}>
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Tên hiển thị">
                                    <Form.Item name="display_name" rules={[{ required: true, message: 'Field này không được bỏ trống!' }]}>
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="value_default">
                                    <Form.Item name="value_default">
                                        <TextArea rows={1} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Kiểu DATA">
                                    <Form.Item name="type" rules={[{ required: true, message: 'Field này không được bỏ trống!' }]}>
                                    <Select allowClear={true}
                                        showSearch
                                        style={{ width: 200 }}
                                        placeholder="Search to Select"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                        filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                        options={[
                                            {value: 'INT', label: 'INT'},
                                            {value: 'VARCHAR',label: 'VARCHAR'},
                                            {value: 'TEXT',label: 'TEXT'},
                                            {value: 'LONGTEXT',label: 'LONGTEXT'},
                                            {value: 'DATE',label: 'DATE'},
                                            {value: 'TIME',label: 'TIME'},
                                            {value: 'DATETIME',label: 'DATETIME'},
                                            {value: 'FLOAT',label: 'FLOAT'},
                                            {value: 'TIMESTAMP',label: 'TIMESTAMP'}
                                        ]}
                                    />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Kiểu NHẬP liệu" rules={[{ required: true, message: 'Field này không được bỏ trống!' }]}>
                                    <Form.Item name="type_edit">
                                        <Select allowClear={true}
                                            showSearch
                                            style={{ width: 200 }}
                                            placeholder="Search to Select"
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                            filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                            options={TYPE_EDIT}
                                        />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="max_length">
                                    <Form.Item name="max_length">
                                        <Input  />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="col">
                                    <Form.Item name="col">
                                        <InputNumber />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="block_type">
                                    <Form.Item name="block_type">
                                        <Select allowClear={true}
                                            showSearch
                                            style={{ width: 200 }}
                                            placeholder="Search to Select"
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                            options={[
                                                {value: '', label: 'none'},
                                                {value: 'tab', label: 'tab'},
                                                {value: 'block_basic', label: 'block_basic'},
                                                {value: 'block_right',label: 'block_right'}
                                            ]}
                                        />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="Chọn bảng cần select">
                                    <Form.Item name="select_table_id">
                                        <Select allowClear={true}
                                            showSearch
                                            style={{ width: 200 }}
                                            placeholder="Search to Select"
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                            filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                            options={props.tableSelect}
                                        />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="Điều kiện select">
                                    <Form.Item name="data_select">
                                        <TextArea rows={1} placeholder='{
    "value":"col_name",
    "name": {
        "0":"col_name"
    }
}' />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tỷ lệ ảnh crop">
                                    <Form.Item name="ratio_crop">
                                        <Input/>
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="ĐK select (hoặc SL img)">
                                    <Form.Item name="conditions">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="class">
                                    <Form.Item name="class">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="add_column_in_list">
                                    <Form.Item name="add_column_in_list">
                                        <TextArea placeholder="{'0':'column_01'}" rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="auto_generate_code">
                                    <Form.Item name="auto_generate_code">
                                        <TextArea placeholder="{'edit':0,'prefix':0 }" rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>

                                <Descriptions.Item label="html detail">
                                    <Form.Item name="links">
                                        <TextArea placeholder="" rows={2} />
                                    </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="Kiểu tìm kiếm">
                                    <Form.Item name="search_type">
                                        <Select allowClear={true}
                                            showSearch
                                            style={{ width: 200 }}
                                            placeholder="Search to Select"
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                            filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                                            options={[
                                                {value: 1, label: 'Like'},
                                                {value: 2,label: 'equal'},
                                                {value: 3,label: 'different'},
                                                {value: 4,label: '% Like'},
                                                {value: 5,label: 'Like %'},
                                                {value: 6,label: 'between dates'}
                                            ]}
                                        />
                                    </Form.Item>
                                </Descriptions.Item>
                            </Descriptions>

                            <Descriptions bordered style={{ display:isShowColumn }}>
                                <Descriptions.Item label="Cài đặt khác">
                                <Row>
                                    <Col span={4}>
                                        <Form.Item name="require" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>require</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="edit" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>edit</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="fast_edit" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>Sửa nhanh</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="check_all_selects" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>check_all_selects</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_view_detail" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>is_view_detail</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="add2search" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>add2search</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="show_in_list" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>show_in_list</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="show_in_detail" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>show_in_detail</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="bg_in_list" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>bg_in_list</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_show_total" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>is_show_total</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_show_id" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>show_id</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="show_length" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>đếm length realtime</Checkbox>
                                        </Form.Item>
                                    </Col>

                                    <Col span={4}>
                                        <Form.Item name="add_express" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                                            <Checkbox>add_express (select)</Checkbox>
                                        </Form.Item>
                                    </Col>

                                </Row>
                                </Descriptions.Item>
                            </Descriptions>

                            <Descriptions bordered style={{ display:isShowColumn }}>
                                <Descriptions.Item>
                                    <Space>
                                        <Button type="primary" htmlType="submit" loading={loadingBtn}>
                                            {props.columnId === '0' ? 'Thêm mới Column':'Cập nhật Column'}
                                        </Button>
                                        <Link href={route('table.form', [props.tableId, 0])} className='ant-btn css-dev-only-do-not-override-yp8pcc ant-btn-default'>
                                            Hủy
                                        </Link>
                                    </Space>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Form>

                    {/* sort order */}
                    <Card type="inner"
                        title='Column config'
                        extra={
                            <div>
                                <Button loading={loadingBtn} type="default" htmlType="button">
                                    <Link href={route('table.index')}>Quay lại</Link>
                                </Button>
                            </div>
                        }>
                            <Tree className="draggable-tree"
                                draggable
                                blockNode
                                onDragEnter={onDragEnter}
                                onDrop={(info) => onDropData(info)}
                                treeData={formatGdata()}
                                checkStrictly={true}
                                // onSelect={onSelectColumn}
                            />
                        </Card>

                </div>
            }
        />
    );
}
