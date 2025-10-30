import React, { useEffect, useRef, useState } from 'react';
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
    Breadcrumb,Radio, List
} from "antd";
import {
    PrinterOutlined,
    CloseSquareOutlined ,CheckOutlined,
    SignatureFilled,
    MoneyCollectFilled,
    BookFilled,
    EyeFilled,
    FileTextFilled,
} from "@ant-design/icons";

import { numberFormat } from "../Function/common";
import { callApi } from "../Function/api";
import dayjs from "dayjs";

export function checkBtnActive(hoaDon) {
    if(hoaDon.is_recycle_bin === 0) {
        return <Popconfirm title="BẠN MUỐN HỦY PHIẾU NÀY?" 
                        description={<ul>
                                        <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                                        <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                                        <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                                    </ul>}
                        onConfirm={ async () => {
                                    const result = await callApi(route('hoa_don.huyHoaDon.banLe', [hoaDon.id]));
                                    console.log('result', result);
                                    
                                    if(result.status === 200) {
                                        message.success("Đã hủy đơn thành công");
                                        location.reload();
                                    } else {
                                        message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                    }
                                }
                            }
                        
                        cancelText="Dừng" 
                        okText="XÁC NHẬN HỦY PHIẾU"
                    >
                        <button className="btn-cancel02" 
                            onClick={ () => {
                                // setIsModalXoaOpen(true); 
                                // setIdAction(record.id);
                            }} 
                        
                        >
                            <CloseSquareOutlined /> 
                            Hủy phiếu này
                        </button>
                    </Popconfirm>
    }
    // mở lại phiếu
    return <Popconfirm title="MỞ LẠI PHIẾU NÀY?" 
        description={<ul>
                        <li>Phiếu này sẽ được mở lại như cũ</li>
                        <li>Các thông tin về phiếu thu của hóa đơn này cũng sẽ được mở lại</li>
                        <li>Các thông tin về sổ quỹ của hóa đơn này cũng sẽ được mở lại</li>
                    </ul>}
        onConfirm={ async () => {
                    const result = await callApi(route('hoa_don.huyHoaDon.banLe', [hoaDon.id]));
                    console.log('result', result);
                    
                    if(result.status === 200) {
                        message.success("Đã mở lại hóa đơn này");
                        location.reload();
                    } else {
                        message.error("Mở lại đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                    }
                }
            }
        
        cancelText="Dừng" 
        okText="XÁC NHẬN HỦY PHIẾU"
    >
        <button className="btn-cancel02" 
            onClick={ () => {
                // setIsModalXoaOpen(true); 
                // setIdAction(record.id);
            }} 
        
        >
            <SignatureFilled /> 
            Mở lại phiếu này
        </button>
    </Popconfirm>
}

export function hoaDonInfo(hoaDonChiTiet, hoaDon) {
    let data01 = [
            <p><b><SignatureFilled /> Mã: </b> {hoaDon.code}</p>,
            <p><b><FileTextFilled /> Người tạo: </b> {hoaDon.nguoi_tao}</p>,
            <p><b><BookFilled /> Chi nhánh: </b> {hoaDon.chi_nhanh}</p>,
    ];

    let data02 = [
        <p><b><MoneyCollectFilled /> HH NV làm DV: </b> {numberFormat(hoaDon.chiet_khau_nv_thuc_hien)}</p>,
        <p><b><MoneyCollectFilled />  HH NV sale: </b> {numberFormat(hoaDon.chiet_khau_nv_tu_van)}</p>,
        <p><b><EyeFilled /> Ngày tạo: </b> {dayjs(hoaDon.created_at).format('DD/MM/YYYY HH:mm:ss')}</p>,
    ]

    // bán sản phẩm
    if(hoaDon.product_type_id === 1) {
        data01.push(<p><b>Hoa hồng bán hàng: </b> {numberFormat(hoaDon.ck_nv_tu_van)} {hoaDon.is_ck_nv_tu_van_percen === 1 ? '%' : <sup>đ</sup>}</p>);
        data01.push(<p><b>Hoa hồng thực hiện: </b> {numberFormat(hoaDon.ck_nv_cham_soc)} {hoaDon.is_ck_nv_cham_soc_percen === 1 ? '%' : <sup>đ</sup>}</p>);
    }

    function detail(id) {
        if(hoaDonChiTiet[id]) {
            return hoaDonChiTiet[id].map((item, idx) => {
                return <tr key={idx}>
                    <td>
                        <em>{item.product_code}</em>
                        <br/>
                        {item.product_name}
                    </td>
                    <td>{item.so_luong}</td>
                    <td>{numberFormat(item.don_gia)}</td>
                    <td>{numberFormat(item.thanh_tien)}</td>
                </tr>
            })
        }
        return <tr>
            <td colSpan={4}>
                <Spin tip="Loading...">
                    <Alert
                        message="Đang tải thông tin hóa đơn chi tiết..."
                        description=""
                        type="info"
                    />
                </Spin>
            </td>
        </tr>;
    };
    
    return <Row>
        <Col sm={{ span: 12 }}>
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
        <Col sm={{ span: 12 }}>
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
        
        
        {hoaDon.mo_ta && hoaDon.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Mô Tả: </b>{hoaDon.mo_ta}</p></Col> : ''}
        
        {hoaDon.mo_ta && hoaDon.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Ghi chú:{hoaDon.ghi_chu}</b></p></Col> : ''}
        
        <Col sm={{ span: 24 }} >
        <br/>
        <table className="table-sub">
            <thead>
                <tr>
                    <th>Hàng hóa</th>
                    <th>Số lượng</th>
                    <th>Giá bán</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>
            
            <tbody>
                {detail(hoaDon.id)}
            </tbody>

            <tbody>

                <tr>
                    <td colSpan={2}></td>
                    <td className="text-right _bold">Tổng tiền hàng: </td>
                    <td>{numberFormat(hoaDon.TongChiPhi)}</td>
                </tr>

                {/* Giảm giá */}
                <tr>
                    <td colSpan={2}></td>
                    <td className="text-right _bold">Giảm giá: </td>
                    <td>{numberFormat(hoaDon.giam_gia)}</td>
                </tr>
                {/* VAT */}
                <tr>
                    <td colSpan={2}>
                        {
                            hoaDon.cong_no === 0 ? 
                            ''
                            :
                            <Popconfirm title="TẤT TOÁN CÔNG NỢ" 
                                description={<ul>
                                            <li>Hóa đơn này sẽ được chuyển về trạng thái đã thanh toán</li>
                                            <li>Đóng các thông tin công nợ liên quan đến hóa đơn này</li>
                                            <li>Thông tin công nợ sẽ không thể sửa lại sau khi tất toán</li>
                                        </ul>}
                                onConfirm={ () => {
                                        axios.post(route("tatToanCongNo"), {
                                            loai_chung_tu: 'hoa_don',
                                            chung_tu_id: hoaDon.id,
                                            so_tien: 1,
                                            hinh_thuc_thanh_toan_id: '',
                                        })
                                        .then((response) => {
                                            message.success('Đã tất toán thành công');
                                            location.reload();
                                        })
                                        .catch((error) => {
                                            message.error("Thanh toán thất bại, vui lòng tải lại trình duyệt và thử lại");
                                    });
                                } }
                            
                            cancelText="Dừng" 
                            okText="XÁC NHẬN THANH TOÁN"
                        >
                            <button className="btn-print">
                                <CheckOutlined /> Thanh toán công nợ
                            </button>
                            </Popconfirm>
                        }
                        
                    </td>
                    <td className="text-right _bold">VAT ({numberFormat(hoaDon.vat)}%): </td>
                    <td>{numberFormat(hoaDon.vat_money)}<sup>đ</sup></td>
                </tr>
                {/* Tiền trừ thẻ */}
                <tr>
                    <td colSpan={2}>
                        <a target="new" href={route('print.hoaDon', [hoaDon.id])}>
                            <button className="btn-print"><PrinterOutlined /> In</button>
                        </a>
                    </td>
                    <td className="text-right _bold">Tiền trừ thẻ: </td>
                    <td>{numberFormat(hoaDon.tien_tru_the)}</td>
                </tr>
                {/* Thành tiền */}
                <tr>
                    <td colSpan={2}>
                        {checkBtnActive(hoaDon)}
                    </td>
                    <td className="text-right _bold">Thành tiền: </td>
                    <td>{numberFormat(hoaDon.thanh_toan)}</td>
                </tr>
                {/* Công nợ */}
                <tr>
                    <td colSpan={2}>
                    </td>
                    <td className="text-right _bold">Công nợ: </td>
                    <td>{numberFormat(hoaDon.thanh_toan)}</td>
                </tr>
            </tbody>
            
        </table>
            
        </Col>
    </Row>
}
