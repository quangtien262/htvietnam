import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "../../utils/axiosConfig";
import API from '../../common/api';
import ROUTE from '../../common/route';
import { Col, Row, Card} from 'antd';
import {
    DribbbleSquareOutlined, GlobalOutlined, FileProtectOutlined, CopyOutlined, LineChartOutlined,
    HddOutlined, NodeExpandOutlined, DeleteColumnOutlined, OrderedListOutlined, IssuesCloseOutlined,
    DoubleRightOutlined, DoubleLeftOutlined, ForkOutlined, SortAscendingOutlined, EditFilled,
    FileSearchOutlined, ShopFilled, PayCircleOutlined, HourglassOutlined, DeleteRowOutlined,
    IdcardFilled, SolutionOutlined, InsertRowAboveOutlined, LaptopOutlined, RiseOutlined, SlidersFilled,
    PieChartFilled, SettingFilled, ProjectOutlined, FlagOutlined, DiffOutlined, ColumnWidthOutlined,
    GoldFilled, CalendarOutlined, ReadFilled, UserSwitchOutlined, UndoOutlined, InfoCircleFilled,
    HddFilled, CalendarFilled, TeamOutlined, UngroupOutlined, InsertRowRightOutlined, AccountBookOutlined,
    BookOutlined, BranchesOutlined, ArrowDownOutlined, ClusterOutlined, AppstoreOutlined,
    MailOutlined, HomeOutlined, IdcardOutlined, ProfileOutlined,
    WalletOutlined
} from "@ant-design/icons";

import "../../../css/home.css";


const Dashboard: React.FC = () => {
    const [datas, setDatas] = useState([]);

    useEffect(() => {
        axios.post(API.menuDashboard)
            .then((res: any) => {
                setDatas(res.data.data);
            })
            .catch((err: any) => console.error(err));
    }, []);

    function showDataDashboard(item: any) {

        if (item.name === 'parent_website') {

            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>
                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.newsManagement}?p=web`}>
                                <DribbbleSquareOutlined /> {item.display_name}
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
                                        <li><FileSearchOutlined /> Quản lý landingpage</li>
                                        <li><MailOutlined /> Liên hệ từ website</li>
                                        <li><AppstoreOutlined /> Đơn hàng</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        }

        // aitilen
        // if (item.name === 'parent_aitilen') {
        //     return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
        //         <Card variant="borderless" className='item-dashboard'>
        //             <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
        //                 <div className="ant-statistic-title">
        //                     <Link to={`${ROUTE.dashboard_aitilen}?p=bds`}>
        //                         <HomeOutlined /> BĐS AITILEN
        //                     </Link>
        //                 </div>

        //                 <div className="ant-statistic-content" >
        //                     <div className="ant-statistic-content-prefix">
        //                         <HomeOutlined />
        //                     </div>
        //                     <div className="ant-statistic-content-value">
        //                         <div>
        //                             <ul className="dashboard-list-item">
        //                                 <li><HomeOutlined /> Căn hộ</li>
        //                                 <li><BookOutlined /> Phòng cho thuê</li>
        //                                 <li><IdcardOutlined /> Hợp đồng</li>
        //                                 <li><ProfileOutlined /> Hóa đơn</li>
        //                                 <li><WalletOutlined /> Công việc</li>
        //                             </ul>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </Card>
        //     </Col>
        // }

        if (item.name === 'parent_tai_lieu') {
            {/* QUẢN LÝ TÀI LIỆU */ }
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>
                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.documentsExplorer}?p=docs`}>
                                <CopyOutlined /> QUẢN LÝ TÀI LIỆU
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
                                        <li><ClusterOutlined /> Upload multiple file</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        }

        {/* QUẢN LÝ NHÂN SỰ */ }
        if (item.name === 'parent_nhan_su') {
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>

                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.hrBaoCao}?p=hr`}>
                                <IdcardFilled /> QUẢN LÝ NHÂN SỰ
                            </Link>
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
                                        <li><InsertRowAboveOutlined /> Doanh số, hoa hồng</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        }
        {/* QUẢN LÝ KHO HÀNG */ }
        if (item.name === 'parent_kho_hang') {
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>
                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.qlKho}?p=kho`}>
                                <SlidersFilled /> QUẢN LÝ HÀNG HÓA & DỊCH VỤ
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
        }

        {/* BÁO CÁO - THỐNG KÊ */ }
        if (item.name === 'parent_thong_ke') {
            // return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
            //     <Card variant="borderless" className='item-dashboard'>

            //         <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
            //             <div className="ant-statistic-title">
            //                 <Link to="/">
            //                     <PieChartFilled /> BÁO CÁO - PHÂN TÍCH
            //                 </Link>
            //             </div>
            //             <div className="ant-statistic-content" >
            //                 <div className="ant-statistic-content-prefix">
            //                     <PieChartFilled />
            //                 </div>
            //                 <div className="ant-statistic-content-value">
            //                     <div>
            //                         <ul className="dashboard-list-item">
            //                             <li><GlobalOutlined /> Báo cáo tổng hợp</li>
            //                             <li><UserSwitchOutlined /> Báo cáo nhân sự</li>
            //                             <li><PayCircleOutlined /> Báo cáo bán hàng</li>
            //                             <li><DeleteColumnOutlined /> Báo cáo công nợ</li>
            //                             <li><FileSearchOutlined /> ..........</li>
            //                         </ul>
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>
            //     </Card>
            // </Col>
        }

        {/* QUẢN LÝ DỰ ÁN */ }
        if (item.name === 'parent_cong_viec') {
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>
                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.project_dashboard}?p=projects`}>
                                <CalendarFilled /> DỰ ÁN & CÔNG VIỆC
                            </Link>
                            {/* <Link to={`${ROUTE.dashboardProject}?p=pro`}>
                                <CalendarFilled /> DỰ ÁN & CÔNG VIỆC
                            </Link> */}
                        </div>
                        <div className="ant-statistic-content" >
                            <div className="ant-statistic-content-prefix">
                                <CalendarFilled />
                            </div>
                            <div className="ant-statistic-content-value">
                                <div>
                                    <ul className="dashboard-list-item">
                                        <li><FileProtectOutlined /> Danh sách công việc</li>
                                        <li><ForkOutlined /> Phân loại công việc</li>
                                        <li><FlagOutlined /> Meeting, Daily</li>
                                        <li><DoubleRightOutlined /> Báo cáo tiến độ</li>
                                        <li><HourglassOutlined /> Quản lý lịch hẹn</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        }

        {/* QUẢN LÝ TÀI SẢN */ }
        if (item.name === 'parent_tai_san') {
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>
                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.purchaseReportManagement}?p=purchase`}>
                                <HddFilled /> QUẢN LÝ MUA HÀNG / TÀI SẢN
                            </Link>
                        </div>
                        <div className="ant-statistic-content" >
                            <div className="ant-statistic-content-prefix">
                                <HddFilled />
                            </div>
                            <div className="ant-statistic-content-value">
                                <div>
                                    <ul className="dashboard-list-item">
                                        <li><OrderedListOutlined /> Danh sách tài sản</li>
                                        <li><SortAscendingOutlined /> Phân loại tài sản</li>
                                        <li><InsertRowRightOutlined /> Tài sản trong kho</li>
                                        <li><LaptopOutlined /> Tài sản đang sử dụng</li>
                                        <li><UndoOutlined /> Tài sản bảo trì</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        }

        {/* QUẢN LÝ TÀI CHÍNH */ }
        if (item.name === 'parent_tai_chinh') {
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>
                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.erpDashboard}?p=erp`}>
                                <AccountBookOutlined /> QUẢN LÝ TÀI CHÍNH
                            </Link>
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
        }

        //parent_ban_hang
        // if (item.name === 'parent_ban_hang') {
        //     return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
        //         <Card variant="borderless" className='item-dashboard'>

        //             <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
        //                 <div className="ant-statistic-title">
        //                     <Link to={`${ROUTE.salesBaoCao}?p=sales`}>
        //                         <ShopFilled /> QUẢN LÝ BÁN HÀNG
        //                     </Link>
        //                 </div>
        //                 <div className="ant-statistic-content" >
        //                     <div className="ant-statistic-content-prefix">
        //                         <ShopFilled />
        //                     </div>
        //                     <div className="ant-statistic-content-value">
        //                         <div>
        //                             <ul className="dashboard-list-item">
        //                                 <li><GoldFilled /> Thu ngân</li>
        //                                 <li><ReadFilled /> Quản lý Hóa đơn</li>
        //                                 <li><TeamOutlined /> Quản lý khách hàng</li>
        //                                 <li><UngroupOutlined /> Data telesale</li>
        //                                 <li><CalendarOutlined /> Quy trình CSKH</li>
        //                             </ul>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </Card>
        //     </Col>
        // }
        // telesale
        if (item.name === 'parent_telesale') {
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>

                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.telesaleBaoCao}?p=telesale`}>
                                <ShopFilled /> TELESALE
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
        }

        //parent_business
        if (item.name === 'parent_business') {
            return <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>

                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.businessCoHoi}?p=business`}>
                                <ShopFilled /> QUẢN LÝ KINH DOANH
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
    }
    }

    return <>
        <Row gutter={[24, 24]}>
            <Col className='item-home' xs={24} sm={12} md={12} lg={8} xl={6} xxl={6}>
                <Card variant="borderless" className='item-dashboard'>

                    <div className="ant-statistic css-dev-only-do-not-override-1xg9z9n">
                        <div className="ant-statistic-title">
                            <Link to={`${ROUTE.spa_analytics}?p=spa`}>
                                <ShopFilled /> QUẢN LÝ SPA
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
                                        <li><UngroupOutlined /> Voucher</li>
                                        <li><CalendarOutlined /> Thẻ / Ví / nạp tiền</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
            {
                datas && datas.length > 0 && datas.map((item: any, index: number) => {
                    return showDataDashboard(item);
                })
            }
        </Row>
    </>
}

export default Dashboard;
