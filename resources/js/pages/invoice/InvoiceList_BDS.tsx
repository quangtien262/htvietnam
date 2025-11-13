import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { cloneDeep, create, set } from 'lodash';

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

import axios from "axios";
import {
    CloudOutlined, MehOutlined, DownOutlined,
    RiseOutlined, CloseCircleOutlined, DollarOutlined,
    PlusCircleOutlined, CheckOutlined,
    DeleteOutlined, CheckCircleOutlined,
    EditOutlined, CloseSquareOutlined,
    EyeOutlined, RedoOutlined,
    ClockCircleOutlined, FormOutlined,
    FileTextOutlined, ExclamationCircleOutlined,
    UserOutlined,
    CaretRightOutlined, FlagOutlined
} from "@ant-design/icons";

import { optionEntries, showInfo } from "../../function/common";
import { HTBankingQR } from "../../function/generateQR";
import { callApi } from "../../function/api";
import { formatValueForm } from "../../function/input";
import { DON_VI_SERVICE } from "../../function/constant";
import { inArray, parseJson, numberFormat, removeByIndex } from "../../function/common";

import "../../../css/form.css";

const daysInMonth_default = dayjs().daysInMonth();
const { RangePicker } = DatePicker;


import { API } from "../../common/api";
import { act } from './../../../../node_modules/@types/react/index.d';

const InvoiceList_BDS: React.FC = () => {
    // gset/set params
    const [searchParams] = useSearchParams();
    const p = searchParams.get("p");

    const dataService_empty = {
        aitilen_service_id: null,
        name: null,
        price_default: 0,
        per_default: 'Người',
        price_total: 0,
        note: '',
    };

    const [itemServiceDefault, setItemServiceDefault] = useState();
    const [dataService, setDataService] = useState([]);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState([]);//props.datas
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [soNguoi, setSoNguoi] = useState(1);
    const [tienPhong, setTienPhong] = useState(0);
    const [tienCoc, setTienCoc] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState(daysInMonth_default);
    const [soNgayThue, setSoNgayThue] = useState(daysInMonth_default);
    const [tienTraCoc, setTienTraCoc] = useState(0);
    const [tienGiamGia, setTienGiamGia] = useState(0);
    const [formSearch] = Form.useForm();

    const [formEdit] = Form.useForm();
    const [dataAction, setDataAction] = useState({ id: 0 });
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);
    const [isReplaceAllContract, setIsReplaceAllContract] = useState(true);

    // modal active
    const [isModalRecalculateOpen, setIsModalRecalculateOpen] = useState(false);

    const [isModalActiveCurrentOpen, setIsModalActiveCurrentOpen] = useState(false);

    // modal statistics
    const [isModalStatisticsOpen, setIsModalStatisticsOpen] = useState(false);
    const [statisticsData, setStatisticsData] = useState<any>(null);
    const [loadingStatistics, setLoadingStatistics] = useState(false);

    // modal create data month
    const [isOpenModalCreateDataMonth, setIsOpenModalCreateDataMonth] = useState(false);
    const [month, setMonth] = useState<any>(null);

    // Active
    const [monthActive, setMonthActive] = useState<any>(null);
    const [isOpenModalActiveAll, setIsOpenModalActiveAll] = useState(false);
    const [isOpenModalActiveCurrent, setIsOpenModalActiveCurrent] = useState(false);
    const [loadingCreateDataMonth, setLoadingCreateDataMonth] = useState(false);
    const [loadingActive, setLoadingActive] = useState(false);

    const [isDraft, setIsDraft] = useState(2);
    const [note_applyAll, setNote_applyAll] = useState(false);

    const [props, setProps] = useState([]);
    const [searchData, setSearchData] = useState({});

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            position: ["bottonRight"],
            total: 0,
            onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
        },
    });

    function setPagination(pagination: { page?: number; pageSize?: number }) {
        // TODO:
        // router.get(
        //     route("data.index", [props.table.id, props.searchData]),
        //     pagination
        // );
    }

    function fetchData(request = {}) {
        setLoadingTable(true);
        axios.post(API.aitilen_invoiceIndexApi, request)
            .then((res: any) => {
                const propsTmp = res.data.data
                setProps(res.data.data);
                setDataSource(propsTmp.datas);
                setItemServiceDefault(propsTmp.serviceDefault);
                setDataService(propsTmp.serviceDefault);
                setTableParams({
                    pagination: {
                        current: propsTmp.pageConfig.currentPage,
                        pageSize: propsTmp.pageConfig.perPage,
                        total: propsTmp.pageConfig.total,
                    },
                });

                // set search data
                setSearchData({
                    year: propsTmp.searchData.year,
                    month: propsTmp.searchData.month,
                    status: propsTmp.searchData.status,
                });

                // set search form
                formSearch.setFieldValue('date', dayjs().year(propsTmp.searchData.year).month(propsTmp.searchData.month - 1));
                formSearch.setFieldValue('status', propsTmp.searchData.status);
                setLoadingTable(false);
            })
            .catch((err: any) => {
                console.error(err);
                message.error("Tải dữ liệu thất bại");
                setLoadingTable(false);
            });

    }
    useEffect(() => {
        fetchData();
    }, []);

    function refresh(request = {}) {
        setLoadingTable(true);
        axios.post(API.aitilen_searchInvoice, request)
            .then((res: any) => {
                console.log('Refresh response:', res.data);
                const response = res.data.data;
                setDataSource(response.datas);
                setTableParams({
                    pagination: {
                        current: response.pageConfig.currentPage,
                        pageSize: response.pageConfig.perPage,
                        total: response.pageConfig.total,
                    },
                });
                setLoadingTable(false);
            })
            .catch((err: any) => {
                console.error(err);
                message.error("Làm mới dữ liệu thất bại");
                setLoadingTable(false);
            });

    }

    function fetchStatistics() {
        setLoadingStatistics(true);
        setIsModalStatisticsOpen(true);

        axios.post(API.aitilen_invoiceStatistics, { searchData: searchData })
            .then((res: any) => {
                console.log('Statistics response:', res.data);
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

    const onFinishFormEdit = (values: any) => {
        if (values.ngay_hen_dong_tien) {
            values.ngay_hen_dong_tien = values.ngay_hen_dong_tien.format('YYYY-MM-DD');
        }

        if (values.date) {
            values.month = values.date.format('MM');
            values.year = values.date.format('YYYY');
            delete values.date;
        }

        values.services = dataService;
        values.id = dataAction.id;
        values.total = (Array.isArray(dataService) ? dataService.reduce((sum: number, item: any) => sum + (item.price_total ?? 0), 0) : 0) + tienPhong + tienCoc - (tienTraCoc ?? 0) - (tienGiamGia ?? 0);
        values.tien_phong = tienPhong;
        values.tien_coc = tienCoc;
        values.tra_coc = tienTraCoc;
        values.giam_gia = tienGiamGia;

        setLoadingTable(true);
        // save
        axios.post(API.aitilen_updateInvoice, values).then((response) => {
            if (response.data.status_code === 200) {
                message.success("Đã lưu dữ liệu thành công");
                refresh(searchData);
                setIsOpenFormEdit(false);
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
            title: 'Phòng',
            dataIndex: 'room_name',
            key: 'id',
            render: (text: any, record: any) => {
                return <>
                    <Tag color="blue">{props.room[record.room_id] ? props.room[record.room_id].name : ''}</Tag>
                    {record.ten_khach_hang ? <Tag color="green">{record.ten_khach_hang}</Tag> : ''}
                    {record.is_active ? <Tag color="cyan">Active</Tag> : <Tag color="red">Unactive</Tag>}
                </>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'ma_khach_hang',
            key: 'ma_khach_hang',
            render: (text: any, record: any) => {
                return <>
                    {record.aitilen_invoice_status_id
                        ?
                        <Tag color={props.status[record.aitilen_invoice_status_id].color}>{props.status[record.aitilen_invoice_status_id].name}</Tag>
                        :
                        <Tag>Chưa xác định</Tag>
                    }
                    <Popconfirm title="Trạng thái"
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
                                    axios.post(API.aitilen_changeInvoiceStatus, {
                                        id: record.id,
                                        status_id: value,
                                    }).then((res) => {
                                        if (res.data.status_code === 200) {
                                            message.success('Đã đổi trạng thái thành công');
                                            // Cập nhật lại bảng nếu cần
                                            let newData = dataSource.map((item: any) => {
                                                if (item.id === record.id) {
                                                    return { ...item, aitilen_invoice_status_id: value };
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
                return <>
                    <Tag color="red">Tổng: {numberFormat(record.total)} </Tag>
                    <Tag color="purple">tiền phòng: {numberFormat(record.tien_phong)} </Tag>
                    {record.tien_coc ? <Tag color="warning">tiền cọc: {numberFormat(record.tien_coc)}</Tag> : ''}
                    {Array.isArray(record.services) && record.services.map((service: any, idx: number) => {
                        return <Tag color="blue" key={idx}>
                            {service.name}: {numberFormat(service.price_total)}
                        </Tag>
                    })}

                    <Button className="float-btn-option btn-default" onClick={() => setDataEdit(record)}><FormOutlined /></Button>
                </>;
            }
        },
    ];

    function setDataEdit(record: any) {
        setDataAction(record);
        setIsOpenFormEdit(true);
        formEdit.setFieldsValue({
            date: dayjs().year(record.year).month(record.month - 1), // kỳ hợp đồng
            contract_id: record.contract_id.toString(),
            room_id: record.room_id.toString(),
            aitilen_invoice_status_id: record.aitilen_invoice_status_id.toString(),
            ngay_hen_dong_tien: record.ngay_hen_dong_tien ? dayjs(record.ngay_hen_dong_tien) : dayjs().date(5),
            so_ngay_thue: record.so_ngay_thue,
            so_nguoi: record.so_nguoi,
            tien_phong: record.tien_phong,
            tien_coc: record.tien_coc,
            tra_coc: record.tra_coc,
            giam_gia: record.giam_gia,
        });
        setDataService(Array.isArray(record.services) ? record.services : []);
        setSoNguoi(record.so_nguoi);
        setTienPhong(record.tien_phong);
        setTienCoc(record.tien_coc);
        setTienTraCoc(record.tra_coc);
        setTienGiamGia(record.giam_gia);
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
                    <Button>
                        <Space>
                            Thao tác
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>
            <Row>
                <Col span={10}>
                    <HTBankingQR
                        bankCode="TPB"
                        accountNumber="00299941001"
                        accountName="LUU QUANG TIEN"
                        amount={record.total}
                        description="2013017"
                        csrf_token={props.csrf_token}
                    />
                </Col>
                <Col span={14}>
                    <ul className="ul-info">
                        <li><b><FileTextOutlined /> Mã hóa đơn:</b> {record.code}</li>
                        <li><b><FlagOutlined /> Kỳ hóa đơn:</b> {record.month}/{record.year}</li>
                        <li><b><UserOutlined /> Khách hàng:</b> {record.ten_khach_hang}</li>
                        <li><b><UserOutlined /> Hợp Đồng:</b> {record.hop_dong}</li>
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
                                <td className="text-right">{numberFormat(record.tien_phong)}</td>
                                <td className="text-right">Phòng</td>
                                <td className="text-right"><b>{numberFormat(record.tien_phong)}</b></td>
                                <td></td>
                            </tr>
                            {record.tien_coc ? <tr>
                                <td className="text-left">Tiền cọc</td>
                                <td className="text-right">{numberFormat(record.tien_coc)}</td>
                                <td className="text-right">VNĐ</td>
                                <td className="text-right"><b>{numberFormat(record.tien_coc)}</b></td>
                                <td></td>
                            </tr> : ''}
                            {record.services.map((service: any, idx: number) => {
                                return <tr key={idx}>
                                    <td className="text-left">{service.name}</td>
                                    <td className="text-right">{numberFormat(service.price_default)}</td>
                                    <td className="text-right">{service.per_default}</td>
                                    <td className="text-right"><b>{numberFormat(service.price_total)}</b></td>
                                    <td>{service.note}</td>
                                </tr>
                            })}

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

    function createDataMonth() {
        if (!month) {
            message.error("Vui lòng chọn tháng/năm cần tạo dữ liệu");
            return;
        }
        setLoadingCreateDataMonth(true);

        // Gọi API tạo dữ liệu
        axios.post(API.aitilen_createInvoiceMonth, {
            month: month.format('MM'),
            year: month.format('YYYY'),
            is_replace_all_contract: isReplaceAllContract,
        }).then((res) => {
            if (res.data.status_code === 200) {
                message.success('Đã tạo dữ liệu tháng thành công');
                setIsOpenModalCreateDataMonth(false);
                fetchData();
            } else {
                message.error(res.data.message || 'Tạo dữ liệu tháng thất bại');
            }
            setLoadingCreateDataMonth(false);
        }).catch(() => {
            message.error('Tạo dữ liệu tháng thất bại');
            setLoadingCreateDataMonth(false);
        });
    }

    function activeDataMonth() {
        if (!monthActive) {
            message.error("Vui lòng chọn tháng/năm cần active hóa đơn");
            return;
        }
        setLoadingActive(true);

        // Gọi API tạo dữ liệu
        axios.post(API.aitilen_activeAllInvoice, {
            month: monthActive.format('MM'),
            year: monthActive.format('YYYY'),
            searchData: searchData,
        }).then((res) => {
            if (res.data.status_code === 200) {
                message.success('Đã active hóa đơn thành công');
                setIsOpenModalActiveAll(false);
                setDataSource(res.data.data.datas);
                setTableParams({
                    pagination: {
                        current: res.data.data.pageConfig.currentPage,
                        pageSize: res.data.data.pageConfig.perPage,
                        total: res.data.data.pageConfig.total,
                    },
                });
            } else {
                message.error(res.data.message || 'Active hóa đơn thất bại');
            }
            setLoadingActive(false);
        }).catch(() => {
            message.error('Active hóa đơn thất bại');
            setLoadingCreateDataMonth(false);
        });
    }

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

    function totalItem(data: any, idx: number) {
        const soNgayEffective = soNgayThue ?? daysInMonth;
        if (['kWh', 'm3', 'Xe'].includes(data.per_default)) {
            return <b>0</b>;
        }
        let total = (data.price_default ?? 0);
        if (data.per_default === 'Người') {
            total = total * soNguoi;
        }
        // tính số tiền theo ngày tương ứng
        // total = (total / daysInMonth) * soNgayEffective;

        // Làm tròn lên hàng nghìn
        total = Math.ceil(total / 100) * 100;

        let dataService_tmp = cloneDeep(dataService);
        dataService_tmp[idx].price_total = total;
        setDataService(dataService_tmp);
    }

    function total(soNgay: number, dataService_new: any, tongSoNgay: number, soNguoi_new: number) {
        // let dataService_tmp = cloneDeep(dataService);
        dataService_new.forEach((data: any, idx: number) => {
            let total = (data.price_default ?? 0);
            if (['kWh', 'm3'].includes(data.per_default)) {
                total = 0;;
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
        if (!dataService || !Array.isArray(dataService)) {
            return null;
        }
        return dataService.map((data: any, idx: number) => {
            return <tr key={idx}>
                {/* chon dịch vụ */}
                <td>
                    <Select className="select03"
                        placeholder="Chọn dich vụ"
                        optionFilterProp="children"
                        onChange={(value, info: any) => {
                            let isError = false;

                            // check duplication
                            if (isError) {
                                return false;
                            }

                            let data_tmp = cloneDeep(dataService);
                            data_tmp[idx].aitilen_service_id = value;

                            // Update giá và đơn vị từ service được chọn
                            if (info && info.info) {
                                data_tmp[idx].price_default = info.info.price || 0;
                                data_tmp[idx].per_default = info.info.per || 'Tháng';
                            }

                            // Tính lại tổng tiền
                            total(soNgayThue, data_tmp, daysInMonth, soNguoi);
                        }}
                        allowClear={true}
                        value={data.aitilen_service_id}
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
                        value={data.per_default}
                        options={DON_VI_SERVICE}
                    />
                </td>

                {/* Tổng */}
                <td className="td-input">
                    {
                        data.per_default === 'KWH' || data.per_default === 'm3'
                            ? <InputNumber min={0}
                                onChange={(value) => {
                                    let data_tmp = cloneDeep(dataService);
                                    data_tmp[idx].price_total = value;
                                    setDataService(data_tmp);
                                }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                value={data.price_total} />
                            : <b>{numberFormat(data.price_total)}</b>
                    }

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
        if (values.date) {
            values.month = values.date.format('MM');
            values.year = values.date.format('YYYY');
            delete values.date;
        }
        setSearchData(values);
        refresh(values);
    };

    function initialsFormatData() {
        let result: any = {
            // date: dayjs().year(props.searchData.year).month(props.searchData.month - 1),
            so_nguoi: 1,
            ngay_hen_dong_tien: dayjs().date(5),
            so_ngay_thue: daysInMonth_default,
        };
        return result;
    }

    const items: MenuProps['items'] = [
        {
            label: <a onClick={() => {
                setIsOpenFormEdit(true);
                setDataAction({ id: 0 });
                setDataService([]);
                formEdit.resetFields();
                setTienPhong(0);
                setTienCoc(0);
                setTienTraCoc(0);
                setTienGiamGia(0);
                setSoNguoi(1);
                setSoNgayThue(daysInMonth_default);
            }}
            >Thêm mới</a>,
            key: '1',
            icon: <EditOutlined />,
        },
        { type: 'divider' },
        {
            label: <a className="text-success" onClick={() => setIsOpenModalActiveAll(true)}>Active tất cả</a>,
            key: '2',
            icon: <CheckCircleOutlined />,
        },
        { type: 'divider' },
        {
            label: <a onClick={() => setIsOpenModalCreateDataMonth(true)}>Tạo nhanh hóa đơn tháng</a>,
            key: '3',
            icon: <CloseSquareOutlined />,
            danger: true,
            disabled: false,
        },
    ];

    const menuProps = {
        items,
    };

    // render
    return (
        <div>

            <Divider orientation="left">
                Danh sách hóa đơn
            </Divider>

            <Row>
                {/* search  */}
                <Col span={6} className="main-search-left">
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
                                    title: <span> Sắp xếp</span>,
                                    description: <>
                                        <Form.Item
                                            name="sort_by"
                                        >
                                            <Select
                                                onChange={() => formSearch.submit()}
                                                showSearch
                                                allowClear={true}
                                                style={{ width: "100%" }}
                                                placeholder="Chọn sắp xếp"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                options={[
                                                    { label: 'Tên phòng', value: 'room' },
                                                    { label: 'Tên khách hàng', value: 'user_name' },
                                                    { label: 'Tổng tiền tăng dần', value: 'total_asc' },
                                                    { label: 'Tổng tiền giảm dần', value: 'total_desc' },
                                                ]}
                                            />
                                        </Form.Item>
                                    </>,
                                },
                                {
                                    title: <span> Thời gian</span>,
                                    description: <>
                                        <Form.Item
                                            name="date"
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
                                    </>,
                                },
                                {
                                    title: 'Tòa nhà',
                                    description: <Form.Item
                                        name="apartment_ids"
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
                                        name="room_id"
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
                                {
                                    title: 'Hợp đồng',
                                    description: <>
                                        <Form.Item
                                            name="contract_id"
                                        >
                                            <Select
                                                showSearch
                                                allowClear={true}
                                                style={{ width: "100%" }}
                                                placeholder="Chọn hợp đồng"
                                                optionFilterProp="children"
                                                options={optionEntries(props.contract)}
                                                onChange={() => formSearch.submit()}
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                            />
                                        </Form.Item>
                                    </>,
                                },
                                {
                                    title: 'Active',
                                    description: <>
                                        <Form.Item
                                            name="active"
                                        >
                                            <Select
                                                showSearch
                                                allowClear={true}
                                                style={{ width: "100%" }}
                                                placeholder="Chọn trạng thái Active"
                                                optionFilterProp="children"
                                                options={[
                                                    { label: 'Active', value: '1' },
                                                    { label: 'Unactive', value: '0' },
                                                ]}
                                                onChange={() => formSearch.submit()}
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                            />
                                        </Form.Item>
                                    </>,
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
                <Col span={18} className="main-content02">
                    <Row>
                        <Col className="text-left" span={12}>
                            <Dropdown.Button
                                type="primary"
                                className="btn-dropdown _left"
                                disabled={!hasSelected}
                                onClick={() => setIsModalActiveCurrentOpen(true)}
                                menu={{
                                    items: [
                                        {
                                            key: '1',
                                            label: `Active ${hasSelected ? selectedRowKeys.length : ''} hóa đơn`,
                                            icon: <CheckOutlined />,
                                            onClick: () => setIsModalActiveCurrentOpen(true),
                                        },
                                        { type: 'divider' },
                                        {
                                            key: '2',
                                            label: `Tính lại tiền ${hasSelected ? selectedRowKeys.length : ''} hóa đơn`,
                                            icon: <DollarOutlined />,
                                            onClick: () => setIsModalRecalculateOpen(true),
                                        },
                                        { type: 'divider' },
                                        {
                                            key: '3',
                                            label: `Xóa ${hasSelected ? selectedRowKeys.length : ''} hóa đơn`,
                                            icon: <DeleteOutlined />,
                                            danger: true,
                                            onClick: () => setIsModalXoaOpen(true),
                                        },
                                    ],
                                }}
                            >
                                Active {hasSelected ? `(${selectedRowKeys.length})` : ''}
                            </Dropdown.Button>
                        </Col>

                        <Col className="text-right" span={12}>


                            <Dropdown.Button type="primary"
                                className="btn-dropdown _right"
                                onClick={() => {
                                    setIsOpenFormEdit(true);
                                    setDataAction({ id: 0 });
                                    setDataService([]);
                                    formEdit.resetFields();
                                    setTienPhong(0);
                                    setTienCoc(0);
                                    setTienTraCoc(0);
                                    setTienGiamGia(0);
                                    setSoNguoi(1);
                                    setSoNgayThue(daysInMonth_default);
                                }}
                                menu={{ items }}
                            >
                                <PlusCircleOutlined /> Thêm mới
                            </Dropdown.Button>

                            <Button className="btn-primary _right"
                                icon={<RedoOutlined />}
                                onClick={() => refresh(searchData)}
                            >
                                Refresh
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
                onOk={async () => {
                    // const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [idAction]));

                    const result = await axios.post(API.aitilen_deleteInvoice, {
                        ids: selectedRowKeys,
                        searchData: searchData,
                    });

                    if (result.status === 200) {
                        message.success("Đã xóa đơn thành công");
                        setDataSource(result.data.data.datas);
                        setTableParams({ ...tableParams, pagination: result.data.data.pagination });
                        setSelectedRowKeys([]);
                        setIsModalXoaOpen(false);
                    } else {
                        message.error("Đã xóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                    }
                }}
                okText="Xác nhận xóa đơn"
                cancelText="Hủy"
                maskClosable={true}
                // confirmLoading={confirmLoading}
                onCancel={() => { setIsModalXoaOpen(false); }}>
                <ul>
                    <li>Các thông tin về data này sẽ bị chuyển đến thùng rác</li>
                    <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                    <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                </ul>
            </Modal>



            <Modal title={dataAction.id === 0 ? "Thêm mới hóa đơn" : "Chỉnh sửa hóa đơn"}
                open={isOpenFormEdit}
                onOk={() => {
                    formEdit.submit();
                }}
                okText={dataAction.id === 0 ? "Thêm mới hóa đơn" : "Chỉnh sửa hóa đơn"}
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

                        <Col span={6}>
                            <Form.Item
                                name="contract_id"
                                label="Hợp đồng"
                            >
                                <Select
                                    showSearch
                                    style={{ width: "100%" }}
                                    placeholder="Chọn hợp đồng"
                                    optionFilterProp="children"
                                    allowClear={true}
                                    options={optionEntries(props.contract)}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    onChange={(value, user: any) => {
                                        formEdit.setFieldValue('room_id', user.info.room_id ? user.info.room_id.toString() : null);
                                    }}
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

                        <Col span={12}>
                            <Form.Item
                                name="aitilen_invoice_status_id"
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
                                name="date"
                                label={<><span>Kỳ HĐ</span> {showInfo('Thay đổi tháng, sẽ update lại tiền dịch vụ tương ứng với số ngày trên tháng')}</>}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                            >
                                <DatePicker className="form-item01"
                                    picker="month"
                                    style={{ width: "100%" }}
                                    format="MM/YYYY"
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
                                label={<><span>Ngày đóng tiền</span> {showInfo('Ngày hẹn đóng tiền')}</>}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                            >
                                <DatePicker className="form-item01" />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="so_nguoi"
                                label="Số người ở "
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
                        <Col span={6}>
                            <Form.Item
                                name="so_ngay_thue"
                                label={<span>Số ngày thuê <em className="text-normal">/{daysInMonth}</em> {showInfo('<Số ngày thuê> / <Tổng số ngày trong tháng> Thay đổi số ngày sẽ update lại số tiền dịch vụ trong tháng')}</span>}
                            >
                                <InputNumber className="form-item01"
                                    onChange={(value) => {
                                        const v = value ?? daysInMonth;
                                        setSoNgayThue(v);
                                        total(v, dataService, daysInMonth, soNguoi);
                                    }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <table className="table-salary">
                                <thead>
                                    <tr>
                                        <th>
                                            <span>Chọn dịch vụ</span>
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
                                                name="tien_phong"
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
                                            <b>Tổng tiền phòng & dịch vụ:</b>
                                        </td>
                                        <td className="text-left">
                                            <b className="_red">{numberFormat((Array.isArray(dataService) ? dataService.reduce((sum: number, item: any) => sum + (item.price_total ?? 0), 0) : 0) + tienPhong + tienCoc)}</b>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="text-right">
                                            <b>Trả cọc:</b>
                                        </td>
                                        <td className="text-left">
                                            <InputNumber className="input-number-normal input-none"
                                                value={tienTraCoc}
                                                min={0}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                onChange={(value) => {
                                                    setTienTraCoc(value);
                                                }}
                                            />
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="text-right">
                                            <b>Giảm giá:</b>
                                        </td>
                                        <td className="text-left">
                                            <InputNumber className="input-number-normal input-none"
                                                value={tienGiamGia}
                                                min={0}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                onChange={(value) => {
                                                    setTienGiamGia(value);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <Input.TextArea
                                                rows={2}
                                                placeholder="Ghi chú giảm giá"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td colSpan={3} className="text-right">
                                            <b>Tổng cộng:</b>
                                        </td>
                                        <td className="text-left">
                                            <b className="_red">{numberFormat((Array.isArray(dataService) ? dataService.reduce((sum: number, item: any) => sum + (item.price_total ?? 0), 0) : 0) + tienPhong + tienCoc - (tienTraCoc ?? 0) - (tienGiamGia ?? 0))}</b>
                                        </td>
                                        <td></td>
                                    </tr>


                                </tbody>

                                {/* {showTotalDetail()} */}


                            </table>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal title={<span><ExclamationCircleOutlined /> Xác nhận tạo data tháng</span>}
                open={isOpenModalCreateDataMonth}
                onOk={() => createDataMonth()}
                loading={loadingCreateDataMonth}
                okText="Xác nhận"
                cancelText="Hủy"
                maskClosable={true}
                onCancel={() => { setIsOpenModalCreateDataMonth(false); }}>
                <p><b>Chọn tháng cần tạo:</b> <DatePicker value={month} picker="month" onChange={(date) => setMonth(date)} /></p>
                <Checkbox checked={isReplaceAllContract}
                    onChange={(e) => setIsReplaceAllContract(e.target.checked)}
                >
                    <b className="_red">Ghi đè tất cả hợp đồng trước đó</b>(Nếu không chọn, chỉ tạo mới những hợp đồng chưa có hóa đơn trong tháng đã chọn)
                </Checkbox>

                <p> </p>

                <p><b>LƯU Ý QUAN TRỌNG:</b></p>
                <ul>
                    <li><em>Data sẽ được tạo mới theo tháng đã chọn dựa công thức trong hợp đồng (Trạng thái phải là đang hoạt động) kết hợp với số điện/nước của tháng trước đó</em></li>
                    <li><em>Cần review lại dữ liệu trước/sau khi tạo mới xem hóa đơn đã đúng chưa, có bị trùng không. </em></li>
                    <li><em>Hóa đơn sẽ ở trạng thái Unactive, để public cho khách hàng biết thì cần phải active hóa đơn</em></li>
                </ul>
            </Modal>

            <Modal title={<span><ExclamationCircleOutlined /> Active tất cả </span>}
                open={isOpenModalActiveAll}
                loading={loadingActive}
                onOk={() => activeDataMonth()}
                okText="Xác nhận"
                cancelText="Hủy"
                maskClosable={false}
                onCancel={() => { setIsOpenModalActiveAll(false); }}>
                <p><b>Chọn tháng cần active:</b> <DatePicker value={monthActive} picker="month" onChange={(date) => setMonthActive(date)} /></p>
                <p><b>LƯU Ý:</b></p>
                <ul>
                    <li><em>Data sẽ được tạo mới theo tháng tương ứng</em></li>
                    <li><em>Cần check lại dữ liệu trước/sau khi tạo mới để không bị trùng data</em></li>
                    <li><em>Hóa đơn sẽ ở trạng thái Unactive, để public cho khách hàng biết thì cần phải active hóa đơn</em></li>
                </ul>
            </Modal>



            {/* Active current */}
            <Modal title="Xác nhận active các hóa đơn đã chọn"
                open={isModalActiveCurrentOpen}
                loading={loadingCreateDataMonth}
                onOk={async () => {
                    setLoadingActive(true);
                    const result = await axios.post(API.aitilen_activeCurrentInvoice, {
                        ids: selectedRowKeys,
                        searchData: searchData,
                    });
                    if (result.status === 200) {
                        message.success("Đã active hóa đơn thành công");
                        setDataSource(result.data.data.datas);
                        setTableParams({ ...tableParams, pagination: result.data.data.pagination });
                        setSelectedRowKeys([]);
                    } else {
                        message.error("Đã active hóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                    }
                    setIsModalActiveCurrentOpen(false);
                    setLoadingActive(false);
                }}
                okText="Xác nhận active"
                cancelText="Hủy"
                maskClosable={false}
                onCancel={() => { setIsModalActiveCurrentOpen(false); }}>
                <ul>
                    <li>Các thông tin về data này sẽ được <em>public cho khách hàng xem</em></li>
                    <li>Sau khi active, các thông tin này <em>vẫn có thể chỉnh sửa lại</em></li>
                </ul>
            </Modal>

            <Modal title="Xác nhận tính lại tiền các hóa đơn đã chọn"
                open={isModalRecalculateOpen}
                loading={loadingCreateDataMonth}
                onOk={() => {
                    setLoadingActive(true);
                    axios.post(API.aitilen_recalculateInvoice, {
                        ids: selectedRowKeys,
                    }).then((result: any) => {
                        console.log('   result', result );
                        if (result.status === 200) {
                            message.success("Đã tính lại tiền hóa đơn thành công");
                            setSelectedRowKeys([]);
                            refresh(searchData);
                        } else {
                            message.error("Đã tính lại tiền hóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại11");
                        }
                        setIsModalRecalculateOpen(false);
                        setLoadingActive(false);
                    }).catch((error: any) => {
                        console.log(error);
                        message.error("Đã tính lại tiền hóa đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                        setIsModalRecalculateOpen(false);
                        setLoadingActive(false);
                    });
                }}
                okText="Xác nhận tính lại tiền"
                cancelText="Hủy"
                maskClosable={false}
                onCancel={() => { setIsModalActiveCurrentOpen(false); }}>
                <ul>
                    <li>Các thông tin về data này sẽ được <em>public cho khách hàng xem</em></li>
                    <li>Sau khi active, các thông tin này <em>vẫn có thể chỉnh sửa lại</em></li>
                </ul>
            </Modal>

            {/* Modal Thống kê */}
            <Modal
                title={<><RiseOutlined /> Thống kê hóa đơn</>}
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
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Tổng số hóa đơn</div>
                                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                                        {statisticsData.total_invoices}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ padding: 16, background: '#fff7e6', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Tổng cộng</div>
                                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
                                        {numberFormat(statisticsData.grand_total)} ₫
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={12}>
                                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                        <DollarOutlined /> Tổng tiền phòng
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                        {numberFormat(statisticsData.total_tien_phong)} ₫
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ padding: 16, background: '#fff1f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                        <CloudOutlined /> Tổng tiền dịch vụ
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#cf1322' }}>
                                        {numberFormat(statisticsData.total_service_amount)} ₫
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
                                                    <Tag color="blue">{item.count} lần sử dụng</Tag>
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
                                {statisticsData.filters.month && (
                                    <Tag>Tháng: {statisticsData.filters.month}/{statisticsData.filters.year}</Tag>
                                )}
                                {statisticsData.filters.status && (
                                    <Tag>Trạng thái: {statisticsData.filters.status}</Tag>
                                )}
                                {statisticsData.filters.room_id && (
                                    <Tag>Phòng ID: {statisticsData.filters.room_id}</Tag>
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

export default InvoiceList_BDS;
