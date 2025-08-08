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

import { getGioiTinh, numberFormat } from "../Function/common";
import { LOAI_CHUNG_TU } from "../Function/constant";
// import { callApi } from "../Function/api";

export function khachHangInfo(data, mainClass='tab-info') {

    if(!data || data.length === 0) {
        return '';
    }
    const khachHang = data.khachHang;
    
    let data01 = [
            <p><b><SignatureFilled /> Mã: </b> {khachHang.code}</p>,
            <p><b><FileTextFilled /> Họ tên: </b> {khachHang.name}</p>,
            <p><b><FileTextFilled /> Giới tính: </b> {getGioiTinh(khachHang.gioi_tinh_id)}</p>,
            <p><b><FileTextFilled /> Ngày sinh: </b> {khachHang.ngay_sinh}</p>,
            <p><b><FileTextFilled /> Số điện thoại: </b> {khachHang.phone}, {khachHang.phone02}</p>,
            <p><b><FileTextFilled /> Email: </b> {khachHang.email}</p>,
            <p><b><FileTextFilled /> Facebook: </b> {khachHang.facebook}</p>,
            <p><b><FileTextFilled /> Địa chỉ: </b> {khachHang.address}</p>,
    ];

    let data02 = [
        <p><b><BookFilled /> Chi nhánh: </b> {khachHang.chi_nhanh}</p>,
        <p><b><BookFilled /> Nhóm khách hàng: </b> {khachHang.customer_group}</p>,
        <p><b><MoneyCollectFilled /> Công ty: </b> {khachHang.cong_ty}</p>,
        <p><b><MoneyCollectFilled /> MST: </b> {khachHang.mst}</p>,
        <p><b><EyeFilled /> Nguồn khách: </b> {khachHang.user_source}</p>,
        <p><b><EyeFilled /> Ngày tạo TK: </b> {dayjs(khachHang.created_at).format('DD/MM/YYYY HH:mm:ss')}</p>,
        <p><b><EyeFilled /> Mô tả: </b> {khachHang.note}</p>,
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
                            <Col sm={8}>
                    
                                {khachHang.image ? <Image className="image-list" src={khachHang.image}></Image> : <Image className="image-list" src='/images/no-image.jpg'></Image>}
                            
                            </Col>
                            <Col sm={8}>
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
                            <Col sm={8}>
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

            // Thẻ đã mua
            {
                label: <span className="title-sub-tab">Thẻ đã mua</span>, //hh/dv
                key: key++,
                children: <Row className='width100'>
                            <Col sm={8}>

                                <Card variant="borderless">
                                    <Statistic
                                    title="Tổng đã nạp"
                                    value={khachHang.tong_tien_da_nap}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<MoneyCollectFilled />}
                                    suffix="đ"
                                    />
                                </Card> 
                            </Col>

                            <Col sm={8}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Tiền đã dùng"
                                    value={khachHang.tien_da_su_dung}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<CheckCircleFilled />}
                                    suffix="đ"
                                    />
                                </Card>     
                            </Col>
                            
                            <Col sm={8}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Tiền còn lại"
                                    value={khachHang.tien_con_lai}
                                    valueStyle={{ color: '#07378c' }}
                                    prefix={<RightSquareFilled />}
                                    suffix="đ"
                                    />
                                </Card>     
                            </Col>

                            <Col sm={24}>
                                <br/>
                                <table className="table-sub">
                                    <thead>
                                        <tr>
                                            <th>Mã thẻ nạp</th>
                                            <th>Tên thẻ nạp</th>
                                            <th>Số tiền</th>
                                            <th>Số lượng</th>
                                            <th>Thành tiền</th>
                                            <th>Ngày nạp</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.theGT.map((card, idx) => {
                                            return <tr key={idx}>
                                                <td>{card.card_code}</td>
                                                <td>{card.product_name}</td>
                                                <td>{numberFormat(card.menh_gia_the)}</td>
                                                <td>{numberFormat(card.so_luong)}</td>
                                                <td>{numberFormat(card.thanh_tien)}</td>
                                                <td>{dayjs(card.created_at).format('DD/MM/YYYY')}</td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                                {data.theGT.length === 0 ? <Empty description="Chưa có lịch sử nạp thẻ" /> : ''} 
                            </Col>
                        </Row>
            },
            {
                // gói dịch vụ
                label: <span className="title-sub-tab">Gói DV đã mua</span>, 
                key: key++,
                children: <Row className='width100'>
                            <Col sm={24}>
                                <br/>
                                <table className="table-sub">
                                    <thead>
                                        <tr>
                                            <th>Mã/Tên gói</th>
                                            <th>Tổng SL</th>
                                            <th>Đã dùng</th>
                                            <th>Ngày mua</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {data.goiDichVu.map((goi, idx) => {
                                        
                                        return <tr key={idx}>
                                            <td>
                                                <Popconfirm 
                                                    showCancel={false}
                                                    placement="topLeft"
                                                    title="Chi tiết gói dịch vụ"
                                                    description={() => {
                                                        const content = goi.cardService.map((item, idx) => {
                                                            return <tr key={idx}>
                                                                <td>{item.product_name}</td>
                                                                <td>{numberFormat(item.product_gia_ban)}<sup>đ</sup></td>
                                                                <td>{numberFormat(Math.round(goi.card.menh_gia_the/goi.card.so_luong))}<sup>đ</sup></td>
                                                                <td>{item.so_luong_da_su_dung}</td>
                                                            </tr>
                                                        });
                                                        return <table className="table-sub">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Tên dịch vụ</th>
                                                                        <th>Giá bán lẻ</th>
                                                                        <th>Giá trong gói</th>
                                                                        <th>Đã sử dụng</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {content}
                                                                </tbody>
                                                            </table>
                                                    }}
                                                >
                                                    <div>
                                                        <a>{goi.card.product_code}-{goi.so_luong}</a>
                                                        <br/>
                                                        <a>{goi.card.product_name}</a>
                                                    </div>
                                                </Popconfirm>
                                            </td>
                                            <td>{goi.card.so_luong}</td>
                                            <td>{goi.card.so_luong_da_su_dung}</td>
                                            <td>{goi.card.created_at ? dayjs(goi.card.created_at).format('DD/MM/YYYY') : ''}</td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>

                                {data.goiDichVu.length === 0 ? <Empty description="Chưa có lịch sử nạp thẻ" /> : ''}
                            </Col>
                        </Row>
            },
            // Công nợ
            {
                label: <span className="title-sub-tab">Công nợ</span>, 
                key: key++,
                children: <Row className='width100'>
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

                            <Col sm={24}>
                                <br/>
                                <table className="table-sub">
                                    <thead>
                                        <tr>
                                            <th>Mã phiếu</th>
                                            <th>Loại</th>
                                            <th>Giá trị <br/> hóa đơn</th>
                                            <th>Còn nợ</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày ghi nợ</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.congNo.map((no, idx) => {
                                            return <tr key={idx}>
                                                <td>{no.ma_chung_tu}</td>
                                                <td>{LOAI_CHUNG_TU[no.loai_chung_tu]}</td>
                                                <td>{numberFormat(no.tong_tien_hoa_don)}</td>
                                                <td>{numberFormat(no.so_tien_no)}</td>
                                                <td>{no.cong_no_status_name}</td>
                                                <td>{no.created_at ? dayjs(no.created_at).format('DD/MM/YYYY'):'' }</td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                                {data.congNo.length === 0 ? <Empty description="Chưa có lịch sử công nợ" /> : ''} 
                            </Col>
                        </Row>
            },
            {
                label: <span className="title-sub-tab">Lịch sử giao dịch</span>, 
                key: key++,
                children: <Row className='width100'>

                            <Col sm={12}>
                                <Card variant="borderless">
                                    <Statistic
                                    title="Tổng tiền giao dịch"
                                    value={data.tongGiaoDich}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<CheckCircleFilled />}
                                    suffix="đ"
                                    />
                                </Card> 
                            </Col>

                            <Col sm={12}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Tổng giảm giá"
                                    value={data.tongGiamGia}
                                    valueStyle={{ color: '#07378c' }}
                                    prefix={<CopyFilled />}
                                    suffix="đ"
                                    />
                                </Card>     
                            </Col>

                            <Col sm={24}>
                                <br/>
                                <table className="table-sub">
                                    <thead>
                                        <tr>
                                            <th>Mã hóa đơn</th>
                                            <th>Tổng tiền hàng</th>
                                            <th>VAT</th>
                                            <th>Giảm giá</th>
                                            <th>Thanh toán</th>
                                            <th>Công nợ</th>
                                            <th>Ngày giao dịch</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.history.map((hdon, idx) => {
                                            return <tr key={idx}>
                                                <td>{hdon.ma_chung_tu}</td>
                                                <td>{numberFormat(hdon.TongTienHang)}</td>
                                                <td>{numberFormat(hdon.TongTienThue)}</td>
                                                <td>{numberFormat(hdon.giam_gia)}</td>
                                                <td>{numberFormat(hdon.thanh_toan)}</td>
                                                <td>{numberFormat(hdon.cong_no)}</td>
                                                <td>{hdon.created_at ? dayjs(hdon.created_at).format('DD/MM/YYYY'):'' }</td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                                {data.history.length === 0 ? <Empty description="Chưa có lịch sử giao dịch" /> : ''} 
                            </Col>
                        </Row>
            },
        ]
    }/>
}
