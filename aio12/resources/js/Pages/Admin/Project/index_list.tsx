import React, { useState, useContext, useMemo } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { DndContext } from '@dnd-kit/core';
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Button,
    Table, Popconfirm,
    message,
    Modal, Drawer,
    Form,
    TableColumnsType,
    Row, Col,
    Tag, Checkbox,
    Select,
    Input,ColorPicker
} from "antd";
import {
    SettingOutlined,
    SettingFilled,
    PlusCircleFilled,
    CopyOutlined, PlusCircleOutlined, HolderOutlined, DownOutlined,
    EditOutlined, DeleteOutlined, SnippetsFilled, EditFilled, CheckOutlined,
    CheckSquareFilled, PlusSquareFilled, InfoCircleFilled, PushpinFilled,
    HddFilled, UserOutlined, UsergroupAddOutlined,
    ClockCircleFilled, FlagFilled, ScheduleFilled, DiffFilled, FileSyncOutlined,
    FileSearchOutlined, FileMarkdownOutlined, ProfileOutlined,
} from "@ant-design/icons";

import "../../../../css/task.css";


import { callApi } from "../../../Function/api";

// import { projectConfig, formProject, getProjectDetail, projectInfo } from "./project_config";
import { formProject, getProjectDetail, projectInfo } from "./project_config";
import { DATE_FORMAT, TITLE } from '../../../Function/constant';
import { icon } from "../../../components/comp_icon";

const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;
export default function Dashboard(props: any) {
    sessionStorage.clear();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource.data);
    const [dataInfo, setDataInfo] = useState([]);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [statusData, setStatusData] = useState(props.statusData);
    const [status, setStatus] = useState(props.projectStatus);
    const [form] = Form.useForm();
    const [dataAction, setDataAction] = useState({ id: 0 });

    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [formSearch] = Form.useForm();
    const [comments, setComments] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [checklistPercent, setChecklistPercent] = useState(0);

    const [openDetail, setOpenDetail] = useState(false);

    // start project config
    function projectConfig(
        datas: any,
        tbl: TblType,
        columns: columnType
    ) {
        const [isModalAddExpress, setIsModalAddExpress] = useState(false);
        const [dataSource, setDataSource] = React.useState<DataType[]>(datas);
        const [formExpress] = Form.useForm();

        let name = 'Tiêu đề';
        let description = 'Mô tả';
        let color = 'Màu đánh dấu';
        if (columns.name) {
            name = columns.name;
        }
        if (columns.description) {
            description = columns.description;
        }
        if (columns.color) {
            color = columns.color;
        }

        const onfinish = (values: any) => {
            if (values.background && typeof values.background === 'object') {
                values.background = values.background.toHexString();;
            }
            if (values.color && typeof values.color === 'object') {
                values.color = values.color.toHexString();;
            }

            values.id = dataAction.id;
            axios.post(route('project.editConfig', [tbl.parentName, tbl.currentName]), values).then((response) => {
                message.success('Thêm mới thành công');
                setDataSource(response.data.data.data);
                setStatusData(response.data.data.data);
                setIsModalAddExpress(false);
                formExpress.resetFields();
            }).catch((error) => {
                console.error('Error:', error);
            });
        }

        //////////////////////////////////////

        interface RowContextProps {
            setActivatorNodeRef?: (element: HTMLElement | null) => void;
            listeners?: SyntheticListenerMap;
        }

        const RowContext = React.createContext<RowContextProps>({});

        const DragHandle: React.FC = () => {
            const { setActivatorNodeRef, listeners } = useContext(RowContext);
            return (
                <Button
                    type="text"
                    size="small"
                    icon={<HolderOutlined />}
                    style={{ cursor: 'move' }}
                    ref={setActivatorNodeRef}
                    {...listeners}
                />
            );
        };

        const handleDelete = (key: React.Key) => {
            // const newData = dataSource.filter((item) => item.key !== key);
            // setDataSource(newData);
            axios.post(route('project.deleteConfig', [tbl.parentName, tbl.currentName]), { id: key }).then((response) => {
                message.success('Xóa thành công');
                setDataSource(response.data.data.data);
                setStatusData(response.data.data.data);
            }).catch((error) => {
                console.error('Error:', error);
            });
        };

        const columns2: TableColumnsType = [
            { key: 'sort', align: 'center', width: 80, render: () => <DragHandle /> },
            {
                title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                    // console.log('record', record);

                    return <span style={{ background: record.background, color: record.color, padding: '2px 5px', borderRadius: 3 }}>{text}</span>
                }
            },
            { title: 'Description', dataIndex: 'description' },
            {
                title: 'Thao tác',
                dataIndex: 'operation',
                render: (_, record) =>
                    dataSource.length >= 1 ? (
                        <>
                            <a onClick={() => {
                                console.log('record', record);
                                setIsModalAddExpress(true);
                                setDataAction(record);
                                formExpress.setFieldsValue(record);
                            }}><EditOutlined /></a>
                            <span> | </span>
                            <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.key)}>
                                <a><DeleteOutlined /></a>
                            </Popconfirm>
                        </>
                    ) : null,
            },
        ];

        interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
            'data-row-key': string;
        }

        const Row: React.FC<RowProps> = (props) => {
            const {
                attributes,
                listeners,
                setNodeRef,
                setActivatorNodeRef,
                transform,
                transition,
                isDragging,
            } = useSortable({ id: props['data-row-key'] });

            const style: React.CSSProperties = {
                ...props.style,
                transform: CSS.Translate.toString(transform),
                transition,
                ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
            };

            const contextValue = useMemo<RowContextProps>(
                () => ({ setActivatorNodeRef, listeners }),
                [setActivatorNodeRef, listeners],
            );

            return (
                <RowContext.Provider value={contextValue}>
                    <tr {...props} ref={setNodeRef} style={style} {...attributes} />
                </RowContext.Provider>
            );
        };

        const onDragEnd2 = ({ active, over }: DragEndEvent) => {

            console.log('tbl', tbl);
            if (active.id !== over?.id) {
                setDataSource((prevState) => {
                    const activeIndex = prevState.findIndex((record) => record.key === active?.id);
                    const overIndex = prevState.findIndex((record) => record.key === over?.id);
                    const newOrder = arrayMove(prevState, activeIndex, overIndex);

                    // Lấy danh sách key/id theo thứ tự mới
                    const orderKeys = newOrder.map(item => item.key);
                    console.log('Thứ tự mới:', orderKeys);
                    console.log('tbl.currentName', tbl.currentName);
                    // send 2 server:
                    // axios.post(route('data.sortOrder02', [tbl.currentName]), { order: orderKeys })
                    axios.post(route('data.update_sort_order_02', [props.tableStatusID]), { data: orderKeys, tableName: 'project_status' })

                    return newOrder;
                });
            }
        };

        return (
            <div>
                {/* modal thên/sửa */}
                <Modal title="Thêm mới"
                    open={isModalAddExpress}
                    footer={null}
                    onCancel={() => setIsModalAddExpress(false)}
                >
                    <Form layout="vertical" onFinish={onfinish} form={formExpress}>
                        <Form.Item label={name} name="name" rules={[{ required: true, message: 'Vui lòng nhập ' + name }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label='Mô tả' name="description">
                            <TextArea />
                        </Form.Item>
                        <Form.Item label='Tìm kiếm mặc định' name="color">
                            <Checkbox>Mặc định luôn lọc theo trường này</Checkbox>
                        </Form.Item>
                        <Form.Item label='Màu nền' name="background">
                            <ColorPicker showText />
                        </Form.Item>
                        <Form.Item label='Màu chữ' name="color">
                            <ColorPicker showText />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            <CopyOutlined />
                            Thêm mới
                        </Button>
                    </Form>
                </Modal>

                {/* btn thêm mới */}
                <Button type="dashed"
                    onClick={() => {
                        setIsModalAddExpress(true)
                        setDataAction(dataActionDefault);
                        formExpress.setFieldsValue(dataActionDefault);
                        formExpress.setFieldsValue(dataActionDefault);
                    }}
                    style={{ marginBottom: 16 }}>
                    <PlusCircleOutlined /> Thêm mới
                </Button>

                <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd2}>
                    <SortableContext items={dataSource.map((i) => i.key)} strategy={verticalListSortingStrategy}>
                        <Table
                            rowKey="key"
                            components={{ body: { row: Row } }}
                            columns={columns2}
                            dataSource={dataSource}
                        />
                    </SortableContext>
                </DndContext>
            </div>
        );
    }
    // end project config

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
        return getProjectDetail(props, record, index, dataInfo, (data: any) => setDataInfo(data.info));
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState({ expandedRowRender, defaultExpandedRowKeys: ['1'] });
    // const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


    const columns2: TableColumnsType = [
        {
            title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                return <>
                    <Link href={route('task.list', { parentName: props.parentName, pid: record.id, p: props.p })}><b>{text}</b></Link>
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
                    const res = await callApi(route('project.getProjectInfo', [record.id]));
                    setChecklist(res.data.data.checklist);
                    setComments(res.data.data.comments);
                    setChecklistPercent(res.data.data.percent);
                }}><SettingOutlined /></a>;
            }
        },
    ];

    const onFinishSearch = (values: any) => {
        values.p = props.p;
        values.display = props.display;
        // console.log('Received values of form: ', values);
        // return;
        setLoadingTable(true);
        setLoadingBtnSearch(true);
        router.get(route('project.list', [props.parentName]), values);
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
                                    options={Object.keys(props.users).map((key) => ({
                                        label: props.users[key].name,
                                        value: props.users[key].id.toString()
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
                                    options={Object.keys(props.users).map((key) => ({
                                        label: props.users[key].name,
                                        value: props.users[key].id.toString()
                                    }))}
                                    onChange={(e) => formSearch.submit()} />
                            </Form.Item>

                            <Button type="primary"
                                className="btn btn-primary btn-submit01"
                                onClick={() => {
                                    router.get(route('project.list', [props.parentName]), { p: props.p });
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
            <AdminLayout
                auth={props.auth}
                content={
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

                                {projectConfig(statusData, { parentName: props.parentName, currentName: 'project_status' }, {
                                    name: 'Trạng thái',
                                    description: 'Mô tả ',
                                    color: 'Màu chữ',
                                    background: 'Màu nền',
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
                {projectInfo(props,
                    dataAction,
                    comments,
                    checklist,
                    checklistPercent,
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
}
