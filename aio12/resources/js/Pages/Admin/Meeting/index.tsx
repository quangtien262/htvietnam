import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    Table, Drawer,
    message,
    Modal,
    Form,
    Input,
    List,
    Popconfirm,
    Checkbox,
    Row, Col,
    Space,
    notification,
    Divider,
    Tag,
    Upload,
    Dropdown,
    Select,
} from "antd";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    EditFilled,
    FormOutlined,
    SearchOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseSquareOutlined,
    UploadOutlined
} from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";

import "../../../../css/form.css";
import { callApi } from "../../../Function/api";

// SunEditor
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from '../../../Function/sun_config';

import dayjs from "dayjs";

import { DATE_FORMAT, DATE_TIME_FORMAT } from '../../../Function/constant'

import { taskConfig, taskInfo } from "../Task/task_config";
import { projectConfig, formProject, getProjectDetail, projectInfo } from "../Project/project_config";


import { smartSearch02, showDataSearch, showDataSearch02 } from "../../../Function/input";

import { icon as iconRaw } from "../../../components/comp_icon";
import { optionEntries, formatGdata_column, onDrop, nl2br, parseJson, showInfo, inArray } from "../../../Function/common";
const icon: Record<string, React.ReactElement> = iconRaw;
const CheckboxGroup = Checkbox.Group;
export default function Dashboard(props: any) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [formMeetingEdit] = Form.useForm();
    const editor = useRef<{ [key: string]: any }>({});

    const [isDraft, setIsDraft] = useState(2);

    // upload excel
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [formEdit] = Form.useForm();
    const [meetingDataAction, setMeetingDataAction] = useState({ id: 0 });
    const [idAction, setIdAction] = useState(0);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [projectChecklist, setProjectChecklist] = useState([]);
    const [projectChecklistPercent, setProjectChecklistPercent] = useState(0);
    const [projectComments, setProjectComments] = useState([]);
    const [projectAction, setProjectDataAction] = useState({ id: 0 });
    const [openProjectDetail, setOpenProjectDetail] = useState(false);

    const [openTaskDetail, setOpenTaskDetail] = useState(false);
    const [taskChecklist, setTaskChecklist] = useState([]);
    const [taskChecklistPercent, setTaskChecklistPercent] = useState(0);
    const [taskComments, setTaskComments] = useState([]);
    const [taskAction, setTaskAction] = useState({ id: 0 });
    const [priority, setPriority] = useState([]);
    const [taskLog, setTaskLog] = useState([]);

    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [isModalEdit, setIsModalEdit] = useState(false);


    const [confirmLoading, setConfirmLoading] = useState(false);





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


    // suneditor
    function handleImageUpload(targetImgElement: any, index: any, state: any, imageInfo: any, remainingFilesCount: any) {
        console.log(targetImgElement, index, state, imageInfo, remainingFilesCount)
    }
    function handleImageUploadError(errorMessage: any, result: any) {
        console.log(errorMessage, result)
    }
    function handleOnResizeEditor(height: any, prevHeight: any) {
        console.log(height, prevHeight)
    }
    function imageUploadHandler(xmlHttpRequest: { response: any; }, info: any, core: any, colName: string) {
        const result = parseJson(xmlHttpRequest.response);
        for (const [key, val] of Object.entries(result.data)) {
            editor.current[colName].insertHTML('<img key="' + key + '" src="' + val.url + '">', true, true);
        }
    }
    // end suneditor

    function setPagination(pagination) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }

    const [api, contextHolder] = notification.useNotification();

    const onFinishFormEdit = (values: any) => {

        setLoading(true);
        values.is_draft = isDraft;

        values.id = idAction;

        values = formatValueForm(props.columns, values);

        // save
        axios.post(route("ncc.save"), values).then((response) => {
            console.log('res', response);
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

    function formatValueForm(columns, values) {
        for (const [key, col] of Object.entries(columns)) {
            if (col.edit !== 1) {
                // values[col.name] = '';
                continue;
            }
            if (col.type_edit === "tiny" && editor.current[col.name]) {
                values[col.name] = editor.current[col.name].getContents();
            }
            if (col.type_edit === "permission_list") {
                values[col.name] = isCheckAllPermission
                    ? props.permissionList_all
                    : permissionList;
            }
            if (col.type_edit === "date") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_FORMAT);
            }
            if (col.type_edit === "datetime") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_TIME_FORMAT);
            }
            if (col.type_edit === "time") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(TIME_FORMAT);
            }
            // if (col.type_edit === "selects_table") {
            //     values[col.name] = dataSourceSelectTbl[col.name].datas.dataSource;
            // }
            if (col.type_edit === "color") {
                values[col.name] = values[col.name].toHexString();
            }

            if (['images', 'image', 'image_crop', 'images_crop'].includes(col.type_edit)) {
                if (fileList && fileList.length > 0) {
                    let images = fileList.map((file) => {
                        if (!file.status) {
                            return false;
                        }
                        if (file.status === "uploading") {
                            setIsStopSubmit(true);
                            return false;
                        }

                        if (file.status === "OK") {
                            return {
                                name: file.name,
                                status: file.status,
                                url: file.url,
                            };
                        }
                        if (file.status === "done") {
                            return {
                                name: file.response.data.fileName,
                                status: file.status,
                                url: file.response.data.filePath,
                            };
                        }
                    });

                    // values.images = JSON.stringify(images);
                    values[col.name] = images;
                } else {
                    values[col.name] = "";
                    values[col.name] = "";
                }
            }

        }
        return values;
    }


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

    const onFinishSearch = (values: any) => {
        values.p = props.p;
        router.get(route("meeting.index"), values);
    };

    const onFinishSearchFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    const listItemsSearch02 = props.columns.map((col) =>
        showDataSearch02(col, props)
    );


    const confirmExport = () => {
        setIsOpenConfirmExportExcel(true);
    };

    function checkShowBtnDelete() {
        let result = [];
        if (inArray(props.table.id, props.userPermission.table_delete)) {
            result.push(<Button
                key="delete"
                type="primary"
                onClick={confirmDelete}
                disabled={!hasSelected}
                loading={loadingBtnDelete}
            >
                <DeleteOutlined />
                Xóa {hasSelected ? `(${selectedRowKeys.length})` : ""}
            </Button>);
        }

        return result;
    }

    function initialValueSearch() {
        // props.searchData
        let result = props.searchData;
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
                onBlur={(e) => { formSearch.submit(); }}
            >
                <Row gutter={24} className="main-search-left">
                    {/* smartSearch */}
                    <Col sm={{ span: 24 }} className='item-search'>
                        <Form.Item name='sm_keyword' label='Từ khoá'>
                            <Input onBlur={() => { formSearch.submit(); }} />
                        </Form.Item>
                    </Col>

                    {/* meeting */}
                    <Col span={24}>
                        <Form.Item name='meeting' label='Meeting'>
                            <CheckboxGroup className="item-status"
                                options={[
                                    { label: 'Daily', value: 'daily' },
                                    { label: 'Weekly', value: 'weekly' },
                                    { label: 'Monthly', value: 'monthly' },
                                    { label: 'Yearly', value: 'yearly' },
                                ]}
                                onChange={(e) => formSearch.submit()}
                            />
                        </Form.Item>
                    </Col>

                    {/* status */}
                    <Col span={24}>
                        <Form.Item name='result' label='Trạng thái'>
                            <CheckboxGroup className="item-status"
                                options={Object.entries(props.meetingStatus).map(([key, val]: [string, any]) => ({ label: val.name, value: key }))}
                                onChange={(e) => formSearch.submit()}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <br />
                    </Col>
                </Row>
            </Form>
            <br />
        </div>
    }

    const expandedRowRender = (record: any, index: number) => {
        // meeting info
        const info = [
            <div><b>Tiêu đề: </b> {record.name}</div>,
            <div>{showTypeMeeting(record, <em></em>)}</div>,
            <div>
                {props.meetingStatus[record.meeting_status_id] ? (
                    <Tag style={{ color: props.meetingStatus[record.meeting_status_id]?.color, background: props.meetingStatus[record.meeting_status_id]?.background }}>
                        <span>{icon[props.meetingStatus[record.meeting_status_id]?.icon]} </span>
                        <span> {props.meetingStatus[record.meeting_status_id]?.name}</span>
                    </Tag>
                ) : null}
            </div>
        ];

        // detail project or task
        let detail: any[] = [];

        if (record.data_type === 'projects') {
            detail.push(<div><b>Tiêu đề: </b> <a onClick={() => onClickItem(record)}>{record.project_name}</a></div>);
            // project_manager
            detail.push(<div><b>Quản lý: </b>
                {props.users[record.project_manager] ? <Tag style={{ color: '#000' }}>{props.users[record.project_manager].name}</Tag> : ''}
            </div>);
            detail.push(<div><b>Bắt đầu: </b>{record.project_start}</div>);
            detail.push(<div><b>Kết thúc: </b>{record.project_end}</div>);
        }

        if (record.data_type === 'tasks') {
            detail.push(<div><b>Tiêu đề: </b><a onClick={() => onClickItem(record)}>{record.task_name}</a></div>);
            detail.push(<div><b>Người làm: </b>
                {props.users[record.task_nguoi_thuc_hien] ? <Tag style={{ color: '#000' }}>{props.users[record.task_nguoi_thuc_hien].name}</Tag> : ''}
            </div>);
            detail.push(<div><b>Bắt đầu: </b>{record.task_start}</div>);
            detail.push(<div><b>Kết thúc: </b>{record.task_end}</div>);
        }



        return <Row key={record.id}>
            <Col span={12} style={{ background: '#e9f4f9', padding: '10px', marginBottom: '10px' }}   >
                <List
                    header={<b>Thông tin cuộc họp <a className="_right" onClick={() => {
                        let meetingType = [];
                        if (record.is_daily) {
                            meetingType.push('is_daily');
                        }
                        if (record.is_weekly) {
                            meetingType.push('is_weekly');
                        }
                        if (record.is_monthly) {
                            meetingType.push('is_monthly');
                        }
                        if (record.is_yearly) {
                            meetingType.push('is_yearly');
                        }

                        // set
                        setIsModalEdit(true);
                        setMeetingDataAction(record);
                        formMeetingEdit.setFieldsValue({ name: record.name });
                        formMeetingEdit.setFieldsValue({ meeting_status_id: record.meeting_status_id });
                        formMeetingEdit.setFieldsValue({ meeting_type: meetingType });
                    }}><EditFilled /></a></b>}
                    bordered
                    dataSource={info}
                    renderItem={(item: any) => (
                        <List.Item>
                            {item}
                        </List.Item>
                    )}
                />
            </Col>
            <Col span={12} style={{ background: '#eff7f1', padding: '10px', marginBottom: '10px' }}   >
                <List
                    header={<a onClick={() => onClickItem(record)}><b> <EyeOutlined /> Chi tiết công việc</b></a>}
                    bordered
                    dataSource={detail}
                    renderItem={(item: any) => (
                        <List.Item>
                            {item}
                        </List.Item>
                    )}
                />
            </Col>
            <Col span={24} style={{ background: '#fff', padding: '10px', marginBottom: '10px' }}   >
                <p><b>Nội dung cuộc họp:</b></p>
                <div dangerouslySetInnerHTML={{ __html: record.description }} />
            </Col>
        </Row>
    }

    const cancelEdit = () => {
        setIsOpenFormEdit(false);
    }

    function formAddExpress(users: any) {
        const formAddExpress_default = {
            name: '',
            meeting_type: 'is_daily',
            meeting_status_id: 1,
            task_id: null
        };
        const [formAddExpress, setFormAddExpress] = useState([formAddExpress_default, formAddExpress_default, formAddExpress_default]);
        const [status_applyAll, setStatus_applyAll] = useState(true);

        function remove(key: number) {
            setFormAddExpress(prev =>
                prev.filter((_, index) => index !== key)
            );
        }

        function updateformAddExpres(idx: number, key: string, val: any) {
            if (key === 'meeting_status_id' && status_applyAll) {
                setFormAddExpress(prev =>
                    prev.map(item => ({
                        ...item,
                        [key]: val
                    }))
                );
                return;
            }

            let updated = [...formAddExpress]; // sao chép mảng
            updated[idx] = { ...updated[idx], [key]: val }; // cập nhật phần tử
            setFormAddExpress(updated); // cập nhật state
        };

        function addExpress() {
            // validation form
            let isValid = true;
            formAddExpress.forEach((item, index) => {
                if (item.name && item.name.trim() !== '' && !item.meeting_status_id) {
                    isValid = false;
                    message.error(<em>Vui lòng nhập trạng thái cho <b>{item.name}</b></em>);
                }
            });
            if (!isValid) return;

            setIsLoadingBtn(true);
            axios.post(route("meeting.addExpress"), {
                datas: formAddExpress,
                searchData: props.searchData
            }).then((response) => {
                setDataSource(response.data.data);
                message.success("Tạo mới thành công");
                setIsLoadingBtn(false);
                setIsOpenFormEdit(false)
            }).catch((error) => {
                message.error("Tạo mới thất bại");
            });
        }

        return <div>
            <table className="table-sub">
                <thead>
                    <tr>
                        <th>
                            <span>Tiêu đề </span>
                            {showInfo('Chỉ lưu những công việc có nhập nội dung cho tiêu đề. nếu bỏ trống tiêu đề thì sẽ bỏ qua')}
                        </th>
                        <th>
                            <span>Chọn công việc cần họp </span>
                            {showInfo('Chọn công việc đã tạo sẵn trước đó')}
                        </th>
                        <th>
                            <span>Meeting </span>
                            {showInfo('Loại cuộc họp')}
                            <br />
                            <Checkbox checked={status_applyAll}
                                onChange={(e) => { setStatus_applyAll(e.target.checked) }}
                            >
                                <em>Áp dụng tất cả</em>
                            </Checkbox>
                        </th>
                        <th>
                            <span>Trạng thái </span>
                            {showInfo('Trạng thái cuộc họp')}
                            <br />
                            <Checkbox checked={status_applyAll}
                                onChange={(e) => { setStatus_applyAll(e.target.checked) }}
                            >
                                <em>Áp dụng tất cả</em>
                            </Checkbox>
                        </th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                {/* form Thêm task express */}
                {
                    formAddExpress.map((item, key) => {

                        return <tbody key={key}>
                            <tr>
                                <td>
                                    <Input.TextArea value={item.name}
                                        placeholder="Nhập tiêu đề"
                                        onChange={(e) => {
                                            updateformAddExpres(key, 'name', e.target.value);
                                        }}
                                    />
                                </td>
                                <td>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn trạng thái"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={[
                                            { label: 'Daily', value: 'is_daily' },
                                            { label: 'Weekly', value: 'is_weekly' },
                                            { label: 'Monthly', value: 'is_monthly' },
                                            { label: 'Yearly', value: 'is_yearly' },
                                        ]}
                                        value={item.meeting_type}
                                        onChange={(val) => {
                                            updateformAddExpres(key, 'meeting_type', val);
                                        }}
                                    />
                                </td>
                                <td>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn trạng thái"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={optionEntries(props.meetingStatus)}
                                        value={item.meeting_status_id}
                                        onChange={(val) => {
                                            updateformAddExpres(key, 'meeting_status_id', val);
                                        }}
                                    />
                                </td>
                                <td>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn công việc"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={props.tasks.map((task: any) => ({
                                            label: task.name,
                                            value: task.id
                                        }))}
                                        value={item.task_id}
                                        onChange={(val) => {
                                            updateformAddExpres(key, 'task_id', val);
                                        }}
                                    />
                                </td>
                                <td>
                                    <span onClick={() => remove(key)} title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                                </td>
                            </tr>

                        </tbody>
                    })
                }

                <tbody>
                    <tr>
                        <td colSpan={4}>
                            <a className="add-item01">
                                <span className="icon-b" onClick={() => setFormAddExpress(prev => [...prev, formAddExpress_default])}>
                                    <PlusCircleOutlined /> Thêm meeting
                                </span>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}>
                            <Row className="main-modal-footer01">
                                <Col span={24} className="main-btn-popup">
                                    <Button className="btn-popup" type="primary" onClick={() => addExpress()} loading={isLoadingBtn}>
                                        <CheckOutlined />
                                        TẠO NHANH
                                    </Button>
                                    <span> </span>
                                    <Button className="btn-popup" onClick={() => setIsOpenFormEdit(false)} loading={isLoadingBtn}>
                                        <CloseSquareOutlined />
                                        ĐÓNG
                                    </Button>
                                </Col>
                            </Row>
                        </td>
                    </tr>
                </tbody>

            </table>
        </div>
    }

    function addNewData() {
        setIsOpenFormEdit(true);
        formEdit.resetFields();
    }

    function btnAddNew() {

        return <div>

            <Button type="primary" onClick={() => addNewData()}>
                <PlusCircleOutlined />
                Thêm mới
            </Button>

            {/* modal them moi */}
            <Modal
                title={"Thêm nhanh nội dung meeting"}
                open={isOpenFormEdit}
                onCancel={cancelEdit}
                footer={[]}
                width={1000}
            >
                {formAddExpress(props.users)}
            </Modal>

        </div>
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

    function onClickItem(record: any) {
        if (record.data_type === 'projects') {
            setOpenProjectDetail(true);
            axios.post(route('project.getProjectInfo', record.data_id)).then((res) => {
                console.log('res', res);
                setProjectChecklist(res.data.data.checklist);
                setProjectChecklistPercent(res.data.data.percent);
                setProjectComments(res.data.data.comments);
                setProjectDataAction(res.data.data.project);
            });
        }
        if (record.data_type === 'tasks') {
            setOpenTaskDetail(true);
            axios.post(route('task.getTaskInfo', record.data_id)).then((res) => {
                console.log(res);
                setTaskChecklist(res.data.data.checklist);
                setTaskChecklistPercent(res.data.data.percent);
                setTaskComments(res.data.data.comments);
                setTaskAction(res.data.data.task);
                setPriority(res.data.data.priority);
                setTaskLog(res.data.data.logs);
            });
        }
    }

    function showTypeMeeting(record: any, style = <br />) {
        let result = [];
        let isMeetting = false;
        if (record.is_daily === 1) {
            isMeetting = true;
            result.push(<Tag color="blue">Daily</Tag>);
        }
        if (record.is_weekly === 1) {
            if (isMeetting) {
                result.push(style);
            }
            result.push(<Tag color="green">Weekly</Tag>);
        }
        if (record.is_monthly === 1) {
            if (isMeetting) {
                result.push(style);
            }
            result.push(<Tag color="purple">Monthly</Tag>);
        }
        return result;
    }

    function showNguoiThucHien(record: any) {
        let result = [];
        let isLine01 = false;
        if (props.users[record.task_nguoi_thuc_hien]) {
            isLine01 = true;
            result.push(<Tag color="cyan">{props.users[record.task_nguoi_thuc_hien].name}</Tag>);
        }
        if (props.users[record.project_manager]) {
            isLine01 = true;
            result.push(<Tag color="cyan">{props.users[record.project_manager].name}</Tag>);
        }

        if (props.taskStatus[record.task_status_id]) {
            if (isLine01) {
                result.push(<br />);
            }
            result.push(
                <Tag style={{ color: props.taskStatus[record.task_status_id]?.color, background: props.taskStatus[record.task_status_id]?.background }}>
                    <span>{icon[props.taskStatus[record.task_status_id]?.icon]} </span>
                    <span> {props.taskStatus[record.task_status_id]?.name}</span>
                </Tag>
            );
        }

        if (props.projectStatus[record.project_status_id]) {
            if (isLine01) {
                result.push(<br />);
            }
            result.push(
                <Tag style={{ color: props.projectStatus[record.project_status_id]?.color, background: props.projectStatus[record.project_status_id]?.background }}>
                    <span>{icon[props.projectStatus[record.project_status_id]?.icon]} </span>
                    <span> {props.projectStatus[record.project_status_id]?.name}</span>
                </Tag>
            );
        }

        return <>{result}</>;
    }

    function onFinishInputFastEdit(value: any, colName: any, record: any) {
        // set value
        value.column_name = colName;
        value.id = record.id;
        value.search = props.request;

        axios
            .post(route("data.fastEdit", [props.table.id]), value)
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

    const columns2: ColumnsType<any> = [
        {
            title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                return <b>{text}</b>
            }
        },
        {
            title: 'Meeting', dataIndex: 'Meeting', render: (text, record: any) => {
                return showTypeMeeting(record);
            }
        },
        {
            title: 'Người làm', dataIndex: 'nguoi_thuc_hien', render: (text, record: any) => {
                return showNguoiThucHien(record);
            }
        },
        {
            title: 'Kết quả', dataIndex: 'status', render: (text: any, record: any) => {
                return <>
                    {
                        props.meetingStatus[record.meeting_status_id] ? (
                            <Tag style={{ color: props.meetingStatus[record.meeting_status_id]?.color, background: props.meetingStatus[record.meeting_status_id]?.background }}>
                                <span>{icon[props.meetingStatus[record.meeting_status_id]?.icon]} </span>
                                <span> {props.meetingStatus[record.meeting_status_id]?.name}</span>
                            </Tag>
                        ) : null
                    }
                </>
            }
        },
    ];


    return (
        <div>
            <AdminLayout
                auth={props.auth}
                current={props.table}
                content={
                    <div>

                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            onOk={async () => {
                                setConfirmLoading(true);
                                const result = await callApi(route('hoa_don.huyHoaDon.xuatHuy', [idAction]));
                                if (result.status === 200) {
                                    message.success("Đã hủy đơn thành công");
                                    location.reload();
                                } else {
                                    setConfirmLoading(false);
                                    message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                }
                            }}
                            okText="Xác nhận hủy đơn"
                            cancelText="Hủy"
                            loading={true}
                            maskClosable={true}
                            // confirmLoading={confirmLoading}
                            onCancel={() => { setIsModalXoaOpen(false); }}>
                            <ul>
                                <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                                <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                                <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                            </ul>
                        </Modal>

                        <Modal title="Cập nhật meeting"
                            width={1000}
                            open={isModalEdit}
                            onOk={async () => {
                                formMeetingEdit.submit();
                            }}
                            okText="Xác nhận hủy đơn"
                            cancelText="Hủy"
                            confirmLoading={confirmLoading}
                            maskClosable={false}
                            onCancel={() => { setIsModalEdit(false); }}>

                            <Form form={formMeetingEdit}
                                component={false}
                                layout="vertical"
                                onFinish={(values) => {
                                    setConfirmLoading(true);
                                    // xử lý dữ liệu trước khi submit
                                    values.description = editor.current['description'].getContents(false);
                                    values.id = meetingDataAction.id;
                                    values.searchData = props.searchData;
                                    // call api
                                    axios.post(route('meeting.updateMeeting'), values).then((res) => {
                                        if (res.data.status_code === 200) {
                                            message.success("Lưu dữ liệu thành công");
                                            setIsModalEdit(false);
                                            setConfirmLoading(false);
                                            setDataSource(res.data.data);
                                        } else {
                                            message.error("Lưu dữ liệu thất bại");
                                            setConfirmLoading(false);
                                        }
                                        setConfirmLoading(false);
                                    }).catch((error) => {
                                        message.error("Lưu dữ liệu thất bại");
                                        setConfirmLoading(false);
                                    });
                                }}
                            >
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item
                                            name="name"
                                            label="Tiêu đề"
                                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                                        >
                                            <Input placeholder="Nhập tiêu đề" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="meeting_type"
                                            label="Loại cuộc họp"
                                            rules={[{ required: true, message: 'Vui lòng chọn loại cuộc họp' }]}
                                        >
                                            <Select
                                                showSearch
                                                mode='multiple'
                                                style={{ width: "100%" }}
                                                placeholder="Chọn loại cuộc họp"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                options={[
                                                    { label: 'Daily', value: 'is_daily' },
                                                    { label: 'Weekly', value: 'is_weekly' },
                                                    { label: 'Monthly', value: 'is_monthly' },
                                                    { label: 'Yearly', value: 'is_yearly' },
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="meeting_status_id"
                                            label="Trạng thái cuộc họp"
                                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái cuộc họp' }]}
                                        >
                                            <Select
                                                showSearch
                                                style={{ width: "100%" }}
                                                placeholder="Chọn trạng thái cuộc họp"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                options={optionEntries(props.meetingStatus)}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={24}>

                                        <SunEditor getSunEditorInstance={(sunEditor) => { editor.current['description'] = sunEditor }}
                                            setContents={meetingDataAction.description ? meetingDataAction.description : ''}
                                            onImageUpload={handleImageUpload}
                                            onImageUploadError={handleImageUploadError}
                                            onResizeEditor={handleOnResizeEditor}
                                            imageUploadHandler={(xmlHttpRequest: any, info: any, core: any) => imageUploadHandler(xmlHttpRequest, info, core, 'description')}
                                            setOptions={optionSunEditor}
                                        />
                                    </Col>
                                </Row>
                            </Form>
                        </Modal>

                        {/* pageContent */}
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

                                    </Space>
                                    <Space className="_right">
                                        {/* {checkShowBtnDelete()}

                                        {btnIndex()}

                                        {checkShowBtnExcel()} */}
                                    </Space>

                                    {/* page name */}
                                    <b className="title-page">Meeting.</b>

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
                                            columns={columns2}
                                            rowSelection={rowSelection}
                                            // rowClassName="editable-row"
                                            // className="table-index"
                                            expandable={{
                                                expandedRowRender,
                                                defaultExpandedRowKeys: ['1'],
                                            }}

                                        />
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        {/* end pageContent */}

                        <Drawer
                            title="Chi tiết dự án"
                            placement="right"
                            open={openProjectDetail}
                            // size={'large'}
                            onClose={() => setOpenProjectDetail(false)}
                            width="90%"
                        >
                            {projectInfo(props,
                                projectAction,
                                projectComments,
                                projectChecklist,
                                projectChecklistPercent,
                                (result: any) => {
                                    // set data action, dùng cho case fast edit
                                    if (result.dataAction) {
                                        setProjectDataAction(result.dataAction);
                                    }

                                    // set checklist
                                    if (result.checklist) {
                                        setProjectChecklist(result.checklist);
                                    }

                                    // set percent
                                    if (result.checklist_percent !== undefined) {
                                        setProjectChecklistPercent(result.checklist_percent);
                                    }
                                    // set comments
                                    if (result.comments) {
                                        setProjectComments(result.comments);
                                    }

                                    if (result.isClosed) {
                                        setOpenProjectDetail(false);
                                    }
                                })}

                            <br />
                        </Drawer>

                        <Drawer
                            title="Chi tiết công việc"
                            placement="right"
                            open={openTaskDetail}
                            onClose={() => setOpenTaskDetail(false)}
                            width="90%"
                        >
                            {taskInfo(props,
                                taskAction,
                                taskComments,
                                taskChecklist,
                                taskChecklistPercent,
                                taskLog,
                                priority,
                                (result: any) => {
                                    // set columns, dùng cho case fast edit
                                    // if (result.columns) {
                                    //     setDataSource(result.columns);
                                    // }

                                    // set data action, dùng cho case fast edit
                                    if (result.data) {
                                        setTaskAction(result.data);
                                    }

                                    // set checklist
                                    if (result.checklist) {
                                        setTaskChecklist(result.checklist);
                                    }

                                    // set percent
                                    if (result.checklist_percent !== undefined) {
                                        setTaskChecklistPercent(result.checklist_percent);
                                    }
                                    // set comments
                                    if (result.comments) {
                                        setTaskComments(result.comments);
                                    }

                                })}

                            <br />

                        </Drawer>
                    </div>
                }
            />
        </div>
    );
}
