import React, { useEffect, useRef } from 'react';
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Spin,
    Select,Checkbox,
    Row,
    Space,
    Tag,
    Dropdown,
    Alert,
    notification,
    Divider,
    Badge,Tabs,
    Col,Image,Carousel ,
    Breadcrumb,Radio, List, Card, Statistic,
    Empty
} from "antd";
import {
    RightSquareFilled,ArrowDownOutlined ,MessageOutlined ,
    CheckCircleFilled ,StarFilled,
    SearchOutlined,
    CopyFilled,
    DeleteOutlined,
    MailFilled,EyeOutlined,
    PhoneFilled,
    SignatureFilled,
    StopOutlined,
    CheckOutlined,
    MoneyCollectFilled,
    BookFilled,
    CloseCircleOutlined,
    EyeFilled,
    CheckCircleOutlined,
    FileTextFilled,
    HomeOutlined, BarsOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

import "../../css/form.css";

import { numberFormat } from "../function/common";
import { LOAI_CHUNG_TU } from "../Function/constant";
// import { callApi } from "../Function/api";

export function nhaCungCapInfo(data, mainClass='tab-info') {
    if(!data || data.length === 0) {
        return '';
    }

    const khachHang = data.info;

    let data01 = [
            <p><b><SignatureFilled /> Mã: </b> {khachHang.code}</p>,
            <p><b><FileTextFilled /> Tên nhà cung cấp: </b> {khachHang.name}</p>,
            <p><b><FileTextFilled /> Người liên hệ:: </b> {khachHang.user_contact}</p>,
            <p><b><FileTextFilled /> Số điện thoại: </b> {khachHang.phone}</p>,
            <p><b><FileTextFilled /> Email: </b> {khachHang.email}</p>,
            <p><b><FileTextFilled /> Địa chỉ: </b> {khachHang.address}</p>,
    ];

    let data02 = [
        <p><b><BookFilled /> Mã số thuế: </b> {khachHang.chi_nhanh}</p>,
        <p><b><BookFilled /> Nhóm khách hàng: </b> {khachHang.customer_group}</p>,
        <p><b><MoneyCollectFilled /> Địa chỉ: </b> {khachHang.cong_ty}</p>,
        <p><b><MoneyCollectFilled /> Link website: </b> {khachHang.mst}</p>,
        <p><b><EyeFilled /> Ghi chú: </b> {khachHang.user_source}</p>,
        <p><b><EyeFilled /> Ngày tạo TK: </b> {dayjs(khachHang.created_at).format('DD/MM/YYYY HH:mm:ss')}</p>,
    ]

    let key = 1;

    return <Tabs className={mainClass + ' width100'}
        defaultActiveKey="1"
        items={[
            // Thông tin
            {
                label: <span className="title-sub-tab">Thông tin</span>,
                key: key++,
                children: <Row>
                            <Col sm={12}>
                                <List className="list01"
                                    bordered
                                    dataSource={data01}
                                    renderItem={(item) => (
                                        <List.Item>
                                            {item}
                                        </List.Item>
                                    )}
                                />
                            </Col>
                            <Col sm={12}>
                                <List className="list01"
                                    bordered
                                    dataSource={data02}
                                    renderItem={(item) => (
                                        <List.Item>
                                            {item}
                                        </List.Item>
                                    )}
                                />
                            </Col>
                        </Row>
            },
            {
                label: <span className="title-sub-tab">Lịch sử nhập hàng</span>,
                key: key++,
                children: <Row className='width100'>

                            <Col sm={24}>
                                <br/>
                                <table className="table-sub">
                                    <thead>
                                        <tr>
                                            <th>Mã phiếu</th>
                                            <th>Tổng tiền hàng</th>
                                            <th>Giảm giá</th>
                                            <th>Số lượng</th>
                                            <th>Phí vân chuyển</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {data.nhapHang.map((nhap, idx) => {
                                        return <tr key={idx}>
                                            <td>
                                                <Popconfirm
                                                    title={<b>Chi tiết đơn hàng</b>}
                                                    description={<table className="table-sub">
                                                            <thead>
                                                                <tr>
                                                                    <th>Hàng hóa</th>
                                                                    <th>Số lượng</th>
                                                                    <th>Đơn giá</th>
                                                                    <th>Giảm giá</th>
                                                                    <th>Phí vận chuyển</th>
                                                                    <th>Thành tiền</th>
                                                                </tr>
                                                            </thead>

                                                            <thead>
                                                                {nhap.info.map((item, index) => {
                                                                        return <tr key={index}>
                                                                            <td>{item.product_code} - {item.product_name}</td>
                                                                            <td>{item.so_luong}</td>
                                                                            <td>{numberFormat(item.gia_von)}</td>
                                                                            <td>{numberFormat(item.giam_gia)}</td>
                                                                            <td>{numberFormat(item.phi_van_chuyen)}</td>
                                                                            <td>{numberFormat(item.thanh_tien)}</td>
                                                                        </tr>
                                                                    })
                                                                }
                                                            </thead>
                                                        </table>
                                                    }
                                                    icon={
                                                        <EyeFilled style={{ color: "#1890ff" }}/>
                                                    }
                                                    showCancel={false}
                                                    okText="Đóng"
                                                >
                                                    <a>{nhap.code}</a>
                                                </Popconfirm>

                                                <br/>

                                                <em>{nhap.created_at ? dayjs(nhap.created_at).format('DD/MM/YYYY'):'' }</em>
                                            </td>
                                            <td>{nhap.tong_tien_hang}</td>
                                            <td>{numberFormat(nhap.giam_gia)}</td>
                                            <td>{numberFormat(nhap.so_luong)}</td>
                                            <td>{numberFormat(nhap.tong_phi_van_chuyen)}</td>
                                            <td>{numberFormat(nhap.thanh_tien)}</td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>
                                {data.traHang.length === 0 ? <Empty description="Chưa có lịch sử nhập hàng" /> : ''}
                            </Col>
                        </Row>
            },
            {
                label: <span className="title-sub-tab">Lịch sử trả hàng</span>,
                key: key++,
                children: <Row className='width100'>

                            <Col sm={24}>
                                <br/>
                                <table className="table-sub">
                                    <thead>
                                        <tr>
                                            <th>Mã hóa đơn</th>
                                            <th>Tổng tiền hàng</th>
                                            <th>Giảm giá</th>
                                            <th>Phí trả hàng</th>
                                            <th>Thanh toán</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {data.traHang.map((tra, idx) => {
                                        return <tr key={idx}>
                                            <td>
                                                <Popconfirm
                                                    title={<b>Chi tiết đơn hàng</b>}
                                                    description={<table className="table-sub">
                                                            <thead>
                                                                <tr>
                                                                    <th>Hàng hóa</th>
                                                                    <th>Số lượng</th>
                                                                    <th>Giá nhập</th>
                                                                    <th>Giá trả lại hàng</th>
                                                                    <th>Thành tiền</th>
                                                                </tr>
                                                            </thead>

                                                            <thead>
                                                                {tra.info.map((item, index) => {
                                                                        return <tr key={index}>
                                                                            <td>{item.product_code} - {item.product_name}</td>
                                                                            <td>{item.so_luong}</td>
                                                                            <td>{numberFormat(item.gia_von)}</td>
                                                                            <td>{numberFormat(item.gia_tra_lai)}</td>
                                                                            <td>{numberFormat(item.thanh_tien)}</td>
                                                                        </tr>
                                                                    })
                                                                }
                                                            </thead>
                                                        </table>
                                                    }
                                                    icon={
                                                        <EyeFilled style={{ color: "#1890ff" }}/>
                                                    }
                                                    showCancel={false}
                                                    okText="Đóng"
                                                >
                                                    <a>{tra.code}</a>
                                                </Popconfirm>

                                                <br/>

                                                <em>{tra.created_at ? dayjs(tra.created_at).format('DD/MM/YYYY'):'' }</em>
                                            </td>
                                            <td>{tra.tong_tien_hang}</td>
                                            <td>{numberFormat(tra.giam_gia)}</td>
                                            <td>{numberFormat(tra.phi_tra_hang)}</td>
                                            <td>{numberFormat(tra.thanh_tien)}</td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>
                                {data.traHang.length === 0 ? <Empty description="Chưa có lịch sử trả hàng" /> : ''}
                            </Col>
                        </Row>
            },

            {
                label: <span className="title-sub-tab">Công nợ</span>,
                key: key++,
                children: <Row className='width100'>
                            {/* Công nợ hiện tại */}
                            <Col sm={8}>
                                <Card variant="borderless">
                                    <Statistic
                                    title="Công nợ hiện tại"
                                    value={khachHang.cong_no_hien_tai}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<MoneyCollectFilled />}
                                    suffix="đ"
                                    />
                                </Card>
                            </Col>

                            {/* Đã thanh toán */}
                            <Col sm={8}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Đã thanh toán"
                                    value={khachHang.cong_no_da_thanh_toan}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<CheckCircleFilled />}
                                    suffix="đ"
                                    />
                                </Card>
                            </Col>

                            {/* Tổng công nợ */}
                            <Col sm={8}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Tổng công nợ"
                                    value={khachHang.tong_cong_no}
                                    valueStyle={{ color: '#07378c' }}
                                    prefix={<CopyFilled />}
                                    suffix="đ"
                                    />
                                </Card>
                            </Col>

                            {/* content */}
                            <Col sm={24}>
                                <br/>
                                <table className="table-sub">
                                    <thead>
                                        <tr>
                                            <th>Mã phiếu</th>
                                            <th>Tổng tiền hàng</th>
                                            <th>Số tiền nợ</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày hẹn tất toán</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.congNo.map((cong, key) => {
                                            return <tr key={key}>
                                                <td>
                                                    {cong.code}
                                                    <br/>
                                                    {cong.created_at ? dayjs(cong.created_at).format('DD/MM/YYYY'):'' }
                                                </td>
                                                <td>{cong.tong_tien_hoa_don}</td>
                                                <td>{numberFormat(cong.so_tien_no)}</td>
                                                <td>{cong.cong_no_status_id == 1 ? 'Đã tất toán' : 'Chưa thanh toán'}</td>
                                                <td>{numberFormat(cong.ngay_hen_tat_toan)}</td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                                {data.congNo.length === 0 ? <Empty description="Chưa có công nợ" /> : ''}
                            </Col>
                        </Row>
            },
        ]
    }/>
}
