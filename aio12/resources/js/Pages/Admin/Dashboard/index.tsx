import React, { useState } from "react";
import AdminLayout from '@/layouts/AdminLayout';
import { Select, Col, Row, Card,Modal, Button  } from 'antd';
import { Link, router } from "@inertiajs/react";

import {
    DribbbleSquareOutlined, GlobalOutlined, FileProtectOutlined, CopyOutlined, LineChartOutlined,
    HddOutlined, NodeExpandOutlined, DeleteColumnOutlined, OrderedListOutlined, IssuesCloseOutlined,
    DoubleRightOutlined, DoubleLeftOutlined, ForkOutlined, SortAscendingOutlined, EditFilled,
    FileSearchOutlined, ShopFilled, PayCircleOutlined, HourglassOutlined, DeleteRowOutlined,
    IdcardFilled, SolutionOutlined, InsertRowAboveOutlined, LaptopOutlined, RiseOutlined, SlidersFilled,
    PieChartFilled, SettingFilled, ProjectOutlined, FlagOutlined, DiffOutlined, ColumnWidthOutlined,
    GoldFilled, CalendarOutlined, ReadFilled, UserSwitchOutlined, UndoOutlined, InfoCircleFilled,
    HddFilled, CalendarFilled, TeamOutlined, UngroupOutlined, InsertRowRightOutlined,  AccountBookOutlined,
    BookOutlined, BranchesOutlined, ArrowDownOutlined, ClusterOutlined, AppstoreOutlined,
    MailOutlined
} from "@ant-design/icons";

import "../../../../css/home.css";
import { routeHome } from "../../../Function/config_route";

export default function Dashboard(props:any) {
    const [isOpenModalConfirm, setIsOpenModalConfirm] = useState(false);

    const changeMenu = (id: unknown) => {
        router.get(route('data.index', [id]));
    }
    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={routeHome}
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
                        {/* QUẢN TRỊ WEBSITE */}
                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>
                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        <Link href={route('web.dashboard')}>
                                            <DribbbleSquareOutlined /> QUẢN TRỊ WEBSITE
                                        </Link>
                                    </div>
                                    
                                    <div className="ant-statistic-content" >
                                        <div className="ant-statistic-content-prefix">
                                            <DribbbleSquareOutlined />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><HddOutlined /> Quản lý sản phẩm</li>
                                                    <li><CopyOutlined /> Quản lý tin tức</li>
                                                    <li><AppstoreOutlined /> Cài đặt website</li>
                                                    <li><FileSearchOutlined /> Cài đặt landingpage</li>
                                                    <li><MailOutlined /> Liên hệ từ website</li>
                                                    <li><MailOutlined /> Liên hệ từ website</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* QUẢN LÝ KHO HÀNG */}
                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>
                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        <Link href={route('file.index')}>
                                            <a><CopyOutlined /> QUẢN LÝ TÀI LIỆU</a>
                                        </Link>
                                    </div>
                                    <div className="ant-statistic-content">
                                        <div className="ant-statistic-content-prefix">
                                            <CopyOutlined />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><FileSearchOutlined /> Tài liệu theo từng user</li>
                                                    <li><BookOutlined /> Tài liệu chung</li>
                                                    <li><BranchesOutlined /> Tài liệu được chia sẻ</li>
                                                    <li><ArrowDownOutlined /> Download tài liệu</li>
                                                    <li><ClusterOutlined /> Cho phép upload nhiều loại định dạng file</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        
                        
                        
                    </Row>

                    <Modal
                        title={<div><a><InfoCircleFilled /></a> Tính năng này đang tạm khóa</div>}
                        open={isOpenModalConfirm}
                        // onOk={formEdit}
                        width={600}
                        onCancel={() => setIsOpenModalConfirm(false)}
                        footer={[<Button key={1} onClick={() => setIsOpenModalConfirm(false)} type="primary">Đóng</Button>]}
                    >
                        <p>
                            Tính năng này đang tạm khóa do hết hạn sử dụng hoặc bạn chưa đăng ký.</p>
                        <p>
                            Vui lòng liên hệ hotline <b>039 916 2342</b> để được hỗ trợ nhanh nhất.
                        </p>
                    </Modal>
                </ div>
            }
        />
    );
}
