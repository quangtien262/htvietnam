import React, { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import dayjs from "dayjs";
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
    Tree,
    notification,
    Divider,
    Image,
    Upload,
    Dropdown, Tabs
} from "antd";


import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
    ArrowRightOutlined,
    FormOutlined,
    SearchOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    CopyOutlined,
    CloseSquareOutlined,
    UploadOutlined,
    CaretRightOutlined, SettingOutlined
} from "@ant-design/icons";

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import "../../../../css/form.css";
// import "../../../../css/popconfirm_hidden_btn.css";
import { inArray, parseJson, numberFormat, showsettingMenu, formatGdata_column, onDrop } from "../../../Function/common";
import { DATE_FORMAT, DATE_TIME_FORMAT, DATE_SHOW, DATE_TIME_SHOW } from '../../../Function/constant';

import ImgCrop from 'antd-img-crop';

import {
    HTSelect,
    HTSelects,
    HTTextarea,
    HTNumber,
    HTDate,
    HTDateTime,
    HTPassword,
    HTInput,
    HTTime, HTColor, HTCascaderTable, smartSearch02, smartSearch, showDataSearch, showDataSearch02
} from "../../../Function/input";

import { checkRule, showData, showDataSelectTable } from '../../../Function/data';
import { contentFormData } from '../../../components/comp_data';

import { showSelects, showSelect } from '../../../Function/selects_table';
import { callApi } from '../../../Function/api';
const { TextArea } = Input;
export default function Dashboard(props: any) {
    sessionStorage.clear();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);

    const [fileList, setFileList] = useState([]);
    const [documentFile, setDocumentFile] = useState([]);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [uploading, setUploading] = useState(false);

    const [dataAction, setDataAction] = useState([]);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

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

    function setPagination(pagination: { page?: number; pageSize?: number }) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }

    //
    const { useMemo } = React;
    const [api, contextHolder] = notification.useNotification();

    const contextValue = useMemo(
        () => ({
            name: "Ant Design",
        }),
        []
    );

    const Context = React.createContext({
        name: "Default",
    });

    const openNotification = (type, msg) => {
        const placement = "topRight";
        const result = {
            message: `${msg}`,
            description: "",
            placement,
        };
        switch (type) {
            case "success":
                api.success(result);
                break;
            case "error":
                api.error(result);
                break;
            case "warning":
                api.warning(result);
                break;
            default:
                api.info(result);
                break;
        }
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

    const active = () => {
        setLoadingBtnDelete(true);
        setLoadingTable(true);
        axios
            .post(route("admin_user.active", [props.table.name]), {
                ids: selectedRowKeys,
            })
            .then((response) => {
                if (response.data.status_code == 200) {
                    let dataSrc = [];
                    for (var key in dataSource) {
                        if (selectedRowKeys.includes(dataSource[key].key)) {
                            dataSource[key].is_active = 1;
                        }
                        dataSrc.push(dataSource[key]);
                    }
                    message.success("Đã active (" + response.data.data + ")");
                    setDataSource(dataSrc);
                    setSelectedRowKeys([]);
                } else {
                    setSelectedRowKeys([]);
                    message.error("Error");
                }

                setLoadingBtnDelete(false);
                setLoadingTable(false);
            })
            .catch((error) => {
                message.error("Có lỗi xảy ra");
                setLoadingBtnDelete(false);
                setLoadingTable(false);
            });
    };

    const unactive = () => {
        setLoadingBtnDelete(true);
        setLoadingTable(true);
        axios
            .post(route("admin_user.unactive", [props.table.name]), {
                ids: selectedRowKeys,
            })
            .then((response) => {
                if (response.data.status_code == 200) {
                    let dataSrc = [];
                    for (var key in dataSource) {
                        if (selectedRowKeys.includes(dataSource[key].key)) {
                            dataSource[key].is_active = 2;
                        }
                        dataSrc.push(dataSource[key]);
                    }
                    setDataSource(dataSrc);
                    setSelectedRowKeys([]);
                    message.success("Unactived");
                } else {
                    setSelectedRowKeys([]);
                    message.error("Unactived thất bại");
                }

                setLoadingBtnDelete(false);
                setLoadingTable(false);
            })
            .catch((error) => {
                message.error("Có lỗi xảy ra");
                setLoadingBtnDelete(false);
                setLoadingTable(false);
            });
    };


    function onFinishInputFastEdit(value: any, col: any, record: any) {
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
                    // openNotification('error', 'Cập nhật thất bại');
                }
            })
            .catch((error) => {
                openNotification("error", "Cập nhật thất bại");
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
        openNotification("error", "Cập nhật thất bại");
    };

    function fastEditText(col, record) {
        let rule = [];
        if (col.require === 1) {
            rule.push({
                required: true,
                message: '"' + col.display_name + '" Không được bỏ trống',
            })
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
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
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
                            options={props.selectData[col.name]}
                            // options={Object.entries(props.selectData[col.name]).map(([key, value]) => ({ label: value, value: key }))}
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
                            // options={Object.entries(props.selectData[col.name]).map(([key, value]) => ({ label: value, value: key }))}
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
                            // options={props.selectsData[col.name].selectbox}
                            options={Object.entries(props.selectData[col.name]).map(([key, value]) => ({ label: value, value: key }))}
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
                console.log('err', error);
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
        openNotification("success", "Đã hủy");
    };

    function fastEdit(col, record) {
        if (col.fast_edit !== 1) {
            return '';
        }
        return <Popconfirm className="popconfirm-fast-edit"
            title={fastEditContent(col, record)}
            onConfirm={fastEditOK}
            onCancel={fastEditCancel}
            icon={
                <ArrowRightOutlined
                    style={{ color: "#1890ff" }}
                />
            }
        >
            <a className="icon-fast-edit">
                <FormOutlined />
            </a>
        </Popconfirm>;

    }

    function configColumnData() {
        let result = props.columns
            .filter(function (col: any) {
                if (col.show_in_list === 1) {
                    return true;
                }
                return false;
            })
            .map((col: any) => {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.dataIndex,
                    render: (_: any, record: any) => {
                        if (['select'].includes(col.type_edit)) {
                            return <div>{showSelect(col, record)} {fastEdit(col, record)}</div>
                        }

                        if (['selects'].includes(col.type_edit)) {
                            // return <div className="main-selects">{showSelects(record[col.name])} {fastEdit(col, record)} </div>;
                            return <div className="main-selects">{showSelects(record, col)}  </div>;
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

                        if (col.type_edit === 'color') {
                            return record[col.name] ? <div style={{ color: record[col.name] }}>{record[col.name]} {fastEdit(col, record)}</div> : '';
                        };

                        if (['cascader'].includes(col.type_edit) && record[col.name]) {
                            try {
                                return record[record[col.name]].info.name;
                            } catch (error) {
                                // todo: empty
                            }
                        }
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
                                {checkShowBtnEdit(record)}
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
                return <Button onClick={() => {
                    editData(record);
                }} type="button" className="icon-edit"><EditOutlined /> </Button>;
            }
            return <Link href={route("data.edit", { tableId: props.tableId, dataId: record.id, p: props.p })}>
                <Button type="button" className="icon-edit"><EditOutlined />  </Button>
            </Link>
        }
    }

    function checkShowBtnDetail(record) {
        if (props.table.is_show_btn_detail === 1 && inArray(props.table.id, props.userPermission.table_view)) {
            return <Link href={route("data.detail", { tableId: props.tableId, dataId: record.id, p: props.p })}>
                <Button type="button" className="icon-view"><EyeOutlined /> </Button>
            </Link>
        }
    }

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
        values.p = props.p;
        router.get(route("data.index", [props.table.id]), values);
    };

    const onFinishSearchFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    const listItemsSearch = props.columns.map((col: any) =>
        showDataSearch(col, props)
    );

    const listItemsSearch02 = props.columns.map((col: any) =>
        showDataSearch02(col, props)
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

    function checkShowStatistical() {
        if (props.statistical.length === 0) {
            return '';
        }
        const result = props.statistical.map((item) => {
            return <Link href={'?' + props.table.statistical_select + '=' + item.id}><Button className="btn-statistical">{item.name} <b> ({item.count}</b>)</Button></Link>
        });
        return <div>{result} <hr /></div>
    }

    function checkShowBtnDelete() {
        let result = "";
        if (inArray(props.table.id, props.userPermission.table_delete) && props.table.have_delete === 1) {
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

    function initialValueSearch() {
        // props.searchData
        let result = props.searchData;
        const cols = props.columns;
        for (let i = 0; i < cols.length; i++) {
            if (cols[i].add2search === 1 && cols[i].type_edit === "date") {
                if (result[cols[i].name]) {
                    result[cols[i].name] = {
                        0: dayjs(result[cols[i].name][0], DATE_FORMAT),
                        1: dayjs(result[cols[i].name][1], DATE_FORMAT),
                    };
                }
            }
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
        router.get(route("data.export", { tableId: props.tableId, p: props.p }), {
            ids: selectedRowKeys,
        });
        setIsOpenConfirmExportExcel(false);
        setLoadingBtnExport(false);
    };

    const exportAllDBExcel = () => {
        setLoadingBtnExport(true);
        router.get(route("data.export", { tableId: props.tableId, p: props.p }), {
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
                // loading={loadingBtnExport}
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
                // loading={loadingBtnExport}
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

    function searchTop() {
        if (props.table.search_position !== 2) {
            return '';
        }

        return <div>
            <Form
                name="basic"
                layout="vertical"
                onFinish={onFinishSearch}
                onFinishFailed={onFinishSearchFailed}
                autoComplete="off"
                form={formSearch}
                initialValues={initialValueSearch()}
            // initialValues={props.searchData}
            >
                <Row gutter={24}>
                    {smartSearch(props.table)}
                    {listItemsSearch}
                </Row>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loadingBtnSearch}
                >
                    <SearchOutlined />
                    Tìm kiếm
                </Button>
            </Form>
            <br />
        </div>
    }

    function searchLeft() {
        if (props.table.search_position !== 1) {
            return '';
        }

        return <div>
            <Form
                name="basic"
                layout="vertical"
                onFinish={onFinishSearch}
                onFinishFailed={onFinishSearchFailed}
                autoComplete="off"
                form={formSearch}
                initialValues={initialValueSearch()}
            // initialValues={props.searchData}
            >
                <Row gutter={24} className="main-search-left">
                    {smartSearch02(props.table)}
                    {listItemsSearch02}
                </Row>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loadingBtnSearch}
                >
                    <SearchOutlined />
                    Tìm kiếm
                </Button>
            </Form>
            <br />
        </div>
    }

    const expandedRowRender = (record, index) => {
        return checkShowData(record);
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


    function checkShowData(record: any) {
        const content = props.columns.map((col02: any, key) => {
            if (col02.show_in_detail !== 1) {
                return '';
            }
            if (['select_table'].includes(col02.type_edit)) {
                return '';
            }

            if (['select'].includes(col02.type_edit) && record[col02.name] && record[col02.name].info) {
                return <Col key={col02.id} sm={{ span: 12 }}>{record[col02.name].info.name} {fastEdit(col02, record)}</Col>
            }

            if (['selects'].includes(col02.type_edit)) {
                console.log('selects record', record);
                return <div className="main-selects">{showSelects(record[col02.name])} {fastEdit(col02, record)} </div>;
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
        });

        return <Row>
            {content}
            {/* code đa ngôn ngữ ở đây */}
        </Row>;
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
        setDataAction([]);
    }

    function btnAddNew() {
        if(props.table.have_add_new === 0) {
            return '';
        }
        if (inArray(props.table.id, props.userPermission.table_add) && props.table.have_add_new === 1) {
            if (props.table.config_show_data) {
                const datas = props.table.config_show_data.data;
                let items = [];
                for (const [key, value] of Object.entries(datas)) {
                    items.push({
                        key: key,
                        icon: <ArrowRightOutlined />,
                        label: (
                            <Link
                                href={route("data.create", [
                                    props.table.id,
                                    { type: key },
                                ])}
                            >
                                {value}
                            </Link>
                        ),
                    });
                }
                return (
                    <Dropdown menu={{ items }} placement="top" arrow>
                        <Button type="primary">
                            <PlusCircleOutlined />
                            Thêm mới
                        </Button>
                    </Dropdown>
                );
            }

            if (props.table.form_data_type === 1) {
                return (
                    <Link href={route("data.create", { tableId: props.table.id, p: props.p })}>
                        <Button type="primary">
                            <PlusCircleOutlined />
                            Thêm mới
                        </Button>
                    </Link>
                );
            }
        }

        return <div>
            <Button type="primary" onClick={() => addNewData()}>
                <PlusCircleOutlined />
                Thêm mới
            </Button>
        </div>
    }

    function editData(record: any) {
        setIsOpenFormEdit(true);
        axios
            .post(route("data.api.info", { tableId: props.table.id, dataId: record.id, p: props.p }))
            .then((response) => {

                if (response.data.status_code == 200) {
                    console.log('=ZZZ');
                    console.log(response.data.data);
                    console.log('=======');
                    setDataAction(response.data.data);
                    console.log('response.data.data.imagesData', response.data.data.imagesData);

                    setFileList(response.data.data.imagesData);
                } else {
                    message.error("Lỗi tải dữ liệu cần sửa");
                }
            })
            .catch((error) => {
                message.error("Lỗi tải dữ liệu cần sửa");
            });
    }

    function addNewData() {
        setDataAction([]);
        setIsOpenFormEdit(true);
        axios
            .post(route("data.api.info", { tableId: props.table.id, dataId: 0, p: props.p }))
            .then((response) => {

                if (response.data.status_code == 200) {
                    setDataAction(response.data.data);
                    setFileList(response.data.data.imagesData);
                } else {
                    message.error("Lỗi tải dữ liệu cần sửa");
                }
            })
            .catch((error) => {
                message.error("Lỗi tải dữ liệu cần sửa");
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
                    {/* modal setting */}
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

            {searchTop()}

            {/* form delete/emport/export */}
            <Form form={form} component={false}>

                <div style={{ marginBottom: 16 }}>
                    {/* confirm delete */}
                    <Modal
                        title="Xác nhận xóa"
                        open={isOpenConfirmDelete}
                        onOk={deletes}
                        onCancel={handleCancelDelete}
                        confirmLoading={loadingBtnDelete}
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

                    <Row>
                        {checkShowStatistical()}
                    </Row>

                    <Space>


                        {checkShowBtnImport()}

                        {/* {checkShowBtnActive()} */}

                        {/* {checkShowBtnUnactive()} */}
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
                content={
                    <div>

                        <Modal
                            title={""}
                            open={isOpenFormEdit}
                            // onOk={formEdit}
                            onCancel={cancelEdit}
                            footer={[]}
                            width={1000}
                        >
                            {contentFormData(dataAction, fileList, (result: any) => {
                                setLoadingTable(false);
                                setIsOpenFormEdit(false);
                                // update state datasource
                                if (result) {
                                    const newData = [...dataSource];
                                    const index = newData.findIndex(
                                        (item) => result.id === item.id
                                    );
                                    if (index > -1) {
                                        const item = newData[index];
                                        newData.splice(index, 1, {
                                            ...item,
                                            ...result,
                                        });
                                        setDataSource(newData);
                                    } else {
                                        newData.unshift(result);
                                        setDataSource(newData);
                                    }
                                }
                            })}
                        </Modal>

                        {contextHolder}
                        {pageContent}
                    </div>
                    // <Context.Provider value={contextValue}>
                    //     {contextHolder}
                    //     {pageContent}
                    // </Context.Provider>
                }
            />
        </div>
    );
}
