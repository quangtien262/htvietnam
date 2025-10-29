import React, { useState, useEffect, useRef, Suspense } from 'react';
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
    PlusCircleOutlined,
    DeleteOutlined,
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

import { DATE_FORMAT, DATE_TIME_FORMAT } from '../../../Function/constant'

import { taskInfo } from "../Task/task_config";
import { projectInfo } from "../Project/project_config";


import { showDataSearch02 } from "../../../Function/input";

import { icon as iconRaw } from "../../../components/comp_icon";
import { optionEntries, formatGdata_column, onDrop, nl2br, parseJson, showInfo, inArray } from "../../../Function/common";
import { set } from 'lodash';
const icon: Record<string, React.ReactElement> = iconRaw;
const CheckboxGroup = Checkbox.Group;
export default function meeting(props: any) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);

    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [formMeetingEdit] = Form.useForm();
    const editor = useRef<{ [key: string]: any }>({});


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

    const [searchData, setSearchData] = useState([]);
    const [meetingStatus, setMeetingStatus] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectStatus, setProjectStatus] = useState([]);
    const [taskStatus, setTaskStatus] = useState([]);
    // const [users, setUsers] = useState([]);





    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 1,
            position: ["bottonRight"],
            total: 1,
            onChange: (page, pageSize) => setPagination({ page, pageSize }),
        },
    });

    useEffect(() => {
        axios.post(route('meeting.fetchIndexData', {})).then((res) => {
            console.log('res.data.data', res.data.data);
            setDataSource(res.data.data.dataSource);
            setMeetingStatus(res.data.data.meetingStatus);
            setTasks(res.data.data.tasks);
            setUsers(res.data.data.users);
            setSearchData(res.data.data.searchData || {
                sm_keyword: '',
                meeting: [],
                result: [],
            });
        }).catch((err) => {
            console.error(err);
        });
    }, [props.meetingStatus]);



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
        return pagination;
        // router.get(
        //     route("data.index", [props.table.id, props.searchData]),
        //     pagination
        // );
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

    const onFinishSearch = (values: any) => {
        values.p = props.p;
        router.get(route("meeting.index"), values);
    };

    const onFinishSearchFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };


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
                                options={meetingStatus ? optionEntries(meetingStatus) : []}
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
                {meetingStatus[record.meeting_status_id] ? (
                    <Tag key={record.id} style={{ color: meetingStatus[record.meeting_status_id]?.color, background: meetingStatus[record.meeting_status_id]?.background }}>
                        <span>{icon[meetingStatus[record.meeting_status_id]?.icon]} </span>
                        <span> {meetingStatus[record.meeting_status_id]?.name}</span>
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
                {users[record.project_manager] ? <Tag style={{ color: '#000' }}>{users[record.project_manager].name}</Tag> : ''}
            </div>);
            detail.push(<div><b>Bắt đầu: </b>{record.project_start}</div>);
            detail.push(<div><b>Kết thúc: </b>{record.project_end}</div>);
        }

        if (record.data_type === 'tasks') {
            detail.push(<div><b>Tiêu đề: </b><a onClick={() => onClickItem(record)}>{record.task_name}</a></div>);
            detail.push(<div><b>Người làm: </b>
                {users[record.task_nguoi_thuc_hien] ? <Tag style={{ color: '#000' }}>{users[record.task_nguoi_thuc_hien].name}</Tag> : ''}
            </div>);
            detail.push(<div><b>Bắt đầu: </b>{record.task_start}</div>);
            detail.push(<div><b>Kết thúc: </b>{record.task_end}</div>);
        }



        return <Row key={record.id}>
            <Col span={12} style={{ background: '#e9f4f9', padding: '10px', marginBottom: '10px' }}   >
                <List
                    header={<b> <a onClick={() => {
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
                        formMeetingEdit.setFieldsValue({ meeting_status_id: record.meeting_status_id.toString() });
                        formMeetingEdit.setFieldsValue({ meeting_type: meetingType });
                    }}><EditFilled /> Thông tin cuộc họp</a>

                    </b>}
                    bordered
                    dataSource={info}
                    renderItem={(item: any, idx: number) => (
                        <List.Item key={idx}>
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

    function formAddExpress() {
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
                searchData: searchData
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
                                        options={optionEntries(meetingStatus)}
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
                                        options={tasks.map((task: any) => ({
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
            result.push(<Tag color="blue" key="daily">Daily</Tag>);
        }
        if (record.is_weekly === 1) {
            if (isMeetting) result.push(React.cloneElement(style, { key: "weekly-br" }));
            result.push(<Tag color="green" key="weekly">Weekly</Tag>);
        }
        if (record.is_monthly === 1) {
            if (isMeetting) result.push(React.cloneElement(style, { key: "monthly-br" }));
            result.push(<Tag color="purple" key="monthly">Monthly</Tag>);
        }
        return result;
    }

    function showNguoiThucHien(record: any) {
        let result = [];
        let isLine01 = false;
        if (users[record.task_nguoi_thuc_hien]) {
            isLine01 = true;
            result.push(<Tag color="cyan">{users[record.task_nguoi_thuc_hien].name}</Tag>);
        }
        if (users[record.project_manager]) {
            isLine01 = true;
            result.push(<Tag color="cyan">{users[record.project_manager].name}</Tag>);
        }

        if (taskStatus[record.task_status_id]) {
            if (isLine01) {
                result.push(<br />);
            }
            result.push(
                <Tag style={{ color: taskStatus[record.task_status_id]?.color, background: taskStatus[record.task_status_id]?.background }}>
                    <span>{icon[taskStatus[record.task_status_id]?.icon]} </span>
                    <span> {taskStatus[record.task_status_id]?.name}</span>
                </Tag>
            );
        }

        if (projectStatus[record.project_status_id]) {
            if (isLine01) {
                result.push(<br />);
            }
            result.push(
                <Tag style={{ color: projectStatus[record.project_status_id]?.color, background: projectStatus[record.project_status_id]?.background }}>
                    <span>{icon[projectStatus[record.project_status_id]?.icon]} </span>
                    <span> {projectStatus[record.project_status_id]?.name}</span>
                </Tag>
            );
        }

        return <>{result}</>;
    }

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
                        meetingStatus[record.meeting_status_id] ? (
                            <Tag style={{ color: meetingStatus[record.meeting_status_id]?.color, background: meetingStatus[record.meeting_status_id]?.background }}>
                                <span>{icon[meetingStatus[record.meeting_status_id]?.icon]} </span>
                                <span> {meetingStatus[record.meeting_status_id]?.name}</span>
                            </Tag>
                        ) : null
                    }
                </>
            }
        },
    ];

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

                    <Space>

                    </Space>
                    <Space className="_right">
                        <Button
                            key="delete"
                            type="primary"
                            onClick={confirmDelete}
                            disabled={!hasSelected}
                            loading={loadingBtnDelete}
                        >
                            <DeleteOutlined />
                            Xóa {hasSelected ? `(${selectedRowKeys.length})` : ""}
                        </Button>


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
                            {formAddExpress()}
                        </Modal>
                    </Space>

                    {/* page name */}
                    <b className="title-page">Meeting.</b>

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
    );

    return (
        <div>
            <AdminLayout content={
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
                        okText="Cập nhật"
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

                    {pageContent}

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
                            })
                        }


                        <br />
                    </Drawer>

                    {/* <Drawer
                        title="Chi tiết công việc 1"
                        placement="right"
                        open={openTaskDetail}
                        onClose={() => {
                            setOpenTaskDetail(false);
                            // setShowTask(true);
                            // setShowProject(true);
                        }}
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

                            })
                        }

                        <br />

                    </Drawer> */}
                </div>
            }
            />
        </div>
    );
}
