import AdminLayout from '@/layouts/AdminLayout';
import {  router } from "@inertiajs/react";

import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge
} from 'antd';

import {
    UsergroupAddOutlined,
    UserSwitchOutlined,
    UserOutlined, ArrowUpOutlined,
    PlusOutlined, ArrowDownOutlined,
    MinusOutlined,
    SoundOutlined, MonitorOutlined,
    MessageOutlined, CalendarOutlined, RightSquareOutlined,
    EuroOutlined, FundProjectionScreenOutlined
} from "@ant-design/icons";

import "../../../../css/home.css";


import { routeSetting, tblSetting } from "../../../Function/config_route";

export default function Dashboard(props) {
    const changeMenu = (id) => {
        router.get(route('data.index', [id]));
    }

  
    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={routeSetting}
            content={
                <div>
                    <Card type="inner" title='Điều hướng nhanh'>
                        <Select placeholder="Nhập để điều hướng quản trị nhanh đến chức năng tương ứng"
                            showSearch
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            onChange={changeMenu}
                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                            filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                            options={props.tablesSelects}
                        />
                    </Card>

                    <Row className='main-home'>
                        <Col span={18}>
                            <Row>
                                <Col span={12} className='item-home'>
                                    <div className='sub-item-home'>
                                        <h3>
                                            <FundProjectionScreenOutlined />
                                            SỐ LƯỢNG
                                        </h3>
                                        <Row>
                                            <Col span={12} className='item-home'>
                                                <List
                                                    dataSource={[
                                                        {
                                                            title: <div>Tổng sản phẩm: <b>56</b></div>,
                                                            icon: <UsergroupAddOutlined />
                                                        },
                                                        {
                                                            title: <div>Khách cũ quay lại: <b>34</b></div>,
                                                            icon: <UserSwitchOutlined />
                                                        }
                                                    ]}
                                                    renderItem={(item, index) => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                avatar={<a>{item.icon}</a>}
                                                                title=''
                                                                description={item.title}

                                                            />
                                                        </List.Item>
                                                    )}
                                                />
                                            </Col>
                                            <Col span={12} className='item-home'>

                                            </Col>
                                        </Row>
                                    </div>
                                </Col>

                                {/* Thu chi */}
                                <Col span={12} className='item-home'>
                                    <div className='sub-item-home'>
                                        <h3>
                                            <EuroOutlined />
                                            THU - CHI HÔM NAY
                                        </h3>

                                        <List
                                            dataSource={[
                                                {
                                                    title: <div>Tổng thu: <b>23.020.000</b></div>,
                                                    icon: <PlusOutlined />
                                                },
                                                {
                                                    title: <div>Tổng chi: <b>34</b></div>,
                                                    icon: <MinusOutlined />
                                                }
                                            ]}
                                            renderItem={(item, index) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={<a>{item.icon}</a>}
                                                        title=''
                                                        description={item.title}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </Col>

                                {/* Top ban chay */}
                                <Col span={24} className='item-home'>
                                    <div className='sub-item-home'>
                                        <h3>
                                            <MonitorOutlined />
                                            TOP <em>hàng hóa / dịch vụ</em>  chạy tháng này
                                        </h3>

                                        <Card title="Biểu đồ doanh thu">
                                            {/* <LineChart width={600} height={300} data={data}>
                                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="doanhThu" stroke="#8884d8" />
                                            </LineChart> */}
                                        </Card>

                                        {/* <List className="list-01"
                                            dataSource={props.banChay}
                                            renderItem={(item, index) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={<a><RightSquareOutlined /></a>}
                                                        title={item.title}
                                                        description={<div>
                                                            <span className="item-des">Giá bán: {item.gia_ban}</span>
                                                            <span className="item-des">SL đã bán: 100</span>
                                                        </div>}
                                                    />
                                                </List.Item>
                                            )}
                                        /> */}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={6} className='item-home'>
                            <div className='sub-item-home'>
                                <h3>
                                    <MonitorOutlined />
                                    Thống kê theo loại sản phẩm
                                </h3>
                                
                            </div>

                            <Card variant="borderless">
                                <Statistic
                                    title="Tuần này"
                                    value={9.3}
                                    precision={2}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<ArrowDownOutlined />}
                                    suffix="%"
                                />
                            </Card>
                            <br />
                            <Card variant="borderless" className='sub-item-home'>
                                <Statistic
                                    title="Tuần trước"
                                    value={11.28}
                                    precision={2}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<ArrowUpOutlined />}
                                    suffix="%"
                                />
                            </Card>


                            <div className='sub-item-home'>
                                <h3>
                                    <SoundOutlined />
                                    THÔNG BÁO
                                </h3>
                                <List
                                    dataSource={[
                                        {
                                            title: <div><a>An</a> Vừa tạo HD <a>HD0232</a></div>,
                                        },
                                        {
                                            title: <div><a>An</a> Vừa thêm mới sản phẩm <a>SP000123</a></div>,
                                        },
                                        {
                                            title: <div><a>An</a> Vừa tạo HD <a>HD0232</a></div>,
                                        }
                                    ]}
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
