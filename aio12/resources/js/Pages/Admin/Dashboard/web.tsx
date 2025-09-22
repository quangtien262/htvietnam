import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from "@inertiajs/react";

import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge
} from 'antd';

import {
    ShoppingFilled,
    MailFilled,
    SoundOutlined,
    MessageOutlined, FundFilled
} from "@ant-design/icons";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    Cell, Pie, PieChart, ResponsiveContainer
} from 'recharts';

import "../../../../css/home.css";


import { routeWeb } from "../../../Function/config_route";

export default function Dashboard(props: any) {


    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            menus={props.menus}
            menuParentID = {props.p}
            content={
                <div>
                    <Row className='main-home'>
                        <Col span={18}>


                            <Row>
                                {/* Liện hệ gần đây */}
                                <Col span={24} className='item-home'>
                                    <div className='sub-item-home'>
                                        <h3>
                                            <MailFilled />
                                            Liện hệ gần đây
                                        </h3>

                                        <Table
                                            columns={[
                                                { title: 'Tên khách', dataIndex: 'name', key: 'name' },
                                                { title: 'Email', dataIndex: 'email', key: 'email' },
                                                { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
                                                { title: 'Nội dung', dataIndex: 'content', key: 'content' },
                                                { title: 'Thời gian gửi', dataIndex: 'created_at', key: 'created_at' },
                                            ]}
                                            dataSource={props.contacts}
                                            rowKey="id"
                                            pagination={false}
                                        />
                                    </div>
                                </Col>

                                {/* Recent orders and view stats */}
                                <Col span={24} className='item-home'>
                                    <div className='sub-item-home'>
                                        <h3>
                                            <ShoppingFilled />
                                            Đơn hàng gần đây
                                        </h3>

                                        <Table
                                            columns={[
                                                { title: 'Tiêu đề', dataIndex: 'name', key: 'name' },
                                                { title: 'Sản phẩm', dataIndex: 'product_name', key: 'product_name' },
                                                { title: 'Giá bán', dataIndex: 'gia_ban', key: 'gia_ban' },
                                                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                                                { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
                                                { title: 'Email', dataIndex: 'email', key: 'email' },
                                                { title: 'Thời gian đặt', dataIndex: 'created_at', key: 'created_at' },
                                            ]}
                                            dataSource={props.orders}
                                            rowKey="id"
                                            pagination={false}
                                        />
                                    </div>
                                </Col>

                                <Col span={24} className='item-home'>
                                    <Card title={<><FundFilled /> Thống kê lượt view theo ngày</>} style={{ marginTop: 24 }}>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <LineChart data={props.viewStats}>
                                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="view" stroke="#1890ff" name="Lượt view" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card>


                                </Col>


                            </Row>
                        </Col>

                        {/* Thông báo */}
                        <Col span={6} className='item-home'>
                            <div className='sub-item-home'>
                                <h3>
                                    <SoundOutlined />
                                    THÔNG BÁO
                                </h3>
                                <List
                                    dataSource={props.logs.map(log => ({
                                        title: <em>{log.name}</em>,
                                    }))}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<a><MessageOutlined /></a>}
                                                title={<span className='text-normal'>{item.title}</span>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </Col>

                    </Row>
                </div>
            }
        />
    );
}
