import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
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
    Row,
    Space,
    Tag,
    Card,
    notification,
    Divider,
    Upload,
    Dropdown,
} from "antd";

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowRightOutlined,
    FormOutlined,
    SearchOutlined,
    DeleteOutlined,
    EditOutlined,EyeOutlined,
    CheckOutlined,
    CloseSquareOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import "../../../../css/list.css";
import { btnIndex } from "../../../Function/data";
import { smartSearch, showDataSearch } from "../../../Function/input";
import { renderData } from "../../../Function/index";
import { inArray } from "../../../Function/common";
import dayjs from "dayjs";
const { TextArea } = Input;
const DATE_FORMAT = "YYYY-MM-DD";

export default function Dashboard(props) {
    sessionStorage.clear();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);
    const [columnData, setColumnData] = useState(props.columnData);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

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

    const translate = () => {
        setLoadingBtnDelete(true);
        setLoadingTable(true);
        axios
            .post(route("admin_user.translation", [props.table.name]), {
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

    const edit = (record) => {
        const item = dataSource[record.index];
        let formData = {};
        for (let i = 0; i < columnData.length; i++) {
            if (columnData[i].dataIndex === "operation") {
                continue;
            }

            formData[columnData[i].dataIndex] = item[columnData[i].dataIndex];
            if (columnData[i].inputType === "select") {
                const colName = columnData[i].dataIndex;
                formData[columnData[i].dataIndex] = {
                    value: item[colName],
                    label: props.selectData[colName][item[colName]],
                };
            }
        }
        form.setFieldsValue(formData);
    };

    function formatData(data) {
        return dataSource.map((data) => {
            let dataTmp = {};
            for (const [key, value] of Object.entries(data)) {
                dataTmp[key] = value;

                if (value == null) {
                    dataTmp[key] = "";
                    continue;
                }

                if(props.typeEdit[key] === 'select') {
                    dataTmp[key] = '';
                    if(value.data && value.data.name){
                        dataTmp[key] = (
                            <Tag>{value.data.name}</Tag>
                        )
                    }
                }

                // check type == selects
                if(props.typeEdit[key] === 'selects' ) {
                    dataTmp[key] = '';
                    if(value.data) {
                        dataTmp[key] = (
                            value.data.map((val) => {
                                console.log('valval', val);
                                return <Tag key={val.id}>{val.label}</Tag>
                            })
                        )
                    }
                }
            }
            return dataTmp;
        });
    }

    const onFinishInputFastEdit = (value) => {
        if (value[value.column_name] == null) {
            value[value.column_name] = "";
        }
        axios
            .post(route("data.fastEdit", [props.tableId]), value)
            .then((response) => {
                if (response.data.status_code === 200) {
                    message.success("Đã lưu thành công!");
                    // openNotification('error', 'Đã lưu thành công!');
                    let dataSource_tmp = props.dataSource.map((data) => {
                        if (data.key === value.id) {
                            data[value.column_name] = value[value.column_name];
                            if (
                                value[value.column_name].constructor === Array
                            ) {
                                data[value.column_name] = JSON.stringify(
                                    value[value.column_name]
                                );
                            }
                        }
                        return data;
                    });
                    setDataSource(dataSource_tmp);
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
                console.log('props.table.id', props.table.id);
                console.log('props.searchData', props.searchData);
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
                            options={props.selectData[col.name].selectbox}
                        />
                    </Form.Item>
                );
            case "tags":
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
                return <span>{type}</span>;
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
        initialValues["column_name"] = col.name;
        initialValues["id"] = record.key;
        initialValues[col.name] = record[col.name];

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
                // console.log('err', error);
            }
            initialValues[col.name] = selects;
        }

        return (
            <div>
                <Form
                    name="basic"
                    layout="vertical"
                    style={{ maxWidth: 600 }}
                    // initialValues={initialValues}
                    onFinish={onFinishInputFastEdit}
                    onFinishFailed={onFinishFailedFastEdit}
                    autoComplete="off"
                >
                    <div>{fastEditText(col, record)}</div>
                    <Form.Item
                        name="id"
                        initialValue={record.key}
                        style={{ display: "none" }}
                    >
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item
                        name="column_name"
                        initialValue={col.name}
                        style={{ display: "none" }}
                    >
                        <Input type="text" />
                    </Form.Item>
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

    const fastEditOK = (e) => {};

    const fastEditCancel = (e) => {
        openNotification("success", "Đã hủy");
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
                    key: col.id,
                    render: (_, record) => {
                        if(record) {
                            return (
                                <div className="confirm-fast-edit">
                                    {renderData(col, record)}
                                    {fastEdit(col, record)}
                                </div>
                            );
                        }

                    },
                };

                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.id,
                };
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
                    if(record) {
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
        if (props.table.is_show_btn_edit === 1 && inArray(props.table.id, props.userPermission.table_edit)) {
            return <Link href={route("data.edit", [ props.tableId,record.index,])}>
                    <Button type="button" className="icon-edit"><EditOutlined /> </Button>
                </Link>
        }
    }

    function checkShowBtnDetail(record) {
        if (props.table.is_show_btn_detail === 1 && inArray(props.table.id, props.userPermission.table_view)) {
            return <Link href={route("data.detail", [ props.tableId,record.index,])}>
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
        router.get(route("data.index", [props.table.id]), values);
    };

    const onFinishSearchFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    const listItemsSearch = props.columns.map((col) =>
        showDataSearch(col, props)
    );

    function checkShowBtnUnactive() {
        return (
            <Button
                type="primary"
                onClick={unactive}
                disabled={!hasSelected}
                loading={loadingBtnDelete}
            >
                <CloseSquareOutlined />
                Unactive {hasSelected ? `(${selectedRowKeys.length})` : ""}
            </Button>
        );
    }

    function checkShowBtnActive() {
        return (
            <Button
                type="primary"
                onClick={active}
                disabled={!hasSelected}
                loading={loadingBtnDelete}
            >
                <CheckOutlined />
                Active {hasSelected ? `(${selectedRowKeys.length})` : ""}
            </Button>
        );
    }

    const confirmExport = () => {
        setIsOpenConfirmExportExcel(true);
    };

    function checkShowBtnImport() {
        if (props.table.export === 1) {
            return(
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

    const pageContent = (
        <div>
            <Card type="inner" title={props.table.display_name} extra={""}>
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
            </Card>
            <br />

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

                    <Space>
                        {checkShowBtnDelete()}

                        {checkShowBtnImport()}

                        {/* {checkShowBtnActive()} */}

                        {/* {checkShowBtnUnactive()} */}
                    </Space>
                    <Space className="_right">
                        {btnIndex(props)}

                        {checkShowBtnExcel()}
                    </Space>

                    <em>
                        {" "}
                        Trang {props.pageConfig.currentPage}, hiển thị{" "}
                        {props.pageConfig.perPage}/{props.pageConfig.total}
                    </em>
                </div>

                <hr />
                <br />

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
                    dataSource={formatData(dataSource)}
                    columns={configColumnData()}
                    rowSelection={rowSelection}
                    rowClassName="editable-row"
                    className="table-index"
                />
            </Form>
        </div>
    );

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={props.table.display_name}
                tables={props.tables}
                current={props.table}
                content={
                    <Context.Provider value={contextValue}>
                        {contextHolder}
                        {pageContent}
                    </Context.Provider>
                }
            />
        </div>
    );
}
