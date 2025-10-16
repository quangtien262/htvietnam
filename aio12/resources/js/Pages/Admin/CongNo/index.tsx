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
    DatePicker ,
    Card,
    Statistic,
    notification,
    Divider,
    Image,
    Upload,
    Dropdown,Tabs
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
    MoneyCollectFilled ,
    CheckOutlined,
    CloseSquareOutlined,
    CheckCircleFilled ,
    MinusSquareFilled ,
    UploadOutlined,
    CaretRightOutlined, DiffFilled
} from "@ant-design/icons";

import "../../../../css/form.css";

import {callApi} from "../../../Function/api";


import { inArray, parseJson, numberFormat, removeByIndex } from "../../../Function/common";
import { nhaCungCapInfo } from "../../../components/comp_nha_cung_cap";
import { khachHangInfo } from "../../../components/comp_khach_hang";
import { khachTraHang, nhapHang, traHangNCC } from "../../../components/comp_hoa_don";

import dayjs from "dayjs";

import { DATE_FORMAT, DATE_TIME_FORMAT, DATE_SHOW, DATE_TIME_SHOW } from '../../../Function/constant';
import { cloneDeep } from "lodash";
const { TextArea } = Input;

import { HTBankingQR } from '../../../Function/generateQR';

import {
    HTSelect,
    HTSelects,
    HTSelectsNormal,
    HTTextarea,
    HTNumber,
    HTDate,
    HTDateTime,
    HTPassword,
    HTInput,
    HTTags,
    HTSelectModal,
    HTSelectsModal,
    HTTime, HTColor, HTCascaderTable, smartSearch02, smartSearch, showDataSearch, showDataSearch02
} from "../../../Function/input";

import {MOC_THOI_GIAN} from "../../../Function/constant";

import { showSelects, showSelect, showDate, showDateTime } from '../../../Function/selects_table';

// image
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import ImgCrop from 'antd-img-crop';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { routeTaiChinh } from "../../../Function/config_route";

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
    const [fastEditValue, setFastEditValue] = useState("");
    const [dataInfo, setDataInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [classLoaiChi, setClassLoaiChi] = useState('_hidden');
    const [classLoaiThu, setClassLoaiThu] = useState('_hidden');

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [formEdit] = Form.useForm();
    const [idAction, setIdAction] = useState(0);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [daThanhToan, setDaThanhToan] = useState(0);
    const [tongCongNo, setTongCongNo] = useState(0);
    const [ngayTatToan, setNgayTatToan] = useState(dayjs());

    const [isModalTatToan, setIsModalTatToan] = useState(false);
    const [soTienCongNoThanhToan, setSoTienCongNoThanhToan] = useState(0);
    const [soTienCongNoThanhToan_max, setSoTienCongNoThanhToan_max] = useState(0);
    const [tienCongNo_phuongThucTT, setTienCongNo_phuongThucTT] = useState(null);
    const [loaiChungTu, setLoaiChungTu] = useState('');
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

    const [isDraft, setIsDraft] = useState(2);

    const [mocThoiGian, setMocThoiGian] = useState(props.mocThoiGian);
    const [khoangThoiGian, setKhoangThoiGian] = useState(!props.khoangThoiGian[0] ? props.khoangThoiGian : [dayjs(props.khoangThoiGian[0]), dayjs(props.khoangThoiGian[1])]);

    const dataDetail_item_default = {
        product_id: null,
        product_name: '',
        product_code: '',
        so_luong: 0, // so_luong_thuc_te
        gia_von: 0,
        giam_gia: 0,
        thanh_tien: 0,
    };
    const [dataDetail, setDataDetail] = useState([dataDetail_item_default]);
    const [result, setResult] = useState([]);

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

    function addSub() {
        let dataDetail_tmp = cloneDeep(dataDetail);
        dataDetail_tmp.push(dataDetail_item_default);
        setDataDetail(dataDetail_tmp);
    }

    function setPagination(pagination) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }

    //
    const { useMemo } = React;
    const [api, contextHolder] = notification.useNotification();

    const onFinishFormEdit = (values) => {

        // todo: xu ly lưu hình ảnh
        console.log('fileList', fileList);

        if(values.loai_phieu === 'phieu_thu' && values.loai_thu_id === undefined) {
            message.error('Vui lòng chọn loại phiếu thu');
        }

        if(values.loai_phieu === 'phieu_chi' && values.loai_chi_id === undefined) {
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

    function checkProduct() {
        // check pro
        let  isOK = true;
        let checkResult = [];
        let key = 0;
        dataDetail.forEach((item) => {
            if(!item.product_id) {
                checkResult.push(<li key={key++} className="">Vui lòng chọn sản phẩm</li>)
                isOK = false;
            }
        });
        setResult(checkResult);
        return isOK;
    }

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
                            formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
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
                return <Button onClick={() => { editData(record) }} type="button" className="icon-edit"><EditOutlined /> </Button>
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
        if(khoangThoiGian[0]) {
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

    const listItemsSearch = props.columns.map((col) =>
        showDataSearch(col, props)
    );

    const listItemsSearch02 = props.columns.map((col) =>
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

        function searchByTime(type) {
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
                            onConfirm={()=>true}
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
                                        <td><a onClick={()=>searchByTime('today')}>Hôm nay</a></td>
                                        <td><a onClick={()=>searchByTime('month')}>Tháng này</a></td>
                                        <td><a onClick={()=>searchByTime('year')}>Năm nay</a></td>
                                    </tr>
                                    <tr>
                                        <td><a onClick={()=>searchByTime('yesterday')}>Hôm qua</a></td>
                                        <td><a onClick={()=>searchByTime('lastMonth')}>Tháng trước</a></td>
                                        <td><a onClick={()=>searchByTime('lastYear')}>Năm trước</a></td>
                                    </tr>
                                    <tr>
                                        <td><a onClick={()=>searchByTime('thisWeek')}>Tuần này</a></td>
                                        <td><a onClick={()=>searchByTime('30day')}>30 ngày qua</a></td>
                                        <td><a onClick={()=>searchByTime('all')}>Toàn thời gian</a></td>
                                    </tr>
                                    <tr>
                                        <td><a onClick={()=>searchByTime('lastWeek')}>Tuần trước</a></td>
                                        <td><a onClick={()=>searchByTime('thisQuarter')}>Quý này</a></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td><a onClick={()=>searchByTime('7day')}>07 ngày qua</a></td>
                                        <td><a onClick={()=>searchByTime('lastQuarter')}>Quý trước</a></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>}
                        >
                            <Input readOnly={true} value={mocThoiGian ? MOC_THOI_GIAN[mocThoiGian]: ''} />
                        </Popconfirm>

                        <br/><br/>

                        <label>Tùy chọn khoảng thời gian</label>
                        <RangePicker
                            placeholder={['Bắt đầu','Kết thúc']}
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

    const expandedRowRender = (record, index) => {
        if(!dataInfo[record.id]) {
                axios.post(route("congNoInfo"), { id: record.id })
                    .then((response) => {
                        console.log('response', response.data.data);
                        if(response.status === 200) {
                            let dataInfo_tmp = cloneDeep(dataInfo);
                            dataInfo_tmp[record.id] = response.data.data;

                            setDataInfo(dataInfo_tmp);
                        }

                    })
                    .catch((error) => {
                        message.error("Lỗi tải hóa đơn chi tiết");
                    }
                );
        }


        let key = 1;
        console.log('record', record);

        let item = [
            {
                label: <span className="title-sub-tab">Thông tin</span>,
                key: key++,
                children: <div>
                    {checkShowData(record)}

                    {record.cong_no_status_id.id !== 1 ?
                    <Divider>
                        <button className="btn-print"
                                onClick={() => {
                                    setIsModalTatToan(true);
                                    setSoTienCongNoThanhToan(record.so_tien_no > 0 ? record.so_tien_no : -record.so_tien_no);
                                    setSoTienCongNoThanhToan_max(record.so_tien_no > 0 ? record.so_tien_no : -record.so_tien_no);
                                    setIdAction(record.chung_tu_id);
                                    setLoaiChungTu(record.loai_chung_tu);
                                    setTienCongNo_phuongThucTT(null);
                                }}
                        >
                            Thanh toán công nợ
                        </button>
                    </Divider>
                    : <span>111</span>}
                </div>
            }
        ];

        if(dataInfo[record.id]) {

            const info = dataInfo[record.id];

            // check ncc
            if(info.nhaCungCap) {
                item.push({
                    label: <span className="title-sub-tab">Nhà cung cấp</span>,
                    key: key++,
                    children: nhaCungCapInfo(info.nhaCungCap)
                })

            }
            // check khach hang
            if(info.khachHang) {
                item.push({
                    label: <span className="title-sub-tab">Khách hàng</span>,
                    key: key++,
                    children: khachHangInfo(info.khachHang)
                })
            }

            if(info.khachTraHang) {
                item.push({
                    label: <span className="title-sub-tab">Hóa đơn khách trả hàng</span>,
                    key: key++,
                    children: khachTraHang(info.khachTraHang)
                })
            }

            if(info.nhapHang) {
                item.push({
                    label: <span className="title-sub-tab">Hóa đơn nhập hàng</span>,
                    key: key++,
                    children: nhapHang(info.nhapHang)
                })
            }

            if(info.traHangNCC) {
                item.push({
                    label: <span className="title-sub-tab">Hóa đơn trả hàng</span>,
                    key: key++,
                    children: traHangNCC(info.traHangNCC)
                })
            }

            // check hdon

            // nhap hang

            // tra hang

            // tra hang ncc

        }

        return <Tabs className={' width100'}
            defaultActiveKey="1"
            items={item}/>

    };

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
                return <Col key={col02.id} sm={{ span: 12 }}><label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a> {col02.display_name}: </label> {!record[col02.name] ? '' : dayjs(record[col02.name]).format(DATE_SHOW)} </Col>;
            }

            if (['datetime'].includes(col02.type_edit)) {
                return <Col key={col02.id} sm={{ span: 12 }}><label className="label-title01"><a className="a-icon"><CaretRightOutlined /></a> {col02.display_name}: </label> {!record[col02.name] ? '' : dayjs(record[col02.name]).format(DATE_TIME_SHOW)}</Col>;
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
                // initialValues={formChamCong}
                >
                    <Row>
                        {/* chọn loại phiếu */}
                        <Col sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: 12 }}>
                            <Form.Item name='loai_phieu' label=''
                                className="radio02"
                                rules={[{
                                    required: true,
                                    message: 'Vui lòng chọn loại phiếu',
                                }]}>
                                <Radio.Group
                                    block
                                    onChange={(radio) => {
                                        console.log('value', radio.target.value);
                                        const value = radio.target.value;
                                        if(value === 'phieu_thu') {
                                            setClassLoaiChi('_hidden');
                                            setClassLoaiThu('');
                                        }
                                        if(value === 'phieu_chi') {
                                            setClassLoaiChi('');
                                            setClassLoaiThu('_hidden');
                                        }
                                    }}
                                    options={[
                                        { label: 'Phiếu Thu', value: 'phieu_thu'},
                                        { label: 'Phiếu Chi', value: 'phieu_chi' },
                                    ]}
                                    optionType="button"
                                    buttonStyle="solid"
                                />
                            </Form.Item>
                        </Col>



                    </Row>


                    <Row>

                        {/* <Col sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: 12 }} className={classLoaiThu}>
                            <Form.Item name='loai_thu_id' label='Loại phiếu thu' className="form-item02">
                                <Select
                                    style={{ width: 80 }}
                                    placeholder="Chọn loại thu"
                                    optionFilterProp="children"
                                    options={props.selectData.loai_thu_id.selectbox
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: 12 }} className={classLoaiChi}>
                            <Form.Item name='loai_chi_id' label='Loại phiếu chi' className="form-item02">
                                <Select
                                    style={{ width: 80 }}
                                    placeholder="Chọn loại chi"
                                    optionFilterProp="children"
                                    options={props.selectData.loai_thu_id.selectbox
                                    }
                                />
                            </Form.Item>
                        </Col> */}

                        {listItems}

                    </Row>

                    <Row>
                        <Col md={{ span: 24 }}>

                            <p><b>Hình ảnh</b></p>

                            <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                <ImgCrop
                                        aspect={1}
                                        aspectSlider={true}
                                        rotationSlider={true}
                                        showGrid={true}
                                        showReset={true}
                                    >
                                        <Upload multiple
                                            action={route("data.upload_image")}
                                            listType="picture-card" // picture-card
                                            fileList={fileList}
                                            maxCount={5}
                                            onChange={onChange}
                                            itemRender={(originNode, file) => (
                                                <DraggableUploadListItem originNode={originNode} file={file} />
                                            )}
                                        >
                                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                    </Upload>
                                </ImgCrop>
                                </SortableContext>
                            </DndContext>

                        </Col>
                    </Row>

                    <Row className="main-modal-footer01">
                        <Col span={24} className="main-btn-popup">
                            <Button className="btn-popup" type="primary"
                                onClick={() => {
                                    if(isDraft !== 2) {
                                        setIsDraft(2);
                                    }
                                    formEdit.submit();
                                }}
                            >
                                <CheckOutlined />
                                Tạo phiếu
                            </Button>
                            <span> </span>
                            <Button className="btn-popup btn-draft"
                                onClick={() => {
                                    setIsOpenFormEdit(false);
                                }}
                            >
                                <CloseSquareOutlined />
                                Hủy
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
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

                        {checkShowBtnImport()}

                    </Space>
                    <Space className="_right">
                        {/* checkShowBtnDelete() */}

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
                    <Col sm={{ span: 6 }}>
                        {searchLeft()}
                    </Col>
                    <Col sm={{ span: 18 }}>
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
            <AdminLayout
                auth={props.auth}
                header={props.table.display_name}
                tables={routeTaiChinh}
                current={props.table}
                content={
                    <div>
                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            onOk={async () => {
                                    setConfirmLoading(true);
                                    const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [idAction]));
                                    if(result.status === 200) {
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
                            onCancel={() => {setIsModalXoaOpen(false);}}>
                                <ul>
                                    <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                                    <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                                    <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                                </ul>
                        </Modal>

                        <Modal title="THANH TOÁN CÔNG NỢ"
                            open={isModalTatToan}
                            okText="Xác nhận thanh toán"
                            cancelText="Hủy"
                            onCancel={()=>setIsModalTatToan(false)}
                            onOk={() => {
                                    if(!tienCongNo_phuongThucTT) {
                                        message.error('Vui lòng chọn phương thức thanh toán');
                                        return false;
                                    }
                                    axios.post(route("tatToanCongNo"), {
                                                loai_chung_tu: loaiChungTu,
                                                chung_tu_id: idAction,
                                                so_tien: soTienCongNoThanhToan,
                                                hinh_thuc_thanh_toan_id: tienCongNo_phuongThucTT,
                                            })
                                            .then((response) => {
                                                message.success('Đã tất toán thành công');
                                                location.reload();
                                            })
                                            .catch((error) => {
                                                message.error("Thanh toán thất bại, vui lòng tải lại trình duyệt và thử lại");
                                        });
                                    }
                                }
                            >
                                <div>
                                    <table className="table-sub">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <b>Số tiền thanh toán:</b>
                                                </td>
                                                <td>
                                                    <InputNumber value={soTienCongNoThanhToan}
                                                        min={1}
                                                        max={soTienCongNoThanhToan_max}
                                                        formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                                        onChange={(value) => setSoTienCongNoThanhToan(value)}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><b>Phương thức thanh toán:</b></td>
                                                <td>
                                                    <Radio.Group
                                                        value={tienCongNo_phuongThucTT}
                                                        block
                                                        options={[
                                                            { label: 'Tiền mặt', value: 1 },
                                                            { label: 'Thẻ', value: 2 },
                                                            { label: 'Chuyển khoản', value: 3 },
                                                        ]}
                                                        optionType="button"
                                                        buttonStyle="solid"
                                                        onChange={(e) => {
                                                            setTienCongNo_phuongThucTT(e.target.value);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                        <span> </span>

                                    <p> </p>

                                    <p>Sau khi xác nhận thanh toán, hệ thống sẽ cập nhật và đồng bộ lại toàn bộ dữ liệu liên quan đến phiếu nhập hàng này, gồm có phiếu chi, sổ quỹ, công nợ</p>

                                </div>

                        </Modal>

                        <Row className='width100'>
                            <Col sm={6}>
                                <Card variant="borderless">
                                    <Statistic
                                    title="Số lượng"
                                    value={props.soLuongCongNo}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<MoneyCollectFilled />}
                                    />
                                </Card>
                            </Col>

                            <Col sm={6}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Nợ cần thu"
                                    value={props.noCanThu}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<CheckCircleFilled />}
                                    suffix="đ"
                                    />
                                </Card>
                            </Col>

                            <Col sm={6}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Nợ phải trả"
                                    value={props.noPhaiTra}
                                    valueStyle={{ color: '#07378c' }}
                                    prefix={<MinusSquareFilled />}
                                    suffix="đ"
                                    />
                                </Card>
                            </Col>

                            <Col sm={6}>
                                <Card variant="borderless" className='sub-item-home'>
                                    <Statistic
                                    title="Tổng công nợ"
                                    value={props.tongCongNo}
                                    valueStyle={{ color: '#07378c' }}
                                    prefix={<DiffFilled />}
                                    suffix="đ"
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Row>
                            <br/>
                        </Row>

                        <HTBankingQR
                            bankCode="TPB"
                            accountNumber="00299941001"
                            accountName="LUU QUANG TIEN"
                            amount={5000}
                            description="2013017"
                        />

                        {/* {HTBankingQR({
                            bankCode: 'TPB',
                            accountNumber: '00299941001',
                            accountName: 'Luu Quang Tien',
                            amount: 5000,
                            description: 'test nap tien',
                        })} */}

                        {contextHolder}
                        {pageContent}
                    </div>
                }
            />
        </div>
    );
}
