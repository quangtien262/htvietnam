import React, { useState, useContext, useMemo, useEffect } from "react";
import { Card } from 'antd';
import { useParams, Link, useSearchParams } from "react-router-dom";

import {
    Button,
    Table,
    message,
    Modal, Drawer,
    Form,
    TableColumnsType,
    Row, Col,
    Tag, Checkbox,
    Select,
    Input,
} from "antd";
import axios from "axios";
import {
    SettingOutlined,
    SettingFilled,
    PlusCircleFilled,
} from "@ant-design/icons";

import "../../../css/task.css";
import { callApi } from "../../function/api";
import { DATE_FORMAT, TITLE } from '../../function/constant';
import { icon } from "../../components/comp_icon";

import { projectConfig, formProject, getProjectDetail, projectInfo } from "./project_config";
import API from "../../common/api";
import ROUTE from "../../common/route";

const CheckboxGroup = Checkbox.Group;

const ProductList: React.FC = () => {
    // get params from url
    const { parentName } = useParams<{ parentName: string }>();
    const display = 'list';
    const [searchParams] = useSearchParams();
    const p = searchParams.get("p");

    // form
    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // states
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataInfo, setDataInfo] = useState([]);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [statusData, setStatusData] = useState([]); // statusData
    const [status, setStatus] = useState([]); // projectStatus
    const [dataAction, setDataAction] = useState({ id: 0 });
    const [dataSource, setDataSource] = useState([]); //dataSource.data

    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [checklistPercent, setChecklistPercent] = useState(0);

    //
    const [props, setProps] = useState({});
    const [users, setUsers] = useState([]);
    const [tableStatusID, setTableStatusID] = useState([]);
    const [searchData, setSearchData] = useState([]);

    const [openDetail, setOpenDetail] = useState(false);


    // import excel
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 1,
            position: ["bottomRight"],
            total: 0,
            onChange: (page: any, pageSize: any) => setPagination({ page, pageSize }),
        },
    });

    function setPagination(pagination: any) {
        //TODO: fix pagination
        // router.get(
        //     route("index", [table.id, searchData]),
        //     pagination
        // );
    }
    const [isReady, setIsReady] = useState(false);

    function fetchData(request = {}) {
        setLoadingTable(true);
        axios.post(API.projectList, request)
            .then((res: any) => {
                setIsReady(true);
                const response = res.data.data;
                console.log('res.data.data', response);
                setProps(response);
                setDataSource(response.dataSource.data);
                setStatus(response.projectStatus);
                setStatusData(response.statusData);
                setUsers(response.users);
                setTableStatusID(response.setTableStatusID);

                const searchDataTmp = response.searchData;
                formSearch.setFieldValue('keyword', searchDataTmp.keyword || '');
                formSearch.setFieldValue('status', searchDataTmp.status || []);
                formSearch.setFieldValue('manager', searchDataTmp.manager || null);
                formSearch.setFieldValue('support', searchDataTmp.support || null);
                setSearchData(searchDataTmp);

                // set table params
                setTableParams({
                    pagination: {
                        ...tableParams.pagination,
                        total: response.dataSource.total,
                        current: response.dataSource.current_page,
                        pageSize: response.dataSource.per_page,
                    },
                });

                setLoadingTable(false);
            })
            .catch((err: any) => console.error(err));
    }
    useEffect(() => {
        fetchData({ parentName: parentName, display: 'list' });
    }, []);



    function closeModalAdd() {
        setIsModalAddOpen(false);
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

        // TODO: fix delete
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


    const expandedRowRender = (record: any, index: number) => {
        // TODO: fix get detail
        // return getProjectDetail(props, record, index, dataInfo, (data: any) => setDataInfo(data.info));
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState({ expandedRowRender, defaultExpandedRowKeys: ['1'] });
    // const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


    const columns2: TableColumnsType = [
        {
            title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                return <>
                    <Link to={`/tasks/${parentName}/kanban/${record.id}?p=${p}`}><b>{text}</b></Link>
                    {record.description ? <p>{record.description}</p> : ''}
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
            title: 'Quản lý', dataIndex: 'project_manager', render: (text, record: any) => {
                return <>
                    {props.users[record.project_manager] ? <Tag style={{ color: '#000' }}>{props.users[record.project_manager].name}</Tag> : ''}
                </>;
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
                    axios.post(API.projectGetInfo, { project_id: record.id }).then((res: any) => {
                        console.log('reszzzzzzzzz', res);
                        setChecklist(res.data.data.checklist);
                        setComments(res.data.data.comments);
                        setChecklistPercent(res.data.data.percent);
                    });
                }}><SettingOutlined /></a>;
            }
        },
    ];

    const onFinishSearch = (values: any) => {
        setLoadingTable(true);
        values.p = p;
        values.display = 'list';
        values.parentName = parentName;
        // console.log('Received values of form: ', values);
        // return;
        setLoadingTable(true);
        setLoadingBtnSearch(true);
        axios.post(API.projectSearch, values)
            .then((res: any) => {
                const response = res.data.data;
                setDataSource(response.dataSource.data);
                setTableParams({
                    pagination: {
                        ...tableParams.pagination,
                        total: response.dataSource.total,
                        current: response.dataSource.current_page,
                        pageSize: response.dataSource.per_page,
                    },
                });
                setLoadingTable(false);
                setLoadingBtnSearch(false);
            })
            .catch((err: any) => console.error(err));
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

                    {/* title */}
                    <Row>
                        <Col sm={{ span: 24 }}>

                            {/* page name */}
                            <b className="title-page">{TITLE[parentName]}</b>

                            {/* TODO: Show số lượng item/page */}

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
                    {/* search form */}
                    <Col className="search-left" sm={{ span: 6 }}>
                        <Form form={formSearch}
                            name="search"
                            onFinish={onFinishSearch}
                            initialValues={props.searchData}
                            layout="vertical">
                            <Form.Item name="keyword" label="Từ khóa">
                                <Input placeholder="Nhập từ khóa" onBlur={() => formSearch.submit()} />
                            </Form.Item>
                            <Form.Item name="status" label="Trạng thái">
                                <CheckboxGroup className="item-status"
                                    options={Object.keys(status).map((key) => ({
                                        label: status[key].name,
                                        value: status[key].id.toString()
                                    }))}
                                    onChange={(e) => formSearch.submit()}
                                />
                            </Form.Item>
                            <Form.Item name="manager" label="Quản lý">
                                <Select
                                    showSearch
                                    placeholder="Chọn quản lý"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                    }
                                    options={Object.keys(users).map((key) => ({
                                        label: users[key].name,
                                        value: users[key].id.toString()
                                    }))}
                                    onChange={(e) => formSearch.submit()} />
                            </Form.Item>
                            <Form.Item name="support" label="Người làm cùng">
                                <Select
                                    showSearch
                                    placeholder="Chọn người làm cùng"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                    }
                                    options={Object.keys(users).map((key) => ({
                                        label: users[key].name,
                                        value: users[key].id.toString()
                                    }))}
                                    onChange={(e) => formSearch.submit()} />
                            </Form.Item>

                            <Button type="primary"
                                className="btn btn-primary btn-submit01"
                                onClick={() => {
                                    // TODO: fix search
                                    router.get(route('project.list', [parentName]), { p });
                                }}
                                loading={loadingBtnSearch}
                            >
                                Reset
                            </Button>
                        </Form>
                    </Col>

                    {/* content */}
                    <Col className="content-right" sm={{ span: 18 }}>
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
                        // rowSelection={rowSelection}
                        // rowClassName="editable-row"F
                        // expandable={expandable}
                        />
                    </Col>
                </Row>
            </Form>
        </div>
    );

    return (
        <div>
            <Modal title="Xác nhận xóa"
                open={isModalXoaOpen}
                onOk={async () => {
                    setConfirmLoading(true);
                    const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [dataAction.id]));
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

                    {projectConfig(statusData, parentName, 'project_status',
                        {
                            name: 'Trạng thái',
                            description: 'Mô tả ',
                            color: 'Màu chữ',
                            // background: 'Màu nền',
                        },
                        (data: any) => {
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

                {formProject(statusData, props, searchData, (data: any) => {
                    console.log('data', data);
                    setDataSource(data);
                    setIsModalAddOpen(false);
                })}
            </Modal>

            {/* Chi tiết công việc */}
            <Drawer
                title="Chi tiết công việc"
                placement="right"
                open={openDetail}
                // size={'large'}
                onClose={() => setOpenDetail(false)}
                width="90%"
            >
                {projectInfo(props,
                    dataAction,
                    comments,
                    checklist,
                    checklistPercent,
                    searchData,
                    (result: any) => {
                        // set columns, dùng cho case fast edit
                        if (result.datas) {
                            setDataSource(result.datas);
                        }

                        // set data action, dùng cho case fast edit
                        if (result.dataAction) {
                            setDataAction(result.dataAction);
                        }

                        // set checklist
                        if (result.checklist) {
                            setChecklist(result.checklist);
                        }

                        // set percent
                        if (result.checklist_percent !== undefined) {
                            setChecklistPercent(result.checklist_percent);
                        }
                        // set comments
                        if (result.comments) {
                            setComments(result.comments);
                        }

                        if (result.isClosed) {
                            setOpenDetail(false);
                        }
                    })}

                <br />
            </Drawer>

        </div>
    );
};

export default ProductList;
