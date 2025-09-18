import React, { useState, useEffect, useRef, useCallback } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    Table,
    message,
    Modal,
    Form, Radio, Input, InputNumber, Select,
    Popconfirm, Empty,

    Row,
    Space,
    Tag,
    Card,
    DatePicker,
    notification,
    Divider,
    Collapse,
    Breadcrumb,
    Switch, Tabs, Col, FloatButton, Drawer
} from "antd";



import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    InfoCircleOutlined,
    CaretRightOutlined,
    MinusCircleOutlined, SwapOutlined, ShopOutlined,
    SettingOutlined, PlusCircleOutlined,
    CheckOutlined, HomeOutlined,
    DashboardOutlined, FileDoneOutlined,
    SearchOutlined, DeleteOutlined, LineHeightOutlined, UserAddOutlined, UserOutlined, CopyOutlined,
    ArrowRightOutlined, CheckCircleOutlined, CrownOutlined, FallOutlined, AccountBookOutlined, BookOutlined,
} from "@ant-design/icons";

import "../../../../css/hoa_don.css";

import { inArray, parseJson, numberFormat } from "../../../Function/common";

import { contentThuNganConfig, contentDoiCa } from "../../../components/comp_hoa_don";

import { callApi } from "../../../Function/api";

import { khachHangInfo, formEditKhachHang } from "../../../components/comp_khach_hang";

const { TextArea } = Input;

import cloneDeep from 'lodash/cloneDeep';

import Highlighter from 'react-highlight-words';

import { routeSales } from "../../../Function/config_route";

export default function Dashboard(props) {

    const [isModalThuNganConfig, setIsModalThuNganConfig] = useState(props.checkThuNganConfig);

    // thu ngan setting
    const [nhanVienThuNgan, setNhanVienThuNgan] = useState(props.nhanVienThuNgan);
    const [chiNhanhThuNgan, setChiNhanhThuNgan] = useState(props.chiNhanhThuNgan);
    const [khoHangThuNgan, setKhoHangThuNgan] = useState(props.khoHangThuNgan);

    const [users, setUsers] = useState(props.users);

    const [maskClosableConfirm, setMaskClosableConfirm] = useState(!props.checkThuNganConfig);
    const [isModalDoiCa, setIsModalDoiCa] = useState(false);
    const [classPhiCaThe, setClassPhiCaThe] = useState('_hidden');

    const [idActive, setIdActive] = useState(props.hoaDon_active.hoaDonId);
    const [keyActive, setKeyActive] = useState(props.key_active);

    const hoaDonProps = props.hoaDon_active.hoa_don;

    const [chiNhanh, setChiNhanh] = useState(hoaDonProps.chi_nhanh_id === 0 ? null : hoaDonProps.chi_nhanh_id);

    const [khachHangId, setKhachHangId] = useState(hoaDonProps.users_id === 0 ? null : hoaDonProps.users_id);
    const [khachHangData, setKhachHangData] = useState(props.hoaDon_active.khachHangData);
    const [khachHangDetail, setKhachHangDetail] = useState([]);
    const [caInfo, setCaInfo] = useState(props.caInfo);
    const [tienTruThe, setTienTruThe] = useState(hoaDonProps.tien_tru_the);
    const [khachThanhToan, setKhachThanhToan] = useState(hoaDonProps.thanh_toan);
    const [khachDaThanhToan, setKhachDaThanhToan] = useState(hoaDonProps.thanh_toan);
    const [tienCongNo, setTienCongNo] = useState(0);
    const [ngayTatToan, setNgayTatToan] = useState(null);

    const [note, setNote] = useState('');
    const [phiCaThe, setPhiCaThe] = useState(0);
    const [tienTip, setTienTip] = useState(0);

    const [inputChietKhau, setInputChietKhau] = useState(0);
    const [chietKhauPhanTram, setChietKhauPhanTram] = useState(true);

    const [confirmLoadingChietKhau, setConfirmLoadingChietKhau] = useState(false);
    const [loadingContent, setLoadingContent] = useState(false);

    const [giamGia, setGiamGia] = useState(0);
    const [hinhThucThanhToan, setHinhThucThanhToan] = useState(0);


    // show modal nv tu vấn/thực hiện
    const [modalNVThucHien, setModalNVThucHien] = useState(false);
    const [modalNVTuVan, setModalNVTuVan] = useState(false);

    // nv mặc định
    const [hoaDonChiTiet_active, setHoaDonChiTiet_active] = useState([]);
    // const [hoaDonChiTiet_ids , setHoaDonChiTiet_ids] = useState([]);
    const [NVTuVan, setNVTuVan] = useState([]);
    const [NVThucHien, setNVThucHien] = useState([]);

    const [hoaDon, setHoaDon] = useState(props.hoaDon_active.hoa_don);
    const [hoaDons, setHoaDons] = useState(props.hoaDon);

    const [hoaDonChiTiet, setHoaDonChiTiet] = useState(props.hoaDon_active.hoaDonChiTiet);


    const [openPayment, setOpenPayment] = useState(false);

    const [selectedRowKeys, setSelectedRowKeys] = useState(props.hoaDon_active.productIDs);

    const [tongTienConLai, setTongTienConLai] = useState(props.hoaDon_active.hoa_don.user__tien_con_lai);

    const [goiDichVu, setGoiDichVu] = useState(props.hoaDon_active.goiDichVu);
    const [isDisableBtnGoiDV, setIsDisableBtnGoiDV] = useState(true);
    const [loadingBtn, setLoadingBtn] = useState(false);

    const [isOpenModalGoiDV, setIsOpenModalGoiDV] = useState(false);

    const [modalAddKhachHang, setModalAddKhachHang] = useState(false);

    ///////////////////
    function payment() {

        // validation
        if (!chiNhanhThuNgan.id || !nhanVienThuNgan.id || !khoHangThuNgan.id) {
            console.log('xxx', chiNhanhThuNgan.id, nhanVienThuNgan.id, khoHangThuNgan.id);

            setIsModalThuNganConfig(true);
            return;
        }

        if (hinhThucThanhToan === 0 && khachThanhToan > 0) {
            message.error("Vui lòng chọn hình thức thanh toán");
            return;
        }

        let ngayTatToan_str = '';
        if (tienCongNo > 0) {
            if (!ngayTatToan) {
                message.error('Vui lòng chọn ngày tất toán');
                return;
            }
            ngayTatToan_str = ngayTatToan.format('YYYY-MM-DD')
        }

        // save
        axios.post(route('hoa_don.hoaDon_payment'), {
            tien_tru_the: tienTruThe,
            hoa_don_id: hoaDon.id,
            note: note,
            hinh_thuc_thanh_toan_id: hinhThucThanhToan,
            giam_gia: giamGia,
            khach_hang_id: khachHangId,
            thanh_toan: khachThanhToan,

            da_thanh_toan: khachDaThanhToan,
            cong_no: tienCongNo,
            ngay_tat_toan: ngayTatToan_str,
            tien_tip: tienTip,
            phi_ca_the: phiCaThe

        })
            .then((response) => {
                if (response.data.status_code == 200) {
                    // todo
                    message.success("Đã thanh toán hóa đơn thành công");
                    message.loading("Đang đóng hóa đơn này....");
                    location.reload();
                } else {
                    message.error("Thanh toán không thành công");
                }

            })
            .catch((error) => {
                message.error("Thanh toán không thành công");
            });
    }


    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };


    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };


    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => {
                        var _a;
                        return (_a = searchInput.current) === null || _a === void 0 ? void 0 : _a.select();
                    }, 100);
                }
            },
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };
    const clearAll = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            filteredValue: filteredInfo.name || null,
            ...getColumnSearchProps('name')
        },
        {
            title: 'Giá',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: '20%',
            sorter: (a, b) => a.gia_ban - b.gia_ban,
            sortDirections: ['descend', 'ascend'],
            showSorterTooltip: ['sss', 'dsds'],
            render: (_, record) => {
                return numberFormat(record.gia_ban);
            }
        },
        {
            title: 'Loại',
            dataIndex: 'product_type_id',
            key: 'product_type_id',
            width: '20%',
            filters: [
                { text: 'Hàng hóa', value: 1 },
                { text: 'Dịch vụ', value: 2 },
                { text: 'Gói dịch vụ, liệu trình', value: 3 },
                { text: 'Thẻ khách hàng', value: 4 },
            ],
            filteredValue: filteredInfo.product_type_id || null,
            onFilter: (value, record) => record.product_type_id === value,
            // onFilter: (value, record) => record.product_type_id.includes(value),
            render: (_, record) => {
                return record.product_type_name;
            }
        },
        {
            title: 'Nhóm',
            dataIndex: 'product_group_id',
            key: 'product_group_id',
            width: '25%',
            filters: props.productGroup,
            filteredValue: filteredInfo.product_group_id || null,
            onFilter: (value, record) => record.product_group_id === value,
            render: (_, record) => {
                return record.product_group_name;
            }
        },
    ];

    const onSelectChange = (newSelectedRowKeys, data) => {
        setSelectedRowKeys(newSelectedRowKeys);

        // get hdon Chi tiet
        getHoaDonChiTiet(newSelectedRowKeys);

        // getDichVuTrongGoi(pid);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    };

    function getHoaDonChiTiet(newSelectedRowKeys) {
        setLoadingContent(true);
        axios.post(route('himalaya_api.addHoaDonChiTiet'), {
            id_active: newSelectedRowKeys,
            hoaDonId: idActive,
            khach_hang_id: khachHangId
        }).then((response) => {
            setLoadingContent(false);
            if (response.data.status_code == 200) {
                const data = response.data.data;
                // set tiền còn lại trong thẻ
                setHoaDons(data.hoaDons);
                setHoaDon(data.hoaDon);
                setHoaDonChiTiet(data.hoaDonChiTiet);
                setKhachThanhToan(data.hoaDon.thanh_toan);
                setGoiDichVu(data.hoaDon.goiDichVu);

                let tienTruThe_tmp = 0;
                if (tongTienConLai > data.hoaDon.TongChiPhi) {
                    tienTruThe_tmp = data.hoaDon.TongChiPhi;
                } else {
                    tienTruThe_tmp = tongTienConLai;
                }
                setTienTruThe(tienTruThe_tmp);


                setKhachDaThanhToan(tienTip + data.hoaDon.thanh_toan);
                setTienCongNo(0);
                message.success("Đã thêm sản phẩm");
            } else {
                message.error("Lỗi tải danh sách thẻ");
            }

        }).catch((error) => {
            setLoadingContent(false);

            message.error("Lỗi không tải được danh sách thẻ.");
        });
    }

    const onClosePayment = () => {
        setOpenPayment(false);
    };

    const showConfirmPayment = () => {
        if (!khachHangId) {
            message.error("Vui lòng chọn khách hàng");
            return;
        }

        if (selectedRowKeys.length === 0 && hoaDonChiTiet.length === 0) {
            message.error("Vui lòng chọn sản phẩm cho đơn hàng");
            return;
        }
        setOpenPayment(true);
    };

    function changeSoLuong(value, idx) {
        setLoadingContent(true);
        let hoaDonChiTiet_tmp = hoaDonChiTiet;
        hoaDonChiTiet_tmp[idx].so_luong = value;
        setHoaDonChiTiet(cloneDeep(hoaDonChiTiet_tmp));

        // update to db
        axios.post(route('himalaya_api.update_SL_sp'), {
            hdon_chitiet_id: hoaDonChiTiet_tmp[idx].id,
            hoaDonId: idActive,
            so_luong: value
        })
            .then((response) => {
                setLoadingContent(false);
                message.success("Đã cập nhật lại số lượng và chiết khấu NV");
                if (response.data.status_code == 200) {
                    // set tiền còn lại trong thẻ
                    setHoaDonChiTiet(response.data.data.hoaDonChiTiet);
                    setHoaDon(response.data.data.hoaDon);
                    setKhachThanhToan(response.data.data.hoaDon.thanh_toan);

                    setKhachDaThanhToan(tienTip + response.data.data.hoaDon.thanh_toan);
                    setTienCongNo(0);

                    let tienTruThe_tmp = 0;
                    if (tongTienConLai > response.data.data.hoaDon.TongChiPhi) {
                        tienTruThe_tmp = response.data.data.hoaDon.TongChiPhi;
                    } else {
                        tienTruThe_tmp = tongTienConLai;
                    }
                    setTienTruThe(tienTruThe_tmp);

                    // message.success("Đã cập nhật lại số lượng");
                } else {
                    message.error("Lỗi tải danh sách thẻ");
                }
            })
            .catch((error) => {
                message.error("Lỗi không tải được danh sách thẻ."); apple
            });
    }

    function handleCancelNVThucHien() {
        setModalNVThucHien(false);
    }

    function handleCancelNVTuVan() {
        setModalNVTuVan(false);
    }

    function handleChangeNhanVienTuVan(value, data) {
        setLoadingContent(true);
        axios.post(route('himalaya_api.hoa_don.update_nvtuvan'), {
            user_ids: value,
            hoa_don_chi_tiet_id: hoaDonChiTiet_active.id
        })
            .then((response) => {
                setLoadingContent(false);
                if (response.data.status_code == 200) {
                    setHoaDons(response.data.data.hoaDons);
                    setHoaDon(response.data.data.hoaDon);
                    setHoaDonChiTiet(response.data.data.hoaDonChiTiet);
                    setKhachThanhToan(response.data.data.hoaDon.thanh_toan);
                    setKhachDaThanhToan(tienTip + response.data.data.hoaDon.thanh_toan);
                    setTienCongNo(0);

                    let tienTruThe_tmp = 0;
                    if (tongTienConLai > response.data.data.hoaDon.TongChiPhi) {
                        tienTruThe_tmp = response.data.data.hoaDon.TongChiPhi;
                    } else {
                        tienTruThe_tmp = tongTienConLai;
                    }
                    setTienTruThe(tienTruThe_tmp);

                    message.success("Đã cập nhật lại NV tư vấn");
                } else {
                    message.error("Lỗi tải danh sách thẻ");
                }

            })
            .catch((error) => {
                message.error("Lỗi không tải được danh sách thẻ.");
            });
    };

    function handleChangeNhanVienThucHien(value, data) {
        setLoadingContent(true);
        axios.post(route('himalaya_api.hoa_don.update_nvthuchien'), {
            user_ids: value,
            hoa_don_chi_tiet_id: hoaDonChiTiet_active.id
        })
            .then((response) => {
                setLoadingContent(false);
                if (response.data.status_code == 200) {
                    // set tiền còn lại trong thẻ
                    setHoaDons(response.data.data.hoaDons);
                    setHoaDon(response.data.data.hoaDon);
                    setHoaDonChiTiet(response.data.data.hoaDonChiTiet);
                    setKhachThanhToan(response.data.data.hoaDon.thanh_toan);
                    setKhachDaThanhToan(tienTip + response.data.data.hoaDon.thanh_toan);
                    setTienCongNo(0);

                    let tienTruThe_tmp = 0;
                    if (tongTienConLai > response.data.data.hoaDon.TongChiPhi) {
                        tienTruThe_tmp = response.data.data.hoaDon.TongChiPhi;
                    } else {
                        tienTruThe_tmp = tongTienConLai;
                    }
                    setTienTruThe(tienTruThe_tmp);

                    message.success("Đã cập nhật lại NV làm dịch vụ");
                } else {
                    message.error("Lỗi không tải được NV làm dịch vụ.");
                }

            })
            .catch((error) => {
                message.error("Lỗi không tải được NV làm dịch vụ.");
            });
    };

    function showNVThucHien(nv) {
        return nv.map((n, i) => {
            return <div key={i} className="item-nv">{n.ten_nv}</div>;
        });
    }

    function showPopupNVTuVan(hdChiTiet) {

        setNVTuVan(hdChiTiet.nv_tu_van_ids);
        setHoaDonChiTiet_active(cloneDeep(hdChiTiet));

        let nvTuVan_tmp = NVTuVan;
        nvTuVan_tmp[hdChiTiet.id] = true;
        setModalNVTuVan(nvTuVan_tmp)
    }

    function showPopupNVThucHien(hdChiTiet) {

        setNVThucHien(hdChiTiet.nv_thuc_hien_ids);
        setHoaDonChiTiet_active(cloneDeep(hdChiTiet));

        let nvThucHien_tmp = NVThucHien;
        nvThucHien_tmp[hdChiTiet.id] = true;
        setModalNVThucHien(nvThucHien_tmp)
    }

    /**
     * 
     * @param {nv info} nv 
     * @param {giá trị mới} value 
     * @param {% hay vnd} loai 
     */
    function updateChietKhau(nv, table) {

        axios.post(route('himalaya_api.hoa_don.hoaDon_updateCK'), {
            id: nv.id,
            value: inputChietKhau,
            is_percen: chietKhauPhanTram,
            table: table
        })
            .then((response) => {
                setLoadingContent(false);
                if (response.data.status_code == 200) {
                    setHoaDons(response.data.data.hoaDons);
                    setHoaDon(response.data.data.hoaDon);
                    setHoaDonChiTiet(response.data.data.hoaDonChiTiet);
                    message.success("Đã cập nhật lại NV tư vấn");
                } else {
                    message.error("Lỗi tải danh sách thẻ");
                }
                setInputChietKhau(0);
                setChietKhauPhanTram(1);
            })
            .catch((error) => {
                message.error("Lỗi không tải được danh sách thẻ.");
            });
    }

    function showNhanVienThucHien(nv) {
        return nv.map((n, i) => {
            let ck = n.TienChietKhau;
            let dv = n.LaPhanTram === 1 ? '%' : 'Vnđ'
            if (n.LaPhanTram === 1) {
                ck = n.phan_tram_chiet_khau
            }
            return <tr key={i}>
                <td>{n.ten_nv}</td>

                {/* chiết khấu */}
                <td>
                    <Popconfirm title='Chiết khấu'
                        description={<table>
                            <tr>
                                <td>
                                    <InputNumber min={0} onChange={(value) => setInputChietKhau(value)} value={inputChietKhau} />
                                </td>
                                <td>
                                    <Switch checkedChildren="%" unCheckedChildren="VNĐ" value={chietKhauPhanTram} onChange={(e) => setChietKhauPhanTram(e)} />
                                </td>
                            </tr>
                        </table>}
                        icon={<InfoCircleOutlined style={{ color: 'blue' }} />}
                        onConfirm={() => { updateChietKhau(n, 'nhan_vien_thuc_hien') }}
                        okButtonProps={{ loading: confirmLoadingChietKhau }}
                    >
                        <a>{numberFormat(ck)} {dv}</a>
                    </Popconfirm>
                </td>

                {/* Tiền chiết khấu */}
                <td>
                    {/*  */}
                </td>
            </tr>
        })
    }

    function showNhanVienTuVan(nv) {
        return nv.map((n, i) => {
            let ck = n.TienChietKhau;
            let dv = n.LaPhanTram === 1 ? '%' : 'Vnđ'
            if (n.LaPhanTram === 1) {
                ck = n.phan_tram_chiet_khau
            }
            return <tr key={i}>
                <td>{n.ten_nv}</td>

                {/* chiết khấu */}
                <td>
                    <Popconfirm title='Chiết khấu'
                        description={<table>
                            <tr>
                                <td>
                                    <InputNumber min={0} onChange={(value) => setInputChietKhau(value)} value={inputChietKhau} />
                                </td>
                                <td>
                                    <Switch checkedChildren="%" unCheckedChildren="VNĐ" value={chietKhauPhanTram} onChange={(e) => setChietKhauPhanTram(e)} />
                                </td>
                            </tr>
                        </table>}
                        icon={<InfoCircleOutlined style={{ color: 'blue' }} />}
                        onConfirm={() => { updateChietKhau(n, 'nhan_vien_tu_van') }}
                        okButtonProps={{ loading: confirmLoadingChietKhau }}
                    >
                        <a>{ck} {dv}</a>
                    </Popconfirm>
                </td>

                {/* Tiền chiết khấu */}
                <td>
                    {/*  */}
                </td>
            </tr>
        })
    }

    function showHanSuDung(hd) {
        if (hd.han_su_dung === 1) {
            return 'Vô thời hạn';
        }
        if (hd.han_su_dung === 2) {
            return hd.hsd_ngay_cu_the;
        }
        if (hd.han_su_dung === 3) {
            return hd.hsd_khoang_thoi_gian + ' (' + hd.hsd_khoang_thoi_gian_don_vi + ')';
        }
    }

    function showLoaiHH(hd) {
        if (hd.loai_hang_hoa) {
            return hd.loai_hang_hoa.map((loai) => {
                return <Tag>{props.loaiHangHoa[loai]}</Tag>
            })
        }
    }

    function showHH(hd) {
        if (hd.hang_hoa_ap_dung) {
            return hd.hang_hoa_ap_dung.map((hh) => {
                return <Tag>{props.productInfo[hh].name}</Tag>
            })
        }
    }


    function showDVTrongGoi(hd) {
        <p><a><CheckOutlined /></a> Mệnh giá: {numberFormat(hd.product_price)} <sup>đ</sup></p>
        if (hd.product_apply) {
            return hd.product_apply.map((hh) => {
                return <p><a><CheckOutlined /></a> {props.productInfo[hh].name}</p>
            })
        }
    }

    function deleteProduct(hoa_don_chi_tiet_id) {
        axios.post(route('thuNgan.deletProduct'), {
            hoa_don_chi_tiet_id: hoa_don_chi_tiet_id,
            hoaDonId: idActive,
        })
            .then((response) => {
                setLoadingContent(false);
                message.success("Đã cập nhật lại số lượng và chiết khấu NV");
                if (response.data.status_code == 200) {
                    setHoaDonChiTiet(response.data.data.hoaDonChiTiet);
                    setHoaDon(response.data.data.hoaDon);
                    setKhachThanhToan(response.data.data.hoaDon.thanh_toan);
                    setGoiDichVu(response.data.data.goiDichVu);

                    setKhachDaThanhToan(tienTip + response.data.data.hoaDon.thanh_toan);
                    setTienCongNo(0);
                    message.success("Đã xóa");
                } else {
                    message.error("Lỗi tải danh sách hóa đơn");
                }
            })
            .catch((error) => {
                message.error("Lỗi không tải được danh sách thẻ.");
            });
    }

    function showHoaDonChiTiet() {
        let result = hoaDonChiTiet.map((hd, idx) => {
            let price = numberFormat(hd.product_price);
            let des = '';
            let total = hd.product_price * hd.so_luong;
            let readonly = false;
            if (hd.card_id > 0) {
                des = 'Trừ thẻ';
                price = 0;
                total = 0;
                readonly = true;
            }
            return <div className="row-cart-item" key={idx}>

                {/* Modal Nhân viên thực hiện */}
                <Modal
                    open={modalNVThucHien[hd.id]}
                    title="Nhân viên thực hiện"
                    onCancel={handleCancelNVThucHien}
                    footer={[
                        <Button key="back" type="primary" onClick={handleCancelNVThucHien}>
                            Đóng
                        </Button>
                    ]}
                >
                    <Select
                        mode="multiple"
                        disabled={loadingContent}
                        style={{ width: '100%' }}
                        placeholder="Chọn nhân viên"
                        defaultValue={hd.nv_thuc_hien_ids}
                        // defaultValue={[11]}
                        optionFilterProp="label"
                        filterSort={
                            (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                        onChange={(value, data) => { handleChangeNhanVienThucHien(value, data) }}
                        options={props.nhanVien}
                    />

                    <table className="table-popup">
                        <thead>
                            <tr>
                                <th>NV</th>
                                <th>Chiết khấu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showNhanVienThucHien(hd.nv_thuc_hien)}
                        </tbody>
                    </table>
                </Modal>

                {/* Modal Nhân viên tư vấn */}
                <Modal
                    open={modalNVTuVan[hd.id]}
                    title="Nhân viên tư vấn"
                    onCancel={handleCancelNVTuVan}
                    footer={[
                        <Button key="back" type="primary" onClick={handleCancelNVTuVan}>
                            Đóng
                        </Button>,
                    ]}
                >
                    <Select
                        mode="multiple"
                        disabled={loadingContent}
                        style={{ width: '100%' }}
                        placeholder="Chọn nhân viên"
                        defaultValue={hd.nv_tu_van_ids}
                        optionFilterProp="label"
                        filterSort={
                            (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                        onChange={(value, data) => { handleChangeNhanVienTuVan(value, data) }}
                        options={props.nhanVien}
                    />

                    <table className="table-popup">
                        <thead>
                            <tr>
                                <th>NV</th>
                                <th>Chiết khấu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showNhanVienTuVan(hd.nv_tu_van)}
                        </tbody>
                    </table>
                </Modal>

                {/* content */}
                <div className="d-flex cell-order font-medium">
                    <b>{(idx + 1)}.</b>
                </div>
                <div className="row-product">
                    <div className="cell-name full">
                        <b className="font-medium">{hd.product_name}</b>
                    </div>
                    <div className="cell-quatity">
                        <div className="quantity quantity-sm">
                            <InputNumber className="input-sl"
                                disabled={readonly}
                                value={hd.so_luong}
                                min={1}
                                onChange={(value) => { changeSoLuong(value, idx) }} />
                        </div>
                    </div>

                    <div className="cell-change-price">
                        <div className="popup-anchor">{price}</div>
                        <div className="popup-anchor"><em className="desc-truthe">{des}</em></div>
                    </div>

                    <div className="cell-price"> {numberFormat(total)} </div>
                    <div className="pl-4">
                        <a className="btn-icon btn-icon-default mr-4" onClick={() => deleteProduct(hd.id)}>
                            <DeleteOutlined />
                        </a>
                    </div>
                </div>

                {/* Thẻ VIP */}
                <div className={hd.product_type_id === 3 ? 'sub-row-product-container' : '_hidden'}>
                    <br />
                    <Space>
                        <div className="booking-delete mt-12">
                            &nbsp;&nbsp;
                            <a><CaretRightOutlined /></a>
                        </div>
                        <div className="booking-product-container">
                            <div className="booking-action booking-counselor w-100">
                                <span className="form-control-text text-nowrap mr-12">Hạn sử dụng: {showHanSuDung(hd)}</span>
                            </div>
                        </div>
                    </Space>
                    <br /><br />

                    {/* Gói dịch vụ */}
                    <Space>
                        <div className="booking-delete mt-12">
                            &nbsp;&nbsp;
                            <a><CaretRightOutlined /></a>
                        </div>
                        <div className="booking-product-container">
                            <div className="booking-action booking-counselor w-100">
                                <span className="form-control-text text-nowrap mr-12">Gói dịch vụ bao gồm: </span>
                            </div>
                        </div>
                    </Space>
                    {/* show dv trong Gói */}
                    <div className="desc-pro">
                        {showDVTrongGoi(hd)}
                    </div>
                </div>

                {/* Thẻ VIP */}
                <div className={hd.product_type_id === 4 ? 'sub-row-product-container' : '_hidden'}>
                    <br />
                    <Space>
                        <div className="booking-delete mt-12">
                            &nbsp;&nbsp;
                            <a><CaretRightOutlined /></a>
                        </div>
                        <div className="booking-product-container">
                            <div className="booking-action booking-counselor w-100">
                                <span className="form-control-text text-nowrap mr-12">Thông tin thẻ: </span>
                            </div>
                        </div>
                    </Space>

                    <div className="desc-pro">
                        <p><a><CheckOutlined /></a> Hạn sử dụng: {showHanSuDung(hd)}</p>
                        <p><a><CheckOutlined /></a> Mệnh giá: {numberFormat(hd.product_price)} <sup>đ</sup></p>
                        <p>
                            <a><CheckOutlined /></a>
                            Loại hàng hóa Áp dụng:
                            {showLoaiHH(hd)}
                        </p>
                        <p><a><CheckOutlined /></a>Hàng hóa Áp dụng: {showHH(hd)}</p>
                    </div>
                </div>

                {/* NV Tư vấn */}
                <div className="sub-row-product-container">
                    <br />
                    <Space>
                        <div className="booking-delete mt-12">
                            &nbsp;&nbsp;
                            <a><CaretRightOutlined /></a>
                        </div>
                        <div className="booking-product-container">
                            <div className="booking-action booking-counselor w-100">
                                <span className="form-control-text text-nowrap mr-12">Tư vấn bán: </span>
                            </div>
                        </div>
                        <div className="k-multiselect-sm k-widget k-multiselect k-header commission-ratio-result booking-staff">
                            <Space className="main-nv" onClick={() => { showPopupNVTuVan(hd) }}>

                                {showNVThucHien(hd.nv_tu_van)}

                                <div className="item-nv">+</div>

                            </Space>
                        </div>
                    </Space>
                </div>

                {/* nv thực hiện */}
                <div className={[1, 2].includes(hd.product_type_id) ? 'sub-row-product-container' : '_hidden'}>
                    <br />
                    <Space>
                        <div className="booking-delete mt-12">
                            &nbsp;&nbsp;
                            <a><CaretRightOutlined /></a>
                        </div>
                        <div className="booking-product-container">
                            <div className="booking-action booking-counselor w-100">
                                <span className="form-control-text text-nowrap mr-12">Làm dịch vụ: </span>
                            </div>
                        </div>
                        <div className="k-multiselect-sm k-widget k-multiselect k-header commission-ratio-result booking-staff">
                            <Space className="main-nv" onClick={() => { showPopupNVThucHien(hd) }}>

                                {showNVThucHien(hd.nv_thuc_hien)}

                                <div className="item-nv">+</div>

                            </Space>
                        </div>
                    </Space>
                </div>

                <hr />
            </div>
        })

        return result;
    }


    function changekhachHang(value: number, e: any) {
        setKhachHangId(value);
        setKhachHangDetail(e.data);
        setTongTienConLai(e.data.tien_con_lai);
        // update khach hang
        axios.post(route('hoa_don.update_customer'), {
            khach_hang: value,
            hoaDonId: idActive
        })
            .then((response) => {
                if (response.data.status_code == 200) {
                    const data = response.data.data;
                    resetStateHoaDon(data.hoaDons[keyActive], data);
                    message.success("Chọn khách hàng thành công");
                } else {
                    message.error("Lỗi tải thông tin khách hàng");
                }

            })
            .catch((error) => {
                message.error("Lỗi không tải được thông tin khách hàng");
            });
    }

    function selectedKhachHang(user:any) {
        setKhachHangId(user.id);
        setKhachHangDetail(user);
        setTongTienConLai(user.tien_con_lai);
        // todo: update khach hang
        axios.post(route('hoa_don.update_customer'), {
            khach_hang: user.id,
            hoaDonId: idActive
        })
            .then((response) => {
                if (response.data.status_code == 200) {
                    const data = response.data.data;
                    resetStateHoaDon(data.hoaDons[keyActive], data);
                    message.success("Chọn khách hàng thành công");
                } else {
                    message.error("Lỗi tải thông tin khách hàng");
                }

            })
            .catch((error) => {
                message.error("Lỗi không tải được thông tin khách hàng");
            });
    }

    function changeSoLuongService(key, keyService, soLuong) {
        const goiDichVu_tmp = cloneDeep(goiDichVu);
        goiDichVu_tmp[key].cardService[keyService].so_luong_tmp = soLuong;
        let soLuong_tmp = 0;
        goiDichVu_tmp.forEach((item, keyCard) => {
            soLuong_tmp = 0;
            item.cardService.forEach((ser, keySer) => {
                if (ser.so_luong_tmp) {
                    soLuong_tmp += ser.so_luong_tmp
                }
            })

            if (soLuong_tmp > item.card.so_luong_con_lai) {
                goiDichVu_tmp[keyCard].card.error = 'Số lượng bạn chọn vượt quá số lượng của gói đã mua';
                setIsDisableBtnGoiDV(true);
            } else {
                goiDichVu_tmp[keyCard].card.error = '';
                setIsDisableBtnGoiDV(false);
            }
        })
        // set state gói dv
        setGoiDichVu(goiDichVu_tmp);
    }

    function contentGoiDV() {
        if (!goiDichVu || goiDichVu.length === 0) {
            return <Empty description="Khách hàng này chưa đăng ký gọi dịch vụ nào" />
        }

        const items = goiDichVu.map((goi, key) => {
            const slConLai = goi.card.so_luong_con_lai;
            const child = <table className="table-normal">
                <thead>
                    <tr className="tr-border">
                        <th className="th-name">Tên</th>
                        <th>
                            Chọn SL sử dụng
                        </th>
                    </tr>

                    {!goi.card.error ? '' : <tr><th colSpan={2} className="het-luot"><em>{goi.card.error}</em></th></tr>}

                </thead>
                <tbody>
                    {goi.cardService.map((ser, keyService) => {
                        let disable = slConLai === 0 ? true : false;
                        return <tr key={keyService}>
                            <td>{ser.product_name}</td>
                            <td>
                                <InputNumber className="so-luong"
                                    disabled={disable}
                                    min={0}
                                    max={slConLai}
                                    value={goiDichVu[key].cardService[keyService].so_luong_tmp}
                                    onChange={(soLuong) => changeSoLuongService(key, keyService, soLuong)}
                                />
                            </td>
                        </tr>
                    })}

                </tbody>
            </table>

            return {
                key: key,
                label: <div>
                    <b>Mã - Tên gói: </b><a>{goi.card.card_code} - {goi.card.product_name}</a>
                    <p className="">
                        <em>Đã dùng / Tổng SL:</em> <b>{goi.card.so_luong_da_su_dung}/{goi.card.so_luong} </b>
                        {slConLai !== 0 ? '' : <em className="_red">(Hết số lượt sử dụng)</em>}
                    </p>
                </div>,
                children: child
                ,
            }
        })

        return <Collapse items={items} defaultActiveKey={['0']} />;
    }

    function chonDichVu() {
        setLoadingBtn(true);
        axios.post(route('himalaya_api.addHoaDonChiTiet_truThe'), {
            card_data: goiDichVu,
            hoa_don_id: idActive
        }).then((response) => {
            setIsOpenModalGoiDV(false);
            setLoadingBtn(false);
            if (response.data.status_code == 200) {
                const data = response.data.data;
                setIsOpenModalGoiDV(false);
                resetStateHoaDon(data.hoaDons[keyActive], data);
                message.success("Đã thêm sản phẩm");
            } else {
                message.error("Lỗi tải danh sách thẻ");
            }

        }).catch((error) => {
            setLoadingBtn(false);
            setIsOpenModalGoiDV(false);
            message.error("Lỗi không tải được danh sách thẻ.");
        });
    }
    function contentTab() {


        return <Row className="main-hdon">
            {/* San pham */}
            <Col span={10}>

                <Divider orientation="left"><Space>Chọn sản phẩm</Space></Divider>

                <Table loading={loadingContent}
                    onChange={handleChange}
                    columns={columns}
                    dataSource={props.products}
                    rowSelection={rowSelection}
                    locale={{
                        triggerDesc: 'Click để sắp xếp theo thứ tự giảm dần',
                        triggerAsc: 'Click để sắp xếp theo thứ tự tăng dần',
                        cancelSort: 'Click để bỏ sắp xếp'
                    }}
                />

            </Col>

            <Col span={14} className="main-cart">

                {/* modal goiDichVu */}
                <Modal centered
                    open={isOpenModalGoiDV}
                    maskClosable={false}
                    onCancel={() => setIsOpenModalGoiDV(false)}
                    width={1000}
                    title={<div>
                        <p className="">Khách hàng: <b>{khachHangDetail.name}</b></p>
                        <p className="">Tiền trong tài khoản: <span>{numberFormat(tongTienConLai)}</span><sup>đ</sup></p>
                    </div>}
                    footer={[
                        <Button key="1" onClick={() => setIsOpenModalGoiDV(false)}>
                            Đóng
                        </Button>,
                        <Button loading={loadingBtn} disabled={isDisableBtnGoiDV} key="2" type="primary" onClick={() => chonDichVu()}>
                            Xác nhận chọn
                        </Button>,
                    ]}
                >
                    <Tabs
                        // onChange={onChange}
                        type="card"
                        items={[
                            {
                                label: 'Chọn gói dịch vụ',
                                key: '1',
                                children: contentGoiDV(),
                            },
                            {
                                label: 'Thông tin chi tiết',
                                key: '2',
                                children: <Col>
                                    <Row colSpan={24}>
                                        {khachHangData ? khachHangInfo(khachHangData) : ''}
                                    </Row>
                                </Col>,
                            }
                        ]}
                    />


                </Modal>

                {/* content left */}
                <Divider orientation="left">
                    <Space>
                        Khách hàng
                        <span className='space02'>|</span>
                        <a className='divider-thoat' 
                            onClick={() => setModalAddKhachHang(true)}
                        >
                            <PlusCircleOutlined />
                        </a>

                        <Select
                            showSearch
                            style={{ width: 200 }}
                            allowClear={true}
                            value={khachHangId}
                            placeholder="Chọn khách hàng"
                            onChange={(value, e) => { changekhachHang(value, e); }}
                            optionFilterProp="label"
                            filterSort={
                                (optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            options={users.map((u) => {
                                const label = u.name + ' - ' + u.phone;
                                return {
                                    value: u.id,
                                    label: label,
                                    data: u,
                                }
                            })}
                        />

                        {/* <span>{numberFormat(tongTienConLai)}</span>

                        <span className='space02'>|</span> */}

                        <a onClick={() => setIsOpenModalGoiDV(true)}>INFO</a>

                    </Space>
                </Divider>

                <div className="product-cart-item">
                    {showHoaDonChiTiet()}
                </div>
            </Col>

            <Col className="main-btn-payment" span={24} >
                <Button type="primary"
                    onClick={showConfirmPayment}
                    className="btn-submit-fixed" >
                    <CheckOutlined />
                    Thanh Toán  {numberFormat(khachThanhToan + tienTip)}
                </Button>
            </Col>
        </Row>
    }

    const columnsHoaDonChiTiet = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: '40%',
            render: (_, record) => {
                return record.product_name
            }

        },
        {
            title: 'SL x Giá',
            dataIndex: 'age',
            key: 'price',
            width: '20%',
            render: (_, record) => {
                return numberFormat(record.so_luong) + ' x ' + record.product_price;
            }
        },
        {
            title: 'Thành Tiền',
            dataIndex: 'group',
            key: 'thanh_tien',
            width: '30%',
            render: (_, record) => {
                const thanh_tien = record.so_luong * record.product_price;
                return numberFormat(thanh_tien);
            }
        },
    ];

    const changeChiNhanh = (value) => {
        if (!value) {
            value = 0;
        }

        setChiNhanh(value);

        axios.post(route('himalaya_api.hoa_don.update_chi_nhanh'), {
            chi_nhanh: value,
            hoa_don_id: hoaDon.id
        })
            .then((response) => {
                if (response.data.status_code == 200) {
                    // todo
                } else {
                    message.error("Lỗi không thể cập nhật chi nhánh");
                }

            })
            .catch((error) => {
                message.error("Lỗi không thể cập nhật chi nhánh");
            });
    }

    const changeTienTruThe = (value) => {
        setTienTruThe(value);
        const khachThhanhToan_tmp = hoaDon.TongChiPhi - value;
        setKhachThanhToan(khachThhanhToan_tmp);
        setKhachDaThanhToan(tienTip + khachThhanhToan_tmp);
        setTienCongNo(0);
    }


    function deleteTab(hoaDonId) {
        axios.post(route('thu_ngan.deleteHoaDonDraft'), {
            hoa_don_id: hoaDonId,
            hoa_don_id_active: idActive
        })
            .then((response) => {
                if (response.data.status_code == 200) {
                    const data = response.data.data;
                    resetStateHoaDon(data.hoaDons[data.key_active], data);
                    message.success("Đã tạo thêm hóa đơn");
                } else {
                    message.error("Xóa hóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                }
            })
            .catch((error) => {
                message.error("Xóa hóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
            });
    }

    function addTab() {
        axios.post(route('hoa_don.add'), {
            tien_tru_the: tienTruThe,
            hoa_don_id: hoaDon.id,
            note: note
        })
            .then((response) => {
                if (response.data.status_code == 200) {
                    const data = response.data.data;
                    resetStateHoaDon(data.hoaDons[data.key_active], data)
                    message.success("Đã tạo thêm hóa đơn");
                } else {
                    message.error("Tạo hóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                }
            })
            .catch((error) => {
                message.error("Tạo hóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
            });
    }

    function changeTab(i) {
        const hoadon_tmp = hoaDons[i];
        setKeyActive(i);
        resetStateHoaDon(hoadon_tmp);
        setKhachHangId(hoadon_tmp.hoa_don.users_id);
    }

    function showTab(hd) {
        const tab = hd.map((item, i) => {
            let active = '';
            if (i === keyActive) {
                active = 'active';
            }
            return <div className={'tab-name-item ' + active} key={i}>
                <span onClick={() => changeTab(i)}>{item.hoa_don.name}</span>
                <a onClick={() => { deleteTab(item.hoa_don.id) }} className="delete-tab"> X</a>
            </div>;
        });
        return <Space>
            {tab}
            <div className="tab-name-item" onClick={() => addTab()}>+</div>
        </Space>
    }

    // reset all state
    function resetStateHoaDon(hd, data = null, isResetTienTip = true, isResetCongNo = true) {
        // state của hoa dơn active
        setHoaDon(hd.hoa_don);
        setHoaDonChiTiet(hd.hoaDonChiTiet);
        setTienTruThe(hd.hoa_don.tien_tru_the);
        setKhachThanhToan(hd.hoa_don.thanh_toan);
        setKhachDaThanhToan(hd.hoa_don.thanh_toan);

        // checked product
        if (hd.productIDs) {
            setSelectedRowKeys(hd.productIDs);
        }

        // gói dịch vụ
        if (hd.goiDichVu) {
            setGoiDichVu(hd.goiDichVu);
        }

        // set lại state khách hàng
        if (hd.hoa_don.users_id && hd.hoa_don.users_id > 0) {
            setKhachHangData(hd.khachHangData);

            // 3 state chưa cần set, do hiện tại mới chỉ thay đổi ở hàm changeKhachHang thì đã set luôn từ đầu hàm rồi
            // setKhachHangDetail(hd.khachHangInfo);
            // setKhachHangId(hd.hoa_don.users_id);
            // setTongTienConLai(hd.tien_con_lai);
        }



        if (isResetTienTip) {
            setTienTip(0);
        }

        if (isResetCongNo) {
            setTienCongNo(0);
        }

        if (!data) {
            return;
        }

        // list hóa đơn
        if (data.hoaDons) {
            setHoaDons(data.hoaDons);
        }

        // key_active
        if (data.key_active) {
            setKeyActive(data.key_active);
        }


    }

    function showCongNo() {
        if (tienCongNo > 0) {
            return <tr className="_warning-text">
                <td>
                    <b><a><MinusCircleOutlined /> </a> </b>
                    <b>Công nợ </b>
                    <br /><br />
                    <b><a><DashboardOutlined /> </a> </b>
                    <b>Ngày tất toán </b>
                </td>
                <td>
                    {numberFormat(tienCongNo)} <sup>đ</sup>
                    <br /><br />
                    <DatePicker placeholder="Chọn ngày tất toán" onChange={(value) => {

                        setNgayTatToan(value);
                    }} />
                </td>
            </tr>
        }
    }

    const dataFormKhachHang = {
        id: 0,
        email: '',
        name: '',
        phone: '',
        gioi_tinh_id: null,
        ngay_sinh: null,
        facebook: '',
        address: '',
        customer_group_id: null,
        customer_status_id: 1
    }

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={routeSales}
                current={props.table}
                content={
                    <div>
                        {/* Cài đặt thu ngân */}
                        <Modal
                            title={<div><SettingOutlined /> Cài đặt thu ngân</div>}
                            open={isModalThuNganConfig}
                            onCancel={() => setIsModalThuNganConfig(false)}
                            footer={[]}
                            width={500}
                            maskClosable={maskClosableConfirm}
                        >
                            {contentThuNganConfig(
                                nhanVienThuNgan,
                                props.nhanVien,
                                chiNhanhThuNgan,
                                props.chiNhanh,
                                khoHangThuNgan,
                                props.khoHang,
                                (data) => {
                                    setNhanVienThuNgan(data.nhanVien);
                                    setChiNhanhThuNgan(data.chiNhanh);
                                    setKhoHangThuNgan(data.khoHang);
                                    setIsModalThuNganConfig(false);
                                }
                            )}
                        </Modal>

                        {/* đổi ca */}
                        <Modal
                            title={<h3 className="title-search02">ĐỔI CA</h3>}
                            open={isModalDoiCa}
                            onCancel={() => setIsModalDoiCa(false)}
                            footer={[]}
                            width={500}
                            maskClosable={true}
                        >
                            {contentDoiCa(nhanVienThuNgan, props.nhanVien, caInfo, (data: any) => {
                                setNhanVienThuNgan(data.nhanVien);
                                setIsModalDoiCa(false);
                            })}
                        </Modal>

                        {/* modal add khách hàng */}
                        <Modal title={<p className="title02">Thêm khách hàng <hr /></p>}
                            open={modalAddKhachHang}
                            width={1000}
                            footer={[]}
                            onCancel={() => setModalAddKhachHang(false)}>

                            {
                                formEditKhachHang(props, dataFormKhachHang, (data: any) => {
                                    setModalAddKhachHang(false);
                                    if (data.close) {
                                        return;
                                    }
                                    let users_tmp = cloneDeep(users);
                                    users_tmp.unshift(data);
                                    setUsers(users_tmp);
                                    setModalAddKhachHang(false);
                                    selectedKhachHang(data)
                                })
                            }

                        </Modal>

                        <Row>
                            {/* Breadcrumb */}
                            <Col span={12}>
                                <Breadcrumb
                                    items={[
                                        {
                                            href: route('dashboard'),
                                            title: (
                                                <span >
                                                    <HomeOutlined />
                                                    <span>Home</span>
                                                </span>
                                            ),

                                        },
                                        {
                                            href: route('hoaDon.index'),
                                            title: (
                                                <span >
                                                    <FileDoneOutlined />
                                                    <span>Danh sách hóa đơn</span>
                                                </span>
                                            ),
                                        },
                                        {
                                            title: (
                                                <>
                                                    <PlusCircleOutlined />
                                                    <span>Tạo mới hóa đơn</span>
                                                </>
                                            ),
                                        },
                                    ]}
                                />

                            </Col>

                            <Col span={12} className="text-right">
                                <Button onClick={() => {
                                    setIsModalDoiCa(true);
                                    axios.post(route('hoa_don.doiCa'), {
                                        nhan_vien_id: nhanVienThuNgan.id,
                                    })
                                        .then((response) => {
                                            if (response.data.status_code == 200) {
                                                setCaInfo(response.data.data);
                                                message.success("Tải dữ liệu của CA thành công");
                                            } else {
                                                message.error("Không lấy được thông tin của ca này");
                                            }

                                        })
                                        .catch((error) => {
                                            message.error("Không lấy được thông tin của ca này");
                                        });
                                }}
                                >
                                    <SwapOutlined />
                                    Đổi ca
                                </Button>

                                <span> </span>

                                <Button onClick={() => setIsModalThuNganConfig(true)}>
                                    <SettingOutlined />
                                    Cài đặt thu ngân
                                </Button>
                            </Col>
                        </Row>

                        {/* Tab Name */}
                        <Col span={24}>
                            <div className="main-tab-name">
                                {showTab(hoaDons)}
                            </div>
                        </Col>

                        {contentTab()}

                    </div>
                }
            />

            {/* confirm */}
            <Drawer className="main-payment-confirm"
                title="Xác nhận thanh toán"
                placement="right"
                // size={'large'}
                onClose={onClosePayment}
                open={openPayment}
            >
                <Row>
                    <Col span={12}>
                        <Table columns={columnsHoaDonChiTiet}
                            dataSource={hoaDonChiTiet}
                            className="table-confirm02"
                        />
                    </Col>
                    <Col span={12}>
                        <Row>
                            <Col span={24}>
                                <b><ShopOutlined /> Chi nhánh: </b>{chiNhanhThuNgan.name}
                            </Col>

                            <Col span={24}>
                                <b><UserAddOutlined /> Người tạo hóa đơn: </b>{nhanVienThuNgan.name}
                            </Col>

                            <Col span={24}>
                                <table className="table-confirm">
                                    <tbody>
                                        <tr className="_red _bold">
                                            <td>
                                                <a><ArrowRightOutlined /> </a>
                                                Tổng tiền hàng
                                            </td>
                                            <td>{numberFormat(hoaDon.TongChiPhi)}<sup>đ</sup></td>
                                        </tr>

                                        {/* tien_trong_the */}
                                        <tr>
                                            <td>
                                                <b><a><AccountBookOutlined /> </a></b>
                                                <b>Tiền còn trong thẻ</b>
                                            </td>
                                            <td>{numberFormat(tongTienConLai)}<sup>đ</sup></td>
                                        </tr>

                                        {/* tien_tru_the */}
                                        <tr>
                                            <td>
                                                <b><a><BookOutlined /> </a> </b>
                                                <b>Tiền trừ thẻ</b>
                                            </td>
                                            <td>
                                                <InputNumber value={tienTruThe}
                                                    min={0}
                                                    max={tongTienConLai > hoaDon.TongChiPhi ? hoaDon.TongChiPhi : tongTienConLai}
                                                    onChange={changeTienTruThe}
                                                    className="input-none-02"
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                // parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                />
                                            </td>
                                        </tr>

                                        {/* Giảm giá */}
                                        <tr>
                                            <td>
                                                <b><a><FallOutlined /> </a> </b>
                                                <b>Giảm giá</b>
                                            </td>
                                            <td>
                                                <InputNumber value={giamGia}
                                                    min={0}
                                                    max={hoaDon.TongChiPhi}
                                                    onChange={(value) => {
                                                        setGiamGia(value);
                                                        // const khachThhanhToan_tmp = khachThanhToan - value;
                                                        // setKhachThanhToan(khachThhanhToan_tmp);

                                                        // setKhachDaThanhToan(tienTip + khachThhanhToan_tmp);
                                                        setTienCongNo(0);
                                                    }
                                                    }
                                                    className="input-none-02"
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <b><a><CrownOutlined /> </a> </b>
                                                <b>Tiền Tip, Ngày lễ (TT riêng)</b>
                                            </td>
                                            <td>
                                                <InputNumber value={tienTip}
                                                    min={0}
                                                    onChange={(value) => {
                                                        setTienTip(value);
                                                        // setKhachDaThanhToan(value + khachThanhToan);
                                                        setTienCongNo(0);
                                                    }}
                                                    className="input-none-02"
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                />
                                            </td>
                                        </tr>

                                        <tr className="_red _bold">
                                            <td>
                                                <a><LineHeightOutlined /></a>
                                                Tổng chi phí
                                            </td>
                                            <td>{numberFormat(khachThanhToan - giamGia)}</td>
                                        </tr>

                                        <tr className="_success-text">
                                            <td>
                                                <b><CheckCircleOutlined /> </b>
                                                <b>Khách đã thanh toán </b>
                                            </td>
                                            <td>
                                                <InputNumber value={khachDaThanhToan - giamGia}
                                                    min={0}
                                                    max={khachThanhToan + tienTip}
                                                    onChange={(value) => {
                                                        const tong = khachThanhToan + tienTip;
                                                        setKhachDaThanhToan(value);
                                                        if (value < tong) {
                                                            setTienCongNo(tong - value);
                                                        } else {
                                                            setTienCongNo(0);
                                                            setNgayTatToan(null);
                                                        }
                                                    }}
                                                    className="input-none-02"
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                />
                                            </td>
                                        </tr>

                                        {showCongNo()}


                                        <tr className="tr-border0">
                                            <td colSpan={2}>
                                                <p><b>Chọn phương thức thanh toán:</b></p>
                                                <Radio.Group
                                                    block
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setHinhThucThanhToan(val);
                                                        if (val === 2) {
                                                            setClassPhiCaThe('');
                                                        } else {
                                                            setClassPhiCaThe('_hidden');
                                                        }
                                                    }}
                                                    options={[
                                                        { label: 'Tiền mặt', value: 1 },
                                                        { label: 'Thẻ', value: 2 },
                                                        { label: 'Chuyển khoản', value: 3 },
                                                    ]}
                                                    optionType="button"
                                                    buttonStyle="solid"
                                                    value={hinhThucThanhToan}
                                                />
                                            </td>
                                        </tr>

                                        {/* Phí cà thẻ */}
                                        <tr className={classPhiCaThe}>
                                            <td colSpan={2}>

                                                <InputNumber placeholder="Phí cà thẻ"
                                                    value={phiCaThe}
                                                    className="input100"
                                                    prefix={<b> Nhập phí cà thẻ (%): </b>}
                                                    suffix={<b>%</b>}
                                                    min={0}
                                                    max={100}
                                                    onChange={(value) => setPhiCaThe(value)}
                                                />
                                                <p className="_em">
                                                    <b>Phí cà thẻ </b>
                                                    {numberFormat(phiCaThe * (khachThanhToan + tienTip) / 100)}<sup>đ</sup>,
                                                    <b> Thực thu</b> {numberFormat((khachThanhToan + tienTip) - phiCaThe * (khachThanhToan + tienTip) / 100)}<sup>đ</sup>
                                                </p>

                                            </td>
                                        </tr>

                                        <tr>
                                            <td colSpan={2}>
                                                <p>Ghi chú thêm</p>
                                                <TextArea placeholder="Ghi chú thêm"
                                                    value={note}
                                                    onChange={(value) => setNote(value.target.value)} />

                                            </td>
                                        </tr>
                                        <tr className="main-btn-thanhtoan">
                                            <td colSpan={2}>
                                                <Button className="btn-success"
                                                    onClick={() => { payment() }}
                                                >
                                                    <CheckOutlined />
                                                    HOÀN THÀNH
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Drawer>
        </div>
    );
}
