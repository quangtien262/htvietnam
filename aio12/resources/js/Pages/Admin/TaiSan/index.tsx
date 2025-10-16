import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import AdminLayout from "@/layouts/AdminLayout";

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
    Space,
    DatePicker,
    Divider,
    Image,
    Upload,
    Dropdown, Card,
    Popover
} from "antd";



import {
    ArrowRightOutlined,
    FormOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined, CopyFilled,
    CheckOutlined,
    CloseSquareOutlined,
    UploadOutlined,
    CaretRightOutlined, MergeFilled
} from "@ant-design/icons";

import Barcode from 'react-barcode';


import axios from "axios";
import dayjs from "dayjs";



import { callApi } from "../../../Function/api";
import { formatValueForm } from "../../../Function/input";
import { inArray, parseJson, numberFormat, removeByIndex } from "../../../Function/common";
import { DATE_FORMAT, DATE_TIME_FORMAT, DATE_SHOW, DATE_TIME_SHOW } from '../../../Function/constant';

import "../../../../css/form.css";

const { TextArea } = Input;

import {
    HTSelect,
    HTSelects,
    HTTextarea,
    HTNumber,
    HTDate,
    HTDateTime,
    HTPassword,
    HTInput,
    HTTime, HTColor, HTCascaderTable, smartSearch02, smartSearch, showDataSearch02,

} from "../../../Function/input";

import { showSelects, showSelect, showDate, showDateTime } from '../../../Function/selects_table';

import { routeTaiSan } from "../../../Function/config_route";


export default function Dashboard(props) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalNhanBan, setIsModalNhanBan] = useState(false);
    const [isModalCapPhat, setIsModalCapPhat] = useState(false);
    const [titleCapPhatValue, setTitleCapPhatValue] = useState('Chọn nhân viên (hoặc chi nhánh) được cấp phát');

    const [nhomCapPhat, setNhomCapPhat] = useState(null);
    const [capPhat_value, setCapPhat_value] = useState(null);
    const [formCapPhat] = Form.useForm();

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [formEdit] = Form.useForm();
    const [idAction, setIdAction] = useState(0);

    const dataDefault = {
        name: '',
        ngay_mua: null,
        so_luong: 1,
        tai_san_status_id: { id: null, info: { name: '' } },
        tai_san_type_id: { id: null, info: { name: '' } },
        kho_tai_san_id: { id: null, info: { name: '' } }
    }
    const [dataAction, setDataAction] = useState(dataDefault);

    const [soLuongNhanBan, setSoLuongNhanBan] = useState(1);
    const [dataNhanBan, setDataNhanBan] = useState([dataDefault]);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [isDraft, setIsDraft] = useState(2);

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
            onChange: (page, pageSize) => setPagination({ page, pageSize }),
        },
    });


    function setPagination(pagination) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }

    const onFinishFormEdit = (values) => {

        const datas = formatValueForm(props.columns, values);
        // save
        axios.post(route('taiSan.save'), datas).then((response) => {
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

    //
    const EditableCell = ({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        ...restProps
    }) => {
        let inputNode;
        return <td {...restProps}>{children}</td>;
    };
    //
    const deletes = () => {
        setLoadingBtnDelete(true); // ajax request after empty completing
        setLoadingTable(true);
        axios
            .post(route("data.delete", [props.table.id]), {
                ids: selectedRowKeys,
            })
            .then((response) => {
                if (response.data.status_code == 200) {
                    let dataSrc = [];
                    for (var key in dataSource) {
                        if (!selectedRowKeys.includes(dataSource[key].key)) {
                            dataSrc.push(dataSource[key]);
                        }
                    }
                    message.success("Đã xóa");
                    setDataSource(dataSrc);
                    setSelectedRowKeys([]);
                } else {
                    setSelectedRowKeys([]);
                    message.error("Xóa thất bại");
                }
                setLoadingBtnDelete(false);
                setIsOpenConfirmDelete(false);
                setLoadingTable(false);
            })
            .catch((error) => {
                setLoadingBtnDelete(false);
                setSelectedRowKeys([]);
                setIsOpenConfirmDelete(false);
                setLoadingTable(false);
                message.error("Có lỗi xảy ra");
            });
    };

    const onSelectChange = (newSelectedRowKeys) => {
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

    function onFinishInputFastEdit(value, col, record) {
        // set value
        value.column_name = col.name;
        value.id = record.id;
        value.search = props.request;
        if (col.type_edit === 'date') {
            value[col.name] = dayjs(value[col.name]).format(DATE_FORMAT);
        }
        if (col.type_edit === 'datetime') {
            value[col.name] = dayjs(value[col.name]).format(DATE_TIME_FORMAT);
        }

        // set page
        if (props.request.page) {
            value.page = props.request.page;
        }
        axios
            .post(route("data.fastEdit", [props.tableId]), value)
            .then((response) => {
                if (response.data.status_code === 200) {
                    message.success("Đã lưu thành công!");
                    setDataSource(response.data.data);
                } else {
                    message.error("Cập nhật thất bại");
                }
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            });
    };

    const handleUpload = () => {
        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append("files[]", file);
        });
        setUploading(true);
        // You can use any AJAX library you like
        fetch(route("data.import", [props.table.id]), {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then(() => {
                setFileList([]);
                message.success("Upload thành công, đang tải lại dữ liệu");
                router.get(
                    route("data.index", [props.table.id, props.searchData]),
                    pagination
                );
            })
            .catch(() => {
                message.error("upload failed.");
            })
            .finally(() => {
                setUploading(false);
            });
    };

    const uploadConfig = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
    };

    const onFinishFailedFastEdit = (value) => {
        message.error("Cập nhật thất bại");
    };

    function fastEditText(col, record) {
        let rule = "";
        if (col.require === 1) {
            rule = [
                {
                    required: true,
                    message: '"' + col.display_name + '" Không được bỏ trống',
                },
            ];
        }
        const type = col.type_edit;
        switch (type) {
            case "text":
                return (
                    <Form.Item
                        label={col.display_name}
                        name={col.name}
                        rules={rule}
                    >
                        <Input />
                    </Form.Item>
                );
            case "number":
                return (
                    <Form.Item
                        label={col.display_name}
                        name={col.name}
                        rules={rule}
                    >
                        <InputNumber
                            style={{ width: "150px" }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                );
            case "textarea":
                return (
                    <Form.Item
                        label={col.display_name}
                        name={col.name}
                        rules={rule}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                );
            case "select":
                return (
                    <Form.Item
                        label={col.display_name}
                        name={col.name}
                        rules={rule}
                    >
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder="Search to Select"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={props.selectData[col.name].selectbox}
                        />
                    </Form.Item>
                );
            case "tags":
                return (
                    <Form.Item
                        label={col.display_name}
                        name={col.name}
                        rules={rule}
                    >
                        <Select
                            mode="tags"
                            showSearch
                            style={{ width: "100%" }}
                            placeholder="Search to Select"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={props.selectsData[col.name].selectbox}
                        />
                    </Form.Item>
                );
            case "selects":
                return (
                    <Form.Item
                        label={col.display_name}
                        name={col.name}
                        rules={rule}
                    >
                        <Select
                            mode="multiple"
                            showSearch
                            style={{ width: "100%" }}
                            placeholder="Search to Select"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={props.selectsData[col.name].selectbox}
                        />
                    </Form.Item>
                );
            case "date":
                return HTDate(col, 0);
            case "color":
                return <span>{type}</span>;

            default:
                return (
                    <Form.Item
                        label={col.display_name}
                        name={col.name}
                        rules={rule}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                );
        }
    }

    function fastEditContent(col, record) {
        let initialValues = [];
        initialValues[col.name] = record[col.name];
        if (['date'].includes(col.type_edit)) {
            initialValues[col.name] = dayjs(record[col.name]);
        }
        if (col.type_edit === "selects") {
            let selects_data = dataSource.filter(function (d) {
                if (d.key === record.key) {
                    return d[col.name];
                }
            });
            let selects;
            try {
                selects = JSON.parse(selects_data[0][col.name]).map(
                    (select) => {
                        return +select;
                    }
                );
            } catch (error) {
            }
            initialValues[col.name] = selects;
        }

        return (
            <div>
                <Form
                    // name="basic"
                    layout="vertical"
                    style={{ maxWidth: 600 }}
                    initialValues={initialValues}
                    onFinish={(value) => { onFinishInputFastEdit(value, col, record) }}
                    onFinishFailed={onFinishFailedFastEdit}
                    autoComplete="off"
                >
                    <div>{fastEditText(col, record)}</div>
                    <Form.Item className="btn-fast-edit">
                        <Button
                            name="id"
                            value={1}
                            type="primary"
                            htmlType="submit"
                        >
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }

    const fastEditOK = (e) => { };

    const fastEditCancel = (e) => {
        message.error("Cập nhật thất bại");
    };

    function fastEdit(col, record) {
        if (col.fast_edit !== 1) {
            return '';
        }
        return <Popconfirm
            title={fastEditContent(col, record)}
            onConfirm={fastEditOK}
            onCancel={fastEditCancel}
            icon={
                <ArrowRightOutlined
                    style={{ color: "#1890ff" }}
                />
            }
            cancelText="Hủy"
            okText={""}
        >
            <a className="icon-fast-edit">
                <FormOutlined />
            </a>
        </Popconfirm>;

    }

    function configColumnData() {
        let result = props.columns
            .filter(function (col) {
                if (col.show_in_list === 1) {
                    return true;
                }
                return false;
            })
            .map((col) => {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.dataIndex,
                    render: (_, record) => {
                        if (['select'].includes(col.type_edit)) {
                            return <div>{showSelect(col, record)} {fastEdit(col, record)}</div>
                        }

                        if (['selects'].includes(col.type_edit)) {
                            return <div className="main-selects">{showSelects(record[col.name])} {fastEdit(col, record)} </div>;
                        }

                        if (['date'].includes(col.type_edit)) {
                            return <div>{dayjs(record[col.name]).format(DATE_FORMAT)} {fastEdit(col, record)}</div>;
                        }

                        if (['datetime'].includes(col.type_edit)) {
                            return dayjs(record[col.name]).format(DATE_TIME_FORMAT);
                        }

                        if (['number'].includes(col.type_edit)) {
                            return record[col.name] ? <div>{numberFormat(record[col.name])} {fastEdit(col, record)}</div> : '';
                        };

                        if (['text'].includes(col.type_edit)) {
                            return record[col.name] ? <div>{record[col.name]} {fastEdit(col, record)}</div> : '';
                        };

                        if (['image', 'image_crop'].includes(col.type_edit)) {
                            return <Image className="image-index" src={record[col.name]}></Image>;
                        }

                        if (['images', 'images_crop'].includes(col.type_edit) && record[col.name] && record[col.name].avatar) {
                            return <Image className="image-index" src={record[col.name].avatar}></Image>;
                        }

                        if (['cascader'].includes(col.type_edit) && record[col.name]) {
                            try {
                                return record[record[col.name]].info.name;
                            } catch (error) {
                                // todo: empty
                            }
                        }

                        if (col.type_edit === 'barcode') {
                            return <Col key={col.id} sm={{ span: 12 }}>
                                {record[col.name]}
                            </Col>;
                        };
                    },
                }
            });
        if (
            props.table.is_show_btn_edit === 1 &&
            inArray(props.table.id, props.userPermission.table_edit)
        ) {
            result.push({
                title: "#",
                dataIndex: "operation",
                fixed: "right",
                width: 50,
                render: (_, record) => {
                    if (record) {
                        return (
                            <Divider>
                                {checkShowBtnDetail(record)}
                            </Divider>
                        );
                    }
                },
            });
        }
        return result;
    }

    function checkShowBtnEdit(record) {

        // check đối với hóa_đơn, ko cho sửa nếu đã thanh toán
        if (props.table.name === 'hoa_don' && record.hoa_don_status_id.id === 1) {
            return;
        }



        if (props.table.is_show_btn_edit === 1 && inArray(props.table.id, props.userPermission.table_edit)) {
            if (props.table.form_data_type === 2) {
                return <Button onClick={() => { editData(record) }} type="button" className="btn-print"><EditOutlined /> Sửa</Button>
            }
            return <Link href={route("data.edit", [props.tableId, record.index,])}>
                <Button type="button" className="icon-edit"><EditOutlined /> </Button>
            </Link>
        }
    }

    function checkShowBtnDetail(record) {
        if (props.table.is_show_btn_detail === 1 && inArray(props.table.id, props.userPermission.table_view)) {
            return <Link href={route("data.detail", [props.tableId, record.index,])}>
                <Button type="button" className="icon-view"><EyeOutlined /> </Button>
            </Link>
        }
    }

    const onFinishCapPhat = (values) => {
        setLoadingModal(true);
        values.tai_san_id = dataAction.id;
        axios.post(route('taiSan.capPhat'), values).then((response) => {
            if (response.data.status_code === 200) {
                message.success("Đã cấp phát thành công");
                location.reload();
            } else {
                message.error("Cấp phát thất bại");
            }
            setLoadingTable(false);
        }).catch((error) => {
            message.error("Cấp phát thất bại");
        });
    };

    const onFinishSearch = (values) => {
        setLoadingTable(true);
        setLoadingBtnSearch(true);
        const cols = props.columns;
        for (let i = 0; i < cols.length; i++) {
            if (cols[i].add2search === 1 && cols[i].type_edit === "date") {
                if (values[cols[i].name]) {
                    values[cols[i].name] = {
                        0: values[cols[i].name][0].format(DATE_FORMAT),
                        1: values[cols[i].name][1].format(DATE_FORMAT),
                    };
                }
            }
        }

        router.get(route("taiSan.index"), values);
    };

    const listItemsSearch02 = props.columns.map((col) =>
        showDataSearch02(col, props, () => formSearch.submit())
    );


    const confirmExport = () => {
        setIsOpenConfirmExportExcel(true);
    };

    function checkShowBtnImport() {
        if (props.table.export !== 1) {
            return '';
        }
        return (
            <Button
                type="primary"
                onClick={confirmExport}
                disabled={!hasSelected}
                loading={loadingBtnExport}
            >
                Xuất excel
            </Button>
        );
    }

    function checkShowBtnDelete() {
        let result = "";
        if (inArray(props.table.id, props.userPermission.table_delete)) {
            result = (
                <Button
                    type="primary"
                    onClick={confirmDelete}
                    disabled={!hasSelected}
                    loading={loadingBtnDelete}
                >
                    <DeleteOutlined />
                    Xóa {hasSelected ? `(${selectedRowKeys.length})` : ""}
                </Button>
            );
        }
        return result;
    }

    const handleCancelExport = () => {
        setIsOpenConfirmExportExcel(false);
    };

    //Export file excel
    const confirmAllExport = () => {
        setIsOpenConfirmExportAllExcel(true);
    };
    const confirmImport = () => {
        setIsOpenConfirmImportExcel(true);
    };
    const handleCancelImport = () => {
        setIsOpenConfirmImportExcel(false);
    };

    const handleCancelAllExport = () => {
        setIsOpenConfirmExportAllExcel(false);
    };

    const exportExcel = () => {
        setLoadingBtnExport(true);
        router.get(route("data.export", [props.tableId]), {
            ids: selectedRowKeys,
        });
        setIsOpenConfirmExportExcel(false);
        setLoadingBtnExport(false);
    };

    const exportAllDBExcel = () => {
        setLoadingBtnExport(true);
        router.get(route("data.export", [props.tableId]), {
            search: props.request,
        });
        setIsOpenConfirmExportAllExcel(false);
        setLoadingBtnExport(false);
    };

    const items = [
        {
            key: 1,
            label: (
                <a
                    type="primary"
                    onClick={confirmAllExport}
                    loading={loadingBtnExport}
                >
                    Xuất tất cả ra excel
                </a>
            ),
        },
        {
            key: 2,
            label: (
                <a
                    type="primary"
                    onClick={confirmImport}
                    loading={loadingBtnExport}
                >
                    Nhập dữ liệu từ excel
                </a>
            ),
        },
    ];

    function checkShowBtnExcel() {
        if (props.table.export === 1 && props.table.import === 1) {
            return (
                <Dropdown menu={{ items }} placement="bottom" arrow>
                    <Button type="primary">Excel</Button>
                </Dropdown>
            );
        }
        if (props.table.export === 1) {
            return (<Button onClick={confirmAllExport} type="primary">Xuất Excel</Button>);
        }
        if (props.table.import === 1) {
            return (<Button onClick={confirmImport} type="primary">Nhập từ Excel</Button>);
        }
    }


    function searchByTime(type) {
        setMocThoiGian(type);
        setKhoangThoiGian([null, null]);
        formSearch.submit();
    }


    function searchLeft() {
        if (props.table.search_position !== 1) {
            return '';
        }

        return <div>

            <Row gutter={24} className="main-search-left">
                <Form
                    name="basic"
                    layout="vertical"
                    onFinish={onFinishSearch}
                    autoComplete="off"
                    form={formSearch}
                    initialValues={props.searchData}
                    onBlur={(e) => { formSearch.submit(); }}
                >
                    {smartSearch02(props.table, () => formSearch.submit())}

                    {listItemsSearch02}
                </Form>
            </Row>
            <br />
        </div>
    }

    // code chi tiết ở đây
    const expandedRowRender = (record, index) => {
        return <div>
            {checkShowData(record)}
            <Divider orientation="left"
                onClick={() => {
                    setIdAction();
                }}
            >

                {checkShowBtnEdit(record)}

                <span> </span>

                <Button type="primary"
                    onClick={() => {
                        setIsModalNhanBan(true);
                        setDataAction(record);
                        setDataNhanBan([record]);
                        setSoLuongNhanBan(1);
                    }}
                >
                    <CopyFilled /> Nhân bản
                </Button>

                <span> </span>

                <Button type="primary"
                    onClick={() => {
                        setIsModalCapPhat(true);
                        setDataAction(record);
                        setSoLuongNhanBan(1);
                    }}
                >
                    <MergeFilled /> {record.tai_san_type_id.id === 1 ? 'Cấp phát sử dụng' : 'Cấp phát tiêu hao'}
                </Button>
            </Divider>
        </div>;
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


    function checkShowData(record) {

        const content = props.columns.map((col02, key) => {
            if (col02.show_in_detail !== 1) {
                return '';
            }
            if (['select'].includes(col02.type_edit)) {
                return <Col key={col02.id} sm={{ span: 12 }}><label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a> {col02.display_name}: </label>{showSelect(col02, record)} </Col>
            }

            if (['selects'].includes(col02.type_edit)) {
                return <Col key={col02.id} sm={{ span: 12 }}><label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a> {col02.display_name}: </label>{showSelects(record[col02.name])}  </Col>;
            }

            if (['date'].includes(col02.type_edit)) {
                return <Col key={col02.id} sm={{ span: 12 }}><label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a> {col02.display_name}: </label> {dayjs(record[col02.name]).format(DATE_SHOW)} </Col>;
            }

            if (['datetime'].includes(col02.type_edit)) {
                return <Col key={col02.id} sm={{ span: 12 }}><label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a> {col02.display_name}: </label> {dayjs(record[col02.name]).format(DATE_TIME_SHOW)}</Col>;
            }

            if (['number'].includes(col02.type_edit)) {
                return record[col02.name] ? <Col key={col02.id} sm={{ span: 12 }}><label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a> {col02.display_name}: </label>{numberFormat(record[col02.name])} </Col> : '';
            };

            if (['text', 'textarea'].includes(col02.type_edit)) {
                return <Col key={col02.id} sm={{ span: 12 }}>
                    <label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a>{col02.display_name}: </label>{record[col02.name]}
                </Col>;
            };

            if (col02.type_edit === 'barcode') {
                return <Col key={col02.id} sm={{ span: 12 }}>
                    <Popover content={<Barcode value={record[col02.name]} />}>
                        <label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a>{col02.display_name}: </label><a>{record[col02.name]}</a>
                    </Popover>
                </Col>;
            };


            // if(['image', 'image_crop'].includes(col02.type_edit)) {
            //     return <Image className="image-index" src={record[col02.name]}></Image>;
            // }

            // if(['images', 'images_crop'].includes(col02.type_edit) && record[col02.name].avatar) {
            //     return <Image className="image-index" src={record[col02.name].avatar}></Image>;
            // }
        });
        return <Row>{content}</Row>;
    }

    function showData(col, langId = 0) {

        let result;
        const typeEdit = col.type_edit;
        if (col.edit !== 1) {
            return false;
        }
        if (col.edit !== 1) {
            return false;
        }
        switch (typeEdit) {
            case "calendar_cham_cong":
            case "tiny":
            case "images_crop":
            case "image_crop":
            case "image":
            case "images":
            case "permission_list":
            case "selects_table":
                break;
            case "textarea":
                result = HTTextarea(col, langId);
                break;
            case "number":
                result = HTNumber(col, langId);
                break;
            case "select":
                result = HTSelect(col, props, "single", langId);
                break;
            case "selects":
                result = HTSelects(col, props, "multiple");
                break;
            case "tags":
                result = HTSelects(col, props.selectData[col.name], "tags");
                break;
            case "date":
                result = HTDate(col, langId);
                break;
            case "time":
                result = HTTime(col, langId);
                break;
            case "datetime":
                result = HTDateTime(col, langId);
                break;
            case "encryption":
                result = HTPassword(col, langId);
                break;
            case "color":
                result = HTColor(col);
                break;
            case "cascader_table":
                result = HTCascaderTable(col, props);
                break;
            default:
                result = HTInput(col, langId);
                break;
        }

        return result;
    }

    const cancelEdit = () => {
        setIsOpenFormEdit(false);
    }

    function btnAddNew() {

        const listItems = props.columns.map((col) => {
            return showData(col);
        });

        return <div>
            <Modal
                title={""}
                open={isOpenFormEdit}
                // onOk={formEdit}
                onCancel={cancelEdit}
                footer={[]}
                width={1000}
            >
                <Form
                    name="basic"
                    layout="vertical"
                    form={formEdit}
                    onFinish={onFinishFormEdit}
                    autoComplete="off"
                >
                    <Row>
                        {listItems}
                    </Row>

                    {/* thêm mới */}
                    <Row className="main-modal-footer01">
                        <Col span={24} className="main-btn-popup">
                            <Button className="btn-popup" onClick={cancelEdit}>
                                <CloseSquareOutlined />
                                Hủy
                            </Button>
                            <span> </span>
                            <Button className="btn-popup" type="primary"
                                onClick={() => {
                                    if (isDraft !== 2) {
                                        setIsDraft(2);
                                    }
                                    formEdit.submit();
                                }}
                            >
                                <CheckOutlined />
                                Lưu
                            </Button>
                            {/* <span> </span>
                            <Button className="btn-popup btn-draft" type="primary"
                                onClick={() => {
                                    if(isDraft !== 1) {
                                        setIsDraft(1);
                                    }
                                    formEdit.submit();
                                }}
                            >
                                <CopyOutlined />
                                Lưu nháp
                            </Button> */}
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Button type="primary" onClick={() => addNewData()}>
                <PlusCircleOutlined />
                Thêm mới
            </Button>
        </div>
    }

    function addNewData() {
        setIsOpenFormEdit(true);
        setIdAction(0);
        formEdit.resetFields();
    }

    function editData(record) {
        setIsOpenFormEdit(true);
        setIdAction(record.key);
        setDataAction(record);
        formEdit.resetFields();
        props.columns.forEach((val, key) => {

            if (['date', 'datetime'].includes(val.type_edit)) {
                formEdit.setFieldValue(val.name, dayjs(record[val.name]));
            }
            if (['select', 'selects', 'selects_normal'].includes(val.type_edit)) {
                if (val.show_in_list === 1) {
                    formEdit.setFieldValue(val.name, record[val.name].id);
                } else {
                    formEdit.setFieldValue(val.name, record[val.name]);
                }

            }

            if (['text', 'textarea', 'number', 'tiny', 'hidden', 'invisible', 'color'].includes(val.type_edit)) {
                formEdit.setFieldValue(val.name, record[val.name]);
            }

        });
    }

    function btnIndex(id = 0) {
        const [loadingBtn, setLoadingBtn] = useState(false);


        function btnFromRoute() {
            let result;
            if (
                props.table.add_btn_from_route &&
                props.table.add_btn_from_route != "" &&
                props.table.add_btn_from_route !== null
            ) {
                const routes = parseJson(props.table.add_btn_from_route);
                if (!routes) {
                    return "";
                }

                result = Object.values(routes).map((rt) => {
                    return (
                        <Link href={route(rt.name)}>
                            <Button
                                type="primary"
                                loading={loadingBtn}
                                className={rt.class}
                            >
                                <PlusCircleOutlined />
                                {rt.display_name}
                            </Button>
                        </Link>
                    );
                });
            }
            return result;
        }

        function btnSetting() {
            const [openSetting, setOpenSetting] = useState(false);
            const [isLoadOK, setIsLoadOK] = useState(false);
            const [gData, setGData] = useState(props.columnData);

            const setting = (e) => {
                setOpenSetting(true);
            };
            const cancelSetting = () => {
                setOpenSetting(false);
            };

            function loadData() {
                setOpenSetting(true);
            }
            function onDropData(info) {
                const result = onDrop(info, gData);
                setGData(result);
                axios
                    .post(route("column.update_sort_order"), {
                        data: JSON.stringify(result),
                    })
                    .then((response) => {
                        setLoadingBtn(false);
                        message.success("Cập nhật thứ tự thành công");
                    })
                    .catch((error) => {
                        message.error("Cập nhật thứ tự thất bại");
                    });
            }

            return (
                <div>
                    <Modal
                        title={<div>Cài đặt <hr />{showsettingMenu(props.tableSetting)}<hr /></div>}
                        open={openSetting}
                        onOk={setting}
                        onCancel={cancelSetting}
                        footer={[]}
                    >
                        <Tree
                            className="draggable-tree tree-modal"
                            draggable
                            blockNode
                            onDrop={(info) => onDropData(info)}
                            treeData={formatGdata_column(gData)}
                        />
                    </Modal>
                    <Button
                        type="primary"
                        loading={loadingBtn}
                        onClick={() => loadData()}
                        className="_right"
                    >
                        <SettingOutlined />
                    </Button>
                </div>
            )
        }

        return (
            <Space className="_right">

                {btnFromRoute()}

                {btnAddNew()}

                {props.table.setting_shotcut === 1 ? btnSetting() : ''}
            </Space>
        );
    }

    const pageContent = (
        <div>

            <Form form={form} component={false}>
                <div style={{ marginBottom: 16 }}>
                    {/* confirm delete */}
                    <Modal
                        title="Xác nhận xóa"
                        open={isOpenConfirmDelete}
                        onOk={deletes}
                        onCancel={handleCancelDelete}
                    // confirmLoading={loadingBtnDelete}
                    >
                        <p>
                            Dữ liệu đã xóa sẽ <b>không thể khôi phục</b> lại
                            được <br />{" "}
                            <b>(Số lượng {selectedRowKeys.length})</b>
                        </p>
                    </Modal>

                    {/* modal confirm export curent */}
                    <Modal
                        title="Xác nhận export excel"
                        open={isOpenConfirmExportExcel}
                        onOk={exportExcel}
                        onCancel={handleCancelExport}
                        confirmLoading={loadingBtnExport}
                    >
                        <p>
                            Xuất dữ liệu ra file excel{" "}
                            <b>
                                (Số lượng{" "}
                                {hasSelected
                                    ? selectedRowKeys.length
                                    : props.pageConfig.total}
                                )
                            </b>
                        </p>
                    </Modal>

                    {/* modal confirm export all */}
                    <Modal
                        title="Xác nhận export excel"
                        open={isOpenConfirmExportAllExcel}
                        onOk={exportAllDBExcel}
                        onCancel={handleCancelAllExport}
                        confirmLoading={loadingBtnExport}
                    >
                        <p>
                            Xuất tất cả dữ liệu ra file excel{" "}
                            <b>(Số lượng {props.pageConfig.total})</b>
                        </p>
                    </Modal>

                    {/* modal form import */}
                    <Modal
                        title="Chọn file cần nhập liệu"
                        open={isOpenConfirmImportExcel}
                        onCancel={handleCancelImport}
                        confirmLoading={loadingBtnExport}
                        footer=""
                    >
                        <Upload {...uploadConfig}>
                            <Button icon={<UploadOutlined />}>
                                Select File
                            </Button>
                        </Upload>
                        <Button
                            type="primary"
                            onClick={handleUpload}
                            loading={uploading}
                            style={{
                                marginTop: 16,
                            }}
                        >
                            {uploading ? "Uploading" : "Start Upload"}
                        </Button>
                        <Button onClick={handleCancelImport}>Hủy</Button>
                    </Modal>


                    <Space>

                        {checkShowBtnImport()}

                    </Space>
                    <Space className="_right">
                        {checkShowBtnDelete()}

                        {btnIndex()}

                        {checkShowBtnExcel()}
                    </Space>

                    {/* page name */}
                    <b className="title-page">{props.table.display_name}.</b>

                    {/* Show số lượng item/page */}
                    <em> ( Trang {props.pageConfig.currentPage}, hiển thị{" "}
                        {props.pageConfig.count}/{props.pageConfig.total} )
                    </em>
                </div>

                <hr />
                <br />

                <Row>
                    <Col sm={{ span: 7 }}>
                        {searchLeft()}
                    </Col>
                    <Col sm={{ span: 17 }}>
                        <Table
                            size="small"
                            rowClassName={(_, index) =>
                                index % 2 === 0 ? "even-row" : "odd-row"
                            }
                            components={{
                                body: {
                                    cell: EditableCell,
                                },
                            }}
                            loading={loadingTable}
                            pagination={tableParams.pagination}
                            // dataSource={formatData(dataSource)}
                            dataSource={dataSource}
                            columns={configColumnData()}
                            rowSelection={rowSelection}
                            // rowClassName="editable-row"
                            // className="table-index"
                            expandable={expandable}

                        />
                    </Col>
                </Row>
            </Form>
        </div>
    );

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={props.table.display_name}
                tables={routeTaiSan}
                current={props.table}
                content={
                    <div>
                        {/* modal Xóa */}
                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            onOk={async () => {
                                setConfirmLoading(true);
                                const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [idAction]));
                                if (result.status === 200) {
                                    message.success("Đã hủy đơn thành công");
                                    location.reload();
                                } else {
                                    setConfirmLoading(false);
                                    message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }
                            }
                            okText="Xác nhận hủy đơn"
                            cancelText="Hủy"
                            loading={true}
                            maskClosable={true}
                            // confirmLoading={confirmLoading}
                            onCancel={() => { setIsModalXoaOpen(false); }}>
                            <ul>
                                <li>Các thông tin về data này sẽ bị chuyển đến thùng rác</li>
                                <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                                <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                            </ul>
                        </Modal>

                        {/* Cấp phát sử dụng*/}
                        <Modal title="Cấp phát sử dụng"
                            open={isModalCapPhat}
                            onOk={() => {
                                formCapPhat.submit();
                            }}
                            okText="Cấp phát"
                            cancelText="Hủy"
                            // loading={loadingModal}
                            maskClosable={true}
                            // confirmLoading={confirmLoading}
                            onCancel={() => { setIsModalCapPhat(false); }}>
                            <Form form={formCapPhat} layout="vertical" onFinish={onFinishCapPhat}>
                                <Row>
                                    <Col sm={24}>
                                        <span></span>
                                        <Form.Item
                                            label={<span className="text-normal">Chọn nhóm được cấp phát</span>}
                                            name='name'
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng chọn nhóm được cấp phát',
                                                },
                                            ]}
                                        >
                                            <Select
                                                showSearch
                                                style={{ width: "100%" }}
                                                placeholder="Search to Select"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                options={[
                                                    {
                                                        value: 'chi_nhanh_id',
                                                        key: 'chi_nhanh_id',
                                                        label: 'Cấp phát cho chi nhánh'
                                                    }, {
                                                        value: 'nhan_vien_id',
                                                        key: 'nhan_vien_id',
                                                        label: 'Cấp phát cho nhân viên'
                                                    },
                                                ]}
                                                onChange={(val) => {
                                                    setNhomCapPhat(val);
                                                    setCapPhat_value(props.selectData[val].selectbox);
                                                    formCapPhat.setFieldValue('value', null);
                                                    if (val === 'chi_nhanh_id') {
                                                        setTitleCapPhatValue('Chọn chi nhánh được cấp phát');
                                                    } else {
                                                        setTitleCapPhatValue('Chọn nhân viên được cấp phát');
                                                    }

                                                }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col sm={24}>
                                        <Form.Item
                                            label={<span className="text-normal">{titleCapPhatValue}</span>}
                                            name='value'
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng chọn nhóm được cấp phát',
                                                },
                                            ]}
                                        >
                                            <Select
                                                showSearch
                                                style={{ width: "100%" }}
                                                placeholder="Search to Select"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                options={capPhat_value}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col sm={24}>
                                        <Form.Item
                                            label={<span className="text-normal">Ghi chú thêm</span>}
                                            name='note'
                                        >
                                            <Input.TextArea />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal>

                        {/* modal nhân bản */}
                        <Modal title="Nhân bản tài sản"
                            open={isModalNhanBan}
                            okText="Nhân bản"
                            cancelText="Hủy"
                            loading={loadingModal}
                            maskClosable={true}
                            onCancel={() => { setIsModalNhanBan(false); }}
                            width={{
                                xs: '90%',
                                sm: '90%',
                                md: '90%',
                                lg: '90%',
                                xl: '90%',
                                xxl: '90%',
                            }}
                            onOk={async () => {
                                // setLoadingModal(true);
                                axios.post(route('taiSan.nhanBan'), { data: dataNhanBan, ma_nhan_ban: dataAction.code }).then((response) => {
                                    if (response.data.status_code === 200) {
                                        message.success("Đã nhân bản thành công");
                                        location.reload();
                                    } else {
                                        message.error("Nhân bản thất bại");
                                    }
                                    setLoadingTable(false);
                                }).catch((error) => {
                                    message.error("Nhân bản thất bại");
                                });
                            }}
                        >


                            <table className="table-sub">
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Tên tài sản</th>
                                        <th>Ngày mua</th>
                                        <th>Giá mua</th>
                                        <th>Trạng thái</th>
                                        <th>Loại tài sản</th>
                                        <th>Kho tài sản</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{dataAction.code}</td>
                                        <td>{dataAction.name}</td>
                                        <td>{dataAction.ngay_mua ? dayjs(dataAction.ngay_mua).format(DATE_SHOW) : ''}</td>
                                        <td>{numberFormat(dataAction.gia_mua)}</td>
                                        <td>{dataAction.tai_san_status_id ? dataAction.tai_san_status_id.info.name : ''}</td>
                                        <td>{dataAction.tai_san_type_id ? dataAction.tai_san_type_id.info.name : ''}</td>
                                        <td>{dataAction.kho_tai_san_id ? dataAction.kho_tai_san_id.info.name : ''}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div>
                                <br />
                                <b>Nhập số lượng cần nhân bản: </b>
                                <span> </span>
                                <InputNumber min={1} max={20} value={soLuongNhanBan} onChange={(val) => {
                                    setSoLuongNhanBan(val);
                                    let dataNhanBan_tmp = [];
                                    for (let i = 0; i < val; i++) {
                                        dataNhanBan_tmp.push(dataAction);
                                    }
                                    setDataNhanBan(dataNhanBan_tmp);
                                }} />
                                <br /><br />
                            </div>

                            <table className="table-sub">
                                <thead>
                                    <tr>
                                        <th>Tên tài sản</th>
                                        <th>Ngày mua</th>
                                        <th>Giá mua</th>
                                        <th>Trạng thái</th>
                                        <th>Loại tài sản</th>
                                        <th>Kho TS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        dataNhanBan.map((val, idx) => {
                                            return <tr key={idx}>
                                                <td>
                                                    <Input value={val.name}
                                                        onChange={(val) => {
                                                            setDataNhanBan(prev => {
                                                                const newData = [...prev];
                                                                newData[idx] = {
                                                                    ...newData[idx],
                                                                    name: val.target.value
                                                                };
                                                                return newData;
                                                            });
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <DatePicker placeholder="Ngày mua" value={val.ngay_mua ? dayjs(val.ngay_mua) : null} format={DATE_SHOW} />
                                                </td>
                                                <td>
                                                    <InputNumber value={val.gia_mua}
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                        onChange={(val) => {
                                                            setDataNhanBan(prev => {
                                                                const newData = [...prev];
                                                                newData[idx] = {
                                                                    ...newData[idx],
                                                                    gia_mua: val
                                                                };
                                                                return newData;
                                                            });
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Select value={val.tai_san_status_id.id}
                                                        showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Search to Select"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={props.selectData.tai_san_status_id.selectbox}
                                                        onChange={(val) => {
                                                            setDataNhanBan(prev => {
                                                                const newData = [...prev];
                                                                newData[idx] = {
                                                                    ...newData[idx],
                                                                    tai_san_status_id: { id: val }
                                                                };
                                                                return newData;
                                                            });
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Select value={val.tai_san_type_id.id}
                                                        showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Search to Select"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={props.selectData.tai_san_type_id.selectbox}
                                                        onChange={(val) => {
                                                            setDataNhanBan(prev => {
                                                                const newData = [...prev];
                                                                newData[idx] = {
                                                                    ...newData[idx],
                                                                    tai_san_type_id: { id: val }
                                                                };
                                                                return newData;
                                                            });
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Select value={val.kho_tai_san_id.id}
                                                        showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Search to Select"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={props.selectData.kho_tai_san_id.selectbox}
                                                        onChange={(val) => {
                                                            setDataNhanBan(prev => {
                                                                const newData = [...prev];
                                                                newData[idx] = {
                                                                    ...newData[idx],
                                                                    kho_tai_san_id: { id: val }
                                                                };
                                                                return newData;
                                                            });
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        })
                                    }

                                </tbody>
                            </table>
                        </Modal>

                        {/* {contextHolder} */}
                        {pageContent}
                    </div>
                }
            />
        </div>
    );
}
