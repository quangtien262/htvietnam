import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Select, Col, Row,  Card, Statistic, List} from 'antd';
import { router } from '@inertiajs/react';

import {
    UsergroupAddOutlined,
    UserSwitchOutlined,
    ArrowUpOutlined ,
    PlusOutlined,ArrowDownOutlined,
    MinusOutlined,
    SoundOutlined,MonitorOutlined,
    MessageOutlined,CalendarOutlined,RightSquareOutlined,
    EuroOutlined,FundProjectionScreenOutlined
} from "@ant-design/icons";

import "../../../../css/home.css";

export default function Dashboard(props) {
    const changeMenu = (id) => {
        router.get(route('data.index', [id]));
    }
    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={props.tables}
            content={
                <div>
                    <Card type="inner" title='Điều hướng nhanh'>
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Search to Select"
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
                                            KHÁCH HÀNG HÔM NAY
                                        </h3>
                                        <List
                                            dataSource={[
                                                {
                                                    title: <div>Khách mới: <b>56</b></div>,
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
                                        
                                        <List className="list-01"
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
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={6}  className='item-home'>
                            <div className='sub-item-home'>
                                <h3>
                                    <CalendarOutlined />
                                    LỊCH HẸN
                                </h3>
                                <List
                                    dataSource={[]}
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

                            <Card variant="borderless" className='sub-item-home'>
                                <Statistic
                                title="Lịch hẹn"
                                value={11.28}
                                precision={2}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<MessageOutlined />}
                                suffix="%"
                                />
                            </Card>     

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
                            <br/>
                            <Card variant="borderless" className='sub-item-home'>
                                <Statistic
                                title="Tuần trước"
                                value={11.28}
                                precision={2}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<ArrowUpOutlined  />}
                                suffix="%"
                                />
                            </Card>
                           
                            
                            <div className='sub-item-home'>
                                <h3>
                                    <SoundOutlined />
                                    THÔNG BÁO
                                </h3>
                                <List
                                    dataSource={props.logs.map(log => ({
                                        title: <div>{log.name}</div>,
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
