import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { cloneDeep, set } from "lodash";
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Row, Col,
    Checkbox,
    notification,
    Divider,
    Image,
    Upload,
    Dropdown,
    DatePicker,
} from "antd";

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowRightOutlined,
    FormOutlined, CloseCircleOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseSquareOutlined,
    UploadOutlined,
    CaretRightOutlined, FileAddOutlined
} from "@ant-design/icons";

import { optionEntries, showInfo } from "../../../Function/common";

import "../../../../css/form.css";

import { callApi } from "../../../Function/api";

import { formatValueForm } from "../../../Function/input";

import { DON_VI_SERVICE } from "../../../Function/constant";

import { inArray, parseJson, numberFormat, removeByIndex } from "../../../Function/common";

import dayjs from "dayjs";
const daysInMonth_default = dayjs().daysInMonth();

export default function Dashboard(props: any) {

    const formDataDefault = {
        so_ngay: daysInMonth_default,
        so_nguoi: 1,
        ngay_hen_dong_tien: dayjs(),
    };

    const dataService_empty = {
        name: null,
        price_default: 0,
        per_default: 'Người',
        price_total: 0,
        note: '',
    };
    const itemService_default = props.serviceDefault;

    console.log('itemService_default', itemService_default);


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

    // import excel
    const [loadingBtnExport, setLoadingBtnExport] = useState(false);
    const [isOpenConfirmExportExcel, setIsOpenConfirmExportExcel] =
        useState(false);
    const [isOpenConfirmExportAllExcel, setIsOpenConfirmExportAllExcel] =
        useState(false);
    const [isOpenConfirmImportExcel, setIsOpenConfirmImportExcel] =
        useState(false);

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
        if(values.ngay_hen_dong_tien){
            values.ngay_hen_dong_tien = values.ngay_hen_dong_tien.format('YYYY-MM-DD');
        }

        values.services = dataService;
        values.id = dataAction.id;
        values.total = dataService.reduce((sum: number, item: any) => sum + (item.price_total ?? 0), 0) + tienPhong + tienCoc;
        // save
        axios.post(route('aitilen.invoice.update'), values).then((response) => {
            if (response.data.status_code === 200) {
                message.success("Đã lưu dữ liệu thành công");
                location.reload();
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
            title: 'Mã hóa đơn',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'ten_khach_hang',
            key: 'ten_khach_hang',
        },
        {
            title: 'Mã khách hàng',
            dataIndex: 'ma_khach_hang',
            key: 'ma_khach_hang',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
    ];

    const expandedRowRender = (record, index) => {
        return '12';
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
        total = Math.ceil(total);

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
                        data_tmp[idx].note = e.target.value ?? '';
                        setDataService(data_tmp);
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
    return (
        <div>
            <AdminLayout
                auth={props.auth}
                content={
                    <div>

                        <Divider orientation="left">
                            Danh sách hóa đơn
                        </Divider>

                        <Row>
                            <Col className="text-right" span={24}>
                                <Button type="primary"
                                    icon={<DeleteOutlined />}
                                    disabled={!hasSelected}
                                    loading={loadingBtnDelete}
                                    onClick={() => { setIsModalXoaOpen(true); }}
                                >
                                    Xóa {hasSelected ? `${selectedRowKeys.length}` : ''}
                                </Button>

                                <Button style={{ marginLeft: 8 }} type="primary"
                                    icon={<FileAddOutlined />}
                                    onClick={() => {
                                        setIsOpenFormEdit(true);
                                        setDataAction({ id: 0 });
                                        formEdit.setFieldsValue(formDataDefault);
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
                            // dataSource={formatData(dataSource)}
                            dataSource={dataSource}
                            columns={columns}
                            rowSelection={rowSelection}
                            // rowClassName="editable-row"
                            // className="table-index"
                            expandable={expandable}
                        />

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

                        <Modal title={dataAction.id === 0 ? "Thêm mới hóa đơn" : "Chỉnh sửa hóa đơn"}
                            open={isOpenFormEdit}
                            onOk={() => {
                                formEdit.submit();
                            }}
                            okText="Xác nhận Tạo hóa đơn "
                            cancelText="Hủy"
                            maskClosable={false}
                            width={1000}
                            onCancel={() => { setIsOpenFormEdit(false); }}>
                            <Form
                                form={formEdit}
                                layout="vertical"
                                onFinish={onFinishFormEdit}
                            >
                                <Row gutter={24}>

                                    <Col span={12}>
                                        <Form.Item
                                            name="contract_id"
                                            label="Hợp đồng"
                                            rules={[{ required: true, message: 'Vui chọn nhập hợp đồng' }]}
                                        >
                                            <Select
                                                showSearch
                                                style={{ width: "100%" }}
                                                placeholder="Chọn nhân viên thực hiện"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                options={optionEntries(props.contract)}
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
                                            name="ngay_hen_dong_tien"
                                            label={<><span>Ngày (dự kiến) đóng tiền</span> {showInfo('Thay đổi tháng, sẽ update lại tiền dịch vụ tương ứng với số ngày trên tháng')}</>}
                                            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                                        >
                                            <DatePicker className="form-item01"
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

                                    <Col span={12}>
                                        <Form.Item
                                            name="so_nguoi"
                                            label="Số người ở "
                                        >
                                            <InputNumber className="form-item01"
                                                defaultValue={0}
                                                min={1}
                                                onChange={(value) => {
                                                    const v = value ?? 1;
                                                    setSoNguoi(v);
                                                    total(soNgayThue, dataService, daysInMonth, v);
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="so_ngay"
                                            label={<span>Số ngày thuê <em className="text-normal">(Tổng {daysInMonth} ngày)</em> {showInfo('<Số ngày thuê> / <Tổng số ngày trong tháng> Thay đổi số ngày sẽ update lại số tiền dịch vụ trong tháng')}</span>}
                                        >
                                            <InputNumber className="form-item01"
                                                defaultValue={0}
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
                                                            <InputNumber className="form-item02"
                                                                defaultValue={0}
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
                                                            <InputNumber className="form-item02"
                                                                defaultValue={0}
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                onChange={(value) => {
                                                                    setTienCoc(value ?? 0);
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </td>
                                                    <td>VNĐ</td>
                                                    <td><b>{numberFormat(tienCoc)}</b></td>
                                                    <td><em><b>Trả cọc:</b> nhập số nhỏ hơn 0</em></td>
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
                                                        <b>Tổng cộng:</b>
                                                    </td>
                                                    <td colSpan={2} className="text-left">
                                                        <b className="_red">{numberFormat(dataService.reduce((sum: number, item: any) => sum + (item.price_total ?? 0), 0) + tienPhong + tienCoc)}</b>
                                                    </td>
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
