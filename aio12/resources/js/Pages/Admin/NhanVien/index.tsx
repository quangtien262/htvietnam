import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,Checkbox,
    Row,
    Space,
    notification,
    Divider,
    Tabs,
    Col,Image,Switch ,
    Radio, List
} from "antd";

import { router } from "@inertiajs/react";
import axios from "axios";
import {
    HomeFilled,
    CreditCardFilled,
    PlusCircleOutlined,
    DeleteOutlined,
    MailFilled,ShoppingFilled,
    PhoneFilled,
    SignatureFilled,
    StopOutlined,
    CheckOutlined,
    BookFilled,
    CloseCircleOutlined,
    EyeFilled,
    CheckCircleOutlined,
    FileTextFilled,CopyOutlined,CloseSquareOutlined,
    HomeOutlined, BarsOutlined, SlackCircleFilled,PushpinFilled
} from "@ant-design/icons";

import "../../../../css/list02.css";
import "../../../../css/form.css";
import { numberFormat, showInfo, removeByIndex } from "../../../Function/common";
import { cloneDeep } from "lodash";
import dayjs from "dayjs";

import { routeNhanSu, tblNhanSu } from "../../../Function/config_route";

export default function Dashboard(props) {
    const [formSearch] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [formChangePW] = Form.useForm();
    const [resultChangePW, setResultChangePW] = useState('');
    const [nghiLam, setNghiLam] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isModalEdit, setIsModalEdit] = useState(false);
    const [isModalChangePW, setIsModalChangePW] = useState(false);

    const [classLuongChinhNangCao, setClassLuongChinhNangCao] = useState('_hidden');
    const [classLuongChinhCoBan, setClassLuongChinhCoBan] = useState('');
    const [classBtnLuongChinhNangCao, setClassBtnLuongChinhNangCao] = useState('_hidden');
    const [classLuongLamThemGio, setClassLuongLamThemGio] = useState('_hidden');
    const [classSettingLuongLamThemGio, setClassSettingLuongLamThemGio] = useState('_hidden');
    const [classSettingThuong, setClassSettingThuong] = useState('_hidden');
    const [classSettingHoaHong, setClassSettingHoaHong] = useState('_hidden');
    const [classSettingPhuCap, setClassSettingPhuCap] = useState('_hidden');
    const [classSettingGiamTru, setClassSettingGiamTru] = useState('_hidden');

    //thuongData
    const thuongData_item_default = {
            loai_hinh: null,
            doanh_thu_thuan: 0,
            is_thuong_theo_phantram:true,
            thuong:0
        };
    const [thuongData, setThuongData] = useState([thuongData_item_default]);

    //hoaHongData
    const hoaHongData_item_default = {
            loai_hinh: null,
            doanh_thu_thuan: 0,
        };
    const [hoaHongData, sethoaHongData] = useState([hoaHongData_item_default]);

    //phuCapData
    const phuCapData_item_default = {
            ten_phu_cap: null,
            loai_phu_cap: null,
            phu_cap_thu_huong: 0,
        };
    const [phuCapData, setPhuCapData] = useState([phuCapData_item_default]);

    //giamTruData
    const giamTruData_item_default = {
            ten_giam_tru: null,
            loai_giam_tru: null,
            khoan_giam_tru: 0,
            thoi_gian: 15,
        };
    const [giamTruData, setGiamTruData] = useState([giamTruData_item_default]);

    const DATE_FORMAT_SHOW = 'DD/MM/YYYY';
    const DATE_FORMAT = 'YYYY-MM-DD';
    
    
    const [users, setUsers] = useState(props.users.data);

    const [pidAction, setPidAction] = useState(0);
    const [isModalNgungKinhDoanhOpen, setIsModalNgungKinhDoanhOpen] = useState(0);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(0);

    const [loadingLichSuMuaHang, setLoadingLichSuMuaHang] = useState(false);
    const [lichSuMuaHang, setLichSuMuaHang] = useState([]);
    const [indexEdit, setIndexEdit] = useState(0);

    const onFinishChangePW = (values) => {
        console.log('vaa', values);

        if(values.password !== values.password_confirm) {
            setResultChangePW('Mật khẩu và mật khẩu xác nhận không giống nhau');
            return;
        }
        setResultChangePW('');
        setLoadingTable(true);
        values.id = pidAction;
        axios.post(route("nhanVien.changePW"), values)
            .then((response) => {
                console.log('response.data.data', response);
                setLoadingTable(false);
                setIsModalChangePW(false);
                message.success('Đổi mật khẩu thành công');
                formChangePW.resetFields();
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            }
        );
    }


    const onFinishSearch = (values) => {
        console.log('vaa', values);
        setLoadingTable(true);
        axios.post(route("nhanVien.search"), values)
            .then((response) => {
                console.log('response.data.data', response.data.data.data);
                if (response.data.status_code === 200) {
                    setUsers(response.data.data.data);
                    setLoadingTable(false);
                } else {
                    message.error("Không lấy được thông tin dịch vụ");
                    setLoadingTable(false);
                }
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            }
        );
    }

    //onFinishFormEdit
    const onFinishFormEdit = (values) => {
        setLoadingTable(true);
        values.id = pidAction;

        if(values.ngay_cap) {
            values.ngay_cap = values.ngay_cap.format(DATE_FORMAT)
        }
        if(values.birthday) {
            values.birthday = values.birthday.format(DATE_FORMAT)
        }
        if(values.ngay_vao_lam) {
            values.ngay_vao_lam = values.ngay_vao_lam.format(DATE_FORMAT)
        }

        // check loai luong ....

        // check thuong
        if(values.is_setting_thuong) {
            values.thuong_setting = thuongData;
        }

        // check hoa hong
        if(values.is_setting_hoa_hong) {
            values.hoa_hong_setting = hoaHongData
        }

        // check phu cap
        if(values.is_setting_phu_cap) {
            values.phu_cap_setting = phuCapData
        }

        // check giam tru
        if(values.is_setting_giam_tru) {
            values.giam_tru_setting = giamTruData
        }

        console.log('values', values);
        

        // return;
        axios.post(route("nhanVien.save"), values)
            .then((response) => {
                console.log('respons', response);
                // if(pidAction === 0) {
                //     location.reload();
                // }
                if (response.data.status_code === 200) {
                    let users_tmp = cloneDeep(users);
                    users_tmp[indexEdit] = response.data.data;
                    setUsers(users_tmp);
                } else {
                    message.error("Không lấy được thông tin dịch vụ");
                }
                setLoadingTable(false);
                setIsModalEdit(false);
            })
            .catch((error) => {
                console.log(error);
                setLoadingTable(false);
                setIsModalEdit(false);
                message.error("Cập nhật thất bại");
            }
        );
    }

    function initialFormEdit() {
        let result = {
            name:'',
            username:'',
            phone:'',
            email:'',
            tinh_trang_hon_nhan_id:null,
            address:'',
            cmnd:'',
            noi_cap:'',
            ngay_cap:'',
            chi_nhanh_id:null,
            admin_user_status_id:null,
            permission_group_id:null,
            birthday:null,
            ngay_vao_lam:null,
            ngay_cap:null,

            // salary:
            // luong chính
            loai_luong:null,
            is_setting_salary_nang_cao:false,

            // cai dat luong nang cao
            is_setting_salary_lam_them_gio:false,
            luong_chinh_thu7:100,
            luong_chinh_cn:100,
            luong_chinh_ngay_nghi:100,
            luong_chinh_nghi_le:100,

            // luong lam them gio
            is_setting_salary_lam_them_gio:false,

            them_gio_ngay_thuong:150,
            is_them_gio_ngay_thuong_persen:true,

            them_gio_thu7:200,
            is_them_gio_thu7_persen:true,

            them_gio_chu_nhat:200,
            is_them_gio_chu_nhat_persen:true,

            them_gio_ngay_nghi:200,
            is_them_gio_ngay_nghi_persen:true,

            them_gio_nghi_le_tet:200,
            is_them_gio_nghi_le_tet_persen:true,
        };
        return result;
    }

    function showThuongData() {
        return thuongData.map((data, idx)=>{
            return <tr>
                        <td>
                            <Select
                                placeholder="Chọn loại lương"
                                optionFilterProp="children"
                                onChange={(value) => {
                                    let thuong_tmp = cloneDeep(thuongData);
                                    thuong_tmp[idx].loai_hinh = value;
                                    setThuongData(thuong_tmp);
                                }}
                                allowClear={true}
                                value={data.loai_hinh}
                                options={[
                                    { label: 'Thực hiện dịch vụ', value: 1 },
                                    { label: 'Tư vấn bán hàng', value: 2 },
                                ]}
                            />
                            
                        </td>
                        <td className="td-input">
                            <InputNumber 
                                className="input-number" 
                                prefix={'Từ: '}
                                suffix={'vnđ'} 
                                value={data.doanh_thu_thuan}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                onChange={(value) => {
                                    let thuong_tmp = cloneDeep(thuongData);
                                    thuong_tmp[idx].doanh_thu_thuan = value;
                                    setThuongData(thuong_tmp);
                                }}
                            />
                        </td>
                        <td className="td-input">
                            <Space>
                                <InputNumber defaultValue={200} 
                                    className="input-number" 
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    value={data.thuong}
                                    onChange={(value) => {
                                        let thuong_tmp = cloneDeep(thuongData);
                                        thuong_tmp[idx].thuong = value;
                                        setThuongData(thuong_tmp);
                                    }}
                                />
                                <Switch checkedChildren="Phần trăm" 
                                    unCheckedChildren="Tiền mặt" 
                                    value={data.is_thuong_theo_phantram} 
                                    onChange={(value) => {
                                        let thuong_tmp = cloneDeep(thuongData);
                                        thuong_tmp[idx].is_thuong_theo_phantram = value;
                                        thuong_tmp[idx].thuong = 0;
                                        setThuongData(thuong_tmp);
                                    }}
                                />
                                
                            </Space>
                        </td>
                        <td>
                            <a className="btn-delete02"
                                onClick={() => {
                                    let thuong_tmp = cloneDeep(thuongData);
                                    thuong_tmp = removeByIndex(thuong_tmp, idx);
                                    setThuongData(thuong_tmp);
                                }}
                            >
                                <CloseCircleOutlined />
                            </a>
                        </td>
                    </tr>
        });
    }

    function ThemThuong() {
        let thuong_tmp = cloneDeep(thuongData);
        thuong_tmp.push(thuongData_item_default);
        setThuongData(thuong_tmp);
    }

    function showHoaHongData() {
        return hoaHongData.map((data, idx)=>{
            return <tr>
                        <td className="td-input">
                            <Select
                                placeholder="Chọn loại hình"
                                value={data.loai_hinh}
                                optionFilterProp="children"
                                allowClear={true}
                                options={[
                                    { label: 'Thực hiện dịch vụ', value: 1 },
                                    { label: 'Tư vấn bán hàng', value: 2 }
                                ]}
                                onChange={(value) => {
                                    let hoaHongData_tmp = cloneDeep(hoaHongData);
                                    hoaHongData_tmp[idx].loai_hinh = value;
                                    sethoaHongData(hoaHongData_tmp);
                                    
                                }}
                            />
                        </td>
                        <td className="td-input">
                            <InputNumber value={data.doanh_thu_thuan} 
                                className="input-number" 
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                suffix={'vnđ'} 
                                onChange={(value) => {
                                    let hoaHongData_tmp = cloneDeep(hoaHongData);
                                    hoaHongData_tmp[idx].doanh_thu_thuan = value;
                                    sethoaHongData(hoaHongData_tmp);
                                }}
                            />
                        </td>
                        <td>
                            <a className="btn-delete02"
                                onClick={() => {
                                    let hoaHongData_tmp = cloneDeep(hoaHongData);
                                    hoaHongData_tmp = removeByIndex(hoaHongData_tmp, idx);
                                    sethoaHongData(hoaHongData_tmp);
                                }}
                            >
                                <CloseCircleOutlined />
                            </a>
                        </td>
                    </tr>
        });
    }

    function ThemHoaHong() {
        let hoahong_tmp = cloneDeep(hoaHongData);
        hoahong_tmp.push(hoaHongData_item_default);
        sethoaHongData(hoahong_tmp);
    }

    function showPhuCap() {
        return phuCapData.map((data, idx)=>{
            return <tr>
                        <td className="td-input">
                            <Input defaultValue={200} 
                                className="input-number" parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}  
                                value={data.ten_phu_cap}
                                onChange={(e) => {
                                    let phuCapData_tmp = cloneDeep(phuCapData);
                                    phuCapData_tmp[idx].ten_phu_cap = e.target.value;
                                    setPhuCapData(phuCapData_tmp);
                                }}
                            />
                        </td>
                        <td className="td-input">
                            <Select
                                placeholder="Chọn loại phụ cấp"
                                optionFilterProp="children"
                                value={data.loai_phu_cap}
                                allowClear={true}
                                options={[
                                    { label: 'Phụ cấp cố định theo ngày', value: 1 },
                                    { label: 'Phụ cấp cố định hàng tháng', value: 2 }
                                ]}
                                onChange={(value) => {
                                    let phuCapData_tmp = cloneDeep(phuCapData);
                                    phuCapData_tmp[idx].loai_phu_cap = value;
                                    setPhuCapData(phuCapData_tmp);
                                }}
                            />
                        </td>
                        <td className="td-input">
                            <InputNumber defaultValue={200} 
                                className="input-number" 
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}  
                                suffix={'vnđ'} 
                                value={data.phu_cap_thu_huong}
                                onChange={(value) => {
                                    let phuCapData_tmp = cloneDeep(phuCapData);
                                    phuCapData_tmp[idx].phu_cap_thu_huong = value;
                                    setPhuCapData(phuCapData_tmp);
                                }}
                            />
                        </td>
                        
                        <td>
                            <a className="btn-delete02"
                                onClick={() => {
                                    let phuCapData_tmp = cloneDeep(phuCapData);
                                    phuCapData_tmp = removeByIndex(phuCapData_tmp, idx);
                                    setPhuCapData(phuCapData_tmp);
                                }}
                            >
                                <CloseCircleOutlined />
                            </a>
                        </td>
                    </tr>
        });
    }

    function themPhuCap() {
        let phuCapData_tmp = cloneDeep(phuCapData);
        phuCapData_tmp.push(phuCapData_item_default);
        setPhuCapData(phuCapData_tmp);
    }

    function showGiamTru() {
        return giamTruData.map((data, idx)=>{
            return <tr>
                        <td className="td-input">
                            <Select
                                placeholder=" Chọn loại hình giảm trừ"
                                optionFilterProp="children"
                                allowClear={true}
                                options={[
                                    { label: 'Đi muộn theo thời gian', value: 2 },
                                    { label: 'Đi muộn theo số lần', value: 1 },
                                    { label: 'Về sớm theo thời gian', value: 3 },
                                    { label: 'Về sớm theo số lần', value: 4 },
                                ]}
                                value={data.loai_giam_tru}
                                onChange={(value) => {
                                    let giamTruData_tmp = cloneDeep(giamTruData);
                                    giamTruData_tmp[idx].loai_giam_tru = value;
                                    if(value === 1 || value === 2) {
                                        giamTruData_tmp[idx].ten_giam_tru = 'Đi muộn';
                                    }
                                    if(value === 3 || value === 4) {
                                        giamTruData_tmp[idx].ten_giam_tru = 'Về sớm';
                                    }

                                    setGiamTruData(giamTruData_tmp);
                                }}
                            />
                        </td>
                        <td>
                            <InputNumber
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                placeholder="Têm giảm trừ" 
                                disabled={[1,3, null].includes(data.loai_giam_tru)}
                                suffix="Phút"
                                value={data.thoi_gian}
                                onChange={(value) => {
                                    let giamTruData_tmp = cloneDeep(giamTruData);
                                    giamTruData_tmp[idx].thoi_gian = value;
                                    setGiamTruData(giamTruData_tmp);
                                }}
                            />
                        </td>
                        <td className="td-input">
                            <Input 
                                className="input-number" parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                placeholder="Têm giảm trừ" 
                                value={data.ten_giam_tru}
                                onChange={(e) => {
                                    let giamTruData_tmp = cloneDeep(giamTruData);
                                    giamTruData_tmp[idx].ten_giam_tru = e.target.value;
                                    setGiamTruData(giamTruData_tmp);
                                }}
                            />
                        </td>
                        <td className="td-input">
                            <InputNumber className="input-number" 
                                suffix={'vnđ'} 
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}  
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                            />
                        </td>
                        <td>
                            <a className="btn-delete02"
                                onClick={() => {
                                    let giamTruData_tmp = cloneDeep(giamTruData);
                                    giamTruData_tmp = removeByIndex(giamTruData_tmp, idx);
                                    setGiamTruData(giamTruData_tmp);
                                }}
                            >
                                <CloseCircleOutlined />
                            </a>
                        </td>
                    </tr>
        });
    }

    function themGiamTru() {
        let giamTruData_tmp = cloneDeep(giamTruData);
        giamTruData_tmp.push({
            tien_giam_tru: null,
            loai_giam_tru: null,
            khoan_giam_tru: 0,
        });
        setGiamTruData(giamTruData_tmp);
    }

    function setPagination(pagination) {
        router.get(
            route("hima.hoaDon"),
            pagination
        );
    }

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
    ];


    function getLichSuMuaHang(id) {
        setLoadingLichSuMuaHang(true);
        axios.post(route("customer.lichSuMuaHang", [id]))
            .then((response) => {
                if (response.data.status_code === 200) {
                    const lichSuMuaHang_tmp = cloneDeep(lichSuMuaHang);
                    lichSuMuaHang_tmp[id] = response.data.data;
                    setLichSuMuaHang(lichSuMuaHang_tmp);
                    setLoadingLichSuMuaHang(false);
                } else {
                    message.error("Không lấy được thông tin dịch vụ");
                    setLoadingLichSuMuaHang(false);
                }
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            }
        );
    }

    const deleteItem = () => {
        setLoadingTable(true);
        axios.post(route("product.deleteUser"), { pid: pidAction })
            .then((response) => {
                // setLoadingTable(false);
                // setPidAction(0);
                message.success("Đã xóa");
                window.location.reload();
            })
            .catch((error) => {
                setLoadingTable(false);
                message.error("Cập nhật thất bại");
            }
        );
    }

    function showformUpdate(item, idx) {
        setIsModalEdit(true); 
        setIndexEdit(idx);
        setPidAction(item.key);
        formEdit.setFieldValue('name', item.name);
        formEdit.setFieldValue('phone', item.phone);
        formEdit.setFieldValue('username', item.username);
        formEdit.setFieldValue('gioi_tinh_id', item.gioi_tinh_id);
        formEdit.setFieldValue('tinh_trang_hon_nhan_id', item.tinh_trang_hon_nhan_id);
        formEdit.setFieldValue('address', item.address);
        formEdit.setFieldValue('cmnd', item.cmnd);
        formEdit.setFieldValue('noi_cap', item.noi_cap);
        formEdit.setFieldValue('chi_nhanh_id', item.chi_nhanh_id);
        formEdit.setFieldValue('chuc_vu_id', item.chuc_vu_id);
        formEdit.setFieldValue('permission_group_id', item.permission_group_id);
        formEdit.setFieldValue('admin_user_status_id', item.admin_user_status_id);

        if(item.birthday) {
            formEdit.setFieldValue('birthday', dayjs(item.birthday));
        }
        if(item.ngay_vao_lam) {
            formEdit.setFieldValue('ngay_vao_lam', dayjs(item.ngay_vao_lam));
        }
        if(item.ngay_cap) {
            formEdit.setFieldValue('ngay_cap', dayjs(item.ngay_cap));
        }

        const loaiLuong = +item.loai_luong;
        formEdit.setFieldValue('salary', item.salary);
        formEdit.setFieldValue('loai_luong', loaiLuong);
        
        formEdit.setFieldValue('is_setting_salary_nang_cao', item.is_setting_salary_nang_cao);
        // check show nút cài đặt nâng cao
        if(item.loai_luong && [1,2,3].includes(loaiLuong)) {
            setClassBtnLuongChinhNangCao('');
        } else {
            setClassBtnLuongChinhNangCao('_hidden')
        }

        // check show setting lương nâng cao
        if(item.is_setting_salary_nang_cao) {
            setClassLuongChinhNangCao('');
        } else {
            setClassLuongChinhNangCao('_hidden')
        }

        // check show nút cài đặt lương làm thêm giờ
        if(item.loai_luong && [1,3].includes(loaiLuong)) {
            setClassLuongLamThemGio('');
        } else {
            setClassLuongLamThemGio('_hidden')
        }

        // check show content cài đặt lương làm thêm giờ
        formEdit.setFieldValue('is_setting_salary_lam_them_gio', item.is_setting_salary_lam_them_gio);
        if(item.is_setting_salary_lam_them_gio) {
            setClassSettingLuongLamThemGio('');
        } else {
            setClassSettingLuongLamThemGio('_hidden')
        }



        
        ////// cai dat luong chinh
        formEdit.setFieldValue('luong_chinh_thu7', item.luong_chinh_thu7);
        formEdit.setFieldValue('luong_chinh_cn', item.luong_chinh_cn);
        formEdit.setFieldValue('luong_chinh_ngay_nghi', item.luong_chinh_ngay_nghi);
        formEdit.setFieldValue('luong_chinh_nghi_le', item.luong_chinh_nghi_le);
        
        formEdit.setFieldValue('is_luong_chinh_nghi_le_persen', item.is_luong_chinh_nghi_le_persen);
        formEdit.setFieldValue('is_luong_chinh_ngay_nghi_persen', item.is_luong_chinh_ngay_nghi_persen);
        formEdit.setFieldValue('is_luong_chinh_cn_persen', item.is_luong_chinh_cn_persen);
        formEdit.setFieldValue('is_luong_chinh_thu7_persen', item.is_luong_chinh_thu7_persen);

        ////// set luong lam them gio
        formEdit.setFieldValue('them_gio_ngay_thuong', item.them_gio_ngay_thuong);
        formEdit.setFieldValue('them_gio_thu7', item.them_gio_thu7);
        formEdit.setFieldValue('them_gio_chu_nhat', item.them_gio_chu_nhat);
        formEdit.setFieldValue('them_gio_ngay_nghi', item.them_gio_ngay_nghi);
        formEdit.setFieldValue('them_gio_nghi_le_tet', item.them_gio_nghi_le_tet);

        formEdit.setFieldValue('is_them_gio_ngay_thuong_persen', item.is_them_gio_ngay_thuong_persen);
        formEdit.setFieldValue('is_them_gio_thu7_persen', item.is_them_gio_thu7_persen);
        formEdit.setFieldValue('is_them_gio_chu_nhat_persen', item.is_them_gio_chu_nhat_persen);
        formEdit.setFieldValue('is_them_gio_ngay_nghi_persen', item.is_them_gio_ngay_nghi_persen);
        formEdit.setFieldValue('is_them_gio_nghi_le_tet_persen', item.is_them_gio_nghi_le_tet_persen);
        
        // thuong
        formEdit.setFieldValue('is_setting_thuong', item.is_setting_thuong);
        const loaiThuong = +item.loai_thuong;
        formEdit.setFieldValue('loai_thuong', loaiThuong);
        formEdit.setFieldValue('hinh_thuc_thuong', item.hinh_thuc_thuong);
        
        if(item.is_setting_thuong) {
            setClassSettingThuong('');
        } else {
            setClassSettingThuong('_hidden')
        }

        if(item.thuong_setting) {
            setThuongData(item.thuong_setting);
        } else {
            setThuongData([thuongData_item_default]);
        }

        // hoa hong
        formEdit.setFieldValue('is_setting_hoa_hong', item.is_setting_hoa_hong);
        if(item.is_setting_hoa_hong) {
            setClassSettingHoaHong('');
        } else {
            setClassSettingHoaHong('_hidden')
        }

        if(item.hoa_hong_setting) {
            sethoaHongData(item.hoa_hong_setting);
        } else {
            sethoaHongData([hoaHongData_item_default]);
        }

        // phu cap
        formEdit.setFieldValue('is_setting_phu_cap', item.is_setting_phu_cap);
        if(item.is_setting_phu_cap) {
            setClassSettingPhuCap('');
        } else {
            setClassSettingPhuCap('_hidden')
        }

        if(item.phu_cap_setting) {
            setPhuCapData(item.phu_cap_setting);
        } else {
            setPhuCapData([phuCapData_item_default]);
        }

        // giam tru - btn
        formEdit.setFieldValue('is_setting_giam_tru', item.is_setting_giam_tru);
        if(item.is_setting_giam_tru) {
            setClassSettingGiamTru('');
        } else {
            setClassSettingGiamTru('_hidden')
        }
        // giam tru - setting
        if(item.giam_tru_setting) {
            setGiamTruData(item.giam_tru_setting);
        } else {
            setGiamTruData([giamTruData_item_default]);
        }
        
    }

    const expandedRowRender = (record, idx) => {
        let banTrucTiep = <span className="text_success"><CheckCircleOutlined /> Cho phép bán trực tiếp</span>;
        if(record.ban_truc_tiep ===1) {
            banTrucTiep = <span className="text_warning"><CloseCircleOutlined /> Không bán trực tiếp</span>;
        }
        let data01 = [
            <p><b><SlackCircleFilled /> Tên đăng nhập: </b> {record.username}</p>,
            <p><b><SignatureFilled /> Ngày sinh: </b> {record.birthday}</p>,
            <p><b><PhoneFilled /> Điện thoại: </b> {record.phone}, {record.phone02}</p>,
            <p><b><BookFilled /> Giới tính: </b> {record.gioi_tinh_name}</p>,
            <p><b><MailFilled /> Email: </b> {record.email}</p>,
            <p><b><CreditCardFilled /> CCCD: </b> {record.cmnd}</p>,
            <p><b><SignatureFilled /> Ngày cấp: </b> {record.ngay_cap}</p>,
            <p><b><HomeOutlined /> Nơi cấp: </b> {record.noi_cap}</p>,
            <p><b><HomeFilled /> Địa chỉ: </b> {record.address}</p>,
        ];

        let data02 = [
            <p><b><ShoppingFilled /> Chức danh: </b> {record.permission_group_name}</p>,
            <p><b><PushpinFilled /> Phòng ban </b> {record.chi_nhanh_name}</p>,
            <p><b><SignatureFilled /> Ngày vào làm: </b> {record.created_at}</p>,
            <p><b><EyeFilled /> Trạng thái: </b> {record.trong_luong}</p>,
            <p><b><FileTextFilled /> Ngày tạo TK: </b> {record.created_at}</p>,
            <p><b><BookFilled /> TK ngân hàng: </b> {record.ngan_hang}</p>,
        ]

        
        
        if(record.product_type_id === 1) {
            data01.push(<p><b>Hoa hồng bán hàng: </b> {numberFormat(record.ck_nv_tu_van)} {record.is_ck_nv_tu_van_percen === 1 ? '%' : <sup>đ</sup>}</p>);
            data01.push(<p><b>Hoa hồng thực hiện: </b> {numberFormat(record.ck_nv_cham_soc)} {record.is_ck_nv_cham_soc_percen === 1 ? '%' : <sup>đ</sup>}</p>);
        }

        if(record.product_type_id === 2) {
            
        }

        const hhInfo = <Row>
                    <Col sm={{ span: 24 }}>
                        <h3 className="h3"><em>{record.code}</em> - {record.name}</h3>
                    </Col>
                    <Col sm={{ span: 8 }}>
                    {/* <Carousel>
                    </Carousel> */}
                    {record.images ? <Image className="image-list" src={record.images.avatar}></Image> : <Image className="image-list" src='/images/no-image.jpg'></Image>}
                    
                    </Col>
                    <Col sm={{ span: 8 }}>
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
                    <Col sm={{ span: 8 }}>
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
                    
                    
                    {record.mo_ta && record.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Mô Tả: </b>{record.mo_ta}</p></Col> : ''}
                    
                    {record.mo_ta && record.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Ghi chú:{record.ghi_chu}</b></p></Col> : ''}
                    
                    <Col sm={{ span: 24 }} >
                    <Divider orientation="left">
                        <Space>
                            <Button onClick={() => showformUpdate(record, idx)} className="_success"><CheckOutlined /> Cập nhật</Button>
                            <Button onClick={() => {setIsModalChangePW(true); setPidAction(record.key);}} className="_warning"><CheckOutlined /> Đổi mật khẩu</Button>
                            <Button onClick={() => {setIsModalNgungKinhDoanhOpen(true); setPidAction(record.key);}}><StopOutlined /> Nghỉ làm</Button>
                            <Button onClick={() => {setIsModalXoaOpen(true); setPidAction(record.key);}}><DeleteOutlined /> Xóa</Button>
                        </Space>
                    </Divider>
                        
                    </Col>
                </Row>


        const columnLichSuMuaHang = [
            {
                title: 'STT',
                dataIndex: 'stt',
                key: 'stt',
            },
            {
                title: 'Thời gian',
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: 'Hóa đơn',
                dataIndex: 'tong_tien',
                key: 'tong_tien',
            },
            {
                title: 'Hoa hồng',
                dataIndex: 'tong_tien',
                key: 'tong_tien',
            }
        ];
        
        let item = [
            {
                label: 'Thông tin', //hh/dv
                key: '1',
                children: hhInfo,
            },
            {
                label: <span onClick={() => {getLichSuMuaHang(record.key)}}>Hoa hồng sale </span>, // dv
                key: '2',
                children: <Table
                    loading={loadingLichSuMuaHang}
                    columns={columnLichSuMuaHang}
                    dataSource={lichSuMuaHang[record.key]}
                />,
            },
            {
                label: <span onClick={() => {getLichSuMuaHang(record.key)}}>Hoa hồng làm DV </span>, // dv
                key: '3',
                children: <Table
                    loading={loadingLichSuMuaHang}
                    columns={columnLichSuMuaHang}
                    dataSource={lichSuMuaHang[record.key]}
                />,
            },
            {
                label: <span onClick={() => {getLichSuMuaHang(record.key)}}>Khóa học </span>, // dv
                key: '4',
                children: <Table
                    loading={loadingLichSuMuaHang}
                    columns={columnLichSuMuaHang}
                    dataSource={lichSuMuaHang[record.key]}
                />,
            }
        ]
        

        return <div>
                <Tabs
                    defaultActiveKey="1"
                    items={item}
                />
            </div>
    };
    
    const handleCancel = () => {
        setIsModalNgungKinhDoanhOpen(false);
    }
    const handleCancelDelete = () => {
        setIsModalXoaOpen(false);
    }

    const search = () => {
        // const values = formSearch.getFieldsValue();
        // console.log('values', values);
        formSearch.submit();
    }

    const contentTabInfo = <Row> 

            {/* Tài khoản */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <p className="title02">Thông tin tài khoản </p>
                <hr/>
            </Col>    
            
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='username' label='Tên đăng nhập' rules={[{ required: true,message: 'Vui lòng nhập tên đăng nhập',}]}>
                    <Input />
                </Form.Item>
            </Col> 
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='permission_group_id' label={<p>Nhóm quyền</p>} rules={[{ required: true,message: 'Vui lòng chọn nhóm quyền',}]}>
                    <Select
                        placeholder="Chọn nhóm quyền"
                        optionFilterProp="children"
                        options={props.permissionGroup.map((g)=>{
                            return { label: g.name, value: g.id }
                        })}
                    />
                </Form.Item>
            </Col>

            {/* Khởi tạo */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <p className="title02">Thông tin cá nhân </p>
                <hr/>
            </Col>      
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='name' label='Họ tên' 
                    rules={[{ required: true,message: 'Vui lòng nhập tên NV',}]}>
                    <Input />
                </Form.Item>
            </Col>
            
            
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='gioi_tinh_id' label={<p>Giới tính</p>} rules={[{ required: true,message: 'Vui lòng chọn giới tính',}]}>
                    <Select
                        placeholder="Chọn giới tính"
                        optionFilterProp="children"
                        options={props.gioiTinh.map((g)=>{
                            return { label: g.name, value: g.id }
                        })}
                    />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='birthday' label='Ngày sinh'>
                    <DatePicker format={DATE_FORMAT_SHOW} />
                </Form.Item>
            </Col>

            {/* Liên hệ */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <p className="title02">Thông tin liên hệ </p><hr/>
            </Col>    

            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='phone' label='Điện thoại' rules={[{ required: true,message: 'Vui lòng nhập số điện thoại',}]}>
                    <Input />
                </Form.Item>
            </Col>
            
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='email' label='Email'>
                    <Input />
                </Form.Item>
            </Col>

            
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='tinh_trang_hon_nhan_id' label='Hôn nhân'>
                    <Select
                        placeholder="Tình trạng hôn nhân"
                        optionFilterProp="children"
                        options={props.honNhan.map((g)=>{
                            return { label: g.name, value: g.id }
                        })}
                    />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='address' label='Địa chỉ'>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 24 }}>
                <Form.Item name='so_tai_khoan' label='TK Ngân hàng'>
                    <Input />
                </Form.Item>
            </Col>

            {/* CCCD */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <p className="title02">CCCD </p><hr/>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='cmnd' label='Số CCCD'>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='ngay_cap' label='Ngày cấp'>
                    <DatePicker format={DATE_FORMAT_SHOW} />
                </Form.Item>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Form.Item name='noi_cap' label='Nơi cấp'>
                    <Input />
                </Form.Item>
            </Col>

            
        </Row>
    
    {/* cong ty */}
    const contentCompany = <Row>
        <Col md={{ span: 24 }}>
            <p className="title02">Thông tin ở công ty </p><hr/>
        </Col>

        
        <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item name='chi_nhanh_id' label='Chi nhánh'>
                <Select
                    placeholder="Chọn nhóm khách hàng"
                    optionFilterProp="children"
                    options={props.chiNhanh.map((g)=>{
                        return { label: g.name, value: g.id }
                    })}
                />
            </Form.Item>
        </Col>
        <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item name='admin_user_status_id' label='Trạng thái'>
                <Select
                    placeholder="Chọn trạng thái"
                    optionFilterProp="children"
                    options={props.status.map((g)=>{
                        return { label: g.name, value: g.id }
                    })}
                />
            </Form.Item>
        </Col>

        <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item name='chuc_vu_id' label='Chức vụ'>
                <Select
                    placeholder="Chọn trạng thái"
                    optionFilterProp="children"
                    options={props.chucVu.map((g)=>{
                        return { label: g.name, value: g.id }
                    })}
                />
            </Form.Item>
        </Col>
        <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item name='permission_group_id' label='Nhóm quyền'>
                <Select
                    placeholder="Chọn nhóm quyền"
                    optionFilterProp="children"
                    options={props.permissionGroup.map((g)=>{
                        return { label: g.name, value: g.id }
                    })}
                />
            </Form.Item>
        </Col>
        
        <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item name='ngay_vao_lam' label='Ngày vào làm'>
                <DatePicker format={DATE_FORMAT_SHOW} />
            </Form.Item>
        </Col>
    </Row>

    const changeLoaiLuong = (value) => {
        // check ẩn hiện nút cài đặt nâng cao
        if(value === 4) {
            setClassBtnLuongChinhNangCao('_hidden');
            setClassLuongChinhNangCao('_hidden');
            setClassLuongChinhCoBan('');
            formEdit.setFieldValue('is_setting_salary_nang_cao', false);
        } else {
            setClassBtnLuongChinhNangCao('');
        }

        // check luong lam them gio
        if([1,3].includes(value)) {
            setClassLuongLamThemGio('');
            // set gias trij mac dinh
            formEdit.setFieldValue('them_gio_ngay_thuong', 150);
            formEdit.setFieldValue('them_gio_thu7', 200);
            formEdit.setFieldValue('them_gio_chu_nhat', 200);
            formEdit.setFieldValue('them_gio_ngay_nghi', 200);
            formEdit.setFieldValue('them_gio_nghi_le_tet', 200);
            // mac dinh checked la %
            formEdit.setFieldValue('is_them_gio_ngay_thuong_persen', true);
            formEdit.setFieldValue('is_them_gio_thu7_persen', true);
            formEdit.setFieldValue('is_them_gio_chu_nhat_persen', true);
            formEdit.setFieldValue('is_them_gio_ngay_nghi_persen', true);
            formEdit.setFieldValue('is_them_gio_nghi_le_tet_persen', true);
        } else {
            setClassLuongLamThemGio('_hidden');
        }
    }
    const showSettingLuongChinh = (value) => {
        
        if(value) {
            setClassLuongChinhNangCao('');
            setClassLuongChinhCoBan('_hidden');
            formEdit.setFieldValue('luong_chinh_thu7', 100);
            formEdit.setFieldValue('luong_chinh_cn', 100);
            formEdit.setFieldValue('luong_chinh_ngay_nghi', 100);
            formEdit.setFieldValue('luong_chinh_nghi_le', 100);
            
            formEdit.setFieldValue('is_luong_chinh_nghi_le_persen', true);
            formEdit.setFieldValue('is_luong_chinh_ngay_nghi_persen', true);
            formEdit.setFieldValue('is_luong_chinh_cn_persen', true);
            formEdit.setFieldValue('is_luong_chinh_thu7_persen', true);
            return;
        }
        setClassLuongChinhNangCao('_hidden');
        setClassLuongChinhCoBan('');
    }
    
    const showSettingLuongLamThemGio = (value) => {
        if(value) {
            setClassSettingLuongLamThemGio('');
            return;
        }
        setClassSettingLuongLamThemGio('_hidden');
    }
    
    const showSettingTienThuong = (value) => {
        if(value) {
            setClassSettingThuong('');
            return;
        }
        setClassSettingThuong('_hidden');
        formEdit.setFieldValue('loai_thuong', null);
        formEdit.setFieldValue('hinh_thuc_thuong', null);
        setThuongData([thuongData_item_default]);
    }

    const showSettingHoaHong = (value) => {
        if(value) {
            setClassSettingHoaHong('');
            return;
        }
        setClassSettingHoaHong('_hidden');
        sethoaHongData([hoaHongData_item_default]);
    }
    
    const showSettingPhuCap = (value) => {
        if(value) {
            setClassSettingPhuCap('');
            return;
        }
        setClassSettingPhuCap('_hidden');
        let phuCapData_tmp = phuCapData;
        phuCapData_tmp = [phuCapData_item_default];
        setPhuCapData(phuCapData_tmp);
    }
    
    const showSettingGiamTru = (value) => {
        if(value) {
            setClassSettingGiamTru('');
            return;
        }
        setClassSettingGiamTru('_hidden');
    }

    const salaryContent = <Row>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <p className="title02">Lương chính </p><hr/>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 12 }}>
                <Form.Item name='loai_luong' label='Loại lương'>
                    <Select
                        placeholder="Chọn loại lương"
                        optionFilterProp="children"
                        onChange={changeLoaiLuong}
                        options={[
                            { label: 'Theo ca', value: 1 },
                            { label: 'Theo giờ', value: 2 },
                            { label: 'Theo ngày công chuẩn', value: 3 },
                            { label: 'Lương cố định', value: 4 }   
                        ]}
                    />
                </Form.Item>
            </Col>

            <Col md={{ span: 12 }} sm={{ span: 12 }} className={classBtnLuongChinhNangCao}> 
                <Form.Item name='is_setting_salary_nang_cao'>
                    <Switch onChange={showSettingLuongChinh} checkedChildren="Cài đặt nâng cao" unCheckedChildren="Cài đặt cơ bản" defaultChecked={false} />
                </Form.Item>
            </Col>

            <Col md={{ span: 24 }} sm={{ span: 24 }}  className={classLuongChinhCoBan}> 
                <Form.Item name='salary' label='Mức lương' className="form-item-input-number">
                    <InputNumber min={0} 
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        suffix="vnđ"
                    />
                </Form.Item>
            </Col>

            {/* cài đặt nâng cao cho lương chính  */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}  className={classLuongChinhNangCao}> 
                
                <table className="table-salary">
                    <thead>
                        <tr>
                            <th>Lương</th>
                            <th>Thứ 7</th>
                            <th>Chủ nhật</th>
                            <th>Ngày nghỉ</th>
                            <th>Ngày lễ tết</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <Form.Item name='salary' label=''>
                                    <InputNumber min={0} 
                                        className="input-number" 
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                                    />
                                </Form.Item>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='luong_chinh_thu7' label=''>
                                        <InputNumber className="input-number" 
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_luong_chinh_thu7_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('luong_chinh_thu7',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='luong_chinh_cn' label=''>
                                        <InputNumber className="input-number" 
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_luong_chinh_cn_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('luong_chinh_cn',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='luong_chinh_ngay_nghi' label=''>
                                        <InputNumber className="input-number" 
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_luong_chinh_ngay_nghi_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('luong_chinh_ngay_nghi',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='luong_chinh_nghi_le' label=''>
                                        <InputNumber className="input-number" 
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_luong_chinh_nghi_le_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('luong_chinh_nghi_le',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Col>

            {/* làm thêm giờ */}
            <Col md={{ span: 24 }} sm={{ span: 24 }} className={classLuongLamThemGio}>
                <Space>
                    <p className="title03">Lương làm thêm giờ </p>
                    <Form.Item name='is_setting_salary_lam_them_gio' className="btn-switch-lam-them-gio">
                        <Switch onChange={showSettingLuongLamThemGio} 
                            checkedChildren="Cài đặt" 
                            unCheckedChildren="Huỷ cài đặt" 
                            defaultChecked={false} 
                        />
                    </Form.Item>
                </Space>
                <hr/>
            </Col>
            {/* Hệ số lương trên giờ */}
            <Col md={{ span: 24 }} sm={{ span: 24 }} className={classSettingLuongLamThemGio}>
                <b className="title-luong-them-gio">Hệ số lương trên giờ:</b>
                <table className="table-salary">
                    <thead>
                        <tr>
                            <th>Ngày thường</th>
                            <th>Thứ 7</th>
                            <th>Chủ nhật</th>
                            <th>Ngày nghỉ</th>
                            <th>Ngày lễ tết</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <Space>
                                    <Form.Item name='them_gio_ngay_thuong' label=''>
                                        <InputNumber
                                            className="input-number" 
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_them_gio_ngay_thuong_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('them_gio_ngay_thuong',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='them_gio_thu7' label=''>
                                        <InputNumber
                                            className="input-number" 
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_them_gio_thu7_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('them_gio_thu7',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='them_gio_chu_nhat' label=''>
                                        <InputNumber defaultValue={200} className="input-number" 
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}  
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_them_gio_chu_nhat_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('them_gio_chu_nhat',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='them_gio_ngay_nghi' label=''>
                                        <InputNumber defaultValue={200} className="input-number" 
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_them_gio_ngay_nghi_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true}  
                                            onChange={(value) => {
                                                formEdit.setFieldValue('them_gio_ngay_nghi',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                            <td>
                                <Space>
                                    <Form.Item name='them_gio_nghi_le_tet' label=''>
                                        <InputNumber defaultValue={300} className="input-number" 
                                            min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                    <Form.Item name='is_them_gio_nghi_le_tet_persen' label=''>
                                        <Switch checkedChildren="%" 
                                            unCheckedChildren="Vnđ" 
                                            defaultChecked={true} 
                                            onChange={(value) => {
                                                formEdit.setFieldValue('them_gio_nghi_le_tet',0);
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Col>

            {/* tien thuong  */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Space>
                    <p className="title02">Thưởng {showInfo('Thiết lập thưởng theo doanh thu cho nhân viên')}</p>
                    <Form.Item name='is_setting_thuong' className="btn-switch-lam-them-gio">
                        <Switch onChange={showSettingTienThuong} checkedChildren="Huỷ Cài đặt" unCheckedChildren="Cài đặt" defaultChecked={false} />
                    </Form.Item>
                </Space>
                <hr/>
            </Col>

            {/* tien thuong setting */}
            <Col className={classSettingThuong} md={{ span: 24 }} sm={{ span: 24 }}>
                <Row>
                    {/* Loại thưởng  */}
                    <Col md={{ span: 12 }} sm={{ span: 12 }}>
                        <span>Loại thưởng</span>
                        <Form.Item name='loai_thuong' label=''>
                            <Select
                                placeholder="Chọn loại lương"
                                optionFilterProp="children"
                                options={[
                                    { label: 'Theo doanh thu cá nhân', value: 1 },
                                    { label: 'Theo chi nhánh', value: 2 },
                                    { label: 'Theo toàn hệ thống', value: 3 },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    {/* hình thức thưởng  */}
                    <Col md={{ span: 12 }} sm={{ span: 12 }}>
                        <span>Hình thức</span>
                        <Form.Item name='hinh_thuc_thuong' label=''>
                            <Select
                                placeholder="Chọn loại lương"
                                optionFilterProp="children"
                                allowClear={true}
                                options={[
                                    { label: 'Theo DV thực hiên - tư vấn bán hàng', value: 1 },
                                    { label: 'Theo nấc bậc thang tổng doanh thu', value: 2 },
                                    { label: 'Theo mức vượt doanh thu tối thiểu', value: 3 }
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    {/* cài đặt hình thức thưởng  */}
                    <Col md={{ span: 24 }} sm={{ span: 24 }}>
                        <span>Cài đặt hình thức thưởng</span>
                        <table className="table-salary">
                            <thead>
                                <tr>
                                    <th>Loại hình</th>
                                    <th>Doanh thu thuần</th>
                                    <th>Thưởng</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                                {showThuongData()}
                                
                                <tr>
                                    <td colSpan={3}>
                                        <a onClick={() => ThemThuong()}>Thêm Thưởng</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
            </Col>
            
            {/* Hoa hong */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Space>
                    <p className="title02">Hoa hồng {showInfo('Thiết lập mức hoa hồng theo sản phẩm hoặc dịch vụ')}</p>
                    <Form.Item name='is_setting_hoa_hong' className="btn-switch-lam-them-gio">
                        <Switch onChange={showSettingHoaHong} checkedChildren="Cài đặt" unCheckedChildren="Huỷ cài đặt" defaultChecked={false} />
                    </Form.Item>
                </Space>
                <hr/>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }} className={classSettingHoaHong}>
                <span>Cài đặt  mức hoa hồng theo sản phẩm hoặc dịch vụ</span>
                <table className="table-salary">
                    <thead>
                        <tr>
                            <th>Loại hình</th>
                            <th>Doanh thu thuần {showInfo('Là tổng doanh thu bán hàng / thực hiện dịch vụ của nhân viên')}</th>
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        {showHoaHongData()}
                        
                        <tr>
                            <td colSpan={3}>
                                <a onClick={() => ThemHoaHong()}>Thêm hoa hồng</a>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </Col>

            {/* Phu cap */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Space>
                    <p className="title02">Phụ cấp {showInfo('Thiết lập khoản hỗ trợ làm việc như ăn trưa, đi lại, điện thoại, ...')}</p>
                    <Form.Item name='is_setting_phu_cap' className="btn-switch-lam-them-gio">
                        <Switch checkedChildren="Cài đặt" 
                            unCheckedChildren="Huỷ cài đặt" 
                            defaultChecked={false} 
                            onChange={showSettingPhuCap}
                        />
                    </Form.Item>
                </Space>
                <hr/>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }} className={classSettingPhuCap}>
                <span>Thiết lập khoản hỗ trợ làm việc như ăn trưa, đi lại, điện thoại, ...</span>
                <table className="table-salary">
                    <thead>
                        <tr>
                            <th>Tên phụ cấp</th>
                            <th>Loại phụ cấp</th>
                            <th>Tiền phụ cấp thụ hưởng</th>
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>

                        {showPhuCap()}

                        <tr>
                            <td colSpan={3}>
                                <a onClick={() => themPhuCap()}>Thêm phụ cấp</a>
                            </td>
                        </tr>
                        
                    </tbody>
                </table>
            </Col>
            
            {/* Giam tru */}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Space>
                    <p className="title02">Giảm trừ {showInfo('Thiết lập khoản giảm trừ như đi muộn, về sớm, vi phạm nội quy, ...')}</p>
                    <Form.Item name='is_setting_giam_tru' className="btn-switch-lam-them-gio">
                        <Switch onChange={showSettingGiamTru} checkedChildren="Huỷ Cài đặt" unCheckedChildren="Cài đặt" defaultChecked={false} />
                    </Form.Item>
                </Space>
                <hr/>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }} className={classSettingGiamTru}>
                <span>Thiết lập khoản giảm trừ như đi muộn, về sớm, vi phạm nội quy, ...</span>
                <table className="table-salary">
                    <thead>
                        <tr>
                            <th>Loại giảm trừ</th>
                            <th>Thời gian</th>
                            <th>Tên giảm trừ</th>
                            <th>Khoản giảm trừ</th>
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>

                        {showGiamTru()}

                        <tr>
                            <td colSpan={3}>
                                <a onClick={() => themGiamTru()}>Thêm giảm trừ</a>
                            </td>
                        </tr>
                        
                    </tbody>
                </table>
            </Col>

        </Row>

    const tabData = [
        {
          key: '1',
          label: 'Thông tin cá nhân',
          children: contentTabInfo,
        },
        {
          key: '2',
          label: 'Công ty',
          children: contentCompany,
        },
        {
          key: '3',
          label: 'Thiết lập lương',
          children: salaryContent
        },
      ];

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={routeNhanSu}
                current={props.table}
                content={
                    <div>
                        <Modal title="Xác nhận nghỉ làm" 
                            open={isModalNgungKinhDoanhOpen} 
                            onOk={nghiLam} 
                            okText="Nghỉ làm"
                            cancelText="Hủy"
                            onCancel={handleCancel}>
                            <p>Các hàng hóa ngừng kinh doanh sẽ không hiển thị ở danh sách hàng hóa nữa. Bạn có thể xem lại ở phần 
                                <em>hàng hóa ngừng kinh doanh</em>.</p>
                            
                        </Modal>

                        <Modal title="Xác nhận xóa" 
                            open={isModalXoaOpen} 
                            onOk={deleteItem} 
                            okText="Đồng ý xóa"
                            cancelText="Hủy"
                            onCancel={handleCancelDelete}>
                            <p>Các thông tin về hàng hóa này sẽ bị xóa hoàn toàn</p>
                        </Modal>

                        {/* modal edit */}
                        <Modal title={<div><p className="title02">Thông tin cá nhân </p><hr/></div>}
                            open={isModalEdit} 
                            onOk={() => { formEdit.submit();}} 
                            okText={<div><CopyOutlined/> Lưu</div>}
                            cancelText={<div><CloseSquareOutlined/> Hủy</div>}
                            width={1000}
                            onCancel={() => setIsModalEdit(false)}>
                                <Form
                                    name="basic"
                                    layout="horizontal"
                                    onFinish={onFinishFormEdit}
                                    // onFinishFailed={onFinishSearchFailed}
                                    autoComplete="off"
                                    form={formEdit}
                                    initialValues={initialFormEdit()}
                                >
                                    <Row>
                                        <Col>
                                            <Tabs defaultActiveKey="1" 
                                                items={tabData} 
                                                // onChange={onChange} 
                                            />
                                        </Col>
                                    </Row>

                                </Form>

                        </Modal>

                        {/* Đổi mk */}
                        <Modal title={<div><p className="title02">Đổi mật khẩu </p><hr/></div>}
                            open={isModalChangePW} 
                            onOk={() => { formChangePW.submit();}} 
                            okText={<div><CopyOutlined/> Lưu</div>}
                            cancelText={<div><CloseSquareOutlined/> Hủy</div>}
                            width={400}
                            onCancel={() => setIsModalChangePW(false)}>
                                <Form
                                    name="formChangePW"
                                    layout="horizontal"
                                    onFinish={onFinishChangePW}
                                    // onFinishFailed={onFinishSearchFailed}
                                    autoComplete="off"
                                    form={formChangePW}
                                >
                                    <Row>
                                        <Col>
                                            <Form.Item name='password' 
                                                min={8}
                                                label='Mật khẩu mới' 
                                                rules={[
                                                    { required: true,message: 'Vui lòng nhập mật khẩu'},
                                                    { min: 8,message: 'Mật khẩu tối thiếu phải từ 8 ký tự'}
                                                ]}>
                                                <Input type="password" placeholder="Nhập mật khẩu mới" />
                                            </Form.Item>
                                            <Form.Item name='password_confirm' 
                                                min={8}
                                                label='Xác nhận lại MK' 
                                                rules={[
                                                    { required: true,message: 'Vui lòng nhập mật khẩu xác nhận'},
                                                    { min: 8,message: 'Mật khẩu tối thiếu phải từ 8 ký tự'}
                                                ]}>
                                                <Input type="password" placeholder="Nhập lại mật khẩu mới" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row><span className="_red">{resultChangePW}</span></Row>

                                </Form>

                        </Modal>
                        
                            {/* <div style={{ marginBottom: 16 }}>
                                <em>
                                    {" "}
                                    Trang {props.pageConfig.currentPage}, hiển thị{" "}
                                    {props.pageConfig.count}/{props.pageConfig.total}
                                </em>
                            </div> */}
                            

                            <Row>
                                <Col sm={{span:24}}>
                                    <Button type="primary" 
                                        className="_right" 
                                        onClick={() => {
                                            formEdit.resetFields(); 
                                            setIsModalEdit(true); 
                                            setPidAction(0);
                                        }}>
                                        <PlusCircleOutlined />
                                        Thêm mới
                                    </Button>
                                </Col>

                                <Col sm={{span:24}}>
                                    <br />
                                </Col>

                                <Col sm={{ span: 7 }}>
                                    <Form
                                        name="basic"
                                        layout="vertical"
                                        onFinish={onFinishSearch}
                                        // onFinishFailed={onFinishSearchFailed}
                                        autoComplete="off"
                                        form={formSearch}
                                        // initialValues={initialValueSearch()}
                                        // initialValues={props.searchData}
                                    >
                                        <Row gutter={24} className="main-search-left">

                                            <Col sm={{ span: 24 }} className='item-search' onBlur={search}>
                                                <Form.Item name='keyword' label='Từ khoá'>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            {/* customer_group */}
                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='customer_group_id' 
                                                    label={<span>Chức vụ <a target="new" href={route('data.tblName', ['customer_group'])}><BarsOutlined /></a></span>}>
                                                    <Checkbox.Group onChange={search} 
                                                        className="list-checkbox01"
                                                        options={props.chucVu.map((u) => {
                                                            return {
                                                                    value: u.id,
                                                                    label: u.name
                                                                }
                                                            })
                                                        }
                                                    />
                                                    
                                                </Form.Item>
                                            </Col>

                                            {/* chi_nhanh */}
                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='chi_nhanh_id' 
                                                    label={<span>Chi nhánh <a target="new" href={route('data.tblName', ['chi_nhanh'])}><BarsOutlined /></a></span>}>
                                                    <Checkbox.Group onChange={search} 
                                                        className="list-checkbox01"
                                                        options={props.chiNhanh.map((u) => {
                                                            return {
                                                                    value: u.id,
                                                                    label: u.name
                                                                }
                                                            })
                                                        }
                                                    />
                                                    
                                                </Form.Item>
                                            </Col>

                                            {/* status_hon_nhan */}
                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='tinh_trang_hon_nhan_id' 
                                                    label={<span>Tình trạng<a target="new" href={route('data.tblName', ['status_hon_nhan'])}><BarsOutlined /></a></span>}>
                                                    <Checkbox.Group onChange={search} 
                                                        className="list-checkbox01"
                                                        options={props.honNhan.map((u) => {
                                                            return {
                                                                    value: u.id,
                                                                    label: u.name
                                                                }
                                                            })
                                                        }
                                                    />
                                                    
                                                </Form.Item>
                                            </Col>

                                            {/* gioi_tinh */}
                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='gioi_tinh_id' 
                                                    label={<div>Giới tính <a target="new" href={route('data.tblName', ['gioi_tinh'])}><BarsOutlined /></a></div>}>
                                                    <Checkbox.Group onChange={search} 
                                                        options={props.gioiTinh.map((u) => {
                                                            return {
                                                                    value: u.id,
                                                                    label: u.name,
                                                                    data: u,
                                                                }
                                                            })
                                                        }
                                                    />
                                                    
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='is_recycle_bin' label='Trạng thái'>
                                                <Radio.Group
                                                    style={{ display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8,}}
                                                    onChange={search}
                                                    defaultValue={1}
                                                    options={[
                                                        { value: 1, label: 'Đang Hoạt động' },
                                                        { value: 2, label: 'Ngừng hoạt động' },
                                                        { value: 3, label: 'Đã xóa' },
                                                    ]}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                                <Col sm={{ span: 17 }}>
                                    <Table
                                        columns={columns}
                                        loading={loadingTable}
                                        expandable={{
                                            expandedRowRender,
                                            defaultExpandedRowKeys: ['1'],
                                        }}
                                        dataSource={users}
                                        pagination={{ pageSize: 17 }}
                                    />
                                </Col>
                            </Row>
                        
                    </div>
                }
            />
        </div>
    );
}
