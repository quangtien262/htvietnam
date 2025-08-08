import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";

import { Link, router } from "@inertiajs/react";

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
    DatePicker,
    Divider,
    Badge,Tabs,
    Col,Image,Carousel ,
    Breadcrumb,Radio, List
} from "antd";

import axios from "axios";
import {
    PrinterOutlined,
    CloseSquareOutlined ,StarFilled,
    SearchOutlined,
    PlusCircleOutlined,
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



import "../../../../css/form.css";

import { inArray, parseJson, numberFormat } from "../../../Function/common";

import { khachHangInfo } from "../../../Components/khach_hang_info";

import { checkBtnActive } from "../../../Components/hoa_don_info";

import { cloneDeep } from "lodash";
import dayjs from "dayjs";

import {callApi} from "../../../Function/api";
import {MOC_THOI_GIAN} from "../../../Function/constant";
import { routeSales } from "../../../Function/config_route";

export default function Dashboard(props) {

    const { RangePicker } = DatePicker;
    const dateFormat = 'YYYY/MM/DD';

    const [formSearch] = Form.useForm();
    const [mocThoiGian, setMocThoiGian] = useState(props.mocThoiGian);
    const [khoangThoiGian, setKhoangThoiGian] = useState(!props.khoangThoiGian[0] ? props.khoangThoiGian : [dayjs(props.khoangThoiGian[0]), dayjs(props.khoangThoiGian[1])]);
    const [keyword, setKeyword] = useState(props.searchData.sm_keyword ? props.searchData.sm_keyword : '');
    const [loadingTable, setLoadingTable] = useState(false);

    
    const [user, setUser] = useState([]);
    
    const [hoaDon, setHoaDon] = useState(props.hoaDon.data);
    const [hoaDonChiTiet, setHoaDonChiTiet] = useState([]);

    const [idAction, setIdAction] = useState(0);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [modalKhachHangInfo, setModalKhachHangInfo] = useState(false);
    const [khachHangData, setKhachHangData] = useState([]);

    const [loadingLichSuMuaHang, setLoadingLichSuMuaHang] = useState(false);
    const [lichSuMuaHang, setLichSuMuaHang] = useState([]);
    const [lichSuThanhToan, setLichSuThanhToan] = useState([]);
    const [modal_confirmLoading, setModal_confirmLoading] = useState(false);

    const [daThanhToan, setDaThanhToan] = useState(0);
    const [tongCongNo, setTongCongNo] = useState(0);
    const [ngayTatToan, setNgayTatToan] = useState(dayjs());

    const [isModalTatToan, setIsModalTatToan] = useState(false);
    const [soTienCongNoThanhToan, setSoTienCongNoThanhToan] = useState(0);
    const [soTienCongNoThanhToan_max, setSoTienCongNoThanhToan_max] = useState(0);
    const [tienCongNo_phuongThucTT, setTienCongNo_phuongThucTT] = useState(null);

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
            title: 'Khách hàng',
            dataIndex: 'ten_khach_hang',
            key: 'name',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'TongChiPhi',
            key: 'TongChiPhi',
            render: (record) => {
                return <span>{numberFormat(record)}</span>
            }
        },
        {
            title: 'Thanh toán',
            dataIndex: 'thanh_toan',
            key: 'thanh_toan',
            render: (record) => {
                return <span>{numberFormat(record)}</span>
            }
        },
        {
            title: 'Thời gian',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (record) => {
                return <span>{dayjs(record).format('DD/MM/YYYY')}</span>
            }
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

    
    function hoaDonInfo(hoaDonChiTiet, hoaDon) {
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
                                <button className="btn-print"
                                    onClick={() => {
                                        setIsModalTatToan(true);
                                        setSoTienCongNoThanhToan(hoaDon.cong_no);
                                        setSoTienCongNoThanhToan_max(hoaDon.cong_no);
                                        setIdAction(hoaDon.id);
                                        setTienCongNo_phuongThucTT(null);
                                    }}
                                >
                                    <CheckOutlined /> Thanh toán công nợ
                                </button>
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
                    {/* Tiền tip */}
                    <tr>
                        <td colSpan={2}>
                            {checkBtnActive(hoaDon)}
                        </td>
                        <td className="text-right _bold">Tiền tip: </td>
                        <td>{numberFormat(hoaDon.tien_tip)}</td>
                    </tr>
                    {/* Thành tiền */}
                    <tr>
                        <td colSpan={2}>
                        </td>
                        <td className="text-right _bold">Thành tiền: </td>
                        <td>{numberFormat(hoaDon.thanh_toan)}</td>
                    </tr>
                    {/* Công nợ */}
                    <tr>
                        <td colSpan={2}>
                        </td>
                        <td className="text-right _bold">Đã thanh toán: </td>
                        <td>{numberFormat(hoaDon.cong_no)}</td>
                    </tr>
                    {/* Công nợ */}
                    <tr>
                        <td colSpan={2}>
                        </td>
                        <td className="text-right _bold">Công nợ: </td>
                        <td>{numberFormat(hoaDon.cong_no)}</td>
                    </tr>
                </tbody>
                
            </table>
                
            </Col>
        </Row>
    }

    const expandedRowRender = (record) => {

        // load data
        if(!hoaDonChiTiet[record.id]) {
            axios.post(route("hoaDon.getHoaDonChiTiet"), { id: record.id })
                .then((response) => {
                    console.log('response', response);
                    if(response.status === 200) {
                        const data = response.data.data;
                        // set hdon chi tiet
                        let hoaDonChiTiet_tmp = cloneDeep(hoaDonChiTiet);
                        hoaDonChiTiet_tmp[record.id] = data.hoaDonChiTiet;
                        setHoaDonChiTiet(hoaDonChiTiet_tmp);

                        // set lich su thanh toan
                        const lichSuThanhToan_tmp = cloneDeep(lichSuThanhToan);
                        lichSuThanhToan_tmp[record.id] = data.phieuThu;
                        setLichSuThanhToan(lichSuThanhToan_tmp);

                        // set khach hang
                        let khachHangData_tmp = cloneDeep(khachHangData);
                        khachHangData_tmp[record.id] = data.khachHangData;
                        setKhachHangData(khachHangData_tmp);
                    }
                    
                })
                .catch((error) => {
                    message.error("Lỗi tải hóa đơn chi tiết");
                }
            );
        }

        const columnLichSuThanhToan = [
            {
                title: 'Mã phiếu thu',
                dataIndex: 'code',
                key: 'code'
            },
            {
                title: 'Thanh toán',
                dataIndex: 'so_tien',
                key: 'so_tien',
                render: (record) => {
                    return <span>{numberFormat(record)}</span>
                }
            },
            {
                title: 'Thời gian',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (record) => {
                    return record ? <span>{dayjs(record).format('DD/MM/YYYY')}</span> : ''
                }
            }
        ];
        
        let item = [
            {
                label: 'Thông tin', //hh/dv
                key: '1',
                children: hoaDonInfo(hoaDonChiTiet, record),
            },
            {
                label: <span>Thông tin khách hàng </span>, // dv
                key: '2',
                children: <Col>
                    <Row colSpan={24}>
                        { khachHangData[record.id] ? khachHangInfo(khachHangData[record.id]) : '' }
                    </Row>
                </Col>,
            },
            {
                label: <span>Lịch sử thanh toán</span>, // dv
                key: '3',
                children: <Table
                    loading={loadingLichSuMuaHang}
                    columns={columnLichSuThanhToan}
                    dataSource={lichSuThanhToan[record.id]}
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

    const search = (value) => {
        let val = value.target.value;
        if(val !== keyword) {
            formSearch.submit();
        }
        
        // formSearch.submit();
    }

    const onFinishSearch = (values) => {
        
        values.mocThoiGian = mocThoiGian;

        if(khoangThoiGian[0]) {
            console.log('khoangThoiGian', khoangThoiGian);
            values.khoangThoiGian = khoangThoiGian.map((item) => {
                return item.format("YYYY-MM-DD");
            });      
        } else {
            values.khoangThoiGian = null;
        }
        
        setLoadingTable(true);
        router.get(route("hoaDon.index"),values);
    }
    
    function searchByTime(type) {
        setMocThoiGian(type);
        setKhoangThoiGian([null, null]);
        formSearch.submit();
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

                        <Modal title="THANH TOÁN CÔNG NỢ" 
                            open={isModalTatToan} 
                            okText="Xác nhận thanh toán"
                            cancelText="Hủy"
                            loading={true}
                         
                            onCancel={()=>setIsModalTatToan(false)}
                            onOk={() => {
                                    if(!tienCongNo_phuongThucTT) {
                                        message.error('Vui lòng chọn phương thức thanh toán');
                                        return false;
                                    }
                                    axios.post(route("tatToanCongNo"), {
                                                loai_chung_tu: 'hoa_don',
                                                chung_tu_id: idAction,
                                                so_tien: soTienCongNoThanhToan,
                                                hinh_thuc_thanh_toan_id: tienCongNo_phuongThucTT,
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
                            >
                                <div>
                                    <table className="table-sub">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <b>Số tiền thanh toán:</b>
                                                </td>
                                                <td>
                                                    <InputNumber value={soTienCongNoThanhToan} 
                                                        min={1}
                                                        max={soTienCongNoThanhToan_max}
                                                        formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")} 
                                                        onChange={(value) => setSoTienCongNoThanhToan(value)}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><b>Phương thức thanh toán:</b></td>
                                                <td>
                                                    <Radio.Group
                                                        value={tienCongNo_phuongThucTT}
                                                        block
                                                        options={[
                                                            { label: 'Tiền mặt', value: 1 },
                                                            { label: 'Thẻ', value: 2 },
                                                            { label: 'Chuyển khoản', value: 3 },
                                                        ]}
                                                        optionType="button"
                                                        buttonStyle="solid"
                                                        onChange={(e) => {
                                                            setTienCongNo_phuongThucTT(e.target.value);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                     <span> </span>
                                    
                                    <p> </p>
                                        
                                    <p>Sau khi xác nhận thanh toán, hệ thống sẽ cập nhật và đồng bộ lại toàn bộ dữ liệu liên quan đến phiếu nhập hàng này, gồm có phiếu chi, sổ quỹ, công nợ</p>
                                    
                                </div>
                                
                        </Modal>

                        <Row>
                            <Col sm={{span:24}}>
                                <Link href={route('hoaDon.create')}>
                                    <Button type="primary" className="_right">
                                        <PlusCircleOutlined />Thêm mới
                                    </Button>
                                </Link>
                            </Col>

                            <Col sm={{span:24}}>
                                <br />
                            </Col>

                            <Col sm={{ span: 6 }}>
                                <Form
                                    name="basic"
                                    layout="vertical"
                                    onFinish={onFinishSearch}
                                    // onFinishFailed={onFinishSearchFailed}
                                    autoComplete="off"
                                    form={formSearch}
                                    initialValues={props.searchData}
                                >
                                    <Row gutter={24} className="main-search-left">

                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='sm_keyword' label='Từ khoá'>
                                                <Input onBlur={search} />
                                            </Form.Item>
                                        </Col>

                                        {/* thoi gian */}
                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <h3 className="title-search02">Thời gian</h3>

                                            <label>Chọn nhanh</label>
                                            <Popconfirm title="Chọn nhanh theo các mốc thời gian xác định" 
                                                placement="right"
                                                showCancel={false}
                                                okText="Đóng"
                                                onConfirm={()=>true}
                                                description={<table className="table-sub">
                                                    <thead>
                                                        <tr>
                                                            <th>Ngày/Tuần</th>
                                                            <th>Tháng/Quý</th>
                                                            <th>Theo năm</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td><a onClick={()=>searchByTime('today')}>Hôm nay</a></td>
                                                            <td><a onClick={()=>searchByTime('month')}>Tháng này</a></td>
                                                            <td><a onClick={()=>searchByTime('year')}>Năm nay</a></td>
                                                        </tr>
                                                        <tr>
                                                            <td><a onClick={()=>searchByTime('yesterday')}>Hôm qua</a></td>
                                                            <td><a onClick={()=>searchByTime('lastMonth')}>Tháng trước</a></td>
                                                            <td><a onClick={()=>searchByTime('lastYear')}>Năm trước</a></td>
                                                        </tr>
                                                        <tr>
                                                            <td><a onClick={()=>searchByTime('thisWeek')}>Tuần này</a></td>
                                                            <td><a onClick={()=>searchByTime('30day')}>30 ngày qua</a></td>
                                                            <td><a onClick={()=>searchByTime('all')}>Toàn thời gian</a></td>
                                                        </tr>
                                                        <tr>
                                                            <td><a onClick={()=>searchByTime('lastWeek')}>Tuần trước</a></td>
                                                            <td><a onClick={()=>searchByTime('thisQuarter')}>Quý này</a></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td><a onClick={()=>searchByTime('7day')}>07 ngày qua</a></td>
                                                            <td><a onClick={()=>searchByTime('lastQuarter')}>Quý trước</a></td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>}
                                            >
                                                <Input readOnly={true} value={MOC_THOI_GIAN[mocThoiGian]} />
                                            </Popconfirm>
                                            
                                            <br/><br/>
                                            
                                            <label>Tùy chọn khoảng thời gian</label>
                                            <RangePicker
                                                placeholder={['Bắt đầu','Kết thúc']}
                                                format={dateFormat}
                                                value={khoangThoiGian}
                                                onChange={(value) => {
                                                    console.log('val', value);
                                                    setKhoangThoiGian(value);
                                                    setMocThoiGian('');
                                                    formSearch.submit();
                                                }}
                                            />
                                        </Col>

                                        {/* Nhóm hàng */}
                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='customer_group_id' 
                                                label={<span>Nhóm <a target="new" href={route('data.tblName', ['customer_group'])}><BarsOutlined /></a></span>}>
                                                <Checkbox.Group onChange={search} 
                                                    className="list-checkbox01"
                                                    options={props.customerGroup.map((u) => {
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

                                        {/* Thương hiệu */}
                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='hinh_thuc_thanh_toan_id' 
                                                label={<div>Phương thức TT </div>}>
                                                <Checkbox.Group
                                                    onChange={(value) => {
                                                        console.log('value', value);
                                                        formSearch.submit();
                                                    }} 
                                                    options={[
                                                        { label: 'Tiền mặt', value: '1' },
                                                        { label: 'Chuyển khoản', value: '3' },
                                                        { label: 'Thẻ', value: '2' },
                                                    ]
                                                    }
                                                />
                                                
                                            </Form.Item>
                                        </Col>

                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='status' label='Trạng thái'>
                                            <Radio.Group
                                                style={{ display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 8,}}
                                                onChange={search}
                                                options={[
                                                    { value: 0, label: 'Đã tất toán' },
                                                    { value: 1, label: 'Còn công nợ' },
                                                ]}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='is_recycle_bin' label=''>
                                                <Checkbox.Group
                                                    onChange={(value) => {
                                                        formSearch.submit();
                                                    }} 
                                                    options={[
                                                        { value: '1', label: 'Hóa đơn đã xóa' },
                                                    ]
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>


                                    </Row>
                                </Form>
                            </Col>
                            <Col sm={{ span: 18 }}>
                                <Table
                                    columns={columns}
                                    loading={loadingTable}
                                    expandable={{
                                        expandedRowRender,
                                        defaultExpandedRowKeys: ['1'],
                                    }}
                                    dataSource={hoaDon}
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
