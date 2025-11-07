
import React, { useState } from 'react';
import {
    Button,
    Table,
    message,
    Modal,
    Form, Radio, Input, InputNumber, Select,
    Popconfirm,
    List,
    Row,
    Space,
    Tag,
    Card,
    DatePicker,
    notification,
    Divider,
    Image,
    Breadcrumb,
    Switch, Tabs, Col, FloatButton, Drawer
} from "antd";
import {
    CopyOutlined, InfoCircleOutlined,
    UserSwitchOutlined, CheckOutlined, CloseSquareOutlined,
    CaretRightOutlined, SettingOutlined, ArrowRightOutlined,
    PrinterOutlined, MinusCircleOutlined, DashboardOutlined

} from "@ant-design/icons";

import axios from "axios";
import { numberFormat, parseJson } from '../function/common';
import { callApi } from "../Function/api";
import dayjs from "dayjs";

export function contentThuNganConfig(nhanVienThuNgan, nhanVienData, chiNhanhThuNgan, chiNhanhData, khoHang, khoHangData, onSuccess) {
    const [loaddingBtn, setLoaddingBtn] = useState(false);
    const [formConfig] = Form.useForm();

    const onFinish = (values) => {
        setLoaddingBtn(true);
        axios.post(route('admin.session.setThuNgan'), values)
            .then((response) => {
                console.log('response', response.data);

                if (response.data.message == 'success') {
                    message.success("Đã cài đặt thu ngân thành công");
                    onSuccess(response.data.data);
                    setLoaddingBtn(false);
                    // location.reload();
                } else {
                    message.error("Cài đặt thu ngân không thành công");
                    setLoaddingBtn(false);
                }

            })
            .catch((error) => {
                setLoaddingBtn(false);
                message.error("Cài đặt thu ngân không thành công");
            });
    }
    formConfig.setFieldsValue({
        nhan_vien_id: nhanVienThuNgan.id,
        chi_nhanh_id: chiNhanhThuNgan.id,
        kho_hang_id: khoHang.id
    });
    return <Form
        name="formThuNganConfig"
        form={formConfig}
        onFinish={onFinish}
        autoComplete="off"
        // initialValues={{ chi_nhanh_id: chiNhanhThuNgan.id, nhan_vien_id: nhanVienThuNgan.id, kho_hang_id: khoHang.id }}
    >
        <table className="table-form-2">
            <tbody>

                <tr>
                    <td>Nhân viên thu ngân</td>
                    <td>
                        <Form.Item name='nhan_vien_id' label='' rules={[{ required: true, message: 'Vui lòng chọn nhân viên', }]}>
                            <Select
                                style={{ width: '100%' }}
                                allowClear={true}
                                placeholder="Chọn nhân viên"
                                optionFilterProp="label"
                                filterSort={
                                    (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                }
                                options={nhanVienData.map((u) => {
                                    const label = u.code + ' - ' + u.name;
                                    return {
                                        value: u.id,
                                        label: label,
                                        data: u,
                                    }
                                })}
                            />
                        </Form.Item>
                    </td>
                </tr>

                <tr>
                    <td>Chi nhánh</td>
                    <td>
                        <Form.Item name='chi_nhanh_id' label='' rules={[{ required: true, message: 'Vui lòng chọn chi nhánh', }]}>
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                allowClear={true}
                                placeholder="Chi nhánh"
                                optionFilterProp="label"
                                filterSort={
                                    (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                }
                                options={chiNhanhData.map((u) => {
                                    const label = u.code + ' - ' + u.name;
                                    return {
                                        value: u.id,
                                        label: label,
                                        data: u,
                                    }
                                })}
                            />
                        </Form.Item>
                    </td>
                </tr>

                <tr>
                    <td>Chọn kho hàng mặc định</td>
                    <td>
                        <Form.Item name='kho_hang_id' label='' rules={[{ required: true, message: 'Vui lòng chọn kho lấy hàng', }]}>
                            <Select
                                style={{ width: '100%' }}
                                allowClear={true}
                                placeholder="Chọn lấy kho hàng"
                                optionFilterProp="label"
                                filterSort={
                                    (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                }
                                options={khoHangData.map((u) => {
                                    const label = u.code + ' - ' + u.name;
                                    return {
                                        value: u.id,
                                        label: label,
                                        data: u,
                                    }
                                })}
                            />
                        </Form.Item>
                    </td>
                </tr>

                <tr>
                    <td colSpan={2} className="text-center">
                        <br />
                        <span> </span>
                        <Button className="btn-popup"
                            type="primary"
                            htmlType="submit"
                            loading={loaddingBtn}
                        >
                            <SettingOutlined />
                            XÁC NHẬN
                        </Button>
                    </td>
                </tr>
            </tbody>
        </table>
    </Form>
}

export function contentDoiCa(nhanVienThuNgan, nhanVienData, caInfo, onSuccess) {
    const [loaddingBtn, setLoaddingBtn] = useState(false);
    const [formConfig] = Form.useForm();

    // submit
    const onFinish = (values) => {
        setLoaddingBtn(true);
        axios.post(route('admin.session.setDoiCa'), values)
            .then((response) => {
                if (response.data.message == 'success') {
                    message.loading("Đã đổi ca thành công, vui lòng chờ hệ thông cập nhật lại");
                    onSuccess(response.data.data);
                    setLoaddingBtn(false);
                    // location.reload();
                } else {
                    message.error("Cài đặt đổi ca không thành công");
                    setLoaddingBtn(false);
                }

            })
            .catch((error) => {
                setLoaddingBtn(false);
                message.error("Cài đặt đổi ca không thành công123");
            });
    }

    console.log('nhanVienData', nhanVienData);

    return <Form
        name="formDoiCa"
        form={formConfig}
        onFinish={onFinish}
        autoComplete="off"
        // initialValues={{nhan_vien_id:nhanVienThuNgan.id}}
    >
        <table className="table-form-2">
            <tbody>
                <tr className='tr-border'>
                    <td colSpan={2}>
                        <b> <UserSwitchOutlined /> Chọn người đổi Ca</b>
                        <Form.Item className='td-select' name='nhan_vien_id' label='' rules={[{ required: true, message: 'Vui lòng chọn nhân viên', }]}>
                            <Select
                                style={{ width: '100%' }}
                                allowClear={true}
                                placeholder="Chọn nhân viên"
                                optionFilterProp="label"
                                filterSort={
                                    (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                }
                                options={nhanVienData.map((u) => {
                                    const label = u.code + ' - ' + u.name;
                                    return {
                                        value: u.id,
                                        label: label,
                                        data: u,
                                    }
                                })}
                            />
                        </Form.Item>
                    </td>
                </tr>

                <tr className='tr-border'>
                    <td colSpan={2}><b><InfoCircleOutlined /> Thông tin ca trước:</b></td>
                </tr>
                <tr>
                    <td><a><UserSwitchOutlined /></a> <em>Người thu</em></td>
                    <td>{caInfo.nguoiThu}</td>
                </tr>
                <tr>
                    <td><a><CaretRightOutlined /></a> <em>Tổng tiền mặt</em></td>
                    <td>{numberFormat(caInfo.tien_mat)}<sup>đ</sup></td>
                </tr>
                <tr>
                    <td><a><CaretRightOutlined /></a> <em>Tổng tiền quẹt thẻ</em></td>
                    <td>{numberFormat(caInfo.tien_quet_the)}<sup>đ</sup></td>
                </tr>
                <tr>
                    <td><a><CaretRightOutlined /></a> <em>Tổng chuyển khoản</em></td>
                    <td>{numberFormat(caInfo.tien_chuyen_khoan)}<sup>đ</sup></td>
                </tr>
                <tr>
                    <td><a><CaretRightOutlined /></a> <em>Tổng tiền tip</em></td>
                    <td>{numberFormat(caInfo.tien_tip)}<sup>đ</sup></td>
                </tr>
                <tr>
                    <td><a><CaretRightOutlined /></a> <em>Tổng tiền trừ thẻ của khách</em></td>
                    <td>{numberFormat(caInfo.phi_ca_the)}<sup>đ</sup></td>
                </tr>
                <tr>
                    <td><a><CaretRightOutlined /></a> <em>Tổng tiền trừ thẻ của khách</em></td>
                    <td>{numberFormat(caInfo.tien_tru_the_vip)}<sup>đ</sup></td>
                </tr>
                <tr>
                    <td><b className='_red'><a><CheckOutlined /></a> Tổng thu của ca này bao gồm thẻ GT</b></td>
                    <td><b className='_red'>{numberFormat(caInfo.tongThu_baoGomTheVIP)}<sup>đ</sup></b></td>
                </tr>
                <tr>
                    <td><b className='_red'><a><CheckOutlined /></a> Tổng thu của ca này không  bao gồm thẻ GT</b></td>
                    <td><b className='_red'>{numberFormat(caInfo.tongThu_daTruTheVIP)}<sup>đ</sup></b></td>
                </tr>
                <tr>
                    <td><b className='warning-text'><a><CheckOutlined /></a> Công nợ</b></td>
                    <td className='warning-text'><b>{numberFormat(caInfo.cong_no)}<sup>đ</sup></b></td>
                </tr>

                <tr>
                    <td colSpan={2} className="text-center">
                        <br />
                        <span> </span>
                        <Button className="btn-popup"
                            type="primary"
                            htmlType="submit"
                            loading={loaddingBtn}
                        >
                            <CopyOutlined />
                            XÁC NHẬN
                        </Button>
                    </td>
                </tr>
            </tbody>
        </table>
    </Form>
}

export function khachTraHang(record) {
    const detail = record.info.map((item, idx) => {
        console.log('item', item);
        return <tr key={idx}>
            <td>{item.product_code} - {item.product_name}</td>
            <td>{numberFormat(item.gia_ban)}</td>
            <td className="text-center">{item.so_luong}</td>
            <td>{numberFormat(item.giam_gia)} {item.is_percen ? item.don_vi_giam_gia : <sup>đ</sup>}</td>
            <td>{numberFormat(item.tien_tra_khach)}</td>
        </tr>
    });

    return <div>


        <table className="table-sub">
            <thead>
                <tr>
                    <th>Hàng hóa</th>
                    <th>Giá bán</th>
                    <th>Số lượng trả</th>
                    <th>Giảm giá</th>
                    <th>Tổng tiền hàng trả</th>
                </tr>
            </thead>

            <tbody>
                {detail}
            </tbody>

            <tbody>
                <tr>
                    <td colSpan={2} className="text-right01 ">Tổng trả khách:</td>
                    <td className="_bold text-center">{numberFormat(record.so_luong)} </td>
                    <td className="_bold">{numberFormat(record.giam_gia)} <sup>đ</sup></td>
                    <td className="_bold">{numberFormat(record.thanh_tien)} <sup>đ</sup></td>
                </tr>

                {/* Đã thanh toán */}
                <tr>
                    <td>

                    </td>
                    <td className="text-right01 ">Đã thanh toán:</td>
                    <td colSpan={2}></td>
                    <td className="_bold">{numberFormat(record.da_thanh_toan)}</td>
                </tr>

                {/* Công nợ */}
                <tr>
                    <td>
                        <a target="new" href={route('print.khachTraHang', [record.id])}>
                            <button className="btn-print"><PrinterOutlined /> In</button>
                        </a>
                    </td>
                    <td className="text-right01 ">
                        <b><a><MinusCircleOutlined /> </a> </b>
                        <b>Công nợ </b>
                    </td>
                    <td colSpan={2}></td>
                    <td className="_bold">
                        <b className="_red">{numberFormat(record.cong_no)} <sup>đ</sup></b>
                    </td>
                </tr>

                {/* Ngày tất toán */}
                <tr>
                    <td>
                        <Popconfirm
                            title='Xác nhận hủy'
                            onConfirm={async () => {
                                const result = await callApi(route('hoa_don.huyHoaDon.khachTraHang', [record.id]));
                                if (result.status === 200) {
                                    message.success("Đã hủy đơn thành công");
                                    location.reload();
                                } else {
                                    message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }}
                            onCancel={() => { }}
                            icon={
                                <ArrowRightOutlined
                                    style={{ color: "#1890ff" }}
                                />
                            }
                            description={<ul>
                                <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                                <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ bị xóa</em></li>
                                <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                            </ul>}
                            cancelText="Hủy"
                            okText={"Xác nhận hủy"}
                        >
                            <button className="btn-cancel02">
                                <CloseSquareOutlined /> Hủy phiếu này
                            </button>
                        </Popconfirm>
                    </td>
                    <td className="text-right01 ">
                        <b><a><DashboardOutlined /> </a> </b>
                        <b>Ngày tất toán </b>
                    </td>
                    <td colSpan={2} className="_bold"></td>
                    <td className="_bold">
                        {record.ngay_tat_toan ? dayjs(record.ngay_tat_toan).format('DD/MM/YYYY') : ''}
                    </td>
                </tr>
            </tbody>

        </table>
    </div>;
}

export function nhapHang(record) {
    const detail = record.info.map((item, idx) => {
        return <tr key={idx}>
            <td>{item.product_code} - {item.product_name}</td>
            <td>{item.so_luong}</td>
            <td>{numberFormat(item.gia_von)}</td>
            <td>{numberFormat(item.giam_gia)}</td>
            <td>{numberFormat(item.phi_van_chuyen)}</td>
            <td>{numberFormat(item.thanh_tien)}</td>
        </tr>
    });

    return <div>
        {/* {checkShowData(record)} */}
        <table className="table-sub">
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

            <tbody>
                {detail}
            </tbody>

            <tbody>
                <tr className="border-none">
                    <td colSpan={2}></td>
                    <td colSpan={3} className="text-right01">Tổng tiền hàng:</td>
                    <td>{numberFormat(record.tong_tien_hang)}</td>
                </tr>
                <tr className="border-none">
                    <td colSpan={2}>

                    </td>
                    <td colSpan={3} className="text-right01">Giảm giá:</td>
                    <td>{numberFormat(record.giam_gia)}</td>
                </tr>
                <tr className="border-none">
                    <td colSpan={2}>
                        <a target="new" href={route('print.nhapHang', [record.id])}>
                            <button className="btn-print"><PrinterOutlined /> In</button>
                        </a>
                    </td>
                    <td colSpan={3} className="text-right01">Thanh toán:</td>
                    <td>{numberFormat(record.thanh_tien)}</td>
                </tr>
                {/* Đã thanh toán */}
                <tr>
                    <td colSpan={2}>
                        <Popconfirm
                            title='Xác nhận hủy'
                            onConfirm={async () => {
                                const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [record.id]));
                                if (result.status === 200) {
                                    message.success("Đã hủy đơn thành công");
                                    location.reload();
                                } else {
                                    message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }}
                            onCancel={() => { }}
                            icon={
                                <ArrowRightOutlined
                                    style={{ color: "#1890ff" }}
                                />
                            }
                            description={<ul>
                                <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                                <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ bị xóa</em></li>
                                <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                            </ul>}
                            cancelText="Hủy"
                            okText={"Xác nhận hủy"}
                        >
                            <button className="btn-cancel02">
                                <CloseSquareOutlined /> Hủy phiếu này
                            </button>
                        </Popconfirm>
                    </td>
                    <td colSpan={3} className="text-right01 ">Đã thanh toán:</td>
                    <td className="_bold">{numberFormat(record.da_thanh_toan)}</td>
                </tr>

                {/* Công nợ */}
                <tr>
                    <td colSpan={2}></td>
                    <td colSpan={3} className="text-right01 ">
                        <b><a><MinusCircleOutlined /> </a> </b>
                        <b>Công nợ </b>
                    </td>
                    <td className="_bold">
                        <b className="_red">{numberFormat(record.cong_no)} <sup>đ</sup></b>
                    </td>
                </tr>

                {/* Ngày tất toán */}
                <tr>
                    <td colSpan={2} className="_bold"></td>
                    <td colSpan={3} className="text-right01 ">
                        <b><a><DashboardOutlined /> </a> </b>
                        <b>Ngày tất toán </b>
                    </td>
                    <td className="_bold">
                        {record.ngay_tat_toan ? dayjs(record.ngay_tat_toan).format('DD/MM/YYYY') : ''}
                    </td>
                </tr>
            </tbody>

        </table>
    </div>;
}

export function traHangNCC(record) {
    console.log('traHangNCC', record);
    const detail = record.info.map((item, idx) => {
        console.log('ss', item);
        return <tr key={idx}>
            <td>{item.product_code} - {item.product_name}</td>
            <td>{item.so_luong}</td>
            <td>{numberFormat(item.gia_von)}</td>
            <td>{numberFormat(item.gia_tra_lai)}</td>
            <td>{numberFormat(item.thanh_tien)}</td>
        </tr>
    });

    return <div>
        {/* {checkShowData(record)} */}
        <table className="table-sub">
            <thead>
                <tr>
                    <th>Hàng hóa</th>
                    <th>Số lượng</th>
                    <th>Giá nhập</th>
                    <th>Giá trả lại hàng</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>

            <tbody>
                {detail}
            </tbody>

            <tbody>
                <tr className="border-none">
                    <td colSpan={4} className="text-right01">Tổng tiền hàng:</td>
                    <td>{numberFormat(record.tong_tien_hang)}</td>
                </tr>
                <tr className="border-none">
                    <td>
                        {
                            record.cong_no === 0 ?
                                ''
                                :
                                <Popconfirm
                                    title='Xác nhận tất toán toàn bộ công nợ'
                                    onConfirm={() => {
                                        axios.post(route("tatToanCongNo"), {
                                            loai_chung_tu: 'product_tra_hang_ncc',
                                            chung_tu_id: record.id,
                                            so_tien: record.cong_no,
                                        })
                                            .then((response) => {
                                                message.success('Đã tất toán thành công');
                                                location.reload();
                                            })
                                            .catch((error) => {
                                                message.error("Thanh toán thất bại, vui lòng tải lại trình duyệt và thử lại");
                                            });
                                    }
                                    }
                                    onCancel={() => { }}
                                    icon={
                                        <ArrowRightOutlined
                                            style={{ color: "#1890ff" }}
                                        />
                                    }
                                    description={<p>
                                        Sau khi xác nhận thanh toán, hệ thống sẽ cập nhật và đồng bộ lại toàn bộ dữ liệu liên quan đến
                                        <br />
                                        phiếu nhập hàng này, gồm có phiếu chi, sổ quỹ, công nợ
                                    </p>}
                                    cancelText="Hủy"
                                    okText={"Xác nhận hủy"}
                                >
                                    <button className="btn-print">
                                        <CheckOutlined />
                                        Tất toán công nợ
                                    </button>
                                </Popconfirm>
                        }
                    </td>
                    <td colSpan={3} className="text-right01">Giảm giá:</td>
                    <td>{numberFormat(record.giam_gia)}</td>
                </tr>
                <tr className="border-none">
                    <td>
                        <a target="new" href={route('print.traHangNCC', [record.id])}>
                            <button className="btn-print"><PrinterOutlined /> In</button>
                        </a>
                    </td>
                    <td colSpan={3} className="text-right01">Phí trả hàng:</td>
                    <td>{numberFormat(record.phi_tra_hang)}</td>
                </tr>
                <tr className="border-none">
                    <td>
                        <Popconfirm
                            title='Xác nhận hủy'
                            onConfirm={async () => {
                                const result = await callApi(route('hoa_don.huyHoaDon.traHangNhap', [record.id]));
                                if (result.status === 200) {
                                    message.success("Đã hủy đơn thành công");
                                    location.reload();
                                } else {
                                    message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }
                            }
                            onCancel={() => { }}
                            icon={
                                <ArrowRightOutlined
                                    style={{ color: "#1890ff" }}
                                />
                            }
                            description={<ul>
                                <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                                <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ bị xóa</em></li>
                                <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                            </ul>}
                            cancelText="Hủy"
                            okText={"Xác nhận hủy"}
                        >
                            <button className="btn-cancel02"><CloseSquareOutlined /> Hủy phiếu này</button>
                        </Popconfirm>

                    </td>
                    <td colSpan={3} className="text-right01">Thanh toán:</td>
                    <td>{numberFormat(record.thanh_tien)}</td>
                </tr>

                {/* Đã thanh toán */}
                <tr>
                    <td className="text-right01 " colSpan={4}>Đã thanh toán:</td>
                    <td className="_bold">{numberFormat(record.da_thanh_toan)}</td>
                </tr>

                {/* Công nợ */}
                <tr>
                    <td className="text-right01" colSpan={4}>
                        <b><a><MinusCircleOutlined /> </a> </b>
                        <b>Công nợ </b>
                    </td>
                    <td className="_bold">
                        <b className="_red">{numberFormat(record.cong_no)} <sup>đ</sup></b>
                    </td>
                </tr>

                {/* Ngày tất toán */}

                <tr>
                    <td className="text-right01" colSpan={4}>
                        <b><a><DashboardOutlined /> </a> </b>
                        <b>Ngày tất toán </b>
                    </td>
                    <td className="_bold">
                        {record.ngay_tat_toan ? dayjs(record.ngay_tat_toan).format('DD/MM/YYYY') : ''}
                    </td>
                </tr>
            </tbody>

        </table>
    </div>;
}
