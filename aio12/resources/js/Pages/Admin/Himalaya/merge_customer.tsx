import React, { useState, useEffect, useRef  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head } from '@inertiajs/inertia-react';
import { Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, 
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, Radio, Popconfirm, 
    Divider, Table, Spin, List, Typography  } from 'antd';
import { Link } from '@inertiajs/react';
import { FormOutlined, CopyOutlined, UploadOutlined, CloseSquareOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';

import axios from 'axios';

import { inArray } from '../../../Function/common';

import '../../../../css/form.css';

export default function Dashboard(props) {
    const [formData] = Form.useForm();
    const [toData, setToData] = useState([]);
    const [contentTo, setContentTo] = useState('');
    const [contentFrom, setContentFrom] = useState();
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [dataSelect, setDataSelect] = useState(props.customers);

    function merge() {
        formData.submit();
    }

    const onFinish = (values) => {
        console.log('values', values);
        if(values.from === values.to) {
            message.error('Khách hàng theo dõi và ngừng theo dõi phải khác nhau');
            return;
        }
        axios.post(route('hima.merge_customer'), values)
        .then((response) => {
            if (response.data.status_code == 200) {
                setDataSelect(response.data.data);
                setContentTo('');
                setContentFrom('');
                formData.resetFields();
                message.success("Gộp khách hàng thành công");
            } else {
                message.error("Gộp khách hàng thất bại");
            }
        })
        .catch((error) => {
            message.error("Gộp khách hàng thất bại");
        });
    };
    
    const handleChangeFrom = (value) => {
        const result = props.users.map((user) => {
            if (user.value === value) {
                return showUserData(user);
            }
        });
        setContentFrom(result);
    };
    
    const handleChangeTo = (value) => {
        const data = props.users.map((user) => {
            if (user.value === value) {
                return showUserData(user);
            }
        });
        console.log('data', data);
          
        const result = <ul className='ant-list-items'>{data}</ul>;
        setContentTo(result);
    };

    function showUserData(user) {
        const ignoreEdit = ["image", "images", "image_crop", "images_crop", 'select', 'selects'];
        const ignoreBlockType = ["tab", "block_basic", "block_right"];
        let result = props.columns.map((col) => {
            if (col.edit === 1 && !ignoreEdit.includes(col.type_edit) && !ignoreBlockType.includes(col.block_type) ) {
                return <li key={col.name} className='ant-list-items'><b>{col.display_name}</b>: {user[col.name]}</li>;
            }
        });   
        
        return result;
    }

    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={props.tables}
            content={
                <div>
                    <Form
                        name="basic"
                        layout="vertical"
                        form={formData}
                        onFinish={onFinish}
                        autoComplete="off"
                        // initialValues={initialValuesForm()}
                    >
                        <Card
                            type="inner"
                            title={'Gộp khách hàng'}
                            extra={
                                <Space>

                                    <Button type="primary" htmlType="submit" loading={loadingBtn}>
                                        <CopyOutlined/>
                                        Gộp khách hàng này
                                    </Button>

                                    <Link loading={loadingBtn} href={route('hima.merge_history')}>
                                        <Button type="primary" htmlType="button" loading={loadingBtn}>
                                            <InfoCircleOutlined />
                                            Lịch sử gộp
                                        </Button>
                                    </Link>
                                    
                                    {/* user_id: 43 */}
                                    <Link loading={loadingBtn} href={route('data.index', [props.table.id])}>
                                        <Button type="primary btn-close" loading={loadingBtn}>
                                            <CloseSquareOutlined />
                                            Thoát
                                        </Button>
                                    </Link>
                                </Space>
                            }
                        >

                            <table className='tbl-gop-kh'>
                                <tbody>
                                    <tr>
                                        <td>
                                            <Form.Item name={'to'} rules={[{ required: 'Không được để trống' }]} label={'Khách hàng Theo dõi'}>
                                                <Select 
                                                    // mode={mode}
                                                    showSearch
                                                    style={{ width: '100%' }}
                                                    placeholder="Search to Select"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                                    options={dataSelect}
                                                    onChange={handleChangeTo}
                                                />
                                            </Form.Item>
                                        </td>
                                        <td>
                                            <Form.Item name={'from'} rules={[{ required: 'Không được để trống' }]} label={'Khách hàng ngừng Theo dõi'}>
                                                <Select 
                                                    // mode={mode}
                                                    showSearch
                                                    style={{ width: '100%' }}
                                                    placeholder="Search to Select"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                                    options={dataSelect}
                                                    onChange={handleChangeFrom}
                                                />
                                            </Form.Item>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {contentTo}
                                        </td>
                                        <td> 
                                            {contentFrom}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </Card>
                    </Form>
                </div>
            }
        />
    );
}
