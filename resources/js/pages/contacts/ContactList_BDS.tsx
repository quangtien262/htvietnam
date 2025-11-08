import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API } from "../../common/api";
import cloneDeep from "lodash/cloneDeep";
import {
    Button, List,
    Table, DatePicker,
    message, FloatButton,
    Modal, Space,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Row, Col,
    Checkbox,
    Tag,
    Divider,
    Image,
    Upload,
    Dropdown,
    MenuProps,
} from "antd";


import {
    CloudOutlined, MehOutlined, DownOutlined,
    RiseOutlined, CloseCircleOutlined,
    PlusCircleOutlined, CheckOutlined, HomeOutlined,
    DeleteOutlined, CheckCircleOutlined,
    EditOutlined, CloseSquareOutlined,
    EyeOutlined, PlusSquareOutlined,
    ClockCircleOutlined, FormOutlined,
    FileTextOutlined, InsertRowAboveOutlined,
    UserOutlined,
    CaretRightOutlined, LoginOutlined
} from "@ant-design/icons";


import "../../../css/form.css";

import { optionEntries, showInfo } from "../../function/common";
import { DON_VI_SERVICE } from "../../function/constant";
import { inArray, parseJson, numberFormat, removeByIndex } from "../../function/common";


const daysInMonth_default = dayjs().daysInMonth();
const { RangePicker } = DatePicker;

const ContactList_BDS: React.FC = () => {
    // const { id } = useParams();
    // const [searchParams] = useSearchParams();
    // const status = searchParams.get("status");

    // state
    const formDataDefault = {
        so_ngay_thue: daysInMonth_default,
        so_nguoi: 1,
        ngay_hen_dong_tien: 5,
    };

    const dataService_empty = {
        id: null,
        price_default: 0,
        per_default: 'Người',
        price_total: 0,
        note: '',
    };
    const dataService_thangMay = {
        id: '7',
        price_default: 50000,
        per_default: 'Người',
        price_total: 50000,
        note: '',
    };
    // const itemService_default = props.serviceDefault;


    const [dataService, setDataService] = useState([]);


    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState([]); // props.datas
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalActiveOpen, setIsModalActiveOpen] = useState(false);
    const [soNguoi, setSoNguoi] = useState(1);
    const [tienPhong, setTienPhong] = useState(0);
    const [tienCoc, setTienCoc] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState(daysInMonth_default);
    const [soNgayThue, setSoNgayThue] = useState(daysInMonth_default);
    const [tienTraCoc, setTienTraCoc] = useState(0);
    const [tienGiamGia, setTienGiamGia] = useState(0);

    // state login
    const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
    const [confirmLoginSuccess, setConfirmLoginSuccess] = useState(false);
    const [loadingLogin, setLoadingLogin] = useState(false);

    const [isOpenFormEditService, setIsOpenFormEditService] = useState(false);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [searchParams, setSearchParams] = useState({});

    // modal statistics
    const [isModalStatisticsOpen, setIsModalStatisticsOpen] = useState(false);
    const [statisticsData, setStatisticsData] = useState<any>(null);
    const [loadingStatistics, setLoadingStatistics] = useState(false);

    // upload excel
    const [fileList, setFileList] = useState([]);

    const [uploading, setUploading] = useState(false);

    const [formEdit] = Form.useForm();
    const [dataAction, setDataAction] = useState({ id: 0 });
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [isDraft, setIsDraft] = useState(2);
    const [note_applyAll, setNote_applyAll] = useState(false);

    const [props, setProps] = useState([]);

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            position: ["bottonRight"],
            total: 0,
            onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
        },
    });

    function fetchData(request = {}) {
        setLoadingTable(true);
        axios.post(API.contractBDSIndexApi, request)
            .then((res: any) => {
                const propsTmp = res.data.data;
                setProps(res.data.data);
                setDataSource(propsTmp.datas);
                setDataService(propsTmp.serviceDefault);
                setLoadingTable(false);
                setTableParams({
                    pagination: {
                        current: propsTmp.pageConfig.currentPage,
                        pageSize: propsTmp.pageConfig.perPage,
                        position: ["bottonRight"],
                        total: propsTmp.pageConfig.total,
                        onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
                    },
                });
            })
            .catch((err: any) => console.error(err));

    }
    useEffect(() => {
        fetchData();
    }, []);

    function search(request = {}) {
        setLoadingTable(true);
        axios.post(API.contractBDSIndexApi, request)
            .then((response: any) => {
                const res = response.data.data
                setDataSource(res.datas);
                setTableParams({
                    pagination: {
                        current: res.pageConfig.currentPage,
                        pageSize: res.pageConfig.perPage,
                        position: ["bottonRight"],
                        total: res.pageConfig.total,
                        onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
                    },
                });
            })
            .catch((err: any) => console.error(err));

    }

    // login function
    function loginCustomer(item) {
        setIsModalLoginOpen(true);
        setDataAction(item);
    }

    function submitLoginCustomer() {
        setLoadingLogin(true);
        axios.post(API.loginCustomer, { id: dataAction.user_id })
            .then((response) => {
                if (response.data.status_code === 200) {
                    setConfirmLoginSuccess(true);
                } else {
                    message.error("Đăng nhập thất bại");
                }
                setLoadingLogin(false);
                setIsModalLoginOpen(false);
                setConfirmLoginSuccess(true);
            })
            .catch((error) => {
                message.error("Đăng nhập thất bại");
                setLoadingLogin(false);
            });
    }

    function setPagination(pagination: { page?: number; pageSize?: number }) {
        // router.get(
        //     route("data.index", [props.table.id, props.searchData]),
        //     pagination
        // );
    }

    const onFinishFormEdit = (values: any) => {
        if (values.start_date) {
            values.start_date = values.start_date.format('YYYY-MM-DD');
        }
        if (values.end_date) {
            values.end_date = values.end_date.format('YYYY-MM-DD');
        }
        // add values
        values.services = dataService;
        values.id = dataAction.id;
        values.tien_phong = tienPhong;
        values.tien_coc = tienCoc;
        values.total = dataService.reduce((sum: number, item: any) => sum + (item.price_total > 0 ? item.price_total : 0), 0) + tienPhong + tienCoc - (tienTraCoc ?? 0) - (tienGiamGia ?? 0);
        values.total_service = dataService.reduce((sum: number, item: any) => sum + (item.price_total > 0 ? item.price_total : 0), 0);
        values.total_phi_co_dinh = dataService.reduce((sum: number, item: any) => sum + (item.price_total > 0 ? item.price_total : 0), 0) + tienPhong;
        setLoadingTable(true);
        // save
        axios.post(API.updateContract, values).then((response) => {
            if (response.data.status_code === 200) {
                message.success("Đã lưu dữ liệu thành công");
                setIsOpenFormEdit(false);

                if (dataAction.id == 0) {
                    // add data
                    const newData = {
                        ...response.data.data,
                        id: response.data.data.id
                    };
                } else {
                    // update data
                    const updatedData = {
                        ...response.data.data,
                        id: dataAction.id
                    };
                }
                search(searchParams);
            } else {
                message.error("Đã lưu dữ liệu thất bại");
            }
            setLoadingTable(false);
        }).catch((error) => {
            message.error("Lưu dữ liệu thất bại");
        });
    };

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: 'khach_hang',
            key: 'id',
            render: (text: any, record: any) => {
                return <>
                    <b>{record.ho_ten ? <span>{record.ho_ten}</span> : ''}</b>
                    <br />
                    <em >0{record.so_nguoi}Người</em>
                    <br />
                    <em>{record.end_date}</em>
                </>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'ma_khach_hang',
            key: 'ma_khach_hang',
            render: (text: any, record: any) => {
                return <>
                    {props.room[record.room_id] ? <Tag color="blue">{props.room[record.room_id].name}</Tag> : ''}
                    {record.contract_status_id
                        ?
                        <Tag color={props.status[record.contract_status_id].color}>{props.status[record.contract_status_id].name}</Tag>
                        :
                        <Tag>Chưa xác định</Tag>
                    }
                    <Popconfirm title="Sửa trạng thái hơp đồng"
                        showCancel={false}
                        okText="Đóng"
                        description={<div>
                            <Select
                                showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn trạng thái hóa đơn"
                                optionFilterProp="children"
                                options={optionEntries(props.status)}
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                onChange={(value) => {
                                    // Gọi API đổi trạng thái hóa đơn
                                    axios.post(API.fastEditContract, {
                                        id: record.id,
                                        column: 'contract_status_id',
                                        value: value,
                                    }).then((res) => {
                                        if (res.data.status_code === 200) {
                                            message.success('Đã đổi trạng thái thành công');
                                            // Cập nhật lại bảng nếu cần
                                            let newData = dataSource.map((item: any) => {
                                                if (item.id === record.id) {
                                                    return { ...item, contract_status_id: value };
                                                }
                                                return item;
                                            });
                                            setDataSource(newData);
                                        } else {
                                            message.error(res.data.message || 'Đổi trạng thái thất bại');
                                        }
                                    }).catch(() => {
                                        message.error('Đổi trạng thái thất bại');
                                    });
                                }}
                            />
                        </div>}>
                        <a className="float-btn-option"><FormOutlined /></a>
                    </Popconfirm>
                </>;
            }
        },
        {
            title: <>
                <span>Dịch vụ</span>
                <span> | </span>
                <a onClick={() => fetchStatistics()}> <RiseOutlined /> Xem thống kê</a>
            </>,
            dataIndex: 'dich_vu',
            key: 'dich_vu',
            render: (text: any, record: any) => {
                // chuẩn hóa services: có thể là mảng hoặc JSON string
                const services: any[] = Array.isArray(record.services)
                    ? record.services
                    : (parseJson(record.services) || []);

                return <>
                    <Tag color="red">Ser: {numberFormat(record.total_service)} </Tag>
                    <Tag color="red">fix: {numberFormat(record.total_phi_co_dinh)} </Tag>
                    <Tag color="#01a70f">Phòng: {numberFormat(record.gia_thue)} </Tag>
                    {record.tien_coc ? <Tag color="#bb9e02">Cọc: {numberFormat(record.tien_coc)}</Tag> : ''}

                    {services.map((service: any, idx: number) => {
                        const serviceName = service.name ?? service.name ?? 'xxx';
                        const price = service.price ?? service.price_default ?? 0;
                        return (
                            <Tag color="blue" key={idx}>
                                {serviceName}: {numberFormat(price)}
                            </Tag>
                        );
                    })}


                    <Tag color="red">Tổng: {numberFormat(record.total)} </Tag>

                    {/* fast edit dv */}
                    <a className="float-btn-option" onClick={() => { setDataEdit(record); }}>
                        <FormOutlined />
                    </a>
                </>;
            }
        },
    ];

    function setDataEdit(record: any) {
        setDataAction(record);
        setIsOpenFormEdit(true);

        // helper parse an toàn
        const toDayjs = (d: any) => (d ? dayjs(d) : null);

        formEdit.setFieldsValue({
            id: record.id?.toString(),
            room_id: record.room_id?.toString(),
            contract_status_id: record.contract_status_id?.toString(),

            // convert sang dayjs
            // ...existing code...
            // start_date: record.start_date,
            // end_date: record.end_date,
            start_date: toDayjs(record.start_date),
            end_date: toDayjs(record.end_date),

            gia_thue: record.gia_thue,
            tien_coc: record.tien_coc,
            ky_thanh_toan: record.ky_thanh_toan,
            so_nguoi: record.so_nguoi,
            ngay_hen_dong_tien: record.ngay_hen_dong_tien,
            total: record.total,

            user_id: record.user_id.toString(),
            ho_ten: record.ho_ten,
            dob: record.dob ? dayjs(record.dob) : undefined,
            phone: record.phone,
            email: record.email,
            cccd: record.cccd,
            ngay_cap: record.ngay_cap ? dayjs(record.ngay_cap) : undefined,
            noi_cap: record.noi_cap,
            hktt: record.hktt,

            note: record.note,
            phi_moi_gioi: record.phi_moi_gioi,
        });
        console.log('record.services', record.services);

        setSoNguoi(record.so_nguoi);
        setTienPhong(record.gia_thue);
        setTienCoc(record.tien_coc);
        setDataService(record.services ? (Array.isArray(record.services) ? record.services : parseJson(record.services)) : []);

    }

    function fetchStatistics() {
        setLoadingStatistics(true);
        setIsModalStatisticsOpen(true);

        axios.post(API.contractStatistics, { searchData: searchParams })
            .then((res: any) => {
                console.log('Contract Statistics response:', res.data);
                if (res.data.status_code === 200) {
                    setStatisticsData(res.data.data);
                } else {
                    message.error(res.data.message || 'Lỗi lấy thống kê!');
                }
                setLoadingStatistics(false);
            })
            .catch((err: any) => {
                console.error(err);
                message.error('Lỗi kết nối server!');
                setLoadingStatistics(false);
            });
    }

    const expandedRowRender = (record: any, index: number) => {

        const items: MenuProps['items'] = [
            {
                label: <a onClick={() => {
                    setDataEdit(record);
                }}
                >Cập nhật</a>,
                key: '1',
                icon: <EditOutlined />,
            },
            {
                label: <a onClick={() => { setDataAction(record) }}>Active</a>,
                key: '2',
                icon: <CheckCircleOutlined />,
            },
            {
                label: 'Hủy hóa đơn',
                key: '3',
                icon: <CloseSquareOutlined />,
                danger: true,
                disabled: false,
            },
        ];

        const menuProps = {
            items,
        };
        return <>
            <div className="float-btn-option">
                <Dropdown menu={menuProps}>
                    <Button className="btn-default02">
                        <Space>
                            Thao tác
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>
            <Row>
                <Col span={10}>
                    {record.images ? <Image width={150} src={record.images} /> : <Image className="image-list" src='/images/contract-updating.png'></Image>}
                </Col>
                <Col span={14}>
                    <ul className="ul-info">
                        <li><b><CaretRightOutlined /> Tiêu đề:</b> {record.name}</li>
                        <li><b><FileTextOutlined /> Mã Hợp đồng:</b> {record.code}</li>
                        <li>
                            <b><UserOutlined /> Khách hàng: </b>
                            {record.ho_ten}
                            <span>  </span>
                            <button className="btn-default" onClick={() => loginCustomer(record)}> <LoginOutlined /> Login</button>
                        </li>
                        <li><b><CloudOutlined /> Phòng:</b> {props.room && props.room[record.room_id] ? props.room[record.room_id].name : ''}</li>
                        <li><b><MehOutlined /> Số người ở:</b> {record.so_nguoi}</li>
                        <li><b><ClockCircleOutlined /> Ngày hẹn đóng tiền:</b> {record.ngay_hen_dong_tien}</li>
                    </ul>
                </Col>
                <Col span={24}>
                    <table className="table-info01">
                        <thead>
                            <tr>
                                <th className="text-left">Dịch vụ</th>
                                <th className="text-right">Giá</th>
                                <th className="text-right">Đơn vị</th>
                                <th className="text-right">Thành tiền</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-left">Tiền phòng</td>
                                <td className="text-right">{numberFormat(record.gia_thue)}</td>
                                <td className="text-right">Phòng</td>
                                <td className="text-right"><b>{numberFormat(record.gia_thue)}</b></td>
                                <td></td>
                            </tr>
                            {record.tien_coc ? <tr>
                                <td className="text-left">Tiền cọc</td>
                                <td className="text-right">{numberFormat(record.tien_coc)}</td>
                                <td className="text-right">VNĐ</td>
                                <td className="text-right"><b>{numberFormat(record.tien_coc)}</b></td>
                                <td></td>
                            </tr> : ''}

                            {/* show services */}
                            {(() => {
                                if (record.services) {
                                    return record.services.map((service: any, idx: number) => {
                                        const serviceName = service.name ?? service.service_name ?? 'Dịch vụ';
                                        const per = service.per ?? service.per_default ?? '';
                                        const price = service.price ?? service.price_default ?? 0;
                                        const priceTotal = service.price_total ?? price;
                                        return (
                                            <tr key={idx}>
                                                <td className="text-left">{serviceName}</td>
                                                <td className="text-right">{numberFormat(price)}</td>
                                                <td className="text-right">{per}</td>
                                                <td className="text-right"><b>{numberFormat(priceTotal)}</b></td>
                                                <td>{service.note ?? ''}</td>
                                            </tr>
                                        );
                                    });
                                }
                            })()}

                            <tr>
                                <td colSpan={3} className="text-right _red"><b>Tổng</b></td>
                                <td className="text-right _red"><b>{numberFormat(record.total)}</b></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </Col>
            </Row>
        </>;
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState({ expandedRowRender, defaultExpandedRowKeys: ['1'] });


    const EditableCell = (props: any) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = props;
        let inputNode;
        return <td {...restProps}>{children}</td>;
    };
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    const confirmDelete = () => {
        setIsOpenConfirmDelete(true);
    };
    const handleCancelDelete = () => {
        setIsOpenConfirmDelete(false);
    };

    function addSub() {
        let dataDetail_tmp = cloneDeep(dataService);
        dataDetail_tmp.push(dataService_empty);
        setDataService(dataDetail_tmp);
    }

    function total(soNgay: number, dataService_new: any, tongSoNgay: number, soNguoi_new: number) {
        // let dataService_tmp = cloneDeep(dataService);
        dataService_new.forEach((data: any, idx: number) => {
            let total = (data.price_default ?? 0);
            if (['KWH', 'M3'].includes(data.per_default)) {
                total = 0;
            } else {
                if (data.per_default === 'Người') {
                    total = total * soNguoi_new;
                }
            }
            // tính số tiền theo ngày tương ứng
            total = (total * soNgay / tongSoNgay);

            // Làm tròn lên hàng nghìn
            total = Math.ceil(total);
            dataService_new[idx].price_total = total;
        });
        setDataService(dataService_new);
    }

    function showFormDataDetail() {
        return dataService.map((data: any, idx: number) => {
            return <tr key={idx}>
                {/* chon dịch vụ */}
                <td>
                    <Select className="select03"
                        placeholder="Chọn dich vụ"
                        optionFilterProp="children"
                        onChange={(value, info) => {
                            let isError = false;

                            // check duplication
                            if (isError) {
                                return false;
                            }

                            let data_tmp = cloneDeep(dataService);
                            data_tmp[idx].id = value;
                            setDataService(data_tmp);
                        }}
                        allowClear={true}
                        value={data.id ? data.id.toString() : null}
                        options={optionEntries(props.service)}
                    />

                </td>

                {/* giá */}
                <td className="td-input">
                    <InputNumber min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        value={data.price_default} onChange={(value) => {
                            let data_tmp = cloneDeep(dataService);
                            data_tmp[idx].price_default = value;
                            total(soNgayThue, data_tmp, daysInMonth, soNguoi);
                        }} />
                </td>

                {/* đơn vị */}
                <td>
                    <Select className="select03"
                        placeholder="Đơn vị"
                        optionFilterProp="children"
                        onChange={(value) => {
                            let data_tmp = cloneDeep(dataService);
                            data_tmp[idx].per_default = value;
                            total(soNgayThue, data_tmp, daysInMonth, soNguoi);
                        }}
                        value={data.per_default.toString()}
                        options={DON_VI_SERVICE}
                    />
                </td>

                {/* Tổng */}
                <td className="td-input">
                    <b>{numberFormat(data.price_total)}</b>
                </td>

                {/* ghi chú */}
                <td className="td-input">
                    <Input value={data.note} onChange={(e) => {
                        let data_tmp = cloneDeep(dataService);
                        if (note_applyAll) {
                            data_tmp.forEach((item, index) => {
                                item.note = e.target.value ?? '';
                            });
                            setDataService(data_tmp);
                        } else {
                            data_tmp[idx].note = e.target.value ?? '';
                            setDataService(data_tmp);
                        }
                    }} />
                </td>
                <td>
                    <a className="btn-delete02"
                        onClick={() => {
                            let dataDetail_tmp = cloneDeep(dataService);
                            dataDetail_tmp = removeByIndex(dataDetail_tmp, idx);
                            total(soNgayThue, dataDetail_tmp, daysInMonth, soNguoi);
                        }}
                    >
                        <CloseCircleOutlined />
                    </a>
                </td>
            </tr>
        });
    }

    const inFinishSearch = (values: any) => {
        // values.p = props.p;
        if (values.end_date) {
            values.end_date = values.end_date.format('YYYY-MM');
        }
        setSearchParams(values);
        setLoadingTable(true);
        axios.post(API.searchContract, values)
            .then((response: any) => {
                setLoadingTable(false);
                const res = response.data.data
                setDataSource(res.datas);
                setTableParams({
                    pagination: {
                        current: res.pageConfig.currentPage,
                        pageSize: res.pageConfig.perPage,
                        position: ["bottonRight"],
                        total: res.pageConfig.total,
                        onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
                    },
                });
            })
            .catch((err: any) => console.error(err));
    }


    function initialsFormatData() {
        let result: any = {
            so_nguoi: 1,
            ngay_hen_dong_tien: 5,
            so_ngay_thue: daysInMonth_default,
        };
        return result;
    }


    return (
        <div>

            <Divider orientation="left">
                Danh sách hợp đồng
            </Divider>

            <Row>
                {/* search  */}
                <Col span={5} className="main-search-left">
                    <Form form={formSearch} layout="vertical"
                        onFinish={inFinishSearch}
                    >
                        {/* <div className="form-item02">

                                    </div> */}
                        <List
                            className="list-search"
                            dataSource={[
                                {
                                    title: <span> Từ khóa</span>,
                                    description: <>
                                        <Form.Item
                                            name="keyword"
                                        >
                                            <Input allowClear={true} placeholder="Từ khóa" onBlur={() => formSearch.submit()} />
                                        </Form.Item>
                                    </>,
                                },
                                {
                                    title: <span> Thời hạn</span>,
                                    description: <>
                                        <Form.Item
                                            name="end_date"
                                        >
                                            <DatePicker
                                                picker="month"
                                                onChange={() => formSearch.submit()}
                                                style={{ width: "100%" }}
                                                format="MM/YYYY"
                                                placeholder={"Chọn tháng/năm"}
                                            />
                                        </Form.Item>
                                    </>,
                                },
                                {
                                    title: <span> Trạng thái</span>,
                                    description: <>
                                        <Form.Item
                                            name="status"
                                        >
                                            <Select
                                                onChange={() => formSearch.submit()}
                                                showSearch
                                                allowClear={true}
                                                style={{ width: "100%" }}
                                                placeholder="Trạng thái hợp đồng"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                options={optionEntries(props.status)}
                                            />
                                        </Form.Item>
                                    </>,
                                },
                                {
                                    title: 'Tòa nhà',
                                    description: <Form.Item
                                        name="apm"
                                    >
                                        <Select
                                            showSearch
                                            allowClear={true}
                                            onChange={() => formSearch.submit()}
                                            mode="multiple"
                                            style={{ width: "100%" }}
                                            placeholder="Chọn tòa nhà"
                                            optionFilterProp="children"
                                            options={optionEntries(props.apm)}
                                            filterOption={(input, option) =>
                                                (option?.label ?? "")
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                        />
                                    </Form.Item>,
                                },
                                {
                                    title: 'Phòng',
                                    description: <Form.Item
                                        name="room"
                                    >
                                        <Select
                                            showSearch
                                            allowClear={true}
                                            style={{ width: "100%" }}
                                            placeholder="Chọn phòng"
                                            optionFilterProp="children"
                                            options={optionEntries(props.room)}
                                            onChange={() => formSearch.submit()}
                                            filterOption={(input, option) =>
                                                (option?.label ?? "")
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                        />
                                    </Form.Item>,
                                },
                            ]}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.title}
                                        description={item.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </Form>
                </Col>

                {/* content */}
                <Col span={19} className="main-content02">
                    <Row>
                        <Col className="text-left" span={12}>
                            <Button className="btn-success _left"
                                icon={<CheckOutlined />}
                                disabled={!hasSelected}
                                loading={loadingBtnDelete}
                                onClick={() => { setIsModalActiveOpen(true); }}
                            >
                                Active {hasSelected ? `${selectedRowKeys.length}` : ''}
                            </Button>
                            <span> </span>
                            <Button type="primary"
                                icon={<DeleteOutlined />}
                                disabled={!hasSelected}
                                loading={loadingBtnDelete}
                                onClick={() => { setIsModalXoaOpen(true); }}
                            >
                                Xóa {hasSelected ? `${selectedRowKeys.length}` : ''}
                            </Button>
                        </Col>

                        <Col className="text-right" span={12}>
                            <Button style={{ marginLeft: 8 }} type="primary"
                                icon={<PlusSquareOutlined />}
                                onClick={() => {
                                    setIsOpenFormEdit(true);
                                    setDataAction({ id: 0 });
                                    setDataService(props.serviceDefault);
                                    formEdit.resetFields();
                                    setSoNguoi(1);
                                    setTienCoc(0);
                                    setTienPhong(0);
                                    setDaysInMonth(daysInMonth_default);
                                }}
                            >
                                Thêm mới
                            </Button>
                        </Col>

                        <Col span={24}><br /></Col>
                    </Row>

                    <Table
                        size="small"
                        // scroll={{ x: 1500, y: 7000 }}
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        loading={loadingTable}
                        pagination={tableParams.pagination}
                        dataSource={dataSource}
                        columns={columns}
                        rowSelection={rowSelection}
                        // rowClassName="editable-row"
                        // className="table-index"
                        expandable={expandable}
                    />
                </Col>

            </Row>

            {/* modal xóa */}
            <Modal title="Xác nhận xóa"
                open={isModalXoaOpen}
                okText="Xác nhận hủy đơn"
                cancelText="Hủy"
                maskClosable={true}
                width={500}
                onCancel={() => { setIsModalXoaOpen(false); }}
                onOk={() => {
                    axios.post(API.deleteContract, {
                        ids: selectedRowKeys,
                        searchParams: searchParams,
                    }).then((response) => {
                        console.log('response:', response);
                        if (response.data.status_code === 200) {
                            message.success("Đã hủy đơn thành công");
                            setDataSource(response.data.data.data);
                            setIsModalXoaOpen(false);
                            // search(searchParams);
                        } else {
                            message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại111");
                        }


                    }).catch((e) => {
                        console.log(e);
                        message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                    }
                    );
                }}
            >
                <ul>
                    <li>Các thông tin về data này sẽ bị chuyển đến thùng rác</li>
                    <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                    <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                </ul>
            </Modal>

            <Modal title="Xác nhận active"
                open={isModalActiveOpen}
                okText="Xác nhận kích hoạt"
                cancelText="Hủy"
                maskClosable={true}
                width={500}
                onCancel={() => { setIsModalActiveOpen(false); }}
                onOk={() => {
                    axios.post(route('contract.deleteMultiple'), {
                        ids: selectedRowKeys,
                    }).then((response) => {
                        const result = response.data;
                        if (result.status === 200) {
                            message.success("Đã kích hoạt thành công");
                            search(searchParams);
                        } else {
                            message.error("Đã kích hoạt thất bại, vui lòng tải lại trình duyệt và thử lại");
                        }
                        if (result.status === 200) {
                            message.success("Đã kích hoạt thành công");
                            search(searchParams);
                        } else {
                            message.error("Đã kích hoạt thất bại, vui lòng tải lại trình duyệt và thử lại");
                        }
                    }).catch(() => {
                        message.error("Đã kích hoạt thất bại, vui lòng tải lại trình duyệt và thử lại");
                    }
                    );
                }}
            >
                <ul>
                    <li>Các thông tin về data này sẽ được <b>public cho khách hàng xem</b></li>
                    <li>Sau khi active, các thông tin này <b>vẫn có thể chỉnh sửa lại</b></li>
                </ul>
            </Modal>

            {/* form thêm sửa */}
            <Modal title={dataAction.id === 0 ? "Thêm mới hợp đồng" : "Chỉnh sửa hợp đồng"}
                open={isOpenFormEdit}
                onOk={() => {
                    formEdit.submit();
                }}
                okText={dataAction.id === 0 ? "Tạo hợp đồng" : "Cập nhật hợp đồng"}
                cancelText="Hủy"
                maskClosable={false}
                width={1000}
                onCancel={() => { setIsOpenFormEdit(false); }}>
                <Form
                    form={formEdit}
                    layout="vertical"
                    onFinish={onFinishFormEdit}
                    initialValues={initialsFormatData()}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="user_id"
                                label="Khách hàng"
                                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                            >
                                <Select
                                    showSearch
                                    style={{ width: "100%" }}
                                    placeholder="Chọn khách hàng"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={props.users}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="room_id"
                                label="Phòng"
                                rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
                            >
                                <Select
                                    showSearch
                                    style={{ width: "100%" }}
                                    placeholder="Chọn phòng"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={optionEntries(props.room)}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="contract_status_id"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select
                                    showSearch
                                    style={{ width: "100%" }}
                                    placeholder="Chọn phòng"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={optionEntries(props.status)}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="start_date"
                                label={<><span>Ngày bắt đầu</span> {showInfo('Ngày bắt đầu hợp đồng')}</>}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                            >
                                <DatePicker className="form-item01"
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder={"Chọn tháng/năm"}
                                    onChange={(value) => {
                                        let day = 0;
                                        if (value) {
                                            // value là kiểu dayjs, lấy số ngày của tháng đã chọn
                                            day = value.daysInMonth()
                                        } else {
                                            day = dayjs().daysInMonth();
                                        }
                                        setDaysInMonth(day);
                                        // Cập nhật lại số tiền
                                        total(soNgayThue, dataService, day, soNguoi);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="end_date"
                                label={<><span>Ngày kết thúc</span> {showInfo('Ngày kết thúc hợp đồng')}</>}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                            >
                                <DatePicker className="form-item01"
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder={"Chọn tháng/năm"}
                                    onChange={(value) => {
                                        let day = 0;
                                        if (value) {
                                            // value là kiểu dayjs, lấy số ngày của tháng đã chọn
                                            day = value.daysInMonth()
                                        } else {
                                            day = dayjs().daysInMonth();
                                        }
                                        setDaysInMonth(day);
                                        // Cập nhật lại số tiền
                                        total(soNgayThue, dataService, day, soNguoi);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="ngay_hen_dong_tien"
                                label={<><span>Ngày đóng tiền</span> {showInfo('Ngày hẹn đóng tiền của kỳ thanh toán')}</>}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                            >
                                <InputNumber min={1} max={31} className="form-item01" />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="so_nguoi"
                                label="Số người ở"
                                rules={[{ required: true, message: 'Vui lòng chọn số người ở' }]}
                            >
                                <InputNumber className="form-item01"
                                    min={1}
                                    onChange={(value) => {
                                        const v = value ?? 1;
                                        setSoNguoi(v);
                                        total(soNgayThue, dataService, daysInMonth, v);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <table className="table-salary">
                                <thead>
                                    <tr>
                                        <th>
                                            <span>Chọn dịch vụ</span>
                                            <br />
                                            <a onClick={() => {
                                                // Clone, không mutate props
                                                const defaultServices = [...(props.serviceDefault || [])];

                                                // Thêm thang máy cho các tòa 8,7,27 (nếu chưa có)
                                                if (dataAction.apartment_id && [8, 7, 27].includes(Number(dataAction.apartment_id))) {
                                                    const hasElevator = defaultServices.some(
                                                        (s: any) => (s?.code === 'THANG_MAY') || (String(s?.name || '').toLowerCase() === 'thang máy')
                                                    );
                                                    if (!hasElevator) {
                                                        defaultServices.push({
                                                            ...dataService_thangMay,
                                                        });
                                                    }
                                                }

                                                setDataService(defaultServices);
                                            }}
                                            ><InsertRowAboveOutlined /> Mặc định</a>
                                        </th>
                                        <th>Giá</th>
                                        <th>Đơn vị</th>
                                        <th>Thành tiền</th>
                                        <th>
                                            Mô tả thêm
                                            {showInfo('Mô tả thêm cho dịch vụ, nếu chọn áp dụng tất cả, thì ghi chú này sẽ được áp dụng cho tất cả các dịch vụ')}
                                            <br />
                                            <Checkbox checked={note_applyAll}
                                                onChange={(e) => { setNote_applyAll(e.target.checked) }}
                                            >
                                                <a className="text-normal">Áp dụng tất cả</a>
                                            </Checkbox>
                                        </th>
                                        <th>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    <tr>
                                        <td>Tiền phòng</td>
                                        <td>
                                            <Form.Item
                                                name="gia_thue"
                                            >
                                                <InputNumber
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    onChange={(value) => {
                                                        setTienPhong(value ?? 0);
                                                    }}
                                                />
                                            </Form.Item>
                                        </td>
                                        <td>Tháng</td>
                                        <td><b>{numberFormat(tienPhong)}</b></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Tiền cọc</td>
                                        <td>
                                            <Form.Item
                                                name="tien_coc"
                                            >
                                                <InputNumber
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    onChange={(value) => {
                                                        setTienCoc(value ?? 0);
                                                    }}
                                                />
                                            </Form.Item>
                                        </td>
                                        <td>VNĐ</td>
                                        <td><b>{numberFormat(tienCoc)}</b></td>
                                        <td></td>
                                    </tr>

                                    {showFormDataDetail()}

                                    <tr>
                                        <td colSpan={6} className="main-result-submitform">
                                            <ul>
                                                {/* {result} */}
                                            </ul>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td colSpan={6} className="text-left">
                                            <a className="add-item01" onClick={() => addSub()}>
                                                <span className="icon-b"><PlusCircleOutlined /> Thêm dịch vụ</span>
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="text-right">
                                            <b>Tổng tiền dịch vụ hàng tháng:</b>
                                        </td>
                                        <td className="text-left">
                                            <b className="_red">{numberFormat(dataService.reduce((sum: number, item: any) => sum + (item.price_total > 0 ? item.price_total : 0), 0))}</b>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="text-right">
                                            <b>Tổng phí cố định hàng tháng</b>:
                                            <em>(tiền phòng & dịch vụ)</em>
                                        </td>
                                        <td className="text-left">
                                            <b className="_red">{numberFormat(dataService.reduce((sum: number, item: any) => sum + (item.price_total > 0 ? item.price_total : 0), 0) + tienPhong)}</b>
                                        </td>
                                        <td></td>
                                    </tr>

                                    <tr>
                                        <td colSpan={3} className="text-right">
                                            <b>Tổng tiền phòng, cọc & dịch vụ dự tính:</b>
                                        </td>
                                        <td className="text-left">
                                            <b className="_red">{numberFormat(dataService.reduce((sum: number, item: any) => sum + (item.price_total > 0 ? item.price_total : 0), 0) + tienPhong + tienCoc)}</b>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>

                            </table>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal title="Xác nhận đăng nhập"
                open={isModalLoginOpen}
                onOk={() => submitLoginCustomer()}
                okText="Đăng nhập"
                cancelText="Hủy"
                onCancel={() => setIsModalLoginOpen(false)}>
                <p><CaretRightOutlined /> <em>Bạn sẽ login vào tài khoản của khách hàng <b>{dataAction?.ho_ten}</b></em></p>
                <p><CaretRightOutlined /> <em>Sau khi login có thể truy cập trực vào trang profile của tài khoản này thông qua website mà không cần đăng nhập.</em></p>
            </Modal>

            <Modal title={<span className='text-success'>Đăng nhập thành công</span>}
                open={confirmLoginSuccess}
                onOk={loginCustomer}
                okText={<a href="/user" target="new">Truy cập vào trang profile</a>}
                cancelText="Đóng"
                loading={loadingLogin}
                onCancel={() => setConfirmLoginSuccess(false)}>
                <p className="text-success"><em>Bạn đã đăng nhập thành công tài khoản: <b>{dataAction?.ho_ten}</b></em></p>
            </Modal>

            {/* Modal Thống kê hợp đồng */}
            <Modal
                title={<><RiseOutlined /> Thống kê hợp đồng</>}
                open={isModalStatisticsOpen}
                onCancel={() => setIsModalStatisticsOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalStatisticsOpen(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {loadingStatistics ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CloudOutlined style={{ fontSize: '48px', color: '#1890ff' }} spin />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : statisticsData ? (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={12}>
                                <div style={{ padding: 16, background: '#f0f5ff', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Tổng số hợp đồng</div>
                                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                                        {statisticsData.total_contracts}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ padding: 16, background: '#fff7e6', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Tổng giá trị</div>
                                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
                                        {numberFormat(statisticsData.grand_total)} ₫
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                        <HomeOutlined /> Tiền phòng
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                                        {numberFormat(statisticsData.total_gia_thue)} ₫
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ padding: 16, background: '#fff1f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                        <CloudOutlined /> Dịch vụ
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#cf1322' }}>
                                        {numberFormat(statisticsData.total_service_amount)} ₫
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ padding: 16, background: '#e6f7ff', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                        <CheckCircleOutlined /> Tiền cọc
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                                        {numberFormat(statisticsData.total_tien_coc)} ₫
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Divider orientation="left">Chi tiết dịch vụ</Divider>

                        {statisticsData.service_breakdown && statisticsData.service_breakdown.length > 0 ? (
                            <List
                                dataSource={statisticsData.service_breakdown}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={<span style={{ fontSize: 16 }}>{item.name}</span>}
                                            description={
                                                <div>
                                                    <Tag color="blue">{item.count} hợp đồng</Tag>
                                                </div>
                                            }
                                        />
                                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                                            {numberFormat(item.total_amount)} ₫
                                        </div>
                                    </List.Item>
                                )}
                                bordered
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                                <MehOutlined style={{ fontSize: 48 }} />
                                <p>Không có dịch vụ nào</p>
                            </div>
                        )}

                        {statisticsData.filters && Object.keys(statisticsData.filters).length > 0 && (
                            <div style={{ marginTop: 24, padding: 12, background: '#fafafa', borderRadius: 4 }}>
                                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Điều kiện lọc:</div>
                                {statisticsData.filters.status && (
                                    <Tag>Trạng thái: {statisticsData.filters.status}</Tag>
                                )}
                                {statisticsData.filters.room_id && (
                                    <Tag>Phòng ID: {statisticsData.filters.room_id}</Tag>
                                )}
                                {statisticsData.filters.apartment_id && (
                                    <Tag>Tòa nhà ID: {statisticsData.filters.apartment_id}</Tag>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        <MehOutlined style={{ fontSize: 48 }} />
                        <p>Chưa có dữ liệu thống kê</p>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default ContactList_BDS;
