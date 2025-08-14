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
    HddFilled, CalendarFilled, TeamOutlined, UngroupOutlined, InsertRowRightOutlined,  AccountBookOutlined
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
                    <iframe
                        src="/"
                        width="100%"
                        height="500"
                        style={{ border: 'none' }}
                        title="Demo iframe"
                    />

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
                                                    <li><DoubleLeftOutlined /> Quản lý tin tức</li>
                                                    <li><DoubleRightOutlined /> Cài đặt website</li>
                                                    <li><FileSearchOutlined /> Cài đặt trang chủ </li>
                                                    <li><FileSearchOutlined /> .....</li>
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
                                        <Link href={route('khoHang.dashboard')}>
                                            <SlidersFilled /> QUẢN LÝ KHO HÀNG
                                        </Link>
                                    </div>
                                    <div className="ant-statistic-content">
                                        <div className="ant-statistic-content-prefix">
                                            <SlidersFilled />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><HddOutlined /> Quản lý sản phẩm</li>
                                                    <li><DoubleRightOutlined /> Nhập hàng</li>
                                                    <li><DoubleLeftOutlined /> Xuất kho</li>
                                                    <li><FileSearchOutlined /> Kiểm kho</li>
                                                    <li><FileSearchOutlined /> Trả hàng nhập từ NCC</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* QUẢN LÝ BÁN HÀNG */}
                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>

                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        {/* <span onClick={()=>setIsOpenModalConfirm(true)}>
                                            <a><ShopFilled /> QUẢN LÝ BÁN HÀNG</a>
                                        </span> */}
                                        <Link href={route('sale.dashboard')}>
                                            <ShopFilled /> QUẢN LÝ BÁN HÀNG
                                        </Link>
                                    </div>
                                    <div className="ant-statistic-content" >
                                        <div className="ant-statistic-content-prefix">
                                            <ShopFilled />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><GoldFilled /> Thu ngân</li>
                                                    <li><ReadFilled /> Quản lý Hóa đơn</li>
                                                    <li><TeamOutlined /> Quản lý khách hàng</li>
                                                    <li><UngroupOutlined /> Data telesale</li>
                                                    <li><CalendarOutlined /> Quy trình CSKH</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>

                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        <span onClick={()=>setIsOpenModalConfirm(true)}>
                                            <a><IdcardFilled /> QUẢN LÝ NHÂN SỰ</a>
                                        </span>
                                        {/* <Link href={route('nhanSu.dashboard')}><IdcardFilled /> QUẢN LÝ NHÂN SỰ</Link> */}
                                    </div>
                                    <div className="ant-statistic-content" >
                                        <div className="ant-statistic-content-prefix">
                                            <IdcardFilled />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><TeamOutlined /> Quản lý nhân viên</li>
                                                    <li><ProjectOutlined /> Quản lý phòng ban</li>
                                                    <li><SolutionOutlined /> Quản lý bảng lương</li>
                                                    <li><NodeExpandOutlined /> Phân quyền quản trị</li>
                                                    <li><InsertRowAboveOutlined /> Báo cáo doanh số, hoa hồng</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* BÁO CÁO - THỐNG KÊ */}
                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>

                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        <span onClick={()=>setIsOpenModalConfirm(true)}>
                                            <a><PieChartFilled /> BÁO CÁO - THỐNG KÊ</a>
                                        </span>
                                        {/* <Link href={route('report.dashboard')}>
                                            <PieChartFilled /> BÁO CÁO - THỐNG KÊ
                                        </Link> */}
                                    </div>
                                    <div className="ant-statistic-content" >
                                        <div className="ant-statistic-content-prefix">
                                            <PieChartFilled />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><GlobalOutlined /> Báo cáo tổng hợp</li>
                                                    <li><UserSwitchOutlined /> Báo cáo nhân sự</li>
                                                    <li><PayCircleOutlined /> Báo cáo bán hàng</li>
                                                    <li><DeleteColumnOutlined /> Báo cáo công nợ</li>
                                                    <li><FileSearchOutlined /> ..........</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* QUẢN LÝ CÔNG VIỆC */}
                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>
                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        {/* <span onClick={()=>setIsOpenModalConfirm(true)}>
                                            <a><CalendarFilled /> QUẢN LÝ CÔNG VIỆC</a>
                                        </span> */}
                                        <Link href={route('task.dashboard')}>
                                            <CalendarFilled /> QUẢN LÝ CÔNG VIỆC
                                        </Link>
                                    </div>
                                    <div className="ant-statistic-content" >
                                        <div className="ant-statistic-content-prefix">
                                            <CalendarFilled />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><FileProtectOutlined /> Quản lý danh sách công việc</li>
                                                    <li><ForkOutlined /> Phân loại công việc</li>
                                                    <li><FlagOutlined /> Quản lý Meeting, Daily</li>
                                                    <li><DoubleRightOutlined /> Báo cáo tiến độ công việc</li>
                                                    <li><HourglassOutlined /> Quản lý lịch hẹn</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* QUẢN LÝ TÀI SẢN */}
                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>
                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        <span onClick={()=>setIsOpenModalConfirm(true)}>
                                            <a><HddFilled /> QUẢN LÝ TÀI SẢN</a>
                                        </span>
                                        {/* <Link href={route('taiSan.dashboard')}>
                                            <HddFilled /> QUẢN LÝ TÀI SẢN
                                        </Link> */}
                                    </div>
                                    <div className="ant-statistic-content" >
                                        <div className="ant-statistic-content-prefix">
                                            <HddFilled />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><OrderedListOutlined /> Quản lý danh sách tài sản</li>
                                                    <li><SortAscendingOutlined /> Phân loại tài sản</li>
                                                    <li><InsertRowRightOutlined /> Tài sản trong kho</li>
                                                    <li><LaptopOutlined /> Tài sản đang sử dụng</li>
                                                    <li><UndoOutlined /> Tài sản hư hỏng, cần sửa chữa</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* QUẢN LÝ TÀI CHÍNH */}
                        <Col sm={6} className='item-home'>
                            <Card variant="borderless" className='item-dashboard'>
                                <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                                    <div className="ant-statistic-title">
                                        <span onClick={()=>setIsOpenModalConfirm(true)}>
                                            <a><AccountBookOutlined /> QUẢN LÝ TÀI CHÍNH</a>
                                        </span>
                                        {/* <Link href={route('taiChinh.dashboard')}>
                                            <AccountBookOutlined /> QUẢN LÝ TÀI CHÍNH
                                        </Link> */}
                                    </div>
                                    <div className="ant-statistic-content" >
                                        <div className="ant-statistic-content-prefix">
                                            <AccountBookOutlined />
                                        </div>
                                        <div className="ant-statistic-content-value">
                                            <div>
                                                <ul className="dashboard-list-item">
                                                    <li><CopyOutlined /> Quản lý hóa đơn</li>
                                                    <li><DeleteRowOutlined /> Quản lý công nợ</li>
                                                    <li><DiffOutlined /> Quản lý thu chi</li>
                                                    <li><LineChartOutlined /> Báo cáo tài chính</li>
                                                    <li><RiseOutlined /> Báo cáo dòng tiền</li>
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
