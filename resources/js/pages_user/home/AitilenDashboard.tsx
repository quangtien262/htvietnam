import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import axios from "../../utils/axiosConfig";
import API from '../../common/api';
import ROUTE from '../../common/route_user';
import { Select, Col, Row, Card, Modal, Button } from 'antd';
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

import "../../../css/user.css";


const AitilenDashboard: React.FC = () => {

    const [datas, setDatas] = useState([]);

    useEffect(() => {
        axios.post(API.menuDashboard)
            .then((res: any) => {
                setDatas(res.data.data);
            })
            .catch((err: any) => console.error(err));
    }, []);

    return ((
        <div className="dashboard-container">
            <Row gutter={[16, 16]}>

                {/* Hóa đơn */}
                <Col className='item-home' xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Card variant="borderless" className='item-dashboard'>
                        <div className="ant-statistic">
                            <div className="ant-statistic-title">
                                <Link to={ROUTE.invoices}>
                                    <FileProtectOutlined /> HÓA ĐƠN
                                </Link>
                            </div>

                            <div className="ant-statistic-content" >
                                <div className="ant-statistic-content-prefix">
                                    <FileProtectOutlined />
                                </div>
                                <div className="ant-statistic-content-value">
                                    <div>
                                        <ul className="dashboard-list-item">
                                            <li><ProfileOutlined /> QL hóa đơn hàng tháng</li>
                                            <li><PayCircleOutlined /> Thanh toán online</li>
                                            <li><OrderedListOutlined /> Lịch sử thanh toán</li>
                                            <li><DiffOutlined /> Xem chi tiết các phí dịch vụ</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Hợp đồng */}
                <Col className='item-home' xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Card variant="borderless" className='item-dashboard'>
                        <div className="ant-statistic">
                            <div className="ant-statistic-title">
                                <Link to={ROUTE.contracts}>
                                    <BookOutlined /> HỢP ĐỒNG
                                </Link>
                            </div>

                            <div className="ant-statistic-content" >
                                <div className="ant-statistic-content-prefix">
                                    <BookOutlined />
                                </div>
                                <div className="ant-statistic-content-value">
                                    <div>
                                        <ul className="dashboard-list-item">
                                            <li><BookOutlined /> QL hợp đồng đã ký</li>
                                            <li><CalendarOutlined /> Thời hạn hợp đồng</li>
                                            <li><OrderedListOutlined /> Lịch sử gia hạn HĐ</li>
                                            <li><EditFilled /> Xác nhận phụ lục HĐ</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* support */}
                <Col className='item-home' xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Card variant="borderless" className='item-dashboard'>
                        <div className="ant-statistic">
                            <div className="ant-statistic-title">
                                <Link to={ROUTE.support}>
                                    <IssuesCloseOutlined /> GỬI YÊU CẦU HỖ TRỢ
                                </Link>
                            </div>

                            <div className="ant-statistic-content" >
                                <div className="ant-statistic-content-prefix">
                                    <IssuesCloseOutlined />
                                </div>
                                <div className="ant-statistic-content-value">
                                    <div>
                                        <ul className="dashboard-list-item">
                                            <li><GlobalOutlined /> Gửi yêu cầu hỗ trợ</li>
                                            <li><SettingFilled /> Sửa chữa thiết bị</li>
                                            <li><HourglassOutlined /> Hỗ trợ kỹ thuật</li>
                                            <li><NodeExpandOutlined /> Khiếu nại & góp ý</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Tài khoản */}
                <Col className='item-home' xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Card variant="borderless" className='item-dashboard'>
                        <div className="ant-statistic">
                            <div className="ant-statistic-title">
                                <Link to={ROUTE.profile}>
                                    <IdcardFilled /> TÀI KHOẢN
                                </Link>
                            </div>
                            <div className="ant-statistic-content" >
                                <div className="ant-statistic-content-prefix">
                                    <IdcardFilled />
                                </div>
                                <div className="ant-statistic-content-value">
                                    <div>
                                        <ul className="dashboard-list-item">
                                            <li><TeamOutlined /> QL Thông tin cá nhân</li>
                                            <li><ProjectOutlined /> Thay đổi mật khẩu</li>
                                            <li><SolutionOutlined /> Đăng ký biển số xe</li>
                                            <li><AppstoreOutlined /> Thay đổi thông tin cá nhân</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

            </Row>
        </div>
    ));

}

export default AitilenDashboard;
