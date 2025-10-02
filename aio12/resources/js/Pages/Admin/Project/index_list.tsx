import React, { useState } from "react";
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
    Radio,
    Select,
    Row, Col,
    Space,
    DatePicker,
    Card,
    Statistic,
    notification,
    Divider,
    Image,
    Checkbox,
    Dropdown,
} from "antd";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowRightOutlined,
    FormOutlined,
    SearchOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    MoneyCollectFilled,
    CheckOutlined,
    CloseSquareOutlined,
    CheckCircleFilled,
    MinusSquareFilled,
    SettingFilled,
    CaretRightOutlined, PlusCircleFilled,
} from "@ant-design/icons";

import "../../../../css/form.css";

import { callApi } from "../../../Function/api";


import { inArray, parseJson, numberFormat, removeByIndex, optionEntries, showInfo } from "../../../Function/common";
import dayjs from "dayjs";
import { projectConfig, formProject } from "./project_config";

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

export default function Dashboard(props) {
    sessionStorage.clear();
    const { RangePicker } = DatePicker;
    const dateFormat = 'YYYY/MM/DD';

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);


    const [isModalAddExpress, setIsModalAddExpress] = useState(false);

    const [statusData, setStatusData] = useState(props.statusData);

    const [form] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [formEdit] = Form.useForm();
    const [idAction, setIdAction] = useState(0);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);
    const [isDraft, setIsDraft] = useState(2);

    const [mocThoiGian, setMocThoiGian] = useState(props.mocThoiGian);
    const [khoangThoiGian, setKhoangThoiGian] = useState(!props.khoangThoiGian[0] ? props.khoangThoiGian : [dayjs(props.khoangThoiGian[0]), dayjs(props.khoangThoiGian[1])]);


    const [dataAction, setDataAction] = useState({ id: 0 });
    const formChecklist_default = { name: '', content: '', admin_user_id: null };
    const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default]);
    const [isApplyAll, setIsApplyAll] = useState(true);
    const [checklist, setChecklist] = useState([]);
    const [isModalChecklist, setIsModalChecklist] = useState(false);

    const [formDesc] = Form.useForm();

    const [comments, setComments] = useState([]);
    const [formComment] = Form.useForm();

    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

    
    const [formSearch] = Form.useForm();

    const [openDetail, setOpenDetail] = useState(false);

    const [statusAction, setStatusAction] = useState(1);
    const [idxDataAction, setIdxDataAction] = useState(0);
    const [idxColumnAction, setIdxColumnAction] = useState(0);

    // save: save and close
    // save_continue: save and add new
    const [typeSubmit, setTypeSubmit] = useState('save');

    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);

    const [columns, setColumns] = useState(props.datas);
    const [taskInput, setTaskInput] = useState("");

    const [saveStatus, setSaveStatus] = useState(false);

    // import excel

    const [tableParams, setTableParams] = useState({
        // pagination: {
        //     current: props.pageConfig.currentPage,
        //     pageSize: props.pageConfig.perPage,
        //     position: ["bottonRight"],
        //     total: props.pageConfig.total,
        //     onChange: (page, pageSize) => setPagination({ page, pageSize }),
        // },
    });


    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });
    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            setFileList((prev) => {
                const activeIndex = prev.findIndex((i) => i.uid === active.id);
                const overIndex = prev.findIndex((i) => i.uid === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };
    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };
    const DraggableUploadListItem = ({ originNode, file }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: file.uid,
        });
        return (
            <div
                ref={setNodeRef}
                // style={style}
                // prevent preview event when drag end
                className={isDragging ? 'is-dragging' : ''}
                {...attributes}
                {...listeners}
            >
                {/* hide error tooltip when dragging */}
                {file.status === 'error' && isDragging ? originNode.props.children : originNode}
            </div>
        );
    };

    function setPagination(pagination: any) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }

    const onFinishFormEdit = (values: any) => {

        // todo: xu ly lưu hình ảnh
        console.log('fileList', fileList);

        if (values.loai_phieu === 'phieu_thu' && values.loai_thu_id === undefined) {
            message.error('Vui lòng chọn loại phiếu thu');
        }

        if (values.loai_phieu === 'phieu_chi' && values.loai_chi_id === undefined) {
            message.error('Vui lòng chọn loại phiếu chi');
        }

        console.log('val', values);

        setLoading(true);

        // check product
        values.id = idAction;
        for (const [key, val] of Object.entries(formEdit.getFieldValue())) {
            if (!values[key]) {
                values[key] = val;
            }
        }

        values = formatValueForm(props.columns, values);
        values.is_draft = isDraft;

        // save
        axios.post(route("saveSoQuy"), values).then((response) => {
            console.log('res', response);
            if (response.data.status_code === 200) {
                message.success("Đã tạo dữ liệu thành công");
                location.reload();
            } else {
                message.error("Đã lưu dữ liệu thất bại");
            }
            setLoadingTable(false);
        }).catch((error) => {
            message.error("Lưu dữ liệu thất bại");
        });
    };

    function closeModalAdd() {
        setIsModalAddOpen(false);
    }

    function formatValueForm(columns: any, values: any) {
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
    function initialValuesForm() {
        return {
            // nguoi_tạo: props.admin.id
        }
    }

    // createChecklist
    function createChecklist() {
        setIsLoadingBtn(true);
        axios.post(route("task.addChecklist"), {
            data: formChecklist,
            task_id: dataAction.id
        }).then((response) => {
            setChecklist(response.data.data);
            setIsLoadingBtn(false);
            setIsModalChecklist(false);
            message.success("Tạo checklist thành công");

            // let formChecklist_tmp = cloneDeep(formChecklist);
            const formChecklist_tmp = [formChecklist_default, formChecklist_default, formChecklist_default];
            setFormChecklist(formChecklist_tmp);
        }).catch((error) => {
            message.error("Tạo checklist thất bại");
        });
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
                            <td>
                                <span onClick={() => removeFormChecklist(key)} title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                            </td>
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
                                    Tạo Checklist
                                </Button>
                            </Col>
                        </Row>
                    </td>
                </tr>
            </tbody>

        </table>
    }

    function formAddTaskExpress(users) {
        const formAddTaskExpress_default = {
            name: '',
            description: '',
            nguoi_thuc_hien: null,
            project_status_id: null
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

            if (key === 'project_status_id' && status_applyAll) {
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
                if (item.name && item.name.trim() !== '' && !item.project_status_id) {
                    isValid = false;
                    message.error(<em>Vui lòng nhập trạng thái cho <b>{item.name}</b></em>);
                }
            });

            if (!isValid) return;

            // setIsLoadingBtn(true);
            axios.post(route("project.addExpress", [props.parentName]), {
                datas: formAddTaskExpress
            }).then((response) => {
                // location.reload();
                setIsLoadingBtn(false);
                setIsModalAddExpress(false);
                setColumns(response.data.data);
            }).catch((error) => {
                message.error("Tạo checklist thất bại");
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
                                    value={item.project_status_id}
                                    onChange={(val) => {
                                        updateformAddTaskExpres(key, 'project_status_id', val);
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
                        <a className="add-item01" onClick={() => addFormCheckList()}>
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
                                    Thêm mới
                                </Button>
                                <span> </span>
                                <Button className="btn-popup" onClick={() => setIsModalAddExpress(false)} loading={isLoadingBtn}>
                                    <CloseSquareOutlined />
                                    Đóng
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
                            return <div>{showSelect(col, record)} </div>
                        }

                        if (['selects'].includes(col.type_edit)) {
                            return <div className="main-selects">{showSelects(record[col.name])} </div>;
                        }

                        if (['date'].includes(col.type_edit)) {
                            return <div>{dayjs(record[col.name]).format(DATE_FORMAT)} </div>;
                        }

                        if (['datetime'].includes(col.type_edit)) {
                            return dayjs(record[col.name]).format(DATE_TIME_FORMAT);
                        }

                        if (['number'].includes(col.type_edit)) {
                            return record[col.name] ? <div>{numberFormat(record[col.name])}</div> : '';
                        };

                        if (['text'].includes(col.type_edit)) {
                            return record[col.name] ? <div>{record[col.name]}</div> : '';
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
                    },
                }
            });
        return result;
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

    const onFinishSearchFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    const listItemsSearch02 = props.columns.map((col) => {
        return showDataSearch02(col, props)
    });


    function checkShowBtnDelete() {
        let result = null;
        if (inArray(props.table.id, props.userPermission.table_delete)) {
            result = (
                <Button
                    type="primary"
                    onClick={confirmDelete}
                    disabled={!hasSelected}
                    loading={loadingBtnDelete}
                    className="_right"
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

    function searchByTime(type: any) {
        setMocThoiGian(type);
        setKhoangThoiGian([null, null]);
        formSearch.submit();
    }

    function formKhoangThoiGian() {
        return <Col sm={{ span: 24 }} className='item-search'>
            <h3 className="title-search02">Thời gian</h3>

            <label>Chọn nhanh</label>
            <Popconfirm title="Chọn nhanh theo các mốc thời gian xác định"
                placement="right"
                showCancel={false}
                okText="Đóng"
                onConfirm={() => true}
                description={<table className="table-sub">
                    <thead>
                        <tr>
                            <th>Ngày/Tuần</th>
                            <th>Tháng/Quý</th>
                            <th>Theo năm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><a onClick={() => searchByTime('today')}>Hôm nay</a></td>
                            <td><a onClick={() => searchByTime('month')}>Tháng này</a></td>
                            <td><a onClick={() => searchByTime('year')}>Năm nay</a></td>
                        </tr>
                        <tr>
                            <td><a onClick={() => searchByTime('yesterday')}>Hôm qua</a></td>
                            <td><a onClick={() => searchByTime('lastMonth')}>Tháng trước</a></td>
                            <td><a onClick={() => searchByTime('lastYear')}>Năm trước</a></td>
                        </tr>
                        <tr>
                            <td><a onClick={() => searchByTime('thisWeek')}>Tuần này</a></td>
                            <td><a onClick={() => searchByTime('30day')}>30 ngày qua</a></td>
                            <td><a onClick={() => searchByTime('all')}>Toàn thời gian</a></td>
                        </tr>
                        <tr>
                            <td><a onClick={() => searchByTime('lastWeek')}>Tuần trước</a></td>
                            <td><a onClick={() => searchByTime('thisQuarter')}>Quý này</a></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><a onClick={() => searchByTime('7day')}>07 ngày qua</a></td>
                            <td><a onClick={() => searchByTime('lastQuarter')}>Quý trước</a></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>}
            >
                <Input readOnly={true} value={mocThoiGian ? MOC_THOI_GIAN[mocThoiGian] : ''} />
            </Popconfirm>

            <br /><br />

            <label>Tùy chọn khoảng thời gian</label>
            <RangePicker
                placeholder={['Bắt đầu', 'Kết thúc']}
                format={dateFormat}
                value={khoangThoiGian}
                onChange={(value) => {
                    console.log('val', value);
                    setKhoangThoiGian(value);
                    setMocThoiGian('');
                    formSearch.submit();
                }}
            />
        </Col>
    }

    function searchLeft() {
        if (props.table.search_position !== 1) {
            return '';
        }

        return <Col>
            <Row gutter={24} className="main-search-left">
                {/* thoi gian */}
                {formKhoangThoiGian()}

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

                    {smartSearch02(props.table)}
                    {listItemsSearch02}

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
            </Row>
        </Col>
    }

    const expandedRowRender = (record: any, index: number) => {
        return <div>
            {checkShowData(record)}
        </div>;
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


    function checkShowData(record: any) {

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
        });
        return <Row>{content}</Row>;
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
                            <b className="title-page">{TITLE.PROJECT}.</b>

                            {/* Show số lượng item/page */}
                            <em> ( Trang {props.pageConfig.currentPage}, hiển thị{" "}
                                {props.pageConfig.count}/{props.pageConfig.total} )
                            </em>

                            {checkShowBtnDelete()}

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

                            <Button type="primary"
                                className="_right btn-submit01"
                                onClick={() => setIsModalAddExpress(true)}
                            >
                                <PlusCircleFilled /> Thêm nhanh
                            </Button>

                        </Col>
                    </Row>
                </div>

                <hr />
                <br />

                <Row>
                    <Col sm={{ span: 6 }}>
                        {searchLeft()}
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
                                    setColumns(data.columns);
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

                        {/* Thêm nhanh  */}
                        <Modal title="Thêm nhanh "
                            open={isModalAddExpress}
                            onCancel={() => setIsModalAddExpress(false)}
                            footer={[]}
                            width={1000}
                        >
                            {formAddTaskExpress(props.users)}
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
        </div>
    );
}
