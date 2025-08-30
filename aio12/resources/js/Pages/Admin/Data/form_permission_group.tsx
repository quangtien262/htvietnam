
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Image,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, Radio, Popconfirm,
    Divider, Table, Spin
} from 'antd';

import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
    FormOutlined, CopyOutlined,
    UploadOutlined,
    DownloadOutlined, RollbackOutlined

} from '@ant-design/icons';
import { CSS } from '@dnd-kit/utilities';
import { router, Link } from '@inertiajs/react';
import { itemMenu } from "../../../Function/config_route";
import ImgCrop from 'antd-img-crop';

import { checkRule, showData, showDataSelectTable } from '../../../Function/data';

import { parseJson, numberFormat02 } from '../../../Function/common';
import { chamCongCellRender, getH, getM } from '../../../Function/calendar';

// SunEditor
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from '../../../Function/sun_config';

// css
import '../../../../css/admin.css';
import '../../../../css/form.css';

// dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Label } from 'recharts';


dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { TextArea } = Input;

export default function Dashboard(props) {
    console.log('fileList', props);
    const [data, setData] = useState(props.data);
    const [submitRedirect, setSubmitRedirect] = useState("detail"); // detail, list
    const [loading, setLoading] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [isStopSubmit, setIsStopSubmit] = useState(false);
    const [fileList, setFileList] = useState(props.imagesData.length == 0 ? [] : props.imagesData.map((item) => {
        return {
            name: item.name,
            status: item.status,
            url: item.url
        }
    }
    ));

    const [fileDocument, setFileDocument] = useState([]);

    //permission
    const [permissionList, setPermissionList] = useState(props.userPermission);
    const [isCheckAllPermission, setIsCheckAllPermission] = useState(false);
    //modal cham cong
    const [openModalChamCong, setOpenModalChamCong] = useState(false);
    const [isDisableInputChamCong, setIsDisableInputChamCong] = useState(false);
    const [formData] = Form.useForm();
    const [formChamCong] = Form.useForm();
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
        note_curren: "",
        type: 1,
        kpi: 0,
        luong_nghi_nua_ngay: 0,
        luong_nghi_ca_ngay: 0,
    });

    // select table
    const [dataSourceSelectTbl, setDataSourceSelectTbl] = useState(props.selectTbl);

    const DATE_FORMAT = "YYYY-MM-DD";
    const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
    const TIME_FORMAT = "HH:mm:ss";

    /**
     * @type {React.MutableRefObject<SunEditor>} get type definitions for editor
     */
    const editor = useRef([]);

    if (!sessionStorage.getItem('time') || (sessionStorage.getItem('time') && sessionStorage.getItem('time') !== props.time.toString())) {
        sessionStorage.clear();
        sessionStorage.setItem('time', props.time.toString());
    }

    const onFinish = (values) => {
        // console.log(values);
        // return;
        setLoading(true);
        setIsStopSubmit(false);
        values = formData.getFieldValue();
        for (const [key, val] of Object.entries(formData.getFieldValue())) {
            if (!values[key]) {
                values[key] = val;
            }
        }

        // return
        if (isStopSubmit) {
            message.error("Vui lòng chờ tải xong hình ảnh");
            return false;
        }

        values = formatValueForm(props.columns, values);

        if (props.table.is_multiple_language === 1) {
            let nameLang;
            for (const [key, col] of Object.entries(props.columnsLanguage)) {
                if (col.type_edit === "tiny") {
                    for (const [keyLang, lang] of Object.entries(props.language)) {
                        nameLang = 'lang' + '_' + lang.id + '_' + col.name;
                        if (editor.current[nameLang]) {
                            values[nameLang] = editor.current[nameLang].getContents();
                        }
                    }
                }
            }
        }

        // values.tiny_images = tinyImageName;

        values.submit_edirect = submitRedirect;
        if (sessionStorage.getItem("storage")) {
            let storage = parseJson(sessionStorage.getItem("storage"));
            for (const [key, val] of Object.entries(storage)) {
                values[key] = val;
                values.is_change_selects_table = true;
            }
        }
        if (props.dataId > 0) {
            // thử đổi sang ajax
            router.post(
                route("data.update", [props.table.id, data.id]),
                values
            );
        } else {
            router.post(route("data.store", [props.table.id]), values);
        }
    };

    // interface Column {
    //     name: string;
    //     edit?: number;
    //     type_edit?: string;
    // }
    function formatValueForm(columns: any, values: { [x: string]: string; }) {
        for (const [key, col] of Object.entries(columns)) {
            // Add type guard to ensure col is an object
            if (typeof col !== 'object' || col === null) {
                continue;
            }
            if ((col as any).edit !== 1) {
                values[(col as any).name] = '';
                continue;
            }
            if ((col as any).type_edit === "tiny" && editor.current[(col as any).name]) {
                values[(col as any).name] = editor.current[(col as any).name].getContents();
            }
            if ((col as any).type_edit === "permission_list") {
                values[(col as any).name] = isCheckAllPermission
                    ? props.permissionList_all
                    : permissionList;
            }
            if ((col as any).type_edit === "date") {
                values[(col as any).name] = !values[(col as any).name] ? '' : values[(col as any).name].format(DATE_FORMAT);
            }
            if ((col as any).type_edit === "datetime") {
                values[(col as any).name] = !values[(col as any).name] ? '' : values[(col as any).name].format(DATE_TIME_FORMAT);
            }
            if ((col as any).type_edit === "time") {
                values[(col as any).name] = !values[(col as any).name] ? '' : values[(col as any).name].format(TIME_FORMAT);
            }
            if ((col as any).type_edit === "selects_table") {
                values[(col as any).name] = dataSourceSelectTbl[(col as any).name].datas.dataSource;
            }
            if ((col as any).type_edit === "color") {
                values[(col as any).name] = values[(col as any).name].toHexString();
            }

            // images
            if (['images', 'image', 'image_crop', 'images_crop'].includes((col as any).type_edit)) {
                if (fileList && fileList.length > 0) {
                    values[(col as any).name] = formatFiles(fileList);
                } else {
                    values[(col as any).name] = "";
                }
            }

            // files
            if (['file', 'files'].includes((col as any).type_edit)) {
                
                if (fileDocument && fileDocument.length > 0) {
                    values[(col as any).name] = formatFiles(fileDocument);
                } else {
                    values[(col as any).name] = "";
                }
            }
        }
        return values;
    }

    const onFinishFailed = (errorInfo) => { };

    function formatFiles(files: any) {
        interface FileResponseData {
            fileName: string;
            filePath: string;
        }

        interface UploadFile {
            name: string;
            status?: string;
            url?: string;
            response?: {
                data: FileResponseData;
            };
        }

        interface FormattedFile {
            name: string;
            status: string;
            url: string;
        }

        return files.map((file: UploadFile): FormattedFile | false | undefined => {
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
                    url: file.url!,
                };
            }
            if (file.status === "done") {
                return {
                    name: file.response!.data.fileName,
                    status: file.status,
                    url: file.response!.data.filePath,
                };
            }
        });
    }

    // even image
    const onChangeImage = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const DraggableUploadListItem = ({ originNode, file }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: file.uid,
        });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            cursor: 'move',
        };
        return (
            <div
                ref={setNodeRef}
                style={style}
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

    // Chỉ cho phép file ảnh
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được upload file hình ảnh!');
        }
        return isImage;
    };



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
                            <Label>{col.display_name}</Label>
                            <Form.Item
                                name={col.name}
                                rules={checkRule(col)}
                                label={col.display_name}
                            >

                                <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                    <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                        <ImgCrop
                                            aspect={col.ratio_crop}
                                            aspectSlider={true}
                                            rotationSlider={true}
                                            showGrid={true}
                                            showReset={true}
                                        >
                                            <Upload multiple
                                                action={route("data.upload_image")}
                                                listType="picture-card" // picture-card
                                                fileList={fileList}
                                                accept="image/*"
                                                maxCount={+col.conditions}
                                                beforeUpload={beforeUpload}
                                                onChange={onChange}
                                                itemRender={(originNode, file) => (
                                                    <DraggableUploadListItem originNode={originNode} file={file} />
                                                )}
                                                headers={{
                                                    'X-CSRF-TOKEN': props.token,
                                                }}
                                            >

                                                <Button icon={<UploadOutlined />}>Upload({+col.conditions})</Button>
                                            </Upload>
                                        </ImgCrop>
                                    </SortableContext>
                                </DndContext>

                            </Form.Item>
                        </Col>
                    </Row>
                );
                break;
            case "image":
            case "images":
                result = (
                    <Row>
                        <Divider orientation='left'>{col.display_name}</Divider>
                        <Col key={col.name}>
                            <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                    <Upload multiple
                                        action={route("data.upload_image")}
                                        listType="picture-card" // picture-card
                                        fileList={fileList}
                                        maxCount={props.countImage}
                                        onChange={onChange}
                                        accept="image/*"
                                        beforeUpload={beforeUpload}
                                        itemRender={(originNode, file) => (
                                            <DraggableUploadListItem originNode={originNode} file={file} />
                                        )}
                                        headers={{
                                            'X-CSRF-TOKEN': props.token,
                                        }}
                                    >
                                        <Button icon={<UploadOutlined />}>Upload (Tối đa: {props.countImage})</Button>
                                    </Upload>
                                </SortableContext>
                            </DndContext>
                        </Col>
                    </Row>
                );
                break;
        }

        return result;
    }

    function checkConfig(col) {
        let result = true;
        if (props.request.type && props.table.config_show_data && !props.table.config_show_data.config[props.request.type].includes(col.name)) {
            result = false;
        }
        return result;
    }

    const listItems = props.columns.map((col) => {
        if (col.block_type == null || col.block_type == '') {
            if (checkConfig(col) === true) {
                return showData(col, props);
            }
        }
    });

    const uploadRef = useRef();
    const handleClick = () => {
        // Truy cập input file ẩn và click
        if (uploadRef.current) {
            const input = uploadRef.current.querySelector('input[type="file"]');
            if (input) input.click();
        }
    };

    const imageItems = props.columns.map((col) => {

        if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
            if (checkConfig(col)) {
                return showDataImages(col);
            }
        }

    });

    const cellRender = (current) => {
        if (chamCong.length === 0) {
            return "";
        }
        const cong = chamCong[current.format("YYYYMMDD")];
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
        const md = dayjs(date).format("YYYYMMDD");
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
        const day = dayjs(currentChamCong).format("YYYYMMDD");
        setOpenModalChamCong(false);
        return saveChamCong(day, setFormChamCong(values));
    };

    function setFormChamCong(values) {
        const day = dayjs(currentChamCong).format("YYYYMMDD");
        let salary1day = +data.salary1day;

        const type = values.type;

        switch (type) {
            case 1: // đi làm
                values.luong_nghi_ca_ngay = 0;
                if (values.checkin_m === 0) {
                    values.checkin_m = '00';
                }
                if (values.checkout_m === 0) {
                    values.checkout_m = '00';
                }
                const checkin = +(values.checkin_h + values.checkin_m);
                const checkout = +(values.checkout_h + values.checkout_m);
                values.kpi = 0;
                values.note = "";
                values.luong_nghi_nua_ngay = 0;
                if (checkin >= 850) {
                    values.kpi = -1;
                    values.note = "Đi muộn";
                }
                if (checkin >= 1030) {
                    values.kpi = 0;
                    values.luong_nghi_nua_ngay = -salary1day / 2;
                }

                if (checkout <= 1710) {
                    values.kpi = -1;
                    values.note = "Về sớm";
                }

                if (checkout <= 1530) {
                    values.kpi = 0;
                    values.luong_nghi_nua_ngay += -salary1day / 2;
                }
                values.note = "";
                break;
            case 2: // Nghỉ có phép
                values.luong_nghi_ca_ngay = -salary1day;
                values.note = "Nghỉ có phép";
                break;
            case 3: // Nghỉ ko phép
                values.luong_nghi_ca_ngay = -salary1day;
                values.note = "Nghỉ ko phép";
                break;
            case 4: // Nghỉ lễ
                values.kpi = 0;
                values.luong_nghi_ca_ngay = 0;
                values.note = "Nghỉ lễ";
                break;
            case 5: // Nghỉ cuối tuần
                values.note = "Nghỉ cuối tuần";
                values.kpi = 0;
                values.luong_nghi_ca_ngay = 0;
                break;
            default:
                break;
        }
        return values;
    }

    function onChangePermission(e, type) {
        const id = e.target.value;
        let permissionList_tmp = permissionList;
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
    }

    function permissionStatus(type, id) {
        let key = null;
        if (permissionList[type]) {
            key = Object.keys(permissionList[type]).find(
                (key) => permissionList[type][key] === id
            );
        }
        if (key) {
            return 1;
        }
        return 0;
    }

    function subPer(sub) {
        return sub.map((tbl) => {
            return <tr key={tbl.id} data-row-key={tbl.id} className="ant-table-row ant-table-row-level-0">
                <td className="ant-table-cell"><Checkbox onChange={(e) => { onChangePermission(e, 'table_all') }}>{tbl.display_name}</Checkbox></td>
                <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e) => { onChangePermission(e, 'table_add') }} defaultChecked={permissionStatus('table_add', tbl.id)}></Checkbox></td>
                <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e) => { onChangePermission(e, 'table_edit') }} defaultChecked={permissionStatus('table_edit', tbl.id)}></Checkbox></td>
                <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e) => { onChangePermission(e, 'table_delete') }} defaultChecked={permissionStatus('table_delete', tbl.id)}></Checkbox></td>
                <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e) => { onChangePermission(e, 'table_view') }} defaultChecked={permissionStatus('table_view', tbl.id)}></Checkbox></td>
                <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e) => { onChangePermission(e, 'table_create_by') }} defaultChecked={permissionStatus('table_create_by', tbl.id)}></Checkbox></td>
                {/* <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_share')}} defaultChecked={permissionStatus('table_share', tbl.id)}></Checkbox></td> */}
            </tr>
        })
    }

    function permissionData() {
        return props.tablesPermission.map((tbl) => {
            if (tbl.sub.length === 0) {
                return <tbody key={tbl.parent.name} className="ant-table-tbody">
                    <tr key={tbl.parent.name} data-row-key={tbl.id} className="ant-table-row ant-table-row-level-0">
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e) => { onChangePermission(e, 'table_all') }} >{tbl.parent.display_name}</Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e) => { onChangePermission(e, 'table_add') }} defaultChecked={permissionStatus('table_add', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e) => { onChangePermission(e, 'table_edit') }} defaultChecked={permissionStatus('table_edit', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e) => { onChangePermission(e, 'table_view') }} defaultChecked={permissionStatus('table_view', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e) => { onChangePermission(e, 'table_delete') }} defaultChecked={permissionStatus('table_delete', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e) => { onChangePermission(e, 'table_create_by') }} defaultChecked={permissionStatus('table_create_by', tbl.parent.id)}></Checkbox></td>
                        {/* <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_share')}} defaultChecked={permissionStatus('table_share', tbl.parent.id)}></Checkbox></td> */}
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
                    <br />
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
                                <th className="ant-table-cell" scope="col">User</th>
                                {/* <th className="ant-table-cell" scope="col">Share</th> */}
                            </tr>
                        </thead>
                        {permissionData()}
                    </table>
                </div>
            </div>
        </div>;
    }

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

    function showItemsLg(col) {
        if (!checkConfig(col)) {
            return false;
        }

        if (col.type_edit === "tiny") {
            let config = optionSunEditor;
            config.imageUploadHeader = {
                'X-CSRF-TOKEN': props.token
            };
            return (
                <Row key={col.id} layout="vertical" className="main-tiny01">
                    <Col key={col.id} label={col.display_name} className="main-tiny02">
                        <Divider orientation="left">{col.display_name}</Divider>
                        <SunEditor key={col.id}
                            getSunEditorInstance={(sunEditor) => { editor.current[col.name] = sunEditor }}
                            setContents={data[col.name]}
                            onImageUpload={handleImageUpload}
                            onImageUploadError={handleImageUploadError}
                            onResizeEditor={handleOnResizeEditor}
                            imageUploadHandler={(xmlHttpRequest, info, core) => imageUploadHandler(xmlHttpRequest, info, core, col.name)}
                            setOptions={optionSunEditor}
                        />
                    </Col>
                </Row>
            );
        }

        if (col.type_edit === "calendar_cham_cong") {
            return (
                <div>
                    {/* Tạm pending, do fai truyền thêm data chấm công */}
                    {/* <Button onClick={()=>{chamCongCurentUser(data.id)}} loading={loadingBtn}>Chấm công lại từ đầu</Button> */}
                    <Calendar
                        mode="month"
                        locale="vi_VN"
                        value={dayjs(data.year + "-" + numberFormat02(data.month, 2) + "-01")}
                        key={col.name}
                        dateCellRender={cellRender}
                        onSelect={onSelectCalendarChamCong}
                    />
                </div>
            );
        }

        if (col.edit === 1 && col.type_edit === "selects_table") {
            return showDataSelectTable(props, col);
        }

        if (col.type_edit === "permission_list") {
            return permission();
        }
    }

    const listItemsLg = props.columns.map((col) => {
        return showItemsLg(col);
    });

    const handleChamCongCancel = () => {
        setOpenModalChamCong(false);
    };

    // Keyword chứa từ khóa chính, từ khóa phụ và từ khóa liên quan tới thương hiệu, dịch vụ
    // Không lặp lại các keyword tránh tình trạng Google phạt lỗi Duplicate Contens
    // Chèn 2 – 5 keywords ở trong thẻ Meta Keyword
    // Hạn chế sử dụng từ khóa dài.
    const onFormLayoutChange = (input) => {
        const key = Object.keys(input)[0];

        // checkall selects
        if (key.search('checkall_') >= 0) {
            const keySelectAll = key.slice(9);
            if (input[key].length > 0) {
                // check all
                const value = props.selectData[keySelectAll].map((val) => {
                    return val.value;
                });
                formData.setFieldValue(keySelectAll, value);
                return;
            }
            // else uncheck
            formData.setFieldValue(keySelectAll, []);
            return;
        }
    };

    function initialValuesForm() {
        if (props.dataId === 0) {
            // return props.request;
            return props.data;
        }
        let data_tmp = props.data;
        props.columns.map((col) => {
            if (col.type_edit === "date" && data_tmp[col.name]) {
                data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_FORMAT);
            }
            if (col.type_edit === "datetime" && data_tmp[col.name]) {
                const zone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split('GMT')[1]
                data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_TIME_FORMAT).add(zone, 'hour');
                // data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_TIME_FORMAT);
            }
            if (col.type_edit === "time" && data_tmp[col.name]) {
                data_tmp[col.name] = dayjs(data_tmp[col.name], TIME_FORMAT);
            }
            if (col.type_edit === "selects" && data_tmp[col.name]) {
                let selects = null;
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
        console.log('data_tmp', data_tmp);

        return data_tmp;
    }

    const chamCongType = (e) => {
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

    function tabData() {
        return props.tabs.map((tab) => {
            return {
                key: tab.id,
                label: tab.display_name,
                children: contentTab(tab),
            }
        });
    }

    function contentTab(tab) {
        let have_block = false;

        const content_block = props.blocks.map((block) => {
            if (block.parent_id === tab.id) {
                if (!have_block) {
                    have_block = true;
                }
                return <div key={block.id}>
                    <Divider orientation="left">{block.display_name}</Divider>
                    {contentBlock(block)}
                </div>

            }
        });

        if (have_block) {
            return content_block;
        }

        return contentBlock(tab)

    }

    function checkShowData() {

        if (props.tabs.length > 0) {
            return <Tabs defaultActiveKey="1" items={tabData()} />
        }

        if (props.blocks.length > 0) {
            return props.blocks.map((block) => {
                if (checkConfig(block)) {
                    return <Row>
                        <Divider orientation="left">{block.display_name}</Divider>
                        {contentBlock(block)}
                    </Row>
                }
            });
        }

        return <Row>
            {listItems}
            {imageItems}
            {listItemsLg}
        </Row>
    }

    function checkShowDataLanguage() {
        if (props.table.is_multiple_language !== 1) {
            return '';
        }
        return (
            <div>
                <Divider orientation="left">
                    Form nhập nội dung theo ngôn ngữ
                </Divider>
                <Tabs defaultActiveKey="1" items={tabDataLanguage()} />
            </div>
        )
    }

    function tabDataLanguage() {
        return props.language.map((lang) => {
            return {
                key: lang.id,
                label: lang.name,
                children: contentTabLanguage(lang),
            }
        });
    }

    function contentTabLanguage(lang) {

        let content = [],
            contentImage = [],
            contentLong = [];
        for (const [key, col] of Object.entries(props.columnsLanguage)) {
            if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImages(col));
                continue;
            }
            // xu ly tini cho lang
            if (["tiny"].includes(col.type_edit)) {
                const nameTiny = 'lang_' + lang.id + '_' + col.name;
                let config = optionSunEditor;
                config.imageUploadHeader = {
                    'X-CSRF-TOKEN': props.token
                };
                contentLong.push(
                    (
                        <Row layout="vertical" className="main-tiny01">
                            <Col label={col.display_name} className="main-tiny02">
                                <Divider orientation="left">{col.display_name}</Divider>
                                <Form.Item rules={checkRule(col)} label={col.display_name} className="main-tiny03">
                                    <SunEditor key={col.id}
                                        getSunEditorInstance={(sunEditor) => { editor.current[nameTiny] = sunEditor }}
                                        setContents={data[nameTiny]}
                                        onImageUpload={handleImageUpload}
                                        onImageUploadError={handleImageUploadError}
                                        onResizeEditor={handleOnResizeEditor}
                                        imageUploadHandler={(xmlHttpRequest, info, core) => imageUploadHandler(xmlHttpRequest, info, core, nameTiny)}
                                        setOptions={optionSunEditor}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )
                );
                continue;
            }

            content.push(showData(col, props.dataLanguage, lang.id));
        }

        return <Row>
            {content}
            {contentImage}
            {contentLong}
        </Row>

    }

    function showDataFile(col) {
        if (!checkConfig(col)) {
            return false;
        }
        if (col.edit !== 1) {
            return false;
        }


        // Xử lý khi upload file thay đổi
        const onChangeFile = ({ fileList: newFileList }) => {
            setFileDocument(newFileList);
        };

        return (
            <Col span={24} key={col.id}>

                <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                    <SortableContext items={fileDocument.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                        <Upload multiple
                            action={route("data.upload_file")}
                            listType="picture-card" // picture-card
                            fileList={fileDocument}
                            maxCount={1}
                            onChange={onChangeFile}
                            itemRender={(originNode, file) => (
                                <DraggableUploadListItem originNode={originNode} file={file} />
                            )}
                            headers={{
                                'X-CSRF-TOKEN': props.token,
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Upload </Button>
                        </Upload>
                    </SortableContext>
                </DndContext>
            </Col>
        );
    }

    function contentBlock(block) {
        let content = [],
            contentImage = [],
            contentLong = [];
        for (const [key, col] of Object.entries(props.columns)) {
            if (col.parent_id !== block.id || !checkConfig(col)) {
                continue;
            }

            // check config_show_data

            if (["block_basic"].includes(col.block_type)) {
                content = props.columns.map((subCol) => {
                    if (subCol.parent_id === col.id) {
                        return showData(subCol, props);
                    }
                });
                continue;
            }

            if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImages(col));
                continue;
            }

            if (["tiny", "calendar_cham_cong", "permission_list", "selects_table"].includes(col.type_edit)) {
                contentLong.push(showItemsLg(col));
                continue;
            }

            if (["file"].includes(col.type_edit)) {
                content.push(showDataFile(col));
                continue;
            }

            content.push(showData(col, props));
        }


        return <Row>
            {content}
            {contentImage}
            {contentLong}
        </Row>
    }

    let name = '';
    if (props.request.type && props.table.config_show_data) {
        name = ' (' + props.table.config_show_data.data[props.request.type] + ')';
    }




    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={itemMenu(props.table.name)}
            current={props.table}
            content={
                <Spin spinning={loading} size="large">
                    {/* form data */}
                    <div className='main-content-data'>
                        <Form name="basic"
                            layout="vertical"
                            form={formData}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            initialValues={initialValuesForm()}
                            onValuesChange={onFormLayoutChange}
                        >

                            <Divider orientation="right">
                                {props.table.display_name}
                                <span className='space02'>|</span>
                                <Link className='divider-thoat' href={route('data.index', [props.table.id])}><RollbackOutlined />Thoát</Link>
                            </Divider>
                            {/* show form */}
                            {checkShowData()}

                            {/* language */}
                            {checkShowDataLanguage()}

                            <div>
                                <br />
                                <Space>
                                    <Button type="primary" htmlType="submit" onClick={() => { setSubmitRedirect('detail'); }} loading={loadingBtn}>
                                        <CopyOutlined />
                                        Lưu và xem chi tiết
                                    </Button>
                                    <Button type="primary" htmlType="submit" onClick={() => { setSubmitRedirect('list'); }} loading={loadingBtn}>
                                        <FormOutlined />
                                        Lưu và thoát
                                    </Button>
                                </Space>
                            </div>

                        </Form>
                    </div>
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
                </Spin>
            }
        />
    );
}
