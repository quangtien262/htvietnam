import React, { useState, useEffect, useRef  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, Radio, Popconfirm } from 'antd';
import { FormOutlined, CopyOutlined, UploadOutlined } from '@ant-design/icons';
import { router, Link } from '@inertiajs/react';
import ImgCrop from 'antd-img-crop';
import axios from 'axios';

import '../../../../css/form.css';
import { chamCongCellRender, getH, getM } from '../../../Function/calendar';
import { showData, checkRule } from '../../../Function/data';
import { numberFormatBycount } from '../../../Function/common';
// dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { RangePicker } = DatePicker;

const { TextArea } = Input;
const { Option } = Select;

export default function Dashboard(props) {
    const [data, setData] = useState(props.data);

    const [submitRedirect, setSubmitRedirect] = useState("detail"); // detail, list
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [isStopSubmit, setIsStopSubmit] = useState(false);
    const [fileList, setFileList] = useState(props.imagesData);
    //permission
    const [permissionList, setPermissionList] = useState(props.permissionList);
    const [isCheckAllPermission, setIsCheckAllPermission] = useState(false);
    //modal cham cong
    const [openModalChamCong, setOpenModalChamCong] = useState(false);
    const [isDisableInputChamCong, setIsDisableInputChamCong] = useState(false);
    const [formData] = Form.useForm();
    const [formChamCong] = Form.useForm();
    // editor
    const tinyRefs = useRef([]);
    const [tinyImageName, setTinyImageName] = useState([]);
    // calendar
    const [chamCong, setChamCong] = useState(
        !data.cham_cong ? {} : JSON.parse(data.cham_cong)
    );
    const [currentChamCong, setCurrentChamCong] = useState("");

    // Cham Cong
    const [dataChamCong, setDataChamCong] = useState({
        checkin_h: "08",
        checkin_m: "30",
        checkout_h: "17",
        checkout_m: "30",
        note: "",
        note_curren:"",
        type: 1,
        kpi: 0,
        luong_nghi_nua_ngay: 0,
        luong_nghi_ca_ngay: 0,
    });

    const DATE_FORMAT = "YYYY-MM-DD";

    const onFinish = (values) => {
        setIsStopSubmit(false);
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

            values.images = images;
            values.image = images;
        } else {
            values.images = "";
            values.image = "";
        }

        if (isStopSubmit) {
            message.error("Lưu thất bại, vui lòng chờ tải xong hình ảnh");
            return false;
        }

        if (Object.keys(chamCong).length > 0) {
            values.cham_cong = chamCong;
        }

        for (const [key, col] of Object.entries(props.columns)) {
            if (col.type_edit === "tiny") {
                values[col.name] = tinyRefs.current[col.name].getContent();
            }
            if (col.type_edit === "permission_list") {
                values[col.name] = isCheckAllPermission
                    ? props.permissionList_all
                    : permissionList;
            }
            if (col.type_edit === "date" && values[col.name]) {
                values[col.name] = values[col.name].format(DATE_FORMAT) ;
            }
        }
        // console.log(values);
        // return;
        values.tiny_images = tinyImageName;
        values.submit_edirect = submitRedirect;


        values["datepicker"] = values["datepicker"]
            ? values["datepicker"].format(DATE_FORMAT)
            : "";
        if (props.dataId > 0) {
            router.post(
                route("data.update", [props.table.id, data.id]),
                values
            );
        } else {
            router.post(route("data.store", [props.table.id]), values);
        }
    };

    const onFinishFailed = (errorInfo) => {};

    function checkRequired(is_required, name) {
        return [
            {
                required: is_required,
                message: '"' + name + '" Không được để trống',
            },
        ];
    }

    const onChangeImage = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const onPreviewImage = async (file) => {
        let src = file.url;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    };

    const onRemoveImage = (file) => {
        const updatedFileList = fileList.filter((f) => f.uid !== file.uid);
        setFileList(updatedFileList);
        console.log(updatedFileList);
    };

    const optiondata = () => {
        props.selectData[col.name];
    };

    function callbackImage(callback, value, meta) {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                axios
                    .post(route("data.tiny_upload_image"), {
                        file: reader.result,
                    })
                    .then((response) => {
                        // console.log('response', response);
                        if (response.data.status_code == 200) {
                            callback(response.data.data.filePath, {
                                title: "",
                            });

                            message.success("Đã thêm hình ảnh thành công");
                        } else {
                            message.error("Thêm hình ảnh thất bại");
                        }
                    })
                    .catch((error) => {
                        message.error("Thêm hình ảnh thất bại");
                    });
            });
            reader.readAsDataURL(file);
        });

        input.click();
    }

    function showDataImages(col) {
        const data = props.data;
        let result;
        const typeEdit = col.type_edit;
        if (col.edit !== 1) {
            return false;
        }
        switch (typeEdit) {
            case "images_crop":
            case "image_crop":
                result = (
                    <Row>
                        <Col key={col.name}>
                            <Form.Item
                                name={col.name}
                                rules={checkRule(col)}
                                label={col.display_name}
                            >
                                <ImgCrop
                                    aspect={col.ratio_crop}
                                    aspectSlider={true}
                                    rotationSlider={true}
                                    showGrid={true}
                                    showReset={true}
                                >
                                    <Upload
                                        action={route("data.upload_image")}
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={onChangeImage}
                                        onPreview={onPreviewImage}
                                        onRemove={onRemoveImage}
                                    >
                                        {fileList.length < props.countImage &&
                                            "+ Upload"}
                                    </Upload>
                                </ImgCrop>
                            </Form.Item>
                        </Col>
                    </Row>
                );
                break;
            case "image":
            case "images":
                result = (
                    <Row>
                        <Col key={col.name}>
                            <Form.Item
                                name={col.name}
                                rules={checkRule(col)}
                                label={col.display_name}
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                    size="large"
                                >
                                    <Upload
                                        action={route("data.upload_image")}
                                        listType="picture"
                                        maxCount={props.countImage}
                                        fileList={fileList}
                                        onChange={onChangeImage}
                                        onPreview={onPreviewImage}
                                        onRemove={onRemoveImage}
                                        multiple
                                    >
                                        <Button icon={<UploadOutlined />}>
                                            Upload (Tối đa: {props.countImage})
                                        </Button>
                                    </Upload>
                                </Space>

                            </Form.Item>
                        </Col>
                    </Row>
                );
                break;
        }

        return result;
    }

    const listItems = props.columns.map((col) => {
        return showData(col, props);
    });

    const imageItems = props.columns.map((col) => {
        if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
            return showDataImages(col);
        }
    });

    const cellRender = (current) => {
        if (chamCong.length === 0) {
            return "";
        }
        const cong = chamCong[current.format("MMDD")];
        if (!cong) {
            return "";
        }
        const type = cong.type;

        return chamCongCellRender(type, cong);
    };

    async function setStateData(cong) {
        let data_tmp = data;

        let kpiChamCong = 0,
            luongNghiNuaNgay = 0,
            luongNghiCaNgay = 0;
        for (const [key, value] of Object.entries(cong)) {
            if (value.kpi) {
                kpiChamCong += value.kpi;
            }
            if (value.luong_nghi_nua_ngay) {
                luongNghiNuaNgay += value.luong_nghi_nua_ngay;
            }
            if (value.luong_nghi_ca_ngay) {
                luongNghiCaNgay += value.luong_nghi_ca_ngay;
            }
        }
        data_tmp.kpi_cham_cong = kpiChamCong;
        data_tmp.luong_nghi_nua_ngay = luongNghiNuaNgay;
        data_tmp.luong_nghi_ca_ngay = luongNghiCaNgay;
        data_tmp.kpi = +data_tmp.kpi_bonus + data_tmp.kpi_cham_cong;
        data_tmp.total =
            data_tmp.salary +
            data_tmp.thuong +
            data_tmp.phu_cap +
            data_tmp.luong_nghi_nua_ngay +
            data_tmp.luong_nghi_ca_ngay +
            data_tmp.kpi * 20000;
        console.log("data_tmp", data_tmp);
        await setData(data_tmp);
        formData.resetFields();
        return;
    }

    async function setStateDataChamCong(cong) {
        await setDataChamCong(cong);
        let isDisable = true;
        if (cong.type === 1) {
            isDisable = false;
        }
        setIsDisableInputChamCong(isDisable);
        formChamCong.resetFields();
        return;
    }

    const onSelectCalendarChamCong = (date) => {
        setCurrentChamCong(date.format("YYYY-MM-DD"));
        const md = dayjs(date).format("MMDD");
        setStateDataChamCong(chamCong[md]);
        setOpenModalChamCong(true);
    };

    function saveChamCong(day, values) {
        chamCong[day] = values;
        setStateData(chamCong);
        setStateDataChamCong(chamCong);
        return true;
    }

    const onFinishChamCong = (values) => {
        const day = dayjs(currentChamCong).format("MMDD");
        setOpenModalChamCong(false);
        return saveChamCong(day, setFormChamCong(values));
    };

    function setFormChamCong(values) {
        const day = dayjs(currentChamCong).format("MMDD");
        let salary1day = +data.salary1day;

        const type  = values.type;

        switch (type) {
            case 1:
                values.luong_nghi_ca_ngay = 0;
                const checkin = +(values.checkin_h + values.checkin_m);
                const checkout = +(values.checkout_h + values.checkout_m);
                if (checkin >= 850) {
                    values.kpi = -1;
                    values.note = "Đi muộn";
                }
                if (checkin >= 1030) {
                    values.kpi = 1;
                    values.luong_nghi_nua_ngay = -salary1day / 2;
                }

                if (checkout <= 1710) {
                    values.kpi = -1;
                    values.note = "Về sớm";
                }

                if (checkout <= 1530) {
                    values.kpi = 1;
                    values.luong_nghi_nua_ngay += -salary1day / 2;
                }
                values.note = "";
                break;
            case 2:
                values.luong_nghi_ca_ngay = -salary1day;
                values.note = "Nghỉ có phép";
                break;
            case 3:
                values.luong_nghi_ca_ngay = -salary1day;
                values.note = "Nghỉ ko phép";
                break;
            case 4:
                values.kpi = 0;
                values.luong_nghi_ca_ngay = 0;
                values.note = "Nghỉ lễ";
                break;
            case 5:
                values.note = "Nghỉ cuối tuần";
                values.kpi = 0;
                values.luong_nghi_ca_ngay = 0;
                break;
            default:
                break;
        }
        return values;
    }

    const tablePermissionAll = (e) => {
        console.log("value", e.target.value);
    };

    function onChangePermission(e, type) {
        const id = e.target.value;
        let permissionList_tmp = permissionList;
        console.log("permissionList", permissionList);
        if (e.target.checked) {
            permissionList_tmp[type].push(id);
            setPermissionList(permissionList_tmp);
            return;
        }
        let type_tmp = permissionList_tmp[type].map((key) => {
            if (!(key === id || !key)) {
                return key;
            }
        });
        permissionList_tmp[type] = type_tmp;
        setPermissionList(permissionList_tmp);

        console.log("permissionList_tmp", permissionList_tmp);
    }

    function permissionStatus(type, id) {
        let key = Object.keys(permissionList[type]).find(
            (key) => permissionList[type][key] === id
        );
        if (key) {
            return 1;
        }
        return 0;
    }

    function subPer(sub) {
        return sub.map((tbl) => {
            return <tr key={tbl.id} data-row-key={tbl.id} className="ant-table-row ant-table-row-level-0">
                        <td className="ant-table-cell"><Checkbox onChange={(e)=>{onChangePermission(e, 'table_all')}}>{tbl.display_name}</Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_add')}} defaultChecked={permissionStatus('table_add', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_edit')}} defaultChecked={permissionStatus('table_edit', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_delete')}} defaultChecked={permissionStatus('table_delete', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_view')}} defaultChecked={permissionStatus('table_view', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_create_by')}} defaultChecked={permissionStatus('table_create_by', tbl.id)}>{tbl.id}</Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_share')}} defaultChecked={permissionStatus('table_share', tbl.id)}>{permissionStatus('table_share', tbl.id)}</Checkbox></td>
                </tr>
        })
    }
    
    function permissionData() {
        return props.tablesPermission.map((tbl) => {
            if(tbl.sub.length === 0) {
                console.log('length1xx', tbl.sub.length);
                return <tbody key={tbl.parent.name} className="ant-table-tbody">
                    <tr key={tbl.parent.name} data-row-key={tbl.id} className="ant-table-row ant-table-row-level-0">
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_all')}} >{tbl.parent.display_name}</Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_add')}} defaultChecked={permissionStatus('table_add', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_edit')}} defaultChecked={permissionStatus('table_edit', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_delete')}} defaultChecked={permissionStatus('table_delete', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_view')}} defaultChecked={permissionStatus('table_view', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_create_by')}} defaultChecked={permissionStatus('table_create_by', tbl.parent.id)}>{tbl.parent.id}</Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_share')}} defaultChecked={permissionStatus('table_share', tbl.parent.id)}>{permissionStatus('table_share', permissionList.table_share[tbl.parent.id])}</Checkbox></td>
                    </tr>
                    </tbody>
            }

            return <tbody key={tbl.parent.name} className="ant-table-tbody">
                <tr data-row-key={tbl.parent.id} className="ant-table-row ant-table-row-level-0">
                    <td className="ant-table-cell td-parent" colSpan={7}>{tbl.parent.display_name}</td>
                </tr>
                {subPer(tbl.sub)}
            </tbody>
        });
    }

    const changeCheckAllPermission = (e) => {
        setIsCheckAllPermission(e.target.checked);
    }

    function permission() { //  ant-table-small
        return <div className="ant-table ant-table-bordered main-table-permission">
                    <div className="ant-table-container">
                        <div className="ant-table-content">
                            <br/>
                            <Space>
                                <b className='per-title'>Phân quyền quản lý:</b>
                                <Checkbox checked={isCheckAllPermission} onChange={changeCheckAllPermission}>Full quyền</Checkbox>
                            </Space>
                            <table>
                                <thead className="ant-table-thead thead-permission">
                                    <tr>
                                        <th className="ant-table-cell" scope="col">Chức năng</th>
                                        <th className="ant-table-cell" scope="col">Thêm</th>
                                        <th className="ant-table-cell" scope="col">Sửa</th>
                                        <th className="ant-table-cell" scope="col">Xem</th>
                                        <th className="ant-table-cell" scope="col">Xóa</th>
                                        <th className="ant-table-cell" scope="col">Tạo bởi</th>
                                        <th className="ant-table-cell" scope="col">Share</th>
                                    </tr>
                                </thead>
                                    {permissionData()}
                            </table>
                        </div>
                    </div>
            </div>;
    }

    const listItemsLg = props.columns.map((col) => {
        if (col.type_edit === "tiny") {
            // todo đổi sang SunEditor
        }

        if (col.type_edit === "calendar_cham_cong") {
            return (
                <Calendar
                    mode="month"
                    locale="vi_VN"
                    value={dayjs(
                        data.year +
                            "-" +
                            numberFormatBycount(data.month, 2) +
                            "01"
                    )}
                    key={col.name}
                    dateCellRender={cellRender}
                    onSelect={onSelectCalendarChamCong}
                />
            );
        }

        if (col.type_edit === "permission_list") {
            return permission();
        }
    });

    const handleChamCongCancel = () => {
        setOpenModalChamCong(false);
    };

    function initialValuesForm() {
        if (props.dataId === 0) {
            return props.request;
        }
        let data_tmp = props.data;
        props.columns.map((col) => {
            if (col.type_edit === "date" && data_tmp[col.name]) {
                data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_FORMAT);
            }
            if (col.type_edit === "selects" && data_tmp[col.name]) {
                let selects;
                try {
                    selects = JSON.parse(data_tmp[col.name]).map((select) => {
                        return +select;
                    });
                } catch (error) {
                    selects = [];
                }
                data_tmp[col.name] = selects;
            }
        });
        return data_tmp;
    }

    const chamCongType = (e) => {
        console.log('e', e.target.value);
        let values = formChamCong.getFieldValue();
        values.type = e.target.value;
        setFormChamCong(values);
        if (e.target.value === 1) {
            setIsDisableInputChamCong(false);
            return;
        }
        setIsDisableInputChamCong(true);
        return;
    };

    const initialValuesChamCong = () => {
        return dataChamCong;
    };

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={props.tables}
            current={props.table}
            content={
                <div>
                    {/* form data */}
                    <Form
                        name="basic"
                        layout="vertical"
                        form={formData}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={initialValuesForm()}
                    >
                        <Card
                            type="inner"
                            title={props.table.display_name}
                            extra={
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        onClick={() => {
                                            setSubmitRedirect("detail");
                                        }}
                                        loading={loadingBtn}
                                    >
                                        <CopyOutlined />
                                        Lưu và xem chi tiết
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        onClick={() => {
                                            setSubmitRedirect("list");
                                        }}
                                        loading={loadingBtn}
                                    >
                                        <FormOutlined />
                                        Lưu và thoát
                                    </Button>
                                    <Link href={route('data.index', [props.table.id])}>
                                        <Button loading={loadingBtn} type="default" htmlType="button">
                                            thoát
                                        </Button>
                                    </Link>
                                </Space>
                            }
                        >
                            <Row>{listItems}</Row>
                            <Row>{imageItems}</Row>
                            <Row>{listItemsLg}</Row>

                            <div>
                                <br/>
                                <Space>
                                    <Button type="primary" htmlType="submit" onClick={()=>{setSubmitRedirect('detail')}} loading={loadingBtn}>
                                        <CopyOutlined/>
                                        Lưu và xem chi tiết
                                    </Button>
                                    <Button type="primary" htmlType="submit" onClick={()=>{setSubmitRedirect('list')}} loading={loadingBtn}>
                                        <FormOutlined />
                                        Lưu và thoát
                                    </Button>
                                </Space>
                            </div>
                        </Card>
                    </Form>

                    {/* Modal Calendar Chấm công */}
                    <Modal
                        open={openModalChamCong}
                        title={currentChamCong}
                        footer=""
                        closable={false}
                    >
                        <Form
                            name="cham_cong"
                            layout="vertical"
                            onFinish={onFinishChamCong}
                            form={formChamCong}
                            // onFinishFailed={onFinishFailedChamCong}
                            autoComplete="off"
                            initialValues={dataChamCong}
                        >
                            <Row>
                                <Col span={24}>
                                    <Form.Item name="type">
                                        <Radio.Group
                                            buttonStyle="solid"
                                            onChange={chamCongType}
                                        >
                                            <Radio.Button value={1}>
                                                Đi làm
                                            </Radio.Button>
                                            <Radio.Button value={4}>
                                                Nghỉ lễ
                                            </Radio.Button>
                                            <Radio.Button value={2}>
                                                Nghỉ có phép
                                            </Radio.Button>
                                            <br />
                                            <Radio.Button value={3}>
                                                Nghỉ không phép
                                            </Radio.Button>
                                            <Radio.Button value={5}>
                                                Nghỉ cuối tuần
                                            </Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    <br />
                                    <Descriptions
                                        bordered
                                        label="Checkin"
                                        className="description-modal"
                                    >
                                        <Descriptions.Item label="Checkin">
                                            <Space>
                                                <Form.Item
                                                    name="checkin_h"
                                                    rules={[
                                                        {
                                                            required:
                                                                !isDisableInputChamCong,
                                                            message: "",
                                                        },
                                                    ]}
                                                    wrapperCol={{
                                                        offset: 8,
                                                        span: 16,
                                                    }}
                                                >
                                                    <Select
                                                        disabled={
                                                            isDisableInputChamCong
                                                        }
                                                        showSearch
                                                        style={{ width: 80 }}
                                                        placeholder="Giờ"
                                                        optionFilterProp="children"
                                                        filterOption={(
                                                            input,
                                                            option
                                                        ) =>
                                                            (
                                                                option?.label ??
                                                                ""
                                                            ).includes(input)
                                                        }
                                                        options={getH()}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="checkin_m"
                                                    rules={[
                                                        {
                                                            required:
                                                                !isDisableInputChamCong,
                                                            message: "",
                                                        },
                                                    ]}
                                                    wrapperCol={{
                                                        offset: 8,
                                                        span: 16,
                                                    }}
                                                    required
                                                >
                                                    <Select
                                                        disabled={
                                                            isDisableInputChamCong
                                                        }
                                                        showSearch
                                                        style={{ width: 80 }}
                                                        placeholder="phút"
                                                        optionFilterProp="children"
                                                        filterOption={(
                                                            input,
                                                            option
                                                        ) =>
                                                            (
                                                                option?.label ??
                                                                ""
                                                            ).includes(input)
                                                        }
                                                        options={getM()}
                                                    />
                                                </Form.Item>
                                            </Space>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={24}>
                                    <Descriptions
                                        bordered
                                        label="checkin"
                                        className="description-modal"
                                    >
                                        <Descriptions.Item label="Checkout">
                                            <Space>
                                                <Form.Item
                                                    name="checkout_h"
                                                    wrapperCol={{
                                                        offset: 8,
                                                        span: 16,
                                                    }}
                                                >
                                                    <Select
                                                        disabled={
                                                            isDisableInputChamCong
                                                        }
                                                        showSearch
                                                        style={{ width: 80 }}
                                                        placeholder="Giờ"
                                                        optionFilterProp="children"
                                                        filterOption={(
                                                            input,
                                                            option
                                                        ) =>
                                                            (
                                                                option?.label ??
                                                                ""
                                                            ).includes(input)
                                                        }
                                                        options={getH()}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="checkout_m"
                                                    wrapperCol={{
                                                        offset: 8,
                                                        span: 16,
                                                    }}
                                                >
                                                    <Select
                                                        disabled={
                                                            isDisableInputChamCong
                                                        }
                                                        showSearch
                                                        style={{ width: 80 }}
                                                        placeholder="phút"
                                                        optionFilterProp="children"
                                                        filterOption={(
                                                            input,
                                                            option
                                                        ) =>
                                                            (
                                                                option?.label ??
                                                                ""
                                                            ).includes(input)
                                                        }
                                                        options={getM()}
                                                    />
                                                </Form.Item>
                                            </Space>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={24} style={{ display: "none" }}>
                                    <Descriptions
                                        bordered
                                        className="description-modal"
                                    >
                                        <Descriptions.Item label="KPI">
                                            <Form.Item name="kpi">
                                                <InputNumber placeholder="Điểm KPI" />
                                            </Form.Item>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={24} style={{ display: "none" }}>
                                    <Descriptions
                                        bordered
                                        className="description-modal"
                                    >
                                        <Descriptions.Item label="Nghỉ nửa ngày">
                                            <Form.Item name="luong_nghi_nua_ngay">
                                                <InputNumber placeholder="Lương" />
                                            </Form.Item>
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label="Nghỉ cả ngày"
                                            hidden={true}
                                        >
                                            <Form.Item name="luong_nghi_ca_ngay">
                                                <InputNumber placeholder="Lương" />
                                            </Form.Item>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col span={24} style={{ display: "none" }}>
                                    <Descriptions
                                        bordered
                                        label="Auto note"
                                        className="description-modal"
                                    >
                                        <Descriptions.Item label="Ghi chú">
                                            <Form.Item name="note">
                                                <TextArea></TextArea>
                                            </Form.Item>
                                        </Descriptions.Item>
                                    </Descriptions>
                                    <br />
                                </Col>
                                <Col span={24}>
                                    <Descriptions
                                        bordered
                                        label="Ghi chú"
                                        className="description-modal"
                                    >
                                        <Descriptions.Item label="Ghi chú">
                                            <Form.Item name="note_curren">
                                                <TextArea></TextArea>
                                            </Form.Item>
                                        </Descriptions.Item>
                                    </Descriptions>
                                    <br />
                                </Col>

                                <Col span={24} className="text-center">
                                    <Space>
                                        <Button
                                            onClick={handleChamCongCancel}
                                            loading={loadingBtn}
                                        >
                                            {" "}
                                            Hủy{" "}
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loadingBtn}
                                        >
                                            {" "}
                                            Cập nhật
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                </div>
            }
        />
    );
}
