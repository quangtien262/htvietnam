import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { cloneDeep, initial, set } from "lodash";
import type { CheckboxProps } from 'antd';
import {
    Button, List,
    Table, DatePicker,
    message, Flex,
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
    PlusSquareOutlined, MehOutlined, DownOutlined,
    RiseOutlined, CloseCircleOutlined,
    PlusCircleOutlined, CheckOutlined,
    DeleteOutlined, FileAddOutlined, FormOutlined
} from "@ant-design/icons";

import { optionEntries, showInfo } from "../../../Function/common";
import { HTBankingQR } from "../../../Function/generateQR";

import "../../../../css/form.css";

import { callApi } from "../../../Function/api";

import { formatValueForm } from "../../../Function/input";

import { DON_VI_SERVICE } from "../../../Function/constant";

import { inArray, parseJson, numberFormat, removeByIndex } from "../../../Function/common";

import dayjs from "dayjs";
import { on } from 'events';
const CheckboxGroup = Checkbox.Group;
const daysInMonth_default = dayjs().daysInMonth();
export default function Dashboard(props: any) {

    const dataService_empty = {
        id: 0,
        room_id: null,
        dien_start: 0,
        dien_end: 0,
        nuoc_start: 0,
        nuoc_end: 0,
        nonglanh_start: 0,
        nonglanh_end: 0,
        maybom_start: 0,
        maybom_end: 0,
    };
    const itemService_default = props.serviceDefault;


    const [dataService, setDataService] = useState([
        { ...dataService_empty },
        { ...dataService_empty },
        { ...dataService_empty }
    ]);

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
    const [dateEdit, setDateEdit] = useState<dayjs.Dayjs | null>(null);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);

    const [isModalDataThang, setIsModalDataThang] = useState(false);

    const [formEdit] = Form.useForm();

    const [dataAction, setDataAction] = useState({ id: 0 });
    const [datasAction, setDatasAction] = useState([]);

    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [isDraft, setIsDraft] = useState(2);
    const [note_applyAll, setNote_applyAll] = useState(false);

    // add số điện nước
    const plainOptions = ['dien', 'nuoc', 'maybom', 'nonglanh'];
    const defaultCheckedList = ['dien'];

    const [checkedList, setCheckedList] = useState<string[]>(defaultCheckedList);

    const checkAll = plainOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < plainOptions.length;

    const onChange = (list: string[]) => {
        setCheckedList(list);
    };

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setCheckedList(e.target.checked ? plainOptions : []);
    };

    function submitFormEdit() {
        console.log('dataService', dataService);
        if (!dateEdit) {
            message.error("Vui lòng chọn tháng/năm");
            return;
        }
        let isValid = false;
        dataService.forEach((item: any, index: number) => {
            if (item.room_id) {
                isValid = true;
                return;
            }
        });
        if (!isValid) {
            message.error("Vui lòng chọn ít nhất 1 phòng");
            return;
        }
        // return;
        axios.post(route('aitilen.service.saveDienNuoc'), {
            datas: dataService,
            month: dateEdit.month() + 1,
            year: dateEdit.year(),
        }).then((response) => {
            console.log('response', response);

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

    }


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

    function fastEditRecord(id: number, field: string, value: any) {
        console.log('va', value);

        axios.post(route('aitilen.service.fastEditDienNuoc'), {
            id: id,
            field: field,
            value: value,
        }).then((response) => {
            console.log('response', response);
            if (response.data.status_code === 200) {
                message.success("Đã cập nhật dữ liệu thành công");
                // update dataSource
                let data_tmp = cloneDeep(dataSource);
                data_tmp.forEach((item: any, index: number) => {
                    if (item.id === id) {
                        item[field] = value;
                    }
                });
                setDataSource(data_tmp);
            } else {
                message.error("Đã cập nhật dữ liệu thất bại1");
            }
            setLoadingTable(false);
        }).catch((error) => {
            console.log(error);

            message.error("Cập nhật dữ liệu thất bại2");
        });
    }


    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'room_id',
            key: 'id',
            render: (text: any, record: any) => {
                return <>
                    {props.room[record.room_id] ? <Tag color="blue">{props.room[record.room_id].name}</Tag> : ''}
                </>;
            }
        },
        {
            title: <span>Số điện/nước {showInfo('Chỉ hiển thị nếu có sẵn chỉ số đầu')}</span>,
            dataIndex: 'room_id',
            key: 'id',
            render: (text: any, record: any) => {
                return <>
                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Điện cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'dien_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.dien_start ? <Tag className="_point" color="blue">Điện:{record.dien_start}-{record.dien_end}</Tag> : ''}
                    </Popconfirm>

                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Nước cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'nuoc_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.nuoc_start ? <Tag className="_point" color="green">Nước:{record.nuoc_start}-{record.nuoc_end}</Tag> : ''}

                    </Popconfirm>

                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Nóng lạnh cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'nonglanh_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.nonglanh_start ? <Tag className="_point" color="orange">Nóng lạnh:{record.nonglanh_start}-{record.nonglanh_end}</Tag> : ''}
                    </Popconfirm>

                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Máy bơm cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'maybom_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.maybom_start ? <Tag className="_point" color="yellow">Máy bơm:{record.maybom_start}-{record.maybom_end}</Tag> : ''}
                    </Popconfirm>


                </>;
            }
        },
    ];


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

    const inFinishSearch = (values: any) => {
        values.p = props.p;
        if (values.end_date) {
            values.end_date = values.end_date.format('YYYY-MM');
        }
        if (!values.month) {
            values.month = props.searchData.month;
        }
        if (!values.year) {
            values.year = props.searchData.year;
        }
        if (!values.room && props.searchData.room) {
            values.room = props.searchData.room;
        }

        router.get(route('aitilen.service.dienNuoc'), values);
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

    // Hàm cập nhật giá trị cho từng trường của từng hàng
    function handleChangeInput(index: number, field: string, value: number) {
        let data_tmp = cloneDeep(dataService);
        data_tmp[index][field] = value;
        setDataService(data_tmp);
    }

    const items = [
        {
            key: '1',
            label: <div onClick={() => { setIsOpenFormEdit(true) }}>
                <PlusSquareOutlined />
                Thêm nhanh
            </div>,
        },
        {
            key: '2',
            label: <div onClick={() => setIsModalDataThang(true)}>
                <FileAddOutlined /> Tạo data tháng
            </div>,
        },
    ];

    function openQuickEditFromSelection() {
        if (!selectedRowKeys.length) {
            message.warning('Vui lòng chọn ít nhất 1 dòng');
            return;
        }

        // Dựng map id -> record để truy xuất nhanh
        const mapById = new Map<string, any>(
            (dataSource || []).map((item: any) => [String(item.id), item])
        );

        // Lấy bản ghi đầy đủ theo đúng thứ tự người dùng đã chọn
        const selectedRecords: any[] = selectedRowKeys
            .map((k) => mapById.get(String(k)))
            .filter(Boolean);

        if (!selectedRecords.length) {
            message.warning('Không tìm thấy bản ghi phù hợp trong lựa chọn');
            return;
        }

        // Kiểm tra tất cả bản ghi phải cùng tháng/năm
        const monthYearSet = new Set(
            selectedRecords.map((r: any) => {
                const m = Number(r?.month ?? props.searchData?.month);
                const y = Number(r?.year ?? props.searchData?.year);
                return `${y}-${m}`;
            })
        );

        if (monthYearSet.size > 1) {
            message.error('Vui lòng chọn các bản ghi cùng tháng/năm');
            return;
        }

        // Set lại dateEdit theo tháng/năm chung
        const [onlyPair] = Array.from(monthYearSet);
        const [yStr, mStr] = onlyPair.split('-');
        const yNum = Number(yStr);
        const mNum = Number(mStr);
        if (yNum && mNum) {
            setDateEdit(dayjs(`${yNum}-${String(mNum).padStart(2, '0')}`));
        }

        // Chuẩn hóa data đưa vào form nhanh
        const selectedRows = selectedRecords.map((r: any) => ({
            id: r.id,
            room_id: r.room_id.toString() ?? null,
            dien_start: Number(r.dien_start ?? 0),
            dien_end: Number(r.dien_end ?? 0),
            nuoc_start: Number(r.nuoc_start ?? 0),
            nuoc_end: Number(r.nuoc_end ?? 0),
            nonglanh_start: Number(r.nonglanh_start ?? 0),
            nonglanh_end: Number(r.nonglanh_end ?? 0),
            maybom_start: Number(r.maybom_start ?? 0),
            maybom_end: Number(r.maybom_end ?? 0),
        }));

        setDataService(selectedRows);
        setIsOpenFormEdit(true);
    }

    const items02 = [
        {
            key: '1',
            label: <a onClick={() => openQuickEditFromSelection()}><FormOutlined /> Sửa nhanh</a>,
        },
        {
            key: '2',
            label: <a onClick={() => setIsModalXoaOpen(true)}><DeleteOutlined /> Xóa</a>,
        },
    ];

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                content={
                    <div>

                        <Divider orientation="left">
                            Danh sách số điện/nước {props.searchData.month && props.searchData.year ? `tháng ${props.searchData.month}/${props.searchData.year}` : ''}
                        </Divider>

                        <Row>
                            {/* search  */}
                            <Col span={24} className="main-search-left">
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
                                                title: <div>
                                                    <span>Chọn Tòa nhà </span>

                                                    <Popconfirm
                                                        title="Tìm kiếm nâng cao"
                                                        okText="Đóng"
                                                        showCancel={false}
                                                        icon={null}
                                                        description={<>
                                                            <Form.Item
                                                                name="room"
                                                            >
                                                                <Select
                                                                    showSearch
                                                                    addonBefore="Phòng"
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
                                                            </Form.Item>

                                                            {/* month */}


                                                            <Form.Item
                                                                name="month"
                                                            >
                                                                <InputNumber addonBefore="Tháng" onBlur={() => formSearch.submit()} />
                                                            </Form.Item>

                                                            {/* year */}
                                                            <Form.Item
                                                                name="year"
                                                            >
                                                                <InputNumber addonBefore="Năm" onBlur={() => formSearch.submit()} />
                                                            </Form.Item>
                                                        </>}
                                                        onConfirm={() => {
                                                            formSearch.setFieldsValue({ apm: [] });
                                                            formSearch.submit();
                                                        }}
                                                    >
                                                        <a className="_right">Nâng cao</a>
                                                    </Popconfirm>
                                                </div>,
                                                description: <Form.Item name="apm">
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
                            <Col span={24} className="main-content02">
                                <Row>
                                    {/* thao tác */}
                                    <Col className="text-left" span={12}>
                                        <Dropdown
                                            disabled={!hasSelected}
                                            className="btn-dropdown _left"
                                            menu={{ items: items02 }}>
                                            <Button type="primary">
                                                <Space>
                                                    Thao tác {hasSelected ? `(${selectedRowKeys.length})` : ''}
                                                    <DownOutlined />
                                                </Space>
                                            </Button>
                                        </Dropdown>
                                    </Col>

                                    {/* Thêm nhanh */}
                                    <Col className="text-right" span={12}>
                                        <Dropdown.Button type="primary"
                                            className="btn-dropdown _right"
                                            onClick={() => {
                                                setIsOpenFormEdit(true);
                                                setDataAction({ id: 0 });
                                            }}
                                            menu={{ items }}
                                        >
                                            <PlusCircleOutlined /> Thêm nhanh
                                        </Dropdown.Button>
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
                                />
                            </Col>

                        </Row>

                        {/* modal xóa */}
                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            onOk={async () => {
                                const query = (selectedRowKeys || []).map(k => `ids[]=${encodeURIComponent(String(k))}`).join('&');
                                const url = query ? `${route('aitilen.service.deleteDienNuoc')}?${query}` : route('aitilen.service.deleteDienNuoc');
                                const result = await callApi(url);
                                if (result.status === 200) {
                                    message.success("Đã hủy đơn thành công");
                                    location.reload();
                                } else {
                                    message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }}
                            okText="Xác nhận xóa"
                            cancelText="Hủy"
                            maskClosable={true}
                            // confirmLoading={confirmLoading}
                            onCancel={() => { setIsModalXoaOpen(false); }}>
                            <ul>
                                <li>Các thông tin về data này sẽ bị chuyển đến thùng rác</li>
                                <li>Bạn có thể phục hồi lại data này trong mục Thùng rác</li>
                            </ul>
                        </Modal>

                        {/* Xác nhận tạo data tháng */}
                        <Modal title="Xác nhận tạo data tháng"
                            open={isModalDataThang}

                            onOk={async () => {
                                const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [idAction]));
                                if (result.status === 200) {
                                    message.success("Đã tạo data tháng thành công");
                                    location.reload();
                                } else {
                                    message.error("Đã tạo data tháng thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            maskClosable={true}
                            onCancel={() => { setIsModalDataThang(false); }}>
                            <p><b>Chọn tháng cần tạo:</b> <DatePicker picker="month" /></p>
                            <p><b>LƯU Ý:</b></p>
                            <ul>
                                <li>Tạo dữ liệu số điện nước dựa theo số liệu của tháng trước đó</li>
                                <li>Dữ liệu có sẵn sẽ bị ghi đè</li>
                                <li>Dữ liệu bị ghi đè sẽ không thể phục hồi</li>
                            </ul>
                        </Modal>

                        <Modal title={dataAction.id === 0 ? "Thêm mới" : "Cập nhật"}
                            open={isOpenFormEdit}
                            onOk={() => {
                                submitFormEdit();
                            }}
                            okText="Lưu dữ liệu "
                            cancelText="Hủy"
                            maskClosable={false}
                            width={1000}
                            onCancel={() => { setIsOpenFormEdit(false); }}>

                            <span>Chọn tháng/năm</span>
                            <DatePicker picker="month" value={dateEdit} onChange={(date) => setDateEdit(date)} />
                            <p> </p>
                            <b>Chọn loại data:</b>
                            <em>
                                <span> ( </span>
                                <Checkbox indeterminate={indeterminate}
                                    onChange={onCheckAllChange}
                                    checked={checkAll}>
                                </Checkbox>
                                <span> Chọn tất cả )</span>
                            </em>
                            <br />
                            <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />
                            <table className="table-salary" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Phòng</th>
                                        {checkedList.includes('dien') && (
                                            <>
                                                <th>Số điện</th>
                                            </>
                                        )}
                                        {checkedList.includes('nuoc') && (
                                            <>
                                                <th>Số nước</th>
                                            </>
                                        )}
                                        {checkedList.includes('nonglanh') && (
                                            <>
                                                <th>Nóng lạnh</th>
                                            </>
                                        )}
                                        {checkedList.includes('maybom') && (
                                            <>
                                                <th>Máy bơm</th>
                                            </>
                                        )}
                                        <th>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataService.map((item: any, index: number) => (
                                        <tr key={index}>
                                            <td>
                                                <Select
                                                    showSearch
                                                    style={{ width: "100%" }}
                                                    placeholder="Chọn phòng"
                                                    optionFilterProp="children"
                                                    options={optionEntries(props.room)}
                                                    value={item.room_id}
                                                    onChange={(value) => handleChangeInput(index, 'room_id', value)}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? "")
                                                            .toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                />
                                            </td>
                                            {checkedList.includes('dien') && (
                                                <>
                                                    <td>
                                                        <InputNumber
                                                            value={item.dien_start}
                                                            onChange={(value) => handleChangeInput(index, 'dien_start', value)}
                                                            addonBefore="start"
                                                        />
                                                        <InputNumber
                                                            value={item.dien_end}
                                                            onChange={(value) => handleChangeInput(index, 'dien_end', value)}
                                                            addonBefore="end"
                                                        />
                                                    </td>
                                                </>
                                            )}
                                            {checkedList.includes('nuoc') && (
                                                <>
                                                    <td>
                                                        <InputNumber
                                                            value={item.nuoc_start}
                                                            onChange={(value) => handleChangeInput(index, 'nuoc_start', value)}
                                                            addonBefore="start"
                                                        />
                                                        <InputNumber
                                                            value={item.nuoc_end}
                                                            onChange={(value) => handleChangeInput(index, 'nuoc_end', value)}
                                                            addonBefore="end"
                                                        />
                                                    </td>
                                                </>
                                            )}
                                            {checkedList.includes('nonglanh') && (
                                                <>
                                                    <td>
                                                        <InputNumber
                                                            value={item.nonglanh_start}
                                                            onChange={(value) => handleChangeInput(index, 'nonglanh_start', value)}
                                                            addonBefore="start"
                                                        />
                                                        <InputNumber
                                                            value={item.nonglanh_end}
                                                            onChange={(value) => handleChangeInput(index, 'nonglanh_end', value)}
                                                            addonBefore="end"
                                                        />
                                                    </td>
                                                </>
                                            )}
                                            {checkedList.includes('maybom') && (
                                                <>
                                                    <td>
                                                        <InputNumber
                                                            value={item.maybom_start}
                                                            onChange={(value) => handleChangeInput(index, 'maybom_start', value)}
                                                            addonBefore="start"
                                                        />
                                                        <InputNumber
                                                            value={item.maybom_end}
                                                            onChange={(value) => handleChangeInput(index, 'maybom_end', value)}
                                                            addonBefore="end"
                                                        />
                                                    </td>
                                                </>
                                            )}
                                            <td>
                                                <Button
                                                    onClick={() => {
                                                        let data_tmp = cloneDeep(dataService);
                                                        data_tmp.splice(index, 1);
                                                        setDataService(data_tmp);
                                                    }}
                                                >
                                                    <DeleteOutlined /> Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: 16, textAlign: "left" }}>
                                <Button
                                    type="dashed"
                                    icon={<PlusCircleOutlined />}
                                    onClick={addSub}
                                >
                                    Thêm hàng
                                </Button>
                            </div>
                        </Modal>

                    </div>
                }
            />
        </div>
    );
}
