import  { useState } from "react";
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
    Checkbox ,
    notification,
    Divider,
    Image,
    Upload,
    Dropdown,
} from "antd";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowRightOutlined,
    FormOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    CopyOutlined,
    CheckOutlined,
    CloseSquareOutlined,
    PrinterOutlined,
    CloseCircleOutlined,
    UploadOutlined,
    CaretRightOutlined, MinusCircleOutlined,DashboardOutlined
} from "@ant-design/icons";

import "../../../../css/form.css";
import {callApi} from "../../../Function/api";
import { inArray, parseJson, numberFormat, removeByIndex } from "../../../Function/common";
import dayjs from "dayjs";

import { DATE_FORMAT, DATE_TIME_FORMAT, DATE_SHOW, DATE_TIME_SHOW, MOC_THOI_GIAN } from '../../../Function/constant';
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
    HTTime, HTColor, HTCascaderTable, smartSearch02, showDataSearch, showDataSearch02,

} from "../../../Function/input";

import { showSelects, showSelect } from '../../../Function/selects_table';
import { routeQLKho } from "../../../Function/config_route";

export default function Dashboard(props) {
    sessionStorage.clear();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);
    const [loading, setLoading] = useState(false);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [formEdit] = Form.useForm();
    const [idAction, setIdAction] = useState(0);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [thanhToan, setThanhToan] = useState(0);
    const [tongTienHang, setTongTienHang] = useState(0);
    const [tongGiamGia, setTongGiamGia] = useState(0);
    const [tongSoLuong, setTongSoLuong] = useState(0);
    const [tongPhiVanChuyen, setTongPhiVanChuyen] = useState(0);

    const [daThanhToan, setDaThanhToan] = useState(0);
    const [tongCongNo, setTongCongNo] = useState(0);
    const [ngayTatToan, setNgayTatToan] = useState(dayjs());

    const [isModalTatToan, setIsModalTatToan] = useState(false);
    const [soTienCongNoThanhToan, setSoTienCongNoThanhToan] = useState(0);
    const [soTienCongNoThanhToan_max, setSoTienCongNoThanhToan_max] = useState(0);
    const [tienCongNo_phuongThucTT, setTienCongNo_phuongThucTT] = useState(null);

    const [isDraft, setIsDraft] = useState(2);

    const dataDetail_item_default = {
        product_id: null,
        product_name: '',
        product_code: '',
        so_luong: 0, // so_luong_thuc_te
        gia_von: 0,
        giam_gia: 0,
        thanh_tien: 0,
        phi_van_chuyen:0
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


    const { RangePicker } = DatePicker;
    const dateFormat = 'YYYY/MM/DD';

    const [hinhThucTT, setHinhThucTT] = useState(props.searchData.hinh_thuc_thanh_toan_id ? props.searchData.hinh_thuc_thanh_toan_id : null);
    const [mocThoiGian, setMocThoiGian] = useState(props.mocThoiGian);
    const [khoangThoiGian, setKhoangThoiGian] = useState(!props.khoangThoiGian[0] ? props.khoangThoiGian : [dayjs(props.khoangThoiGian[0]), dayjs(props.khoangThoiGian[1])]);


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

    const [api, contextHolder] = notification.useNotification();

    const onFinishFormEdit = (values) => {

        setLoading(true);
        values.is_draft = isDraft;

        // check product
        const check = checkProduct();
        if(!check) {
            formEdit.setFieldValue('is_draft', 0);
            return false;
        }

        if(tongCongNo > 0 && !ngayTatToan) {
            message.error('Vui lòng chọn ngày tất toán');
            return false;
        }

        for (const [key, val] of Object.entries(formEdit.getFieldValue())) {
            if (!values[key]) {
                values[key] = val;
            }
        }

        values.dataDetail = dataDetail;
        values.giam_gia = tongGiamGia;
        values.tong_tien_hang = tongTienHang;
        values.thanh_tien = thanhToan;
        values.so_luong = tongSoLuong;
        values.tong_phi_van_chuyen = tongPhiVanChuyen;
        values.id = idAction;

        values.da_thanh_toan = daThanhToan;
        values.cong_no = tongCongNo;
        values.ngay_tat_toan = ngayTatToan.format('YYYY-MM-DD');

        values = formatValueForm(props.columns, values);
        // console.log(values);
        // return;

        // save
        axios.post(route("saveNhapHang"), values).then((response) => {
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

        // values.hinh_thuc_thanh_toan_id = hinhThucTT;
        values.mocThoiGian = mocThoiGian;
        if(khoangThoiGian[0]) {
            values.khoangThoiGian = khoangThoiGian.map((item) => {
                return item.format("YYYY-MM-DD");
            });
        } else {
            values.khoangThoiGian = null;
        }

        router.get(route("nhapHang"),values);
    };

    const listItemsSearch02 = props.columns.map((col) =>
        showDataSearch02(col, props, () => formSearch.submit())
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
                            setKhoangThoiGian(value);
                            setMocThoiGian('');
                            formSearch.submit();
                        }}
                    />
                </Col>
    }

    function formHinhThucTT() {
        return <Col sm={{ span: 24 }} className='item-search'>
                        <Form.Item name='hinh_thuc_thanh_toan_id'
                            label={<div>Phương thức TT </div>}>
                            <Checkbox.Group
                                onChange={(value) => {
                                    setHinhThucTT(value)
                                    formSearch.submit();
                                }}
                                options={[
                                    { label: 'Tiền mặt', value: '1' },
                                    { label: 'Chuyển khoản', value: '3' },
                                    { label: 'Thẻ', value: '2' },
                                ]
                                }
                            />

                        </Form.Item>
                    </Col>
    }


    function searchLeft() {
        if (props.table.search_position !== 1) {
            return '';
        }

        return <div>

                <Row gutter={24} className="main-search-left">


                    {/* thoi gian */}
                    {formKhoangThoiGian()}

                    <Form
                        name="basic"
                        layout="vertical"
                        onFinish={onFinishSearch}
                        autoComplete="off"
                        form={formSearch}
                        initialValues={props.searchData}
                        onBlur={(e) => {formSearch.submit();}}
                    >
                        {smartSearch02(props.table, () => formSearch.submit())}

                        {/* hinh_thuc_thanh_toan */}
                        {formHinhThucTT()}

                        {listItemsSearch02}
                    </Form>
                </Row>
                {/* <Button
                    type="primary"
                    htmlType="submit"
                    loading={loadingBtnSearch}
                >
                    <SearchOutlined />
                    Tìm kiếm
                </Button> */}
            <br />
        </div>
    }

    const expandedRowRender = (record, index) => {
        const info = parseJson(record.info);
        const detail = info.map((item, idx) => {
            return <tr key={idx}>
                <td>{item.product_code} - {item.product_name}</td>
                <td>{item.so_luong}</td>
                <td>{numberFormat(item.gia_von)}</td>
                <td>{numberFormat(item.giam_gia)}</td>
                <td>{numberFormat(item.phi_van_chuyen)}</td>
                <td>{numberFormat(item.thanh_tien)}</td>
            </tr>
        });

        return <div>
            {checkShowData(record)}
            <table className="table-sub">
                <thead>
                    <tr>
                        <th>Hàng hóa</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Giảm giá</th>
                        <th>Phí vận chuyển</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>

                <tbody>
                    {detail}
                </tbody>

                <tbody>
                    <tr className="border-none">
                        <td colSpan={2}></td>
                        <td colSpan={3} className="text-right01">Tổng tiền hàng:</td>
                        <td>{numberFormat(record.tong_tien_hang)}</td>
                    </tr>
                    <tr className="border-none">
                        <td colSpan={2}>
                            {
                                record.cong_no === 0 ?
                                ''
                                :
                                <button className="btn-print"
                                    onClick={() => {
                                        setIsModalTatToan(true);
                                        setSoTienCongNoThanhToan(record.cong_no);
                                        setSoTienCongNoThanhToan_max(record.cong_no);
                                        setIdAction(record.id);
                                        setTienCongNo_phuongThucTT(null);
                                    }}
                                >
                                    <CheckOutlined /> Tất toán công nợ
                                </button>
                            }

                        </td>
                        <td colSpan={3} className="text-right01">Giảm giá:</td>
                        <td>{numberFormat(record.giam_gia)}</td>
                    </tr>
                    <tr className="border-none">
                        <td colSpan={2}>
                            <a target="new" href={route('print.nhapHang', [record.id])}>
                                <button className="btn-print"><PrinterOutlined /> In</button>
                            </a>
                        </td>
                        <td colSpan={3} className="text-right01">Thanh toán:</td>
                        <td>{numberFormat(record.thanh_tien)}</td>
                    </tr>
                    {/* Đã thanh toán */}
                    <tr>
                        <td colSpan={2}>
                            <button className="btn-cancel02" onClick={() => {setIsModalXoaOpen(true); setIdAction(record.id)}}><CloseSquareOutlined /> Hủy phiếu này</button>
                        </td>
                        <td colSpan={3} className="text-right01 ">Đã thanh toán:</td>
                        <td className="_bold">{numberFormat(record.da_thanh_toan)}</td>
                    </tr>

                    {/* Công nợ */}
                    <tr>
                        <td colSpan={2}></td>
                        <td colSpan={3} className="text-right01 ">
                            <b><a><MinusCircleOutlined /> </a> </b>
                            <b>Công nợ </b>
                        </td>
                        <td className="_bold">
                            <b className="_red">{numberFormat(record.cong_no)} <sup>đ</sup></b>
                        </td>
                    </tr>

                    {/* Ngày tất toán */}
                    <tr>
                        <td colSpan={2} className="_bold"></td>
                        <td colSpan={3} className="text-right01 ">
                            <b><a><DashboardOutlined /> </a> </b>
                            <b>Ngày tất toán </b>
                        </td>
                        <td className="_bold">
                            {record.ngay_tat_toan ? dayjs(record.ngay_tat_toan).format('DD/MM/YYYY') : ''}
                        </td>
                    </tr>
                </tbody>

            </table>
        </div>;
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


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


            // if(['image', 'image_crop'].includes(col02.type_edit)) {
            //     return <Image className="image-index" src={record[col02.name]}></Image>;
            // }

            // if(['images', 'images_crop'].includes(col02.type_edit) && record[col02.name].avatar) {
            //     return <Image className="image-index" src={record[col02.name].avatar}></Image>;
            // }
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

    function showFormDataDetail() {
        return dataDetail.map((data, idx) => {
            return <tr key={idx}>
                <td>
                    <Select className="select03"
                        placeholder="Hàng hóa"
                        optionFilterProp="children"
                        onChange={(value, info) => {
                            let isError = false;
                            dataDetail.forEach((item) => {
                                if(item.product_id === value) {
                                    message.error('Sản phẩm này đã được chọn trước đó, xin vui lòng chọn sản phẩm khác');
                                    isError = true;
                                }
                            });

                            // check duplication
                            if(isError) {
                                return false;
                            }

                            let data_tmp = cloneDeep(dataDetail);
                            data_tmp[idx].product_id = value;
                            data_tmp[idx].product_name = info.name;
                            data_tmp[idx].product_code = info.code;

                            data_tmp[idx].so_luong = 1;
                            data_tmp[idx].gia_von = info.gia_von;
                            data_tmp[idx].thanh_tien = info.gia_von;
                            setDataDetail(data_tmp);
                            tinhTongTien(data_tmp);
                        }}
                        allowClear={true}
                        value={data.product_id}
                        options={props.products.map((pro) => {
                            return {
                                value: pro.id,
                                label: pro.code + ' - ' + pro.name ,
                                gia_von: +pro.gia_von,
                                name: pro.name,
                                code: pro.code,
                            }
                        })}
                    />

                </td>
                <td className="td-input">
                    <InputNumber
                        className="input-number-kiemkho"
                        disabled={data.product_id ? false : true}
                        value={data.so_luong}
                        min={1}
                        onChange={(value) => {
                            let data_tmp = cloneDeep(dataDetail);
                            data_tmp[idx].so_luong = value;
                            data_tmp[idx].thanh_tien = dataDetail[idx].so_luong * (dataDetail[idx].gia_von - dataDetail[idx].giam_gia) + dataDetail[idx].phi_van_chuyen;
                            setDataDetail(data_tmp);
                            tinhTongTien(data_tmp);
                        }}
                    />
                </td>
                <td className="td-input">
                    <InputNumber
                        className="input-number-kiemkho"
                        formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        disabled={data.product_id ? false : true}
                        value={data.gia_von}
                        min={0}
                        onChange={(value) => {
                            let data_tmp = cloneDeep(dataDetail);
                            data_tmp[idx].gia_von = value;
                            data_tmp[idx].thanh_tien = dataDetail[idx].so_luong * (dataDetail[idx].gia_von - dataDetail[idx].giam_gia) + dataDetail[idx].phi_van_chuyen;

                            setDataDetail(data_tmp);
                            tinhTongTien(data_tmp);
                        }}
                    />
                </td>
                <td className="td-input">
                    <InputNumber
                        className="input-number-kiemkho"
                        formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        disabled={data.product_id ? false : true}
                        value={data.giam_gia}
                        min={0}
                        max={dataDetail[idx].gia_von}
                        onChange={(value) => {
                            let data_tmp = cloneDeep(dataDetail);
                            data_tmp[idx].giam_gia = value;
                            data_tmp[idx].thanh_tien = dataDetail[idx].so_luong * (dataDetail[idx].gia_von - dataDetail[idx].giam_gia) + dataDetail[idx].phi_van_chuyen;

                            setDataDetail(data_tmp);
                            tinhTongTien(data_tmp);
                        }}
                    />

                </td>

                <td className="td-input">
                    <InputNumber
                        className="input-number-kiemkho"
                        formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        disabled={data.product_id ? false : true}
                        value={data.phi_van_chuyen}
                        min={0}
                        onChange={(value) => {
                            let data_tmp = cloneDeep(dataDetail);
                            data_tmp[idx].phi_van_chuyen = value;
                            data_tmp[idx].thanh_tien = dataDetail[idx].so_luong * (dataDetail[idx].gia_von - dataDetail[idx].giam_gia) + dataDetail[idx].phi_van_chuyen;
                            setDataDetail(data_tmp);
                            tinhTongTien(data_tmp);
                        }}
                    />

                </td>

                <td className="td-input">
                    {numberFormat(data.thanh_tien)} <sup>đ</sup>
                </td>
                <td>
                    <a className="btn-delete02"
                        onClick={() => {
                            let dataDetail_tmp = cloneDeep(dataDetail);
                            dataDetail_tmp = removeByIndex(dataDetail_tmp, idx);
                            setDataDetail(dataDetail_tmp);
                            tinhTongTien(dataDetail_tmp);
                        }}
                    >
                        <CloseCircleOutlined />
                    </a>
                </td>
            </tr>
        });
    }

    function tinhTongTien(dataDetail_tmp) {
        let tongTienHang_tmp = 0
        let tongGiamGia_tmp = 0
        let tongThanhToan_tmp = 0
        let tongSoLuong_tmp = 0
        let tongPhiVanChuyen_tmp = 0
        dataDetail_tmp.forEach((val) => {
            tongTienHang_tmp += val.gia_von * val.so_luong;
            tongGiamGia_tmp += (val.giam_gia * val.so_luong);
            tongThanhToan_tmp += val.thanh_tien;
            tongSoLuong_tmp += val.so_luong;
            tongPhiVanChuyen_tmp += val.phi_van_chuyen;
        });
        setTongTienHang(tongTienHang_tmp);
        setTongGiamGia(tongGiamGia_tmp);
        setTongSoLuong(tongSoLuong_tmp);
        setTongPhiVanChuyen(tongPhiVanChuyen_tmp);
        setThanhToan(tongThanhToan_tmp);

        setDaThanhToan(tongThanhToan_tmp);
        setTongCongNo(0);
        setNgayTatToan(dayjs());
    }

    function showTotalDetail() {

        return <tbody>
            <tr>
                <td colSpan={5} className="text-right01">Tổng tiền hàng:</td>
                <td colSpan={1} className="_red text-right">{numberFormat(tongTienHang)} <sup>đ</sup></td>
            </tr>

            <tr>
                <td colSpan={5} className="text-right01">Giảm giá:</td>
                <td colSpan={1} className="_red text-right">{numberFormat(tongGiamGia)} <sup>đ</sup></td>
            </tr>

            <tr>
                <td colSpan={5} className="text-right01">Phí vận chuyển:</td>
                <td colSpan={1} className="_red text-right">{numberFormat(tongPhiVanChuyen)} <sup>đ</sup></td>
            </tr>

            <tr>
                <td colSpan={5} className="text-right01">Thanh Toán:</td>
                <td colSpan={1} className="_red text-right">{numberFormat(thanhToan)} <sup>đ</sup></td>
            </tr>

            {/* Đã thanh toán */}
            <tr>
                <td colSpan={5} className="text-right01 ">Đã thanh toán:</td>
                <td className="_bold">
                    <InputNumber value={daThanhToan} className="width100"
                        min={0}
                        max={thanhToan}
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        onChange={(value) => {
                            setDaThanhToan(value);
                            if(value < thanhToan) {
                                setTongCongNo(thanhToan - value);
                                setNgayTatToan(null);
                            } else {
                                setTongCongNo(0);
                                setNgayTatToan(dayjs());
                            }
                        }}
                    />
                </td>
            </tr>

            {/* Công nợ */}
            <tr>
                <td colSpan={5} className="text-right01 ">
                    <b><a><MinusCircleOutlined /> </a> </b>
                    <b>Công nợ </b>
                </td>
                <td className="_bold">
                    <b className="_red">{numberFormat(tongCongNo)} <sup>đ</sup></b>
                </td>
            </tr>

            {/* Ngày tất toán */}
            <tr>
                <td colSpan={5} className="text-right01 ">
                    <b><a><DashboardOutlined /> </a> </b>
                    <b>Ngày tất toán </b>
                </td>
                <td className="_bold">
                    <DatePicker placeholder="Mặc định là ngày hôm nay"
                        value={ngayTatToan}
                        format={"DD/MM/YYYY"}
                        onChange={(value) => {
                            setNgayTatToan(value);
                        }}
                    />
                </td>
            </tr>

            <tr className="border-none">
                <td colSpan={6}>

                    <p><em className="success-text">Chọn phương thức thanh toán: </em></p>
                    <Form.Item
                        label=''
                        name='hinh_thuc_thanh_toan_id'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn phương thức thanh toán',
                            },
                        ]}
                    >
                        <Radio.Group
                            block
                            options={[
                                { label: 'Tiền mặt', value: 1 },
                                { label: 'Thẻ', value: 2 },
                                { label: 'Chuyển khoản', value: 3 },
                            ]}
                            optionType="button"
                            buttonStyle="solid"
                        />
                    </Form.Item>
                </td>
            </tr>
        </tbody>
    }

    function btnAddNew() {

        const listItems = props.columns.map((col) => {
            return showData(col);
        });

        return <div>
            <Modal
                title={<span className="title-modal01"><PlusCircleOutlined /> Thêm mới phiếu nhập hàng</span>}
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
                        {listItems}
                    </Row>

                    <Row>
                        <table className="table-salary">
                            <thead>
                                <tr>
                                    <th>Hàng hóa</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Giảm giá</th>
                                    <th>Phí vận chuyển</th>
                                    <th>Thành tiền</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>

                                {showFormDataDetail()}

                                <tr>
                                    <td colSpan={6} className="main-result-submitform">
                                        <ul>
                                            {result}
                                        </ul>
                                    </td>
                                </tr>

                                <tr>
                                    <td colSpan={6}>
                                        <a className="add-item01" onClick={() => addSub()}>
                                            <span className="icon-b"><PlusCircleOutlined /> Thêm sản phẩm</span>
                                        </a>
                                    </td>
                                </tr>

                            </tbody>

                            {showTotalDetail()}


                        </table>
                    </Row>
                    <Row className="main-modal-footer01">
                        <Col span={24} className="main-btn-popup">
                            <Button className="btn-popup" onClick={cancelEdit}>
                                <CloseSquareOutlined />
                                Hủy
                            </Button>
                            <span> </span>
                            <Button className="btn-popup" type="primary"
                                onClick={() => {
                                    if(isDraft !== 2) {
                                        setIsDraft(2);
                                    }
                                    formEdit.submit();
                                }}
                            >
                                <CheckOutlined />
                                Xác nhận thanh toán
                            </Button>
                            <span> </span>
                            <Button className="btn-popup btn-draft" type="primary"
                                onClick={() => {
                                    if(isDraft !== 1) {
                                        setIsDraft(1);
                                    }
                                    formEdit.submit();
                                }}
                            >
                                <CopyOutlined />
                                Lưu nháp
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Button type="primary" onClick={() => addNewData()}>
                <PlusCircleOutlined />
                Thêm mới
            </Button>
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

                        {checkShowBtnImport()}

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

    function tatToanCongNo(record) {
        console.log('record', record);
        setTienlq(2);
    }

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                content={
                    <div>
                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            onOk={async () => {
                                    const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [idAction]));
                                    if(result.status === 200) {
                                        message.success("Đã hủy đơn thành công");
                                        location.reload();
                                    } else {
                                        message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                                    }
                                }
                            }
                            okText="Xác nhận hủy đơn"
                            cancelText="Hủy"
                            loading={true}
                            maskClosable={true}
                            // confirmLoading={confirmLoading}
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
                            loading={true}

                            onCancel={()=>setIsModalTatToan(false)}
                            onOk={() => {
                                    if(!tienCongNo_phuongThucTT) {
                                        message.error('Vui lòng chọn phương thức thanh toán');
                                        return false;
                                    }
                                    axios.post(route("tatToanCongNo"), {
                                                loai_chung_tu: 'product_nhap_hang',
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
                                    </table>
                                     <span> </span>

                                    <p> </p>

                                    <p>Sau khi xác nhận thanh toán, hệ thống sẽ cập nhật và đồng bộ lại toàn bộ dữ liệu liên quan đến phiếu nhập hàng này, gồm có phiếu chi, sổ quỹ, công nợ</p>

                                </div>

                        </Modal>


                        {/* {contextHolder} */}
                        {pageContent}
                    </div>
                }
            />
        </div>
    );
}
