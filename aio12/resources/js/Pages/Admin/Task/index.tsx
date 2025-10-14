import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    Button,
    message,
    Modal,
    Form,
    Input, Timeline,
    Popconfirm,
    Popover,
    Select, Checkbox,
    Row,
    Space, Flex, Progress,
    Tag,
    DatePicker,
    Empty,
    notification,
    Divider,
    Col, Drawer,
    Radio, List
} from "antd";
import {
    BarsOutlined, FlagFilled,
    DownOutlined, RollbackOutlined,
    ToolFilled, ProfileOutlined,
    DeleteOutlined,
    EditOutlined, EyeOutlined, CaretRightFilled,
    DiffFilled, SettingOutlined,
    InfoCircleFilled, FireFilled,
    PlusSquareFilled, CheckSquareFilled,
    CheckOutlined, HddFilled,
    CloseSquareOutlined,
    FileSearchOutlined, FileSyncOutlined,
    SnippetsFilled, ClockCircleFilled,
    FileMarkdownOutlined, UserOutlined, UsergroupAddOutlined,
    ApartmentOutlined, PushpinFilled,
    SettingFilled, InsertRowAboveOutlined,
    HomeOutlined, PlusCircleFilled, PlusCircleOutlined
} from "@ant-design/icons";

import "../../../../css/task.css";

import { optionEntries, formatGdata_column, onDrop, nl2br, objEntries, showInfo } from "../../../Function/common";
import { callApi } from "../../../Function/api";
import { DATE_FORMAT, DATE_SHOW, DATE_TIME_FORMAT, TITLE } from "../../../Function/constant";
import { icon } from "../../../components/comp_icon";
import { formAddExpress } from "../../../components/comp_data";
import { taskConfig, taskInfo } from "./task_config";

import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../../../Function/api";
import { cloneDeep, set } from "lodash";
import dayjs from "dayjs";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


export default function Dashboard(props: any) {
    const [status, setStatus] = useState(props.taskStatus);
    const [statusData, setStatusData] = useState(props.statusData);

    const [taskLog, setTaskLog] = useState([]);

    const [isModalAddExpress, setIsModalAddExpress] = useState(false);
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);

    // checklist
    const [checklist, setChecklist] = useState([]);

    const [formDesc] = Form.useForm();

    const [comments, setComments] = useState([]);
    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

    const [formData] = Form.useForm();
    const [formSearch] = Form.useForm();

    const [openDetail, setOpenDetail] = useState(false);
    const [dataAction, setDataAction] = useState<any>({});
    const [checklistPercent, setChecklistPercent] = useState(0);

    // save: save and close
    // save_continue: save and add new
    const [typeSubmit, setTypeSubmit] = useState('save');

    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);

    const [columns, setColumns] = useState(props.datas);

    function formAddTaskExpress(users: any) {
        const formAddTaskExpress_default = {
            name: '',
            description: '',
            nguoi_thuc_hien: null,
            task_status_id: null
        };
        const [formAddTaskExpress, setFormAddTaskExpress] = useState([formAddTaskExpress_default, formAddTaskExpress_default, formAddTaskExpress_default]);
        const [nguoiThucHien_applyAll, setNguoiThucHien_applyAll] = useState(true);
        const [status_applyAll, setStatus_applyAll] = useState(true);

        function remove(key) {
            setFormAddTaskExpress(prev =>
                prev.filter((_, index) => index !== key)
            );
        }

        function updateformAddTaskExpres(idx, key, val) {
            if (key === 'nguoi_thuc_hien' && nguoiThucHien_applyAll) {
                setFormAddTaskExpress(prev =>
                    prev.map(item => ({
                        ...item,
                        [key]: val
                    }))
                );
                return;
            }

            if (key === 'task_status_id' && status_applyAll) {
                setFormAddTaskExpress(prev =>
                    prev.map(item => ({
                        ...item,
                        [key]: val
                    }))
                );
                return;
            }

            let updated = [...formAddTaskExpress]; // sao chép mảng
            updated[idx] = { ...updated[idx], [key]: val }; // cập nhật phần tử
            setFormAddTaskExpress(updated); // cập nhật state
        };

        function addExpress() {
            // validation form
            let isValid = true;

            formAddTaskExpress.forEach((item, index) => {
                if (item.name && item.name.trim() !== '' && !item.task_status_id) {
                    isValid = false;
                    message.error(<em>Vui lòng nhập trạng thái cho <b>{item.name}</b></em>);
                }
            });
            if (!isValid) return;

            setIsLoadingBtn(true);
            axios.post(route("task.addTaskExpress", [props.parentName]), {
                datas: formAddTaskExpress,
                pid: props.pid
            }).then((response) => {
                setIsLoadingBtn(false);
                setIsModalAddExpress(false);
                setColumns(response.data.data);
            }).catch((error) => {
                message.error("Tạo mới thất bại");
            });
        }

        return <table className="table-sub">
            <thead>
                <tr>
                    <th>
                        <span>Tiêu đề </span>
                        {showInfo('Chỉ lưu những công việc có nhập nội dung cho tiêu đề. nếu bỏ trống tiêu đề thì sẽ bỏ qua')}
                    </th>
                    <th>
                        <span>Mô tả </span>
                        {showInfo('Mô tả ngắn về công việc (nếu có)')}
                    </th>
                    <th>
                        <span>Trạng thái </span>
                        {showInfo('Trạng thái hoặc tiến độ hiện tại của công việc, chọn áp dụng tất cả thì sẽ được áp dụng cho tất cả cho các trạng thái khác giống như trạng thái mà bạn vừa chọn')}
                        <br />
                        <Checkbox checked={status_applyAll}
                            onChange={(e) => { setStatus_applyAll(e.target.checked) }}
                        >
                            <em>Áp dụng tất cả</em>
                        </Checkbox>
                    </th>
                    <th>
                        <span>Người thực hiện </span>
                        {showInfo('Chọn người làm chính cho công việc này, chọn áp dụng tất cả thì sẽ được áp dụng cho tất cả cho các "Người thực hiện" đều giống như lựa chọn mà bạn vừa chọn')}
                        <br />
                        <Checkbox checked={nguoiThucHien_applyAll}
                            onChange={(e) => { setNguoiThucHien_applyAll(e.target.checked) }}
                        >
                            <em>Áp dụng tất cả</em>
                        </Checkbox>
                    </th>
                    <th>Xóa</th>
                </tr>
            </thead>
            {/* form Thêm task express */}
            {
                formAddTaskExpress.map((item, key) => {

                    return <tbody key={key}>
                        <tr>
                            <td>
                                <Input value={item.name}
                                    placeholder="Nhập tiêu đề"
                                    onChange={(e) => {
                                        updateformAddTaskExpres(key, 'name', e.target.value);
                                    }}
                                />
                            </td>
                            <td>
                                <Input.TextArea value={item.description}
                                    placeholder="Nhập mô tả ngắn"
                                    onChange={(e) => {
                                        updateformAddTaskExpres(key, 'description', e.target.value);
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
                                    options={optionEntries(status)}
                                    value={item.task_status_id}
                                    onChange={(val) => {
                                        updateformAddTaskExpres(key, 'task_status_id', val);
                                    }}
                                />
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
                                    options={optionEntries(users)}
                                    value={item.nguoi_thuc_hien}
                                    onChange={(val) => {
                                        updateformAddTaskExpres(key, 'nguoi_thuc_hien', val);
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
                            <span className="icon-b" onClick={() => setFormAddTaskExpress(prev => [...prev, formAddTaskExpress_default])}>
                                <PlusCircleOutlined /> Thêm mới
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
                                    TẠO MỚI
                                </Button>
                                <span> </span>
                                <Button className="btn-popup" onClick={() => setIsModalAddExpress(false)} loading={isLoadingBtn}>
                                    <CloseSquareOutlined />
                                    ĐÓNG
                                </Button>
                            </Col>
                        </Row>
                    </td>
                </tr>
            </tbody>

        </table>
    }

    // form data
    const onFinishData = async (values: any) => {
        // setIsLoadingBtn(true);
        values.typeSubmit = typeSubmit;
        if (values.start) {
            values.start = values.start.format('YYYY-MM-DD');
        }
        if (values.end) {
            values.end = values.end.format('YYYY-MM-DD');
        }
        values.pid = props.pid;
        // const res = await createTask(values);
        axios.post(route('task.add', { parentName: props.parentName }), values)
            .then(response => {
                setIsLoadingBtn(false);
                setColumns(response.data.data);
                message.success("Đã lưu dữ liệu thành công");

                // reset form
                formData.resetFields();

                // case lưu và đóng, đóng modal sau khu lưu thành công
                if (typeSubmit === 'save') {
                    setIsModalAddOpen(false);
                }
            })
            .catch(error => {
                setIsLoadingBtn(false);
            });
    }


    useEffect(() => {
        fetchTasks();
    }, []);

    // get task data
    const fetchTasks = async () => {
        // const res = await getTasks();
        // const grouped = {1:[],2:[],3:[],4:[]};
        // res.data.forEach((task) => grouped[task.status].push(task));

        // setColumns(grouped);
    };


    // di chuyển item trong mảng
    function moveItemInArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
        const result = [...array];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        return result;
    }

    const onDragEnd = async (result: import("react-beautiful-dnd").DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        // Sao chép mảng gốc
        const newDatas = [...columns];

        // lấy index của cột
        const source_index = columns.findIndex(item => item.status.id === +source.droppableId);
        const destination_index = columns.findIndex(item => item.status.id === +destination.droppableId);

        // data cần di chuyển
        const itemToMove = newDatas[source_index].datas[source.index];

        // trường hợp sắp xếp thứ tự trên cùng 1 cột
        if (source.droppableId === destination.droppableId) {
            // sắp xếp lại thứ tự của data
            newDatas[source_index].datas = moveItemInArray(newDatas[source_index].datas, source.index, destination.index);

            // save 2 state
            setColumns(newDatas); // Cập nhật state

            // lọc ra ids là danh sách id của data sau khi đã sắp xếp
            const ids = newDatas[destination_index].datas.map(item => item.id);
            // save 2 db
            await updateTask(itemToMove.id, {
                task_status_id: destination.droppableId,
                ids: ids,
                parentName: props.parentName,
                pid: props.pid,
            });

            return;
        }

        // trường hợp di chuyển sang cột khác

        // Xoá khỏi vị trí cũ
        newDatas[source_index].datas = newDatas[source_index].datas.filter((_, i) => i !== source.index);

        // Thêm vào vị trí mới
        newDatas[destination_index].datas = [...newDatas[destination_index].datas, itemToMove];
        // sắp xếp lại thứ tự của data
        const lastIndex = newDatas[destination_index].datas.length - 1;
        newDatas[destination_index].datas = moveItemInArray(newDatas[destination_index].datas, lastIndex, destination.index);


        // Cập nhật state
        setColumns(newDatas);

        // lọc ra ids là danh sách id của data sau khi đã sắp xếp
        const ids = newDatas[destination_index].datas.map(item => item.id);

        await updateTask(itemToMove.id, {
            task_status_id: destination.droppableId,
            ids: ids
        });

    };

    function initialValuesForm() {
        return props.searchData;
    }

    function closeModalAdd() {
        setIsModalAddOpen(false);
    }


    function closePopupStatus() {
        setIsShowStatusSetting(false);
    }

    const onFinishSearch = (values: any) => {
        values.display = props.display;
        values.p = props.p;
        values.pid = props.pid;
        // console.log('Received values of form: ', values);
        // return;
        router.get(route('task.list', [props.parentName]), values);
    };

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                current={props.table}
                content={

                    <div>
                        {/* modal xóa */}
                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            // onOk={deleteProduct}
                            okText="Đồng ý xóa"
                            cancelText="Hủy"
                        // onCancel={handleCancelDelete}
                        >
                            <p>Dữ liệu sẽ bị xóa hoàn toàn</p>
                        </Modal>

                        {/* Cài đặt trạng thái */}
                        <Modal title="Cài đặt trạng thái"
                            className="status-setting"
                            open={isShowStatusSetting}
                            onCancel={() => closePopupStatus()}
                            footer={[]}
                        >
                            <div>

                                {taskConfig(statusData, { parentName: props.parentName, currentName: 'task_status', searchData: props.searchData, pid: props.pid }, {
                                    name: 'Trạng thái',
                                    description: 'Mô tả ',
                                    color: 'Màu chữ',
                                    background: 'Màu nền',
                                }, (result: any) => {
                                    setStatusData(result.status);
                                    setColumns(result.columns);
                                })}

                                <Row>
                                    <Col sm={24} className="text-center">
                                        <br />
                                        <Button type="primary"
                                            className="btn-submit01"
                                            onClick={() => closePopupStatus()}>
                                            Đóng
                                        </Button>
                                    </Col>
                                </Row>

                            </div>
                        </Modal>

                        {/* Thêm nhanh công việc */}
                        <Modal title="Thêm nhanh công việc"
                            open={isModalAddExpress}
                            onCancel={() => setIsModalAddExpress(false)}
                            footer={[]}
                            width={1000}
                        >
                            {formAddTaskExpress(props.users)}
                        </Modal>

                        {/* Thêm mới task */}
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
                            <Form
                                name="htvn"
                                form={formData}
                                layout="vertical"
                                onFinish={onFinishData}
                                autoComplete="off"
                                initialValues={initialValuesForm()}
                                className="form-popup"
                            >

                                <Row>
                                    <Col sm={24}>
                                        <Form.Item name='task_status_id' label='Chọn trạng thái' rules={[{ required: true, message: 'Vui lòng nhập trạng thái công việc', }]}>
                                            <Radio.Group
                                                block
                                                optionType="button"
                                                buttonStyle="solid"
                                                defaultValue={1}
                                                options={Object.entries(status).map(([key, value]) => {
                                                    return {
                                                        value: value.id,
                                                        label: value.name,
                                                        key: value.id,
                                                    }
                                                })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row>
                                    {/* Nội dung chi tiết */}
                                    <Col sm={{ span: 16 }}>
                                        <Row>
                                            <Col sm={{ span: 24 }} className="main-item-form">
                                                <div>
                                                    <Divider orientation="left"><Space>Nội dung chi tiết</Space></Divider>
                                                </div>
                                            </Col>

                                            <Col sm={{ span: 24 }}>
                                                {/* Tên công việc */}
                                                <Form.Item className="item-form-textarea" name='name' label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên công việc', }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>


                                            <Col sm={{ span: 24 }}>
                                                <Form.Item className="item-form" name='nguoi_thuc_hien' label="Người thực hiện">
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
                                                        options={optionEntries(props.users)}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }}>
                                                <Form.Item className="item-form" name='nguoi_theo_doi' label="Người phối hợp thực hiện hoặc theo dõi">
                                                    <Select showSearch
                                                        mode="multiple"
                                                        style={{ width: "100%" }}
                                                        placeholder="Người phối hợp thực hiện hoặc theo dõi"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={optionEntries(props.users)}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }}>
                                                {/* Mô tả chi tiết */}
                                                <Form.Item className="item-form-textarea" name='description' label="Mô tả thêm">
                                                    <Input.TextArea rows={4} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>

                                    {/* Cài đặt */}
                                    <Col sm={{ span: 8 }}>
                                        <Row>
                                            <Col sm={{ span: 24 }} className="main-item-form">
                                                <div>
                                                    <Divider orientation="left"><Space>Cài đặt</Space></Divider>
                                                </div>
                                            </Col>
                                            {/* Độ ưu tiên */}
                                            <Col sm={{ span: 24 }}>
                                                <Form.Item className="item-form" name='task_priority_id' label="Độ ưu tiên">
                                                    <Select showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn mức độ ưu tiên"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={optionEntries(props.priority)}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            {/* Loại công việc */}
                                            <Col sm={{ span: 24 }}>
                                                <Form.Item className="item-form" name='task_type_ids' label="Loại công việc">
                                                    <Select showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn loại công việc"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={optionEntries(props.type)}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            {/* Ngày bắt đầu */}
                                            <Col sm={{ span: 24 }} className="main-item-form">
                                                <Form.Item className="item-form" name='start' label="Ngày bắt đầu">
                                                    <DatePicker format='DD/MM/YYYY' />
                                                </Form.Item>
                                            </Col>

                                            {/* Ngày hoàn thành */}
                                            <Col sm={{ span: 24 }} className="main-item-form">
                                                <Form.Item className="item-form" name='end' label="Ngày hoàn thành">
                                                    <DatePicker format='DD/MM/YYYY' />
                                                </Form.Item>
                                            </Col>

                                            {/* Người giao việc */}
                                            <Col sm={{ span: 24 }} className="main-item-form">
                                                <Form.Item className="item-form" name='nguoi_tạo' label="Người giao việc">
                                                    <Select showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn mức độ ưu tiên"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={optionEntries(props.users)}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }}></Col>
                                        </Row>
                                    </Col>

                                    {/* footer */}
                                    <Col sm={{ span: 24 }}>
                                        <Col span={24} className="main-btn-popup">
                                            <Button className="btn-popup"
                                                onClick={() => closeModalAdd(false)}
                                            >
                                                <CloseSquareOutlined />
                                                Hủy
                                            </Button>
                                            <span> </span>
                                            <Button className="btn-popup btn-success" type="primary" loading={isLoadingBtn}
                                                onClick={() => {
                                                    setTypeSubmit('save');
                                                    formData.submit();
                                                }}
                                            >
                                                <CheckOutlined />
                                                Lưu và đóng
                                            </Button>
                                            <span> </span>
                                            <Button className="btn-popup" type="primary"
                                                loading={isLoadingBtn}
                                                onClick={() => {
                                                    setTypeSubmit('save_continue');
                                                    formData.submit();
                                                }}
                                            >
                                                <PlusCircleOutlined />
                                                Lưu và thêm mới
                                            </Button>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal>

                        {/* title */}
                        <Row>
                            <Col sm={{ span: 8 }}>
                                <Link href={route('project.list', { parentName: props.parentName, p: props.p })}> <Button icon={<RollbackOutlined />}> Back </Button> </Link>
                                <span> </span>
                                <a><b className="title-page">{props.project.name} </b></a>
                            </Col>

                            <Col sm={{ span: 16 }}>
                                {/* Hiển thị dưới dạng */}
                                <span> </span>
                                <Select
                                    className="_right"
                                    value={props.display}
                                    onChange={(value) => {
                                        router.get(route('task.list', [props.parentName]), {  p:props.p, pid: props.pid, display: value });
                                    }}
                                    style={{ width: 150, marginRight: 8 }}
                                >
                                    <Select.Option value="list"><InsertRowAboveOutlined /> Danh sách</Select.Option>
                                    <Select.Option value="kanban"><ApartmentOutlined /> Kanban</Select.Option>
                                </Select>
                                <span> </span>
                                {/* Cài đặt quy trình */}
                                <Button className="_right"
                                    onClick={() => setIsShowStatusSetting(true)}
                                >
                                    <SettingFilled /> Cài đặt trạng thái
                                </Button>
                                    <span> </span>
                                {/* Thêm mới */}
                                <Button type="primary"
                                    className="_right btn-submit01"
                                    onClick={() => setIsModalAddOpen(true)}
                                >
                                    <PlusCircleFilled /> Thêm mới
                                </Button>

                                <Button type="primary"
                                    className="_right btn-submit01"
                                    onClick={() => setIsModalAddExpress(true)}
                                >
                                    <PlusCircleFilled /> Thêm nhanh
                                </Button>
                            </Col>
                        </Row>

                        <Divider orientation="left" className="divider02">
                            <Space>
                                <span><ToolFilled /> Tìm kiếm</span>
                                {/* <span> | </span> */}
                                {/* <a className="title-search"> Tìm kiếm nâng cao</a> */}
                            </Space>
                        </Divider>

                        {/* form search */}
                        <Form
                            name="formSearch"
                            form={formSearch}
                            layout="vertical"
                            onFinish={onFinishSearch}
                            // onFinishFailed={onFinishFailedChamCong}
                            autoComplete="off"
                            initialValues={initialValuesForm()}
                            className="form-popup"
                        >
                            <Row>
                                <Col sm={6}>
                                    <Form.Item name="keyword" label="Từ khóa">
                                        <Input placeholder="Nhập từ khóa"
                                            onBlur={() => formSearch.submit()}
                                            allowClear={true}
                                            onClear={() => formSearch.submit()}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col sm={6}>
                                    <Form.Item name="pic" label="Người làm chính">
                                        <Select
                                            allowClear={true}
                                            onClear={() => formSearch.submit()}
                                            showSearch
                                            placeholder="Chọn người làm chính"
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
                                </Col>

                                <Col sm={6}>
                                    <Form.Item name="support" label="Người làm cùng">
                                        <Select showSearch
                                            allowClear={true}
                                            onClear={() => formSearch.submit()}
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
                                </Col>

                                <Col sm={6}>
                                    <Form.Item name="priority" label="Mức độ ưu tiên">
                                        <Select showSearch
                                            allowClear={true}
                                            onClear={() => formSearch.submit()}
                                            placeholder="Chọn mức độ ưu tiên"
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            filterSort={(optionA, optionB) =>
                                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                            }
                                            options={Object.keys(props.priority).map((key) => ({
                                                label: props.priority[key].name,
                                                value: props.priority[key].id.toString()
                                            }))}
                                            onChange={(e) => formSearch.submit()} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>

                        {/* {/* content */}
                        <div className="tasks-container">

                            {/* content DND */}
                            <Row>
                                <div>
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <div style={{ display: "flex", gap: "5px" }}>
                                            {Object.entries(columns).map(([idx, value]) => (
                                                <Droppable key={idx} droppableId={value.status.id.toString()} index={idx}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            style={{
                                                                backgroundColor: snapshot.isDraggingOver
                                                                    ? "#e0f7fa"
                                                                    : "#f1f1f1",
                                                                borderRadius: 8,
                                                                width: 280,
                                                                minHeight: 500
                                                            }}
                                                            className={`main-task bg-gray-100 rounded p-4 min-h-[400px] ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`}
                                                        >

                                                            {/* show status name */}
                                                            <p className="title-task"
                                                                style={{
                                                                    backgroundColor: value.status.background ? value.status.background : '#64748b',
                                                                    color: value.status.color ? value.status.color : '#64748b',
                                                                }}
                                                            >
                                                                {value.status.icon ? icon[value.status.icon] : ''}
                                                                <span> </span>
                                                                {value.status.name}
                                                            </p>

                                                            {value.datas.map((task, index) => (
                                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                            }}
                                                                            className={`item-task bg-white p-3 mb-2 rounded shadow ${snapshot.isDragging ? "bg-blue-200" : ""}`}
                                                                        >
                                                                            <div className="">
                                                                                <h3 className="title04 click"
                                                                                    onClick={async () => {
                                                                                        setOpenDetail(true);
                                                                                        setDataAction(task);
                                                                                        const res = await callApi(route('task.getTaskInfo', [task.id]));
                                                                                        console.log(res);
                                                                                        setChecklist(res.data.data.checklist);
                                                                                        setChecklistPercent(res.data.data.percent);
                                                                                        setComments(res.data.data.comments);
                                                                                        setTaskLog(res.data.data.logs);
                                                                                        if (formDesc) {
                                                                                            formDesc.setFieldValue('description', task.description);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {props.priority[task.task_priority_id] ? <Tag color={props.priority[task.task_priority_id].color}>{props.priority[task.task_priority_id].name}</Tag> : ''}
                                                                                    {task.name}
                                                                                </h3>

                                                                                <p className="description01">{task.description}</p>

                                                                                {!task.nguoi_thuc_hien || task.nguoi_thuc_hien === null ? '' : <Tag>{props.users[task.nguoi_thuc_hien].name}</Tag>}
                                                                                <p className="deadline"><em>{task.end ? dayjs(task.end).format('DD/MM/YYYY') : ''}</em></p>
                                                                            </div>

                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            ))}
                                        </div>
                                    </DragDropContext>
                                </div>
                            </Row>

                            <Drawer
                                title="Chi tiết công việc"
                                placement="right"
                                open={openDetail}
                                // size={'large'}
                                onClose={() => setOpenDetail(false)}
                                width="90%"
                            >
                                {taskInfo(props,
                                    dataAction,
                                    comments,
                                    checklist,
                                    checklistPercent,
                                    taskLog,
                                    props.priority,
                                    (result: any) => {
                                        // set columns, dùng cho case fast edit
                                        if (result.columns) {
                                            setColumns(result.columns);
                                        }

                                        // set data action, dùng cho case fast edit
                                        if (result.dataAction_column) {
                                            setDataAction({
                                                ...((typeof dataAction === 'object' && dataAction !== null) ? dataAction : {}),
                                                [result.dataAction_column.col]: result.dataAction_column.val,
                                            });
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

                                    })}

                                <br />

                            </Drawer>

                        </div>
                    </div >
                }
            />
        </div >
    );
}
