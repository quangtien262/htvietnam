import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { cloneDeep, initial, set } from "lodash";
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

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    CloudOutlined, MehOutlined, DownOutlined,
    RiseOutlined, CloseCircleOutlined,
    PlusCircleOutlined, CheckOutlined,
    DeleteOutlined, CheckCircleOutlined,
    EditOutlined, CloseSquareOutlined,
    EyeOutlined, PlusSquareOutlined,
    ClockCircleOutlined, FormOutlined,
    FileTextOutlined,
    UserOutlined,
    CaretRightOutlined, FileAddOutlined
} from "@ant-design/icons";

import { optionEntries, showInfo } from "../../../Function/common";
import { HTBankingQR } from "../../../Function/generateQR";

import "../../../../css/form.css";

import { callApi } from "../../../Function/api";

import { formatValueForm } from "../../../Function/input";

import { DON_VI_SERVICE } from "../../../Function/constant";

import { inArray, parseJson, numberFormat, removeByIndex } from "../../../Function/common";

import dayjs from "dayjs";
const daysInMonth_default = dayjs().daysInMonth();
const { RangePicker } = DatePicker;
export default function Dashboard(props: any) {

    const formDataDefault = {
        so_ngay_thue: daysInMonth_default,
        so_nguoi: 1,
        ngay_hen_dong_tien: 5,
    };

    const dataService_empty = {
        name: null,
        price_default: 0,
        per_default: 'Người',
        price_total: 0,
        note: '',
    };
    const itemService_default = props.serviceDefault;


    const [dataService, setDataService] = useState(itemService_default);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.datas);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [soNguoi, setSoNguoi] = useState(1);
    const [tienPhong, setTienPhong] = useState(0);
    const [tienCoc, setTienCoc] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState(daysInMonth_default);
    const [soNgayThue, setSoNgayThue] = useState(daysInMonth_default);
    const [tienTraCoc, setTienTraCoc] = useState(0);
    const [tienGiamGia, setTienGiamGia] = useState(0);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);

    const [uploading, setUploading] = useState(false);

    const [formEdit] = Form.useForm();
    const [dataAction, setDataAction] = useState({ id: 0 });
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [isDraft, setIsDraft] = useState(2);
    const [note_applyAll, setNote_applyAll] = useState(false);

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: props.pageConfig.currentPage,
            pageSize: props.pageConfig.perPage,
            position: ["bottonRight"],
            total: props.pageConfig.total,
            onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
        },
    });

    function setPagination(pagination: { page?: number; pageSize?: number }) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }

    const onFinishFormEdit = (values: any) => {
        console.log('dataService', dataService);

        if (values.start_date) {
            values.start_date = values.start_date.format('YYYY-MM-DD');
        }
        if (values.end_date) {
            values.end_date = values.end_date.format('YYYY-MM-DD');
        }

        values.services = dataService;
        values.id = dataAction.id;
        values.total =dataService.reduce((sum: number, item: any) => sum + (item.price_total ?? 0), 0) + tienPhong + tienCoc - (tienTraCoc ?? 0) - (tienGiamGia ?? 0);
        values.tien_phong = tienPhong;
        values.tien_coc = tienCoc;

        setLoadingTable(true);
        // save
        axios.post(route('contract.update'), values).then((response) => {
            if (response.data.status_code === 200) {
                message.success("Đã lưu dữ liệu thành công");
                // location.reload();
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
            title: 'Khach hàng',
            dataIndex: 'khach_hang',
            key: 'id',
            render: (text: any, record: any) => {
                return <>
                    {record.id}
                    {record.ho_ten ? <Tag color="green">{record.ho_ten}</Tag> : ''}
                    <Tag color="blue">{props.room[record.room_id] ? props.room[record.room_id].name : ''}</Tag>
                </>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'ma_khach_hang',
            key: 'ma_khach_hang',
            render: (text: any, record: any) => {
                return <>
                    {record.contract_status_id
                        ?
                        <Tag color={props.status[record.contract_status_id].background}>{props.status[record.contract_status_id].name}</Tag>
                        :
                        <Tag>Chưa xác định</Tag>
                    }
                    <Popconfirm title="Chỉnh sửa hóa đơn"
                        showCancel={false}
                        okText="Đóng"
                        description={<div>
                            <Select
                                showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn phòng"
                                optionFilterProp="children"
                                options={optionEntries(props.status)}
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                onChange={(value) => {
                                    // Gọi API đổi trạng thái hóa đơn
                                    axios.post(route('aitilen.invoice.changeStatus'), {
                                        id: record.id,
                                        status_id: value,
                                    }).then((res) => {
                                        console.log('res', res);
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
                <a> <RiseOutlined /> Xem thống kê</a>
            </>,
            dataIndex: 'dich_vu',
            key: 'dich_vu',
            render: (text: any, record: any) => {
                return <>
                    {/* <Tag color="red">Tổng: {numberFormat(record.total)} </Tag>
                    <Tag color="purple">tiền phòng: {numberFormat(record.tien_phong)} </Tag>
                    {record.tien_coc ? <Tag color="warning">tiền cọc: {numberFormat(record.tien_coc)}</Tag> : ''}
                    {record.services.map((service: any, idx: number) => {
                        return <Tag color="blue" key={idx}>
                            {service.name}: {numberFormat(service.price_total)}
                        </Tag>
                    })} */}
                </>;
            }
        },
    ];

    function setDataEdit(record: any) {
        setDataAction(record);
        setIsOpenFormEdit(true);
        formEdit.setFieldsValue({
            contract_id: record.contract_id.toString(),
            room_id: record.room_id.toString(),
            contract_status_id: record.contract_status_id.toString(),
            ngay_hen_dong_tien: record.ngay_hen_dong_tien,
            so_nguoi: record.so_nguoi,
            tien_phong: record.tien_phong,
            tien_coc: record.tien_coc,
        });
        setDataService(record.services);
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
                    {/* <HTBankingQR
                        bankCode="TPB"
                        accountNumber="00299941001"
                        accountName="LUU QUANG TIEN"
                        amount={record.total}
                        description="2013017"
                        csrf_token={props.csrf_token}
                    /> */}
                </Col>
                <Col span={14}>
                    <ul className="ul-info">
                        <li><b><CaretRightOutlined /> Tiêu đề:</b> {record.name}</li>
                        <li><b><FileTextOutlined /> Mã hóa đơn:</b> {record.code}</li>
                        <li><b><FileTextOutlined /> Kỳ hóa đơn:</b> {record.month}/{record.year}</li>
                        <li><b><UserOutlined /> Khách hàng:</b> {record.ten_khach_hang}</li>
                        <li><b><CloudOutlined /> Phòng:</b> {props.room[record.room_id] ? props.room[record.room_id].name : ''}</li>
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
                            data_tmp[idx].aitilen_service_id = value;
                            setDataService(data_tmp);
                        }}
                        allowClear={true}
                        value={data.id}
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
        values.p = props.p;
        if (values.end_date) {
            values.end_date = values.end_date.format('YYYY-MM');
        }

        router.get(route('contract.index'), values);
    }

    function initialsFormSearch() {
        let result = props.searchData;
        if (props.searchData.month && props.searchData.year) {
            result.date = dayjs(props.searchData.year + '-' + String(props.searchData.month).padStart(2, '0'));
        }
        return result;
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
            <AdminLayout
                auth={props.auth}
                content={
                    <div>

                        <Divider orientation="left">
                            Danh sách hợp đồng
                        </Divider>

                        <Row>
                            {/* search  */}
                            <Col span={6} className="main-search-left">
                                <Form form={formSearch} layout="vertical"
                                    onFinish={inFinishSearch}
                                    initialValues={initialsFormSearch()}
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
                                                        onChange={(value, user: any) => {

                                                        }}
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
                            <Col span={18} className="main-content02">
                                <Row>
                                    <Col className="text-left" span={12}>
                                        <Button className="btn-success _left"
                                            icon={<CheckOutlined />}
                                            disabled={!hasSelected}
                                            loading={loadingBtnDelete}
                                            onClick={() => { setIsModalXoaOpen(true); }}
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
                                            icon={<FileAddOutlined />}
                                            onClick={() => {
                                                setIsOpenFormEdit(true);
                                                setDataAction({ id: 0 });
                                            }}
                                        >
                                            Tạo nhanh hóa đơn tháng
                                        </Button>

                                        <Button style={{ marginLeft: 8 }} type="primary"
                                            icon={<PlusSquareOutlined />}
                                            onClick={() => {
                                                setIsOpenFormEdit(true);
                                                setDataAction({ id: 0 });
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
                            onOk={async () => {
                                const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [idAction]));
                                if (result.status === 200) {
                                    message.success("Đã hủy đơn thành công");
                                    location.reload();
                                } else {
                                    message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }}
                            okText="Xác nhận hủy đơn"
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

                        <Modal title={dataAction.id === 0 ? "Thêm mới hợp đồng" : "Chỉnh sửa hợp đồng"}
                            open={isOpenFormEdit}
                            onOk={() => {
                                formEdit.submit();
                            }}
                            okText="Tạo hợp đồng "
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
                                                        <b>Tổng tiền phòng, cọc & dịch vụ dự tính:</b>
                                                    </td>
                                                    <td className="text-left">
                                                        <b className="_red">{numberFormat(dataService.reduce((sum: number, item: any) => sum + (item.price_total ?? 0), 0) + tienPhong + tienCoc)}</b>
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

                    </div>
                }
            />
        </div>
    );
}
