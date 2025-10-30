import { useState} from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Row,
    Space,
    Tag,
    notification,
    Divider,
    Breadcrumb, Col
} from "antd";

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    InfoCircleOutlined,
    PayCircleOutlined,
    TransactionOutlined,
    ClockCircleOutlined,PlusCircleOutlined,
    CheckOutlined,HomeOutlined,
    CloseSquareOutlined,FileDoneOutlined
} from "@ant-design/icons";
import "../../../../css/form.css";
import { numberFormat } from "../../../Function/common";
const { TextArea } = Input;


export default function Dashboard(props) {

    const [data, setData] = useState(props.formData);
    const [formData] = Form.useForm();
    const [khachHangDetail, setKhachHangDetail] = useState([]);

    const [total, setTotal] = useState(props.hoaDon.TongTienHang);
    const [totalVAT, setTotalVAT] = useState(props.hoaDon.tong_tien);
    const [VAT, setVAT] = useState(props.hoaDon.vat_money);
    const [chietKhauNVThucHien, setChietKhauNVThucHien] = useState(props.hoaDon.chiet_khau_nv_thuc_hien);
    const [chietKhauNVTuVan, setChietKhauNVTuVan] = useState(props.hoaDon.chiet_khau_nv_tu_van);
    // const [discount, setDiscount] = useState(0);
    const [tienTrongThe, setTienTrongThe] = useState(props.hoaDon.tien_trong_the);
    const [thanhToan, setThanhToan] = useState(props.hoaDon.thanh_toan);
    const [tienConLaiSauThanhToan, setTienConLaiSauThanhToan] = useState(props.hoaDon.tien_con_lai);
    const [tienDaTruTrongThe, setTienDaTruTrongThe] = useState(props.hoaDon.tien_tru_the);
    const [cardGTId, setCardGTId] = useState(props.hoaDon.card_gt);

    const [theGT, setTheGT] = useState(props.hoaDon.theGT);
    const [theLT, setTheTL] = useState([]);

    const [donViSP, setDonViSP] = useState('');

    const [typeSubmit, setTypeSubmit] = useState('submit');

    function changekhachHang(value, e) {
        getCardInfo(value);
        setKhachHangDetail(e.data);
    }

    function khachHangInfo(customer) {
        if(customer.name) {
            return <ul>
                <li>Mã: {customer.code}</li>
                <li>Họ tên: {customer.name}</li>
                <li>SĐT: {customer.phone}</li>
                <li>Nhóm: {customer.customer_group}</li>
            </ul>
        }

        return '';
    }

    ///////////////////////////
    const [api, contextHolder] = notification.useNotification();

    const onFinishFailed = (values) => {
    };
    
    const onFinish = (values) => {
        values.typeSubmit = typeSubmit;
        values.total = total;
        values.totalVAT = totalVAT;
        values.thanhToan = thanhToan;
        values.tienConLaiSauThanhToan = tienConLaiSauThanhToan;
        values.tienTrongThe = tienTrongThe;
        values.tienDaTruTrongThe = tienDaTruTrongThe;
        values.chietKhauNVTuVan = chietKhauNVTuVan;
        values.chietKhauNVThucHien = chietKhauNVThucHien;
        values.cardGTId = cardGTId;
        values.cardGTId = cardGTId;
        values.VAT = VAT;

        console.log(values);
        
        router.post(route("hima.formHoaDon", [props.hoaDonId]), values);
        return;
    };

    function initialValuesForm() {
        let result = {};
        let name;
        let name_nv_thuc_hien_chiet_khau_money,
        name_nv_thuc_hien_chiet_khau_persen,
        name_nv_tu_van_id,
        name_nv_thuc_hien_id,
        name_nv_tu_van_chiet_khau_money,
        name_nv_tu_van_chiet_khau_persen;
        for (const [idx, values] of Object.entries(data)) {
            name = getName(idx);
            for (const [key, value] of Object.entries(values)) {
                if(key === 'nv_thuc_hien'){
                    for (const [i, val] of Object.entries(value)) {
                        
                        name_nv_thuc_hien_id = 'nv_thuc_hien_' + idx + '_' + i;
                        name_nv_thuc_hien_chiet_khau_money = 'nv_thuc_hien_chiet_khau_money_' + idx + '_' + i;
                        name_nv_thuc_hien_chiet_khau_persen = 'nv_thuc_hien_chiet_khau_persen_' + idx + '_' + i;;
                        result[name_nv_thuc_hien_chiet_khau_money] = val.chiet_khau_money;
                        result[name_nv_thuc_hien_chiet_khau_persen] = val.chiet_khau_persen;
                        result[name_nv_thuc_hien_id] = val.nv_thuc_hien;
                        // console.log(name_nv_thuc_hien_id, val);
                    }
                } else if(key === 'nv_tu_van') {
                    for (const [i, val] of Object.entries(value)) {
                        name_nv_tu_van_id = 'nv_tu_van_' + idx + '_' + i;
                        name_nv_tu_van_chiet_khau_money = 'nv_tu_van_chiet_khau_money_' + idx + '_' + i;
                        name_nv_tu_van_chiet_khau_persen = 'nv_tu_van_chiet_khau_persen_' + idx + '_' + i;;
                        result[name_nv_tu_van_chiet_khau_money] = val.chiet_khau_money;
                        result[name_nv_tu_van_chiet_khau_persen] = val.chiet_khau_persen;
                        result[name_nv_tu_van_id] = val.nv_tu_van;
                    }
                } else {
                    result[name[key]] = value;
                }
            }
        }

        if(props.hoaDon.chi_nhanh_id) {
            result.chi_nhanh_id = props.hoaDon.chi_nhanh_id;
        }

        if(props.hoaDon.users_id) {
            result.user_id = props.hoaDon.users_id;
            // getCardInfo(value);
            // setKhachHangDetail(e.data);
        }
        
        // console.log('sss', result);

        return result;
    }

    function getCardInfo(user_id) {
        axios.post(route('himalaya.get_card_by_user'), {users_id:user_id})
            .then((response) => {
                let khachThanhToan = 0;
                let tienConLaiSauThanhToan_tmp = 0;
                let tienConLai = 0;
                let tienDaTruTrongThe_tmp = 0;
                let cardGTId_tmp = 0;
                
                if (response.data.status_code == 200) {
                    // set tiền còn lại trong thẻ
                    // console.log('response.data.data', response.data.data)
                    if(response.data.data.cardGTInfo.tienConLai) {
                        console.log('response.data.data', response.data.data)
                        tienConLai = response.data.data.cardGTInfo.tienConLai;
                        if(tienConLai < thanhToan) {
                            khachThanhToan = thanhToan - tienConLai;
                            tienDaTruTrongThe_tmp = tienConLai;
                        }
                        if(tienConLai > thanhToan) {
                            tienConLaiSauThanhToan_tmp = tienConLai - thanhToan;
                            tienDaTruTrongThe_tmp = thanhToan;
                        }
                    }

                    // set thông tin card
                    setTheGT(response.data.data.cardGTInfo);
                    setTheTL(response.data.data.cardTLInfo);
                    
                    message.success("Danh sách thẻ đã được cập nhật lại");
                } else {
                    message.error("Lỗi tải danh sách thẻ");
                }
                
                setTienTrongThe(tienConLai);
                setThanhToan(khachThanhToan);
                setTienConLaiSauThanhToan(tienConLaiSauThanhToan_tmp);
                setTienDaTruTrongThe(tienDaTruTrongThe_tmp);
                setCardGTId(cardGTId_tmp);
            })
            .catch((error) => {
                message.error("Lỗi không tải được danh sách thẻ.");
            });
    }

    function cardGT_lichSuNap(theGT) {
        let content = theGT.cardHistory.map((his, idx)=>{
            return <tr>
                <td>{(idx + 1)}</td>
                <td><b>{numberFormat(his.price)}</b></td>
                <td>{his.created_at}</td>
                {/* <td>{his.so_luong}</td>
                <td>{his.created_at}</td> */}
            </tr>
        });
        content.push(<tr>
            <td>{(idx + 1)}</td>
            <td><b>{numberFormat(his.price)}</b></td>
            <td>{his.created_at}</td>
            <td>Nạp lần đầu</td>
        </tr>);
        return <div className="main-confirm">
            <table className="table-normal">
                <tbody>
                    <tr>
                        <td><b>STT</b></td>
                        <td><b>Số tiền</b></td>
                        <td><b>Thời gian</b></td>
                        <td><b>Ghi chú</b></td>
                        {/* <th>SL Tặng thêm</th>
                        <th>Tiền Tặng thêm</th> */}
                    </tr>
                    {content}
                </tbody>
            </table>
        </div>;
    }

    function cardGT_LichSuSuDungThe(theGT) {
        const content = theGT.cardHistory.map((his, idx)=>{
            return <tr>
                <td>{(idx + 1)}</td>
                <td><b>{numberFormat(his.price)}</b></td>
                <td>{his.created_at}</td>
                {/* <td>{his.so_luong}</td>
                <td>{his.created_at}</td> */}
            </tr>
        });
        return <div className="main-confirm">
            <table className="table-normal">
                <tbody>
                    <tr>
                        <td><b>STT</b></td>
                        <td><b>Số tiền</b></td>
                        <td><b>Thời gian</b></td>
                        {/* <th>SL Tặng thêm</th>
                        <th>Tiền Tặng thêm</th> */}
                    </tr>
                    {content}
                </tbody>
            </table>
        </div>;
    }

    function cardGTContent(theGT) {
        if(theGT.length === 0) {
            return 'Chưa đăng ký thẻ GT';
        }
        let gt = [];
        gt.push(<p>Mã thẻ: {theGT.code}</p>);
        gt.push(<p>Tổng đã nạp: { numberFormat(theGT.tongDaNap) }</p>);
        gt.push(<p>Còn lại: { numberFormat(theGT.tienConLai) }</p>);
        gt.push(<p>
            <Popconfirm title={'Lịch sử nạp thẻ'}
                        description={cardGT_lichSuNap(theGT)}
                        icon={<InfoCircleOutlined style={{ color: 'blue' }} />}>
                <a>Xem lịch sử nạp thẻ</a>
            </Popconfirm>    
            </p>);
        gt.push(<p>
            <Popconfirm title="Xem lịch sử sử dụng"
                        description={cardGT_LichSuSuDungThe(theGT)}
                        icon={<InfoCircleOutlined style={{ color: 'blue' }} />}>
                <a>Xem lịch sử sử dụng</a>
            </Popconfirm>
            </p>);
        return gt;
    }

    function cardTLContent(theTL) {
        if(theTL.length === 0) {
            return 'Chưa đăng ký thẻ TL';
        }
        let tl = theTL.map((tl) => {
            return <Popconfirm title={tl.card.code}
                        description={cardTLDetail(tl)}
                        icon={<InfoCircleOutlined style={{ color: 'blue' }} />}>
                    <Tag className="_pointer" color="#2db7f5">{tl.card.code}</Tag>
                </Popconfirm>;
        });
        return tl;
    }

    function cardTLDetail(tl) {

        return <table className="table-customer">
            <thead>
                <tr>
                    <th colSpan={3} className="th-description">
                        <p>Tổng số lần: {tl.soLuong_history}</p>
                        <p>Đã sử dụng: {tl.soLuong_service}</p>
                        <p><b className="_red">LỊCH SỬ DÙNG THẺ:</b></p>
                    </th>
                </tr>
                <tr>
                    <th>STT</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Tặng thêm</th>
                    <th>Ngày</th>
                </tr>
            </thead>
            <tbody>
                {showContentHistoryTheTL(tl)}
            </tbody>
        </table>
    }

    function showContentHistoryTheTL(tl) {
        let idx = 0;
        return tl.cardHistorys.map((his) => {
            idx++;
            return <tr>
                <td>{idx}</td>
                <td>{his.product_name}</td>
                <td>{his.so_luong}</td>
                <td>{his.so_luong_duoc_tang}</td>
                <td>{his.created_at}</td>
            </tr>
        });
    }

    function changeProduct(value, e, idx) {

        const name = getName(idx);
        
        // active
        formData.setFieldValue(name.active, 1);

        // set price
        formData.setFieldValue(name.price, e.data.price);

        // set đơn vị sản phẩm
        setDonViSP(e.data.ten_don_vi);

        // set số lượng
        let so_luong = formData.getFieldValue(name.so_luong);
        if(!formData.getFieldValue(name.so_luong)) {
            formData.setFieldValue(name.so_luong, 1);
            so_luong = 1;
        }

        // VAT
        let vat_money = 0;
        if(formData.getFieldValue(name.vat_money)) {
            vat_money = formData.getFieldValue(name.vat_money) * so_luong;
        }
        
        // set total
        const total = e.data.price * so_luong;
        formData.setFieldValue(name.total, total);
        const total_vat = total + vat_money;
        formData.setFieldValue(name.total_vat, total_vat);

        // update chiet khau

        // khai báo tổng tiền chiết khấu
        let totalNVThucHien = 0;
        let totalNVTuVan = 0;

        // khai bao tiền chiết khấu theo idx
        let chietKhau_nvThucHien_idx = 0;
        let chietKhau_nvTuVan_idx = 0;
        for(let i=0; i<4; i++) {
            const name_nvThucHien_money = 'nv_thuc_hien_chiet_khau_money_' + idx + '_' + i;
            const name_nvThucHien_persen = 'nv_thuc_hien_chiet_khau_persen_' + idx + '_' + i;
            const name_nvTuVan_money = 'nv_tu_van_chiet_khau_money_' + idx + '_' + i;
            const name_nvTuVan_persen = 'nv_tu_van_chiet_khau_persen_' + idx + '_' + i;

            // convert % 2 money
            // tính tiền ck cho nv thực hiên tương ứng
            chietKhau_nvThucHien_idx = total * formData.getFieldValue(name_nvThucHien_persen) / 100;
            formData.setFieldValue(name_nvThucHien_money, chietKhau_nvThucHien_idx);
            
            // tính tiền ck cho nv tư vấn tương ứng
            chietKhau_nvTuVan_idx = total * formData.getFieldValue(name_nvTuVan_persen) / 100;
            formData.setFieldValue(name_nvTuVan_money, chietKhau_nvTuVan_idx);

            // cộng vào tổng tiền
            totalNVThucHien += chietKhau_nvThucHien_idx;
            totalNVTuVan += chietKhau_nvTuVan_idx;
        }
        // update total
        updateTotal();
    } 
    
    function changeSoLuong(so_luong, idx) {
        const name = getName(idx);
        
        formData.setFieldValue(name.so_luong, so_luong);

        // price
        let price = 0;
        if(formData.getFieldValue(name.price)) {
            price = formData.getFieldValue(name.price);
        }

        // VAT
        let vat_money = 0;
        if(formData.getFieldValue(name.vat_money)) {
            vat_money = formData.getFieldValue(name.vat_money);
        }

        const total = price * so_luong;
        formData.setFieldValue(name.total, total);
        const total_vat = total + vat_money;
        formData.setFieldValue(name.total_vat, total_vat);

        // update total
        updateTotal();
    }

    function changeVAT(vat, idx) {
        const name = getName(idx);
        formData.setFieldValue(name.vat, vat);

        // price
        const price = formData.getFieldValue(name.price);
        const so_luong = formData.getFieldValue(name.so_luong);
        // VAT
        const vat_money = price * so_luong * vat / 100;
        formData.setFieldValue(name.vat_money, vat_money);

        const total = price * so_luong;
        formData.setFieldValue(name.total, total);
        const total_vat = total + vat_money;
        formData.setFieldValue(name.total_vat, total_vat);

        // update total
        updateTotal();
    }
    function changeVATMoney(value, idx) {
        const name = getName(idx);
    }
    function changeNVThucHien(value, e, idx) {
        const name = getName(idx);
    }
    function changeNVTuVan(value, e, idx) {
        const name = getName(idx);
    }
    function changeNVThucHienChietKhauPersen(chiet_khau_persen, idx, idx_parent) {
        const name = getName(idx_parent);
        const name_money = 'nv_thuc_hien_chiet_khau_money_' + idx_parent + '_' + idx;

        // price
        const total = formData.getFieldValue(name.total);

        // VAT
        const chiet_khau_money = total * chiet_khau_persen / 100;
        formData.setFieldValue(name_money, chiet_khau_money);
        
        // update total
        updateTotal();
    }
    
    function changeNVThucHienChietKhauMoney(chiet_khau_money, idx, idx_parent) {
        const name = getName(idx_parent);
        const name_persen = 'nv_thuc_hien_chiet_khau_persen_' + idx_parent + '_' + idx;
        // const name_money = 'nv_thuc_hien_chiet_khau_money_' + idx_parent + '_' + idx;

        const total = formData.getFieldValue(name.total);
        const chiet_khau_persen = (chiet_khau_money * 100 / total).toFixed(2);
        formData.setFieldValue(name_persen, chiet_khau_persen);

        // update total
        updateTotal();
    }

    function changeNVTuVanChietKhauPersen(chiet_khau_persen, idx, idx_parent) {
        const name = getName(idx_parent);
        const name_money = 'nv_tu_van_chiet_khau_money_' + idx_parent + '_' + idx;

        // price
        const total = formData.getFieldValue(name.total);

        // convert % 2 money
        const chiet_khau_money = total * chiet_khau_persen / 100;
        formData.setFieldValue(name_money, chiet_khau_money);
        
        // update total
        updateTotal();
    }
    
    function changeNVTuVannChietKhauMoney(chiet_khau_money, idx, idx_parent) {
        const name = getName(idx_parent);
        const name_persen = 'nv_tu_van_chiet_khau_persen_' + idx_parent + '_' + idx;

        const total = formData.getFieldValue(name.total);
        const chiet_khau_persen = (chiet_khau_money * 100 / total).toFixed(2);
        formData.setFieldValue(name_persen, chiet_khau_persen);

        // update total
        updateTotal();
    }

    function getName(idx) {
        return {
            active: 'active_' + idx,
            product_id: 'product_id_' + idx,
            price: 'price_' + idx,
            so_luong:'so_luong_' + idx,
            vat:'vat_' + idx,
            vat_money:'vat_money_' + idx,
            total:'total_' + idx,
            total_vat:'total_vat_' + idx,
            nv_thuc_hien:'nv_thuc_hien_' + idx,
            chiet_khau_persen:'chiet_khau_persen_' + idx,
            chiet_khau_money:'chiet_khau_money_' + idx,
            ThoiGianThucHien:'ThoiGianThucHien_' + idx
        }
    }

    function updateTotal() {
        let name;
        let total_tmp = 0;
        let total_vat_tmp = 0;
        let vat_tmp = 0;
        // let discount_tmp = 0;
        let chieu_khau_nv_thuc_hien_tmp = 0;
        let chieu_khau_nv_tu_van_tmp = 0;
        for(let i=0;i<10; i++) {
            name = getName(i);
            total_tmp += formData.getFieldValue(name.total);
            total_vat_tmp += formData.getFieldValue(name.total_vat);
            vat_tmp += formData.getFieldValue(name.vat_money);
            // discount_tmp += formData.getFieldValue(name.discount);
            
            for(let idx_sub=0;idx_sub<4; idx_sub++) {
                console.log('ttt', formData.getFieldValue('nv_tu_van_chiet_khau_money_' + i + '_' + idx_sub));
                chieu_khau_nv_thuc_hien_tmp += +formData.getFieldValue('nv_thuc_hien_chiet_khau_money_' + i + '_' + idx_sub);
                chieu_khau_nv_tu_van_tmp += +formData.getFieldValue('nv_tu_van_chiet_khau_money_' + i + '_' + idx_sub);
            }
        }

        setTotal(total_tmp);
        setTotalVAT(total_vat_tmp);
        setVAT(vat_tmp);
        setChietKhauNVThucHien(chieu_khau_nv_thuc_hien_tmp);
        setChietKhauNVTuVan(chieu_khau_nv_tu_van_tmp);
        // setDiscount(discount_tmp);

        // update hoa thanh toán
        let khachThanhToan = 0;
        let tienConLaiSauThanhToan_tmp = 0;
        if(tienTrongThe < total_vat_tmp) {
            khachThanhToan = total_vat_tmp - tienTrongThe;
        }

        if(tienTrongThe > total_vat_tmp) {
            tienConLaiSauThanhToan_tmp = tienTrongThe - total_vat_tmp;
        }
        setThanhToan(khachThanhToan);
        setTienConLaiSauThanhToan(tienConLaiSauThanhToan_tmp);
        
    }

    function formNVThucHien(item, idx_parent) {
        let result = item.nv_thuc_hien.map((nv, idx) => {
            return <div key={idx} className={nv.active === 1 ? 'active':'_hidden'}>
                <Form.Item name={'nv_thuc_hien_' + idx_parent + '_' + idx } className="item-form-hoa-don">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        allowClear={true}
                        placeholder="Search to Select"
                        optionFilterProp="label"
                        onChange={(value, e)=>{changeNVThucHien(value, e, idx);  } }
                        filterSort={
                            (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                        options={ props.nhanVien.map((u) => {
                            const label = u.code + ' - ' + u.name;
                            return {
                                    value: u.id,
                                    label: label,
                                    // data: u,
                                }
                        })}
                    />
                </Form.Item>

                {/* Chiết khấu */}
                <span>Chiết khấu:</span>
                <Form.Item name={'nv_thuc_hien_chiet_khau_persen_' + idx_parent + '_' + idx } className="item-form-hoa-don">
                    <InputNumber
                        min={0}
                        max={100}
                        formatter={(value) => `${value}%`}
                        parser={(value) => value?.replace('%', '')}
                        onChange={(value)=>{changeNVThucHienChietKhauPersen(value,idx, idx_parent); }}
                    />
                </Form.Item>
                <Form.Item name={'nv_thuc_hien_chiet_khau_money_' + idx_parent + '_' + idx } className="item-form-hoa-don">
                    <InputNumber
                        min={0}
                        max={total}
                        formatter={(value) => `${value}đ`}
                        parser={(value) => value?.replace('đ', '')}
                        onChange={(value)=>{changeNVThucHienChietKhauMoney(value,idx, idx_parent); }}
                    />
                </Form.Item>
                <hr/>
            </div>
        });

        return result;
    }

    
    function formNVTuVan(item, idx_parent) {
        let result = item.nv_tu_van.map((nv, idx) => {
            return <div key={idx} className={nv.active === 1 ? 'active':'_hidden'}>
                <Form.Item name={'nv_tu_van_' + idx_parent + '_' + idx } className="item-form-hoa-don">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        allowClear={true}
                        placeholder="Search to Select"
                        optionFilterProp="label"
                        onChange={(value, e)=>{changeNVTuVan(value, e, idx);  } }
                        filterSort={
                            (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                        options={ props.nhanVien.map((u) => {
                            const label = u.code + ' - ' + u.name;
                            return {
                                    value: u.id,
                                    label: label,
                                    // data: u,
                                }
                        })}
                    />
                </Form.Item>

                {/* Chiết khấu */}
                <span>Chiết khấu:</span>
                <Form.Item name={'nv_tu_van_chiet_khau_persen_' + idx_parent + '_' + idx } className="item-form-hoa-don">
                    <InputNumber
                        min={0}
                        max={100}
                        formatter={(value) => `${value}%`}
                        parser={(value) => value?.replace('%', '')}
                        onChange={(value)=>{changeNVTuVanChietKhauPersen(value,idx, idx_parent); }}
                    />
                </Form.Item>
                <Form.Item name={'nv_tu_van_chiet_khau_money_' + idx_parent + '_' + idx } className="item-form-hoa-don">
                    <InputNumber
                        min={0}
                        max={total}
                        formatter={(value) => `${value}đ`}
                        parser={(value) => value?.replace('đ', '')}
                        onChange={(value)=>{changeNVTuVannChietKhauMoney(value,idx, idx_parent); }}
                    />
                </Form.Item>
                <hr/>
            </div>
        });

        return result;
    }

    function contentSP(items) {
        const result = items.map((item, idx) => {
            return <tr key={idx} className={item.active === 1 ? 'active':'_hidden'}>
                        {/* hang hoa */}
                        <td>
                            <Form.Item name={'product_id_' + idx} className="item-form-hoa-don" rules={idx !== 0 ? []:[{required: true, message: 'Vui lòng chọn khách hàng',}]}>
                                <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    allowClear={true}
                                    placeholder="Search to Select"
                                    optionFilterProp="label"
                                    onChange={(value, e)=>{changeProduct(value, e, idx);  } }
                                    filterSort={
                                        (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                    }
                                    options={ props.products.map((p) => {
                                        const label = p.name + ' - ' + p.code;
                                        return {
                                                value: p.id,
                                                label: label,
                                                data: p,
                                            }
                                    })}
                                />
                            </Form.Item>

                            {/* Price */}
                            {/* <Form.Item name={'price_' + idx} className="item-form-hoa-don" rules={idx !== 0 ? []:[{required: true, message: 'Vui lòng chọn khách hàng',}]}> */}
                            <Space>
                                Giá:
                                <Form.Item name={'price_' + idx} className="item-form-hoa-don" >
                                    <InputNumber min={0} disabled={true} formatter={(value) => `${value}đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                </Form.Item>
                            </Space>
                            {/* Số lượng */}
                            <Space>
                                Số lượng:
                                <Form.Item name={'so_luong_' + idx} className="item-form-hoa-don">
                                    <InputNumber min={1} onChange={(value)=>{changeSoLuong(value,idx); }} />
                                </Form.Item>
                                {donViSP}
                            </Space>
                            
                            {/* Thời gian thực hiện */}
                            <Space>
                                Thời gian: 
                                <Form.Item name={'ThoiGianThucHien_' + idx} className="item-form-hoa-don">
                                    <InputNumber min={0} formatter={(value) => `${value}h`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                </Form.Item>
                            </Space>
                        </td>

                        {/* Total */}
                        <td>
                            <Form.Item name={'total_' + idx} className="item-form-hoa-don">
                                <InputNumber readOnly={true}
                                    min={0}
                                    formatter={(value) => `${value}đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </td>

                        {/* VAT */}
                        <td>
                            <Form.Item name={'vat_' + idx} className="item-form-hoa-don">
                                <InputNumber
                                    min={0}
                                    max={100}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value?.replace('%', '')}
                                    onChange={(value)=>{changeVAT(value,idx); }}
                                />
                            </Form.Item>
                            <Form.Item name={'vat_money_' + idx} className="item-form-hoa-don">
                                <InputNumber
                                    min={0}
                                    readOnly={true}
                                    formatter={(value) => `${value}đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                    onChange={(value)=>{changeVATMoney(value,idx); }}
                                />
                            </Form.Item>
                        </td>

                        {/* Thanh toán */}
                        <td>
                            <Form.Item name={'total_vat_' + idx} className="item-form-hoa-don">
                                <InputNumber readOnly={true}
                                    min={0}
                                    formatter={(value) => `${value}đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </td>

                        {/* NV tư vấn */}
                        <td>
                            {formNVTuVan(item, idx)}
                            <hr/>
                            <a onClick={() => addNVTuVan(item, idx)}><PlusCircleOutlined />Thêm NV thực hiện</a>
                        </td>

                        {/* NV thực hiện */}
                        <td>
                            { formNVThucHien(item, idx) }
                            <hr/>
                            <a onClick={() => addNVThucHien(item, idx)}><PlusCircleOutlined />Thêm NV thực hiện</a>

                        </td>
                        
                    </tr>
        });
        return result;
    }

    function addProduct() {
        let preActive = 1;
        const result = data.map((item)=> {
            
            if(item.active === 1) {
                // preActive = 1;
                return item;
            }
            if(item.active === 0 && preActive === 1) {
                preActive = 0;
                item.active = 1;
            }  
            return item;
        });
        
        setData(result);
    }

    function addNVTuVan(item, idx) {
        let preActive = 1;
        const result = data.map((value, i)=> {
            if(idx === i) {
                
                value.nv_tu_van = value.nv_tu_van.map((nv) => {
                    if(nv.active === 0 && preActive === 1) {
                        preActive = 0;
                        nv.active = 1;
                    }
                    return nv;
                });
                
            }

            return value;
        });
        
        setData(result);
    }

    function addNVThucHien(item, idx) {
        let preActive = 1;
        const result = data.map((value, i)=> {
            if(idx === i) {
                
                value.nv_thuc_hien = value.nv_thuc_hien.map((nv) => {
                    if(nv.active === 0 && preActive === 1) {
                        preActive = 0;
                        nv.active = 1;
                    }
                    return nv;
                });
                
            }

            return value;
        });
        
        setData(result);
    }


    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={props.tables}
                current={props.table}
                content={
                    <Form
                        name="basic"
                        layout="vertical"
                        form={formData}
                        initialValues={initialValuesForm()}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        // onValuesChange={onFormLayoutChange}
                    >
                        <Row>
                            {/* Breadcrumb */}
                            <Col span={24}>
                                <Breadcrumb
                                    items={[
                                    {
                                        href: '',
                                        title: (
                                            <Link href={route('dashboard')}>
                                                <HomeOutlined />
                                                <span>Home</span>
                                            </Link>
                                        ),
                                        
                                    },
                                    {
                                        href: '',
                                        title: (
                                            <Link href={route('hoaDon.draft')}>
                                                <FileDoneOutlined />
                                                <span>Danh sách hóa đơn chờ</span>
                                            </Link>
                                        ),
                                    },
                                    {
                                        title: (
                                            <>
                                                <PlusCircleOutlined />
                                                <span>Tạo hóa đơn mới</span>
                                            </>
                                        ),
                                    },
                                    ]}
                                />
                                
                            </Col>

                            <Col span={6}>
                                {/* content */}
                                <Divider orientation="left">Chi nhánh</Divider>
                                <Form.Item name="chi_nhanh_id" className="item-form-hoa-don" rules={[{required: true, message: 'Vui lòng chọn chi nhánh',}]}>
                                    <Select
                                        showSearch
                                        style={{ width: 200 }}
                                        allowClear={true}
                                        placeholder="Search to Select"
                                        optionFilterProp="label"
                                        filterSort={
                                            (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                        }
                                        options={ props.chiNhanh.map((u) => {
                                            const label = u.name + ' - ' + u.code;
                                            return {
                                                    value: u.id,
                                                    label: label,
                                                    data: u,
                                                }
                                        })  }
                                    />
                                </Form.Item>
                                <Divider orientation="left">khách hàng</Divider>
                                <Form.Item name="user_id" className="item-form-hoa-don" rules={[{required: true, message: 'Vui lòng chọn khách hàng',}]}>
                                    <Select
                                        showSearch
                                        style={{ width: 200 }}
                                        allowClear={true}
                                        placeholder="Search to Select"
                                        optionFilterProp="label"
                                        onChange={(value, e)=>{changekhachHang(value, e);  } }
                                        filterSort={
                                            (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                        }
                                        options={ props.users.map((u) => {
                                            const label = u.name + ' - ' + u.phone;
                                            return {
                                                    value: u.id,
                                                    label: label,
                                                    data: u,
                                                }
                                        })  }
                                    />
                                </Form.Item>

                                {khachHangInfo(khachHangDetail)}

                                <Divider orientation="left" className="divider_ccc">Thẻ GT</Divider>
                                {cardGTContent(theGT)}

                                <Divider orientation="left" className="divider_ccc">Thẻ TL</Divider>
                                <p>{cardTLContent(theLT)}</p>

                               
                            </Col>
                            <Col span={18}>
                                <Divider orientation="left">Chọn sản phẩm / Dịch vụ</Divider>
                                <table className="table-customer">
                                    <thead>
                                        <tr>
                                            <th>Hàng hóa</th>
                                            {/* <th>Số lượng</th> */}
                                            <th>Tổng</th>
                                            <th>VAT(%)</th>
                                            <th>Thanh toán</th>
                                            <th>NV tư vấn</th>
                                            <th>NV thực hiện</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { contentSP(data) }
                                        <tr>
                                            <td className="text-right"><b className="_red">Tổng</b></td>
                                            <td><b>{numberFormat(total)}</b></td>
                                            <td><b>{numberFormat(VAT)}</b></td>
                                            <td><b>{numberFormat(totalVAT)}</b></td>
                                            <td><b>{numberFormat(chietKhauNVTuVan)}</b></td>
                                            <td><b>{numberFormat(chietKhauNVThucHien)}</b></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                                <a onClick={() => addProduct()}><PlusCircleOutlined />Thêm SP</a>
                                <p><b>&nbsp; Ghi chú thêm:</b></p>
                                <Form.Item name="note" className="item-form-hoa-don">
                                    <TextArea className="textarea-note-customer"></TextArea>
                                </Form.Item>

                                <Divider orientation="left"><TransactionOutlined /> Thanh toán</Divider>
                                
                                <ul className="ul_thanhtoan">
                                    <li>
                                        <span className="icon-thanhtoan"><PayCircleOutlined /></span>
                                        <b> Tổng {numberFormat(totalVAT)}</b>
                                    </li>
                                    <li>
                                        <table  className="table-normal">
                                            <tbody>
                                                <tr>
                                                    <td><b>Tổng tiền trong thẻ</b></td>
                                                    <td><b>Tiền sẽ trừ sau TT</b></td>
                                                    <td><b>Còn lại</b></td>
                                                </tr>
                                                <tr>
                                                    <td>{tienTrongThe}</td>
                                                    <td>{tienDaTruTrongThe}</td>
                                                    <td>{tienConLaiSauThanhToan}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </li>
                                    
                                    <li>
                                        <span className="icon-thanhtoan"><TransactionOutlined /></span>
                                        <b className="_red"> Khách thanh toán sau khi trừ thẻ: {numberFormat(thanhToan)}</b>
                                    </li>
                                </ul>
                                
                                <Button type="primary" htmlType="submit" onClick={()=>{ setTypeSubmit('draft'); }} className="btn-draft" > <ClockCircleOutlined /> Lưu nháp </Button>
                                &nbsp;
                                <Button type="primary" htmlType="submit"  onClick={()=>{ setTypeSubmit('submit'); }} className="btn-success" color="primary" > <CheckOutlined /> THANH TOÁN ĐƠN HÀNG </Button>
                                &nbsp;
                                <Button type="primary" htmlType="submit"  onClick={()=>{ setTypeSubmit('cancel'); }} className="btn-cancel" > <CloseSquareOutlined /> Hủy hóa đơn này </Button>
                            </Col>
                        </Row>
                    </Form>
                }
            />
        </div>
    );
}
