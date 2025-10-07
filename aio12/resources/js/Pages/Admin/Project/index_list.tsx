import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    Table,
    message,
    Modal, Drawer,
    Form,
    Input,
    TableColumnsType,
    Popconfirm,
    List,
    Select,
    Row, Col,
    Space,
    DatePicker,
    Card, Flex, Progress,
    Tag, Popover,
    Timeline,
    Divider,
    Empty,
    Checkbox,
    Dropdown,
} from "antd";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    SettingOutlined, ScheduleFilled, PushpinFilled,
    FieldTimeOutlined, FileSyncOutlined,
    FileSearchOutlined, DownOutlined,
    PlusCircleOutlined, PlusSquareFilled,
    DeleteOutlined, CheckSquareFilled,
    EditOutlined, InfoCircleFilled,
    EyeOutlined, EditFilled,
    DiffFilled,
    CheckOutlined, SnippetsFilled,
    UsergroupAddOutlined,
    FlagFilled, HddFilled,
    FileMarkdownOutlined, UserSwitchOutlined,
    SettingFilled, UserOutlined,
    CaretRightOutlined, PlusCircleFilled,
} from "@ant-design/icons";

import "../../../../css/task.css";

import { callApi } from "../../../Function/api";


import { inArray, nl2br, numberFormat, removeByIndex, optionEntries, showInfo, objEntries } from "../../../Function/common";
import dayjs from "dayjs";
import { projectConfig, formProject, getProjectDetail } from "./project_config";

import { DATE_FORMAT, DATE_TIME_FORMAT, DATE_SHOW, DATE_TIME_SHOW, TITLE } from '../../../Function/constant';
import { cloneDeep } from "lodash";
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
    HTTime, HTColor, HTCascaderTable, smartSearch02, showDataSearch, showDataSearch02
} from "../../../Function/input";

import { MOC_THOI_GIAN } from "../../../Function/constant";

import { showSelects, showSelect } from '../../../Function/selects_table';

// image
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import ImgCrop from 'antd-img-crop';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { icon } from "../../../components/comp_icon";

export default function Dashboard(props) {
    sessionStorage.clear();
    const { RangePicker } = DatePicker;
    const dateFormat = 'YYYY/MM/DD';

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource.data);
    const [dataInfo, setDataInfo] = useState([]);
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [checkListAction, setCheckListAction] = useState({ id: 0 });
    const [commentAction, setCommentAction] = useState({ id: 0 });

    const [isModalAddExpress, setIsModalAddExpress] = useState(false);

    const [statusData, setStatusData] = useState(props.statusData);
    const [status, setStatus] = useState(props.status);
    const [type, setType] = useState(props.type);

    const [form] = Form.useForm();

    const [idAction, setIdAction] = useState(0);


    const [dataAction, setDataAction] = useState({ id: 0 });
    const formChecklist_default = { name: '', content: '', admin_user_id: null };
    const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default, formChecklist_default]);
    const [isApplyAll, setIsApplyAll] = useState(true);
    const [isModalChecklist, setIsModalChecklist] = useState(false);

    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);


    const [formSearch] = Form.useForm();

    // save: save and close
    // save_continue: save and add new
    const [typeSubmit, setTypeSubmit] = useState('save');

    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [formDesc] = Form.useForm();
    const [formTitle] = Form.useForm();
    const [formComment] = Form.useForm();
    const [comments, setComments] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [checklistPercent, setChecklistPercent] = useState(0);

    const [openDetail, setOpenDetail] = useState(false);


    // import excel
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: props.dataSource.current_page,
            pageSize: props.dataSource.per_page,
            position: ["bottomRight"],
            total: props.dataSource.total,
            onChange: (page, pageSize) => setPagination({ page, pageSize }),
        },
    });

    function setPagination(pagination: any) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }

    const handleDelete = (id: number) => {
        const params = {
            parentName: props.parentName,
            pid: props.pid,
            searchData: props.searchData,
            p: props.p
        };
        axios.post(route('project.delete', id), params).then(response => {
            setDataSource(response.data.data.datas);
            setDataAction(response.data.data.dataAction);
        }).catch(error => {
            message.error('Xóa thất bại');
        });


        setOpenDetail(false);
        message.success("Đã xóa thành công");
    };

    function updateByColumn(id: number, columnName: string, value: any) {
        setDataAction({
            ...dataAction,
            [columnName]: value,
        });

        axios.post(route('project.fastEditProject'), {
            column_name: columnName,
            id: dataAction.id,
            value: value,
            parentName: props.parentName,
            searchData: props.searchData,
            display: props.display,
        }).then(response => {
            setIsLoadingBtn(false);
            setDataSource(response.data.data.datas);
            setDataAction(response.data.data.dataAction);
            message.success('Cập nhật thành công');
        }).catch(error => {
            message.error('Cập nhật thất bại');
        });
    }

    const onFinishFormDesc = async (values) => {
        updateByColumn(dataAction.id, 'description', values.description);
    }

    //onFinishFormComment
    const onFinishFormComment = async (values) => {
        setIsLoadingBtn(true);

        axios.post(route('task.addComment'), {
            task_id: dataAction.id,
            content: values.content
        }).then(response => {
            formComment.resetFields();
            setIsLoadingBtn(false);
            setComments(response.data.data);
            message.success('Đã thêm comment');
        }).catch(error => {
            message.error('Thêm comment thất bại');
        });
    }



    function closeModalAdd() {
        setIsModalAddOpen(false);
    }

    // createChecklist
    function createChecklist() {
        // setIsLoadingBtn(true);
        axios.post(route("project.addChecklist"), {
            data: formChecklist,
            project_id: dataAction.id,
            checklist_id: checkListAction.id,
        }).then((response) => {
            console.log(response.data);
            setChecklist(response.data.data.list);
            setChecklistPercent(response.data.data.percent);
            setIsLoadingBtn(false);
            setIsModalChecklist(false);
            message.success("Tạo checklist thành công");
            const formChecklist_tmp = [formChecklist_default, formChecklist_default, formChecklist_default, formChecklist_default];
            setFormChecklist(formChecklist_tmp);
        }).catch((error) => {
            message.error("Tạo checklist thất bại");
        });
    }


    function removeFormChecklist(key) {
        setFormChecklist(prev =>
            prev.filter((_, index) => index !== key)
        );
    }

    function formAddTaskChecklist(users, task) {
        function addFormCheckList() {
            setFormChecklist(prev => [...prev, formChecklist_default]);
        }

        function updateChecklistByIndex(indexToUpdate, updatedData) {
            setFormChecklist(prev =>
                prev.map((item, index) =>
                    index === indexToUpdate ? { ...item, ...updatedData } : item
                )
            );
        }

        return <table className="table-sub">
            <thead>
                <tr>
                    <th>Tiêu đề</th>
                    <th>Mô tả</th>
                    <th>
                        Người thực hiện
                        <br />
                        <Checkbox checked={isApplyAll}
                            onChange={(e) => setIsApplyAll(e.target.checked)}
                        >
                            Áp dụng tất cả
                        </Checkbox>
                    </th>
                    <th>Xóa</th>
                </tr>
            </thead>
            {/* form Thêm checklist */}
            {
                formChecklist.map((item, key) => {
                    return <tbody key={key}>
                        <tr>
                            <td>
                                <Input value={item.name} onChange={(e) => updateChecklistByIndex(key, { name: e.target.value })} />
                            </td>
                            <td>
                                <Input.TextArea value={item.content} onChange={(e) => updateChecklistByIndex(key, { content: e.target.value })} />
                            </td>
                            <td>
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
                                    value={item.admin_user_id}
                                    options={optionEntries(users)}
                                    onChange={(value) => {
                                        if (!isApplyAll) {
                                            updateChecklistByIndex(key, { admin_user_id: value });
                                        }
                                        setFormChecklist(prev =>
                                            prev.map(item => ({
                                                ...item,
                                                admin_user_id: value
                                            }))
                                        );
                                        return;

                                    }}
                                />
                            </td>

                            {
                                checkListAction.id === 0 ? (
                                    <td>
                                        <span onClick={() => removeFormChecklist(key)}
                                            title="Xóa"
                                            className="icon-large cursor"
                                            key="list-loadmore-more">
                                            <DeleteOutlined />
                                        </span>
                                    </td>
                                ) : null
                            }
                        </tr>

                    </tbody>
                })
            }

            <tbody>
                <tr>
                    <td colSpan={4}>
                        <a className="add-item01" onClick={() => addFormCheckList()}>
                            <span className="icon-b"><PlusCircleOutlined /> Thêm Checklist</span>
                        </a>
                    </td>
                </tr>
                <tr>
                    <td colSpan={4}>
                        <Row className="main-modal-footer01">
                            <Col span={24} className="main-btn-popup">
                                <span> </span>
                                <Button className="btn-popup"
                                    loading={isLoadingBtn}
                                    type="primary"
                                    onClick={() => createChecklist()}
                                >
                                    <CheckOutlined />
                                    Lưu Checklist
                                </Button>
                            </Col>
                        </Row>
                    </td>
                </tr>
            </tbody>

        </table>
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

        // mocThoiGian
        values.mocThoiGian = mocThoiGian;
        if (khoangThoiGian[0]) {
            console.log('khoangThoiGian', khoangThoiGian);
            values.khoangThoiGian = khoangThoiGian.map((item) => {
                return item.format("YYYY-MM-DD");
            });
        } else {
            values.khoangThoiGian = null;
        }
        router.get(route("soQuy"), values);
    };


    const expandedRowRender = (record: any, index: number) => {
        return getProjectDetail(props, record, index, dataInfo, (data: any) => setDataInfo(data.info));
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState({ expandedRowRender, defaultExpandedRowKeys: ['1'] });
    // const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


    const columns2: TableColumnsType = [
        {
            title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                // console.log('record', record);
                return <>
                    <Link href={route('task.list', { parentName: props.parentName, pid: record.id, p: props.p })}>{text}</Link>
                    {record.description ? <p>{record.description}</p> : ''}
                </>;
            }
        },
        {
            title: 'PM', dataIndex: 'project_manager', render: (text, record: any) => {
                return <>
                    {props.users[record.project_manager] ? <Tag style={{ color: '#000' }}>{props.users[record.project_manager].name}</Tag> : ''}
                </>;
            }
        },
        {
            title: 'Trạng thái', dataIndex: 'project_status_id', render: (text, record: any) => {
                return status[record.project_status_id] ? (
                    <Tag style={{ color: status[record.project_status_id]?.color, background: status[record.project_status_id]?.background }}>
                        <span>{icon[status[record.project_status_id]?.icon]} </span>
                        <span> {status[record.project_status_id]?.name}</span>
                    </Tag>
                ) : null;
            }
        },
        {
            title: 'Thời gian', dataIndex: 'date', render: (text, record: any) => {
                return <>
                    {record.start ? <p><b>Start:</b> {record.start}</p> : ''}
                    {record.end ? <p><b>End:</b> {record.end}</p> : ''}
                </>;
            }
        },
        {
            title: <SettingOutlined />,
            dataIndex: 'date', render: (text, record: any) => {
                return <a onClick={async () => {
                    console.log('record', record);
                    setOpenDetail(true);
                    setDataAction(record);
                    const res = await callApi(route('project.getProjectInfo', [record.id]));
                    setChecklist(res.data.data.checklist);
                    setComments(res.data.data.comments);
                    setChecklistPercent(res.data.data.percent);
                    if (formDesc) {
                        formDesc.setFieldValue('description', record.description);
                    }
                }}><SettingOutlined /></a>;
            }
        },
    ];


    // xoa check list
    const removeChecklistByIndex = (indexToRemove: number, id: number) => {
        setChecklist(prev => prev.filter((checklist, index) => index !== indexToRemove));
        axios.post(route('data.fastEditByTableName'), {
            column_name: 'is_recycle_bin',
            tbl_name: 'project_checklist',
            id: id,
            value: 1,
            project_id: dataAction.id,
        }).then(response => {
            setIsLoadingBtn(false);
            setChecklistPercent(response.data.data.percent);
            message.success('Xóa checklist thành công');
        }).catch(error => {
            message.error('Xóa checklist thất bại');
        });
    };

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
                        confirmLoading={loadingBtnDelete}
                    >
                        <p>
                            Dữ liệu đã xóa sẽ <b>không thể khôi phục</b> lại
                            được <br />{" "}
                            <b>(Số lượng {selectedRowKeys.length})</b>
                        </p>
                    </Modal>


                    <Space>

                    </Space>



                    {/* title */}
                    <Row>
                        <Col sm={{ span: 24 }}>

                            {/* page name */}
                            <b className="title-page">{TITLE[props.parentName]}</b>

                            {/* Show số lượng item/page */}
                            <em> ( Trang {props.dataSource.current_page}, hiển thị{" "}
                                {props.dataSource.per_page}/{props.dataSource.total} )
                            </em>

                            {/* Cài đặt trạng thái */}
                            <Button className="_right"
                                onClick={() => setIsShowStatusSetting(true)}
                            >
                                <SettingFilled /> Cài đặt trạng thái
                            </Button>

                            {/* Thêm mới */}
                            <Button type="primary"
                                className="_right btn-submit01"
                                onClick={() => setIsModalAddOpen(true)}
                            >
                                <PlusCircleFilled /> Thêm mới
                            </Button>

                        </Col>
                    </Row>
                </div>

                <hr />
                <br />

                <Row>
                    <Col sm={{ span: 6 }}>
                        search
                    </Col>
                    <Col sm={{ span: 18 }}>
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
                            dataSource={dataSource}
                            columns={columns2}
                            rowSelection={rowSelection}
                        // rowClassName="editable-row"
                        // expandable={expandable}
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
                content={
                    <div>
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
                            confirmLoading={confirmLoading}
                            onCancel={() => { setIsModalXoaOpen(false); }}>
                            <ul>
                                <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                                <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                                <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                            </ul>
                        </Modal>

                        <Row>
                            <br />
                        </Row>

                        {pageContent}

                        {/* modal  */}

                        <Modal title="Cài đặt trạng thái"
                            className="status-setting"
                            open={isShowStatusSetting}
                            onCancel={() => setIsShowStatusSetting(false)}
                            footer={[]}
                        >
                            <div>

                                {projectConfig(statusData, { parentName: props.parentName, currentName: 'project_status' }, {
                                    name: 'Trạng thái',
                                    description: 'Mô tả ',
                                    color: 'Màu chữ',
                                    background: 'Màu nền',
                                }, (data: any) => {
                                    setStatusData(data.data);
                                    // setColumns(data.columns);
                                })}

                                <Row>
                                    <Col sm={24} className="text-center">
                                        <br />
                                        <Button type="primary"
                                            className="btn-submit01"
                                            onClick={() => setIsShowStatusSetting(false)}>
                                            Đóng
                                        </Button>
                                    </Col>
                                </Row>

                            </div>
                        </Modal>

                        <Modal title="Thêm checklist"
                            open={isModalChecklist}
                            onCancel={() => setIsModalChecklist(false)}
                            footer={[]}
                            width={1000}
                        >
                            {formAddTaskChecklist(props.users, dataAction)}
                        </Modal>

                        {/* Thêm mới */}
                        <Modal title="Thêm mới"
                            open={isModalAddOpen}
                            onCancel={() => closeModalAdd()}
                            footer={[]}
                            width={{
                                xs: '90%',
                                sm: '80%',
                                md: '70%',
                                lg: '60%',
                                xl: '50%',
                                xxl: '40%',
                            }}
                        >

                            {formProject(statusData, props, (data: any) => {
                                console.log('data', data);
                                setDataSource(data);
                                setIsModalAddOpen(false);
                            })}
                        </Modal>

                    </div>
                }
            />

            <Drawer
                title="Chi tiết công việc"
                placement="right"
                open={openDetail}
                // size={'large'}
                onClose={() => setOpenDetail(false)}
                width="90%"
            >
                <Row>
                    <Col sm={16}>
                        <h3>
                            {dataAction.name}
                            <Popconfirm placement="bottomLeft"
                                title="Sửa tiêu đề"
                                trigger="click"
                                onConfirm={() => {
                                    formTitle.submit();
                                }}
                                description={
                                    <Form
                                        name="formTitle"
                                        form={formTitle}
                                        layout="vertical"
                                        onFinish={(values) => {
                                            updateByColumn(dataAction.id, 'name', values.name);
                                        }}
                                        autoComplete="off"
                                        initialValues={{ name: dataAction.name }}
                                    >
                                        <Form.Item className="edit-description" name='name' label=''>
                                            <Input />
                                        </Form.Item>
                                    </Form>
                                }
                            >
                                <a onClick={(e) => formTitle.setFieldValue('name', dataAction.name)} className="_right">
                                    <EditOutlined />
                                </a>
                            </Popconfirm>
                        </h3>
                        <p className="description01">Tạo bởi: {props.users[dataAction.create_by] ? props.users[dataAction.create_by].name : ''}</p>

                        {/* Mo ta */}
                        <Divider orientation="left">
                            <span className="title-desc"><SnippetsFilled /> Mô tả</span>
                            <span> | </span>
                            <Popconfirm
                                icon={<EditFilled />}
                                title="Sửa mô tả"
                                okButtonProps={{ loading: isLoadingBtn }}
                                onConfirm={() => formDesc.submit()}
                                description={
                                    <Form
                                        name="formDesc"
                                        form={formDesc}
                                        layout="vertical"
                                        onFinish={onFinishFormDesc}
                                        autoComplete="off"
                                        initialValues={{ description: dataAction.description }}
                                    >
                                        <Form.Item className="edit-description" name='description' label=''>
                                            <Input.TextArea rows={4} />
                                        </Form.Item>
                                    </Form>
                                }
                            >
                                <a className="desc cursor" onClick={() => formDesc.setFieldValue('description', dataAction.description)} > <EditFilled /> Sửa</a>
                            </Popconfirm>
                        </Divider>
                        <div>
                            <p className="description01">{dataAction.description === null ? <Empty image={null} description="Chưa có mô tả" /> : dataAction.description}</p>
                        </div>

                        {/* Checklist */}
                        <div>
                            <Divider orientation="left">
                                <span className="title-desc"><CheckSquareFilled /> Checklist</span>
                                <span> | </span>
                                <span className="desc cursor" onClick={() => {
                                    setCheckListAction({ id: 0 });
                                    setIsModalChecklist(true);
                                    setFormChecklist([formChecklist_default, formChecklist_default, formChecklist_default]);
                                }}>
                                    <PlusSquareFilled /> Thêm
                                </span>
                            </Divider>
                            <Flex gap="small" vertical>
                                <span>{checklistPercent}%</span>
                                <Progress percent={checklistPercent} status={checklistPercent === 100 ? "success" : "active"} />
                            </Flex>

                            <List
                                className="demo-loadmore-list"
                                itemLayout="horizontal"
                                pagination={{
                                    pageSize: 10, //  số item mỗi trang
                                }}
                                dataSource={!checklist ? [] : checklist.map((item) => { return item; })}
                                locale={{ emptyText: 'Danh sách checklist trống' }}
                                renderItem={(item, key) => (
                                    <List.Item
                                        actions={[
                                            // Chọn người thực hiện checklist
                                            <span>{item.nguoi_thuc_hien_name ? <Tag color="blue">{item.nguoi_thuc_hien_name}</Tag> : ''}</span>,

                                            //sửa checklist
                                            <a title="Sửa checklist này"
                                                onClick={() => {
                                                    setIsModalChecklist(true);
                                                    setCheckListAction(item);
                                                    setFormChecklist([{ id: item.id, name: item.name, content: item.content, admin_user_id: item.nguoi_thuc_hien }]);
                                                }}
                                                className="icon-large"
                                                key="list-loadmore-edit">
                                                <EditOutlined />
                                            </a>,
                                            // xóa checklist
                                            <Popconfirm
                                                icon={<DeleteOutlined />}
                                                title="Xác nhận xóa"
                                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                                onConfirm={() => {
                                                    removeChecklistByIndex(key, item.id);
                                                }}
                                            >
                                                <span title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                                            </Popconfirm>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Checkbox checked={item.is_checked ? true : false}
                                                    onChange={(e) => {
                                                        let status = 0;
                                                        if (e.target.checked) {
                                                            status = 1;
                                                        }

                                                        // update status state
                                                        let checklist_tmp = cloneDeep(checklist);
                                                        checklist_tmp[key].is_checked = status;
                                                        setChecklist(checklist_tmp);
                                                        // update status 2 db
                                                        axios.post(route('data.fastEditByTableName'), {
                                                            column_name: 'is_checked',
                                                            tbl_name: 'project_checklist',
                                                            id: item.id,
                                                            value: status,
                                                            project_id: dataAction.id
                                                        }).then(response => {
                                                            console.log('response', response.data.data);

                                                            setChecklistPercent(response.data.data.percent);
                                                            message.success('Cập nhật thứ tự thành công');
                                                        }).catch(error => {
                                                            message.error('Cập nhật thứ tự thất bại');
                                                        });
                                                    }}
                                                />
                                            }
                                            title={<b style={{ color: item.is_checked ? 'green' : '#000', fontWeight: item.is_checked ? 'normal' : 'bold' }}>{item.name}</b>}
                                            description={item.content !== null || item.content !== '' ? <div dangerouslySetInnerHTML={{ __html: nl2br(item.content) }} /> : ''}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>

                        {/* Comment */}
                        <div>
                            <Divider orientation="left">
                                <span className="title-desc"><CheckSquareFilled /> Comment</span>
                                <span> | </span>
                                <Popconfirm
                                    icon={<EditFilled />}
                                    title="Thêm comment"
                                    okButtonProps={{ loading: isLoadingBtn }}
                                    onConfirm={() => { formComment.submit() }}
                                    description={
                                        <Form
                                            name="formComment"
                                            form={formComment}
                                            layout="vertical"
                                            onFinish={onFinishFormComment}
                                            autoComplete="off"
                                        // initialValues={}
                                        >
                                            <Form.Item className="edit-description" name='content' label=''>
                                                <Input.TextArea rows={4} />
                                            </Form.Item>
                                        </Form>
                                    }
                                >
                                    <span className="desc cursor"> <PlusSquareFilled /> Thêm</span>
                                </Popconfirm>
                            </Divider>

                            <List
                                className="demo-loadmore-list"
                                itemLayout="horizontal"
                                pagination={{
                                    pageSize: 5, // 👉 số item mỗi trang
                                }}
                                dataSource={!comments ? [] : comments.map((item) => { return item; })}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <a title="Sửa comment này" className="icon-large" key="list-loadmore-edit"><EditOutlined /></a>,
                                            <Popconfirm
                                                icon={<DeleteOutlined />}
                                                title="Xác nhận xóa"
                                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                            >
                                                <span title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                                            </Popconfirm>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={<div>
                                            </div>
                                            }
                                            title={<div>
                                                <b>{item.admin_users_name}</b>
                                            </div>
                                            }
                                            description={
                                                <div>
                                                    <em className="text-normal date01"> {dayjs(item.created_at).format(DATE_TIME_FORMAT)}</em>
                                                    <p>{item.content}</p>
                                                </div>

                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Col>

                    {/* right */}
                    <Col sm={8}>
                        <List
                            header={<b><InfoCircleFilled /> Thông tin chi tiết</b>}
                            footer={<div></div>}
                            bordered
                            dataSource={[
                                // status
                                <div className="item03">
                                    <a><PushpinFilled /> </a>
                                    <span>Trạng thái: </span>
                                    {
                                        !dataAction.project_status_id
                                            ?
                                            <span className="value-list">Chưa xác định</span>
                                            :
                                            <>
                                                <Tag style={{ color: status[dataAction.project_status_id].color, background: status[dataAction.project_status_id].background }}>
                                                    <span>{icon[status[dataAction.project_status_id].icon]} </span>
                                                    <span> {status[dataAction.project_status_id].name}</span>
                                                </Tag>
                                            </>
                                    }
                                    <Popover placement="bottomLeft"
                                        title="Chọn trạng thái"
                                        trigger="click"
                                        content={
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={objEntries(status)}
                                                renderItem={(item, key) => (
                                                    <p style={{ color: item.background }}
                                                        className="cursor"
                                                        onClick={() => {
                                                            updateByColumn(dataAction.id, 'project_status_id', item.id);
                                                        }}
                                                    >
                                                        {icon[item.icon]} {item.name}
                                                    </p>
                                                )}
                                            />
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <DownOutlined />
                                        </a>
                                    </Popover>
                                </div>,

                                // loại công việc
                                <div className="item03">
                                    <a><HddFilled /> </a>
                                    <span>Loại: </span>
                                    {
                                        !dataAction.project_type_id
                                            ?
                                            <span className="value-list">Chưa xác định</span>
                                            :
                                            <>
                                                <Tag style={{ color: type[dataAction.project_type_id].color, background: type[dataAction.project_type_id].background }}>
                                                    <span>{icon[type[dataAction.project_type_id].icon]} </span>
                                                    <span> {type[dataAction.project_type_id].name}</span>
                                                </Tag>
                                            </>
                                    }
                                    <Popover placement="bottomLeft"
                                        title="Chọn trạng thái"
                                        trigger="click"
                                        content={
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={objEntries(type)}
                                                renderItem={(item, key) => (
                                                    <p style={{ color: item.color }}
                                                        className="cursor"
                                                        onClick={() => {
                                                            updateByColumn(dataAction.id, 'project_type_id', item.id);
                                                        }}
                                                    >
                                                        {icon[item.icon]} {item.name}
                                                    </p>
                                                )}
                                            />
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <DownOutlined />
                                        </a>
                                    </Popover>
                                </div>,
                                <div className="item03">
                                    <a><UserOutlined /> </a>
                                    <span>Quản lý: </span>
                                    <Popover placement="bottomLeft"
                                        title="Chọn người quản lý"
                                        trigger="click"
                                        content={
                                            <Select
                                                showSearch
                                                style={{ width: "100%" }}
                                                value={dataAction.project_manager}
                                                placeholder="Chọn nhân viên thực hiện"
                                                optionFilterProp="children"
                                                options={optionEntries(props.users)}
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                onChange={(value) => {
                                                    updateByColumn(dataAction.id, 'project_manager', value);
                                                }}
                                            />
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <EditOutlined />
                                        </a>
                                    </Popover>
                                    <p>
                                        {
                                            !dataAction.project_manager
                                                ?
                                                <span className="value-list">Chưa xác định</span>
                                                :
                                                <Tag style={{ color: '#0755aeff' }}>{props.users[dataAction.project_manager].name} </Tag>
                                        }
                                    </p>
                                </div>,

                                // Làm cùng hoặc theo dõi
                                <div className="item03">
                                    <a><UsergroupAddOutlined /> </a>
                                    Làm cùng hoặc theo dõi:
                                    <Popover placement="bottomLeft"
                                        title="Chọn người Làm cùng hoặc theo dõi"
                                        trigger="click"
                                        content={
                                            <Select
                                                showSearch
                                                mode="multiple"
                                                style={{ width: "100%" }}
                                                value={dataAction.nguoi_theo_doi}
                                                placeholder="Chọn nhân viên thực hiện"
                                                optionFilterProp="children"
                                                options={optionEntries(props.users)}
                                                filterOption={(input, option) =>
                                                    (option?.label ?? "")
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                onChange={(value) => {
                                                    console.log(value);

                                                    updateByColumn(dataAction.id, 'nguoi_theo_doi', value);
                                                }}
                                            />
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <EditOutlined />
                                        </a>
                                    </Popover>

                                    <p>
                                        {
                                            !dataAction.nguoi_theo_doi
                                                ?
                                                <span className="value-list">Chưa xác định</span>
                                                :
                                                <div>
                                                    {dataAction.nguoi_theo_doi.map((item, key) => (
                                                        <Tag style={{ color: '#04772cff' }} key={key}>{props.users[item] ? props.users[item].name : ''} </Tag>
                                                    ))}
                                                </div>
                                        }
                                    </p>
                                </div>,

                                // Thời gian:
                                <div className="item03">
                                    <b><PushpinFilled />  Thời gian: </b>
                                </div>,
                                // Ngày tạo:
                                <div className="item03">
                                    <a><FieldTimeOutlined /> </a>
                                    Ngày tạo:
                                    <span className="value-list">{dataAction.created_at ? dayjs(dataAction.created_at).format(DATE_TIME_FORMAT) : ''}</span></div>,

                                // Bắt đầu:
                                <div className="item03">
                                    <a><FlagFilled /> </a>
                                    Bắt đầu:
                                    <span className="value-list"> {dataAction.start ? dayjs(dataAction.start).format(DATE_SHOW) : 'Chưa xác định'}</span>
                                    <Popover placement="bottomLeft"
                                        title="Ngày bắt đầu"
                                        trigger="click"
                                        content={
                                            <DatePicker format='DD/MM/YYYY'
                                                onChange={(date) => {
                                                    updateByColumn(dataAction.id, 'start', date.format('YYYY-MM-DD'));
                                                }}
                                            />
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <EditOutlined />
                                        </a>
                                    </Popover>
                                </div>,

                                // Ngày hoàn thành
                                <div className="item03">
                                    <a><ScheduleFilled /> </a>
                                    Hoàn thành:
                                    <span className="value-list"> {dataAction.end ? dayjs(dataAction.end).format(DATE_SHOW) : 'Chưa xác định'}</span>
                                    <Popover placement="bottomLeft"
                                        title="Ngày hoàn thành"
                                        trigger="click"
                                        content={
                                            <DatePicker format='DD/MM/YYYY'
                                                onChange={(date) => {
                                                    updateByColumn(dataAction.id, 'end', date.format('YYYY-MM-DD'));
                                                }}
                                            />
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <EditOutlined />
                                        </a>
                                    </Popover>
                                </div>,

                                // Ngày hoàn thành thực tế
                                <div className="item03">
                                    <a><CheckSquareFilled /> </a>
                                    Thực tế:
                                    <span className="value-list"> {dataAction.actual ? dayjs(dataAction.actual).format(DATE_SHOW) : 'Chưa xác định'}</span>
                                    <Popover placement="bottomLeft"
                                        title="Ngày hoàn thành"
                                        trigger="click"
                                        content={
                                            <DatePicker format='DD/MM/YYYY'
                                                onChange={(date) => {
                                                    updateByColumn(dataAction.id, 'actual', date.format('YYYY-MM-DD'));
                                                }}
                                            />
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <EditOutlined />
                                        </a>
                                    </Popover>
                                </div>,

                                // meeting
                                <div className="item03">
                                    <b><DiffFilled /> Thêm vào meeting: </b>
                                    <Popover placement="bottomLeft"
                                        title="Thêm vào meeting"
                                        trigger="click"
                                        content={
                                            <Row>
                                                <Col span={24}>
                                                    <Checkbox value="1"
                                                        onChange={(e) => {
                                                            let status = 0;
                                                            if (e.target.checked) {
                                                                status = 1;
                                                            }
                                                            updateByColumn(dataAction.id, 'is_daily', status);
                                                        }}
                                                        checked={dataAction.is_daily === 1}>Daily</Checkbox>
                                                </Col>
                                                <Col span={24}>
                                                    <Checkbox value="is_weekly"
                                                        onChange={(e) => {
                                                            let status = 2;
                                                            if (e.target.checked) {
                                                                status = 1;
                                                            }
                                                            updateByColumn(dataAction.id, 'is_weekly', status);
                                                        }}
                                                        checked={dataAction.is_weekly === 1}>Weekly</Checkbox>
                                                </Col>
                                                <Col span={24}>
                                                    <Checkbox value="1"
                                                        onChange={(e) => {
                                                            let status = 0;
                                                            if (e.target.checked) {
                                                                status = 1;
                                                            }
                                                            updateByColumn(dataAction.id, 'is_monthly', status);
                                                        }}
                                                        checked={dataAction.is_monthly === 1}>Monthly</Checkbox>
                                                </Col>
                                            </Row>
                                        }
                                    >
                                        <a onClick={(e) => e.preventDefault()} className="_right">
                                            <EditOutlined />
                                        </a>
                                    </Popover>
                                </div>,

                                // daily
                                <div className="item03">
                                    <a><FileSyncOutlined /> </a>
                                    Daily:
                                    <span className="value-list"> {dataAction.is_daily === 1 ? 'Có' : 'Không'}</span>
                                </div>,

                                // weekly
                                <div className="item03">
                                    <a><FileSearchOutlined /> </a>
                                    Weekly:
                                    <span className="value-list"> {dataAction.is_weekly === 1 ? 'Có' : 'Không'}</span>
                                </div>,

                                // monthly
                                <div className="item03">
                                    <a><FileMarkdownOutlined /> </a>
                                    Monthly:
                                    <span className="value-list"> {dataAction.is_monthly === 1 ? 'Có' : 'Không'}</span>
                                </div>,

                                <div className="item03">
                                    <Popconfirm
                                        icon={<DeleteOutlined />}
                                        title="Xác nhận xóa"
                                        description={<em>Dữ liệu sẽ bị xóa, <br />các dữ liệu liên quan cũng sẽ bị xóa, <br /><b>bạn chấp nhận chứ?</b></em>}
                                        onConfirm={() => {
                                            handleDelete(dataAction.id);
                                        }}
                                    >
                                        <Button className="_right"><DeleteOutlined /> Xóa </Button>
                                    </Popconfirm>
                                </div>

                            ]}
                            renderItem={(item) => (
                                <List.Item>{item}</List.Item>
                            )}
                        />
                        <div><br /></div>


                    </Col>
                </Row>

                <br />

            </Drawer>
        </div>
    );
}
