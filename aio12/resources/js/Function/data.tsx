import React, { useState, useRef } from "react";
import {
    Select,
    Col,
    Row,
    Badge,
    Descriptions,
    Card,
    Button,
    Input,
    InputNumber,
    Form,
    Space,
    DatePicker,
    Upload,
    message,
    Tabs,
    Calendar,
    Modal,
    Dropdown,
    Radio,
    Popconfirm,
    notification,
    Divider,
    Spin,
    Typography,
    Table, Image, Tag, Tree, List
} from "antd";
import { useForm, router, Link } from "@inertiajs/react";
import cloneDeep from "lodash/cloneDeep";
import {
    PlusCircleOutlined,
    ArrowRightOutlined,
    ReadOutlined,
    EditOutlined,
    EyeOutlined,
    DownloadOutlined,
    DownOutlined,
    DeleteOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import {
    HTSelect,
    HTSelect02,
    HTSelects,
    HTSelectsNormal,
    HTTextarea,HTTextarea02,
    HTNumber,
    HTDate,
    HTDateTime,
    HTPassword,
    HTInput,
    HTTags,
    HTSelectModal,
    HTSelectsModal,
    HTTime, HTColor, HTCascaderTable
} from "./input";
import { inArray, parseJson, nl2br, numberFormat, onDrop, formatGdata_column, showsettingMenu } from "./common";
import { renderData } from "./index";
import { showSelect, showSelects, formatValueForm } from './selects_table';
import { DATE_FORMAT, DATE_TIME_FORMAT } from './constant';
import axios from "axios";
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// SunEditor
import SunEditor from 'suneditor-react';
import SunEditorCore from "suneditor/src/lib/core";
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from './sun_config';

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

function getMonth() {
    let result = [];
    let label, value;
    for (let i = 1; i <= 12; i++) {
        label = "Tháng" + i;
        value = i;
        if (i < 10) {
            label = "Tháng 0" + i;
            value = "0" + i;
        }
        result.push({ value: value.toString(), label: label });
    }
    return result;
}

export function btnAddNew(prop) {
    let result = "";
    if (inArray(prop.table.id, prop.userPermission.table_add) && prop.table.have_add_new === 1) {
        if (prop.table.config_show_data) {
            const datas = prop.table.config_show_data.data;
            let items = [];
            for (const [key, value] of Object.entries(datas)) {
                items.push({
                    key: key,
                    icon: <ArrowRightOutlined />,
                    label: (
                        <Link
                            href={route("data.create", [
                                prop.table.id,
                                { type: key },
                            ])}
                        >
                            {value}
                        </Link>
                    ),
                });
            }
            return (
                <Dropdown menu={{ items }} placement="top" arrow>
                    <Button type="primary">
                        <PlusCircleOutlined />
                        Thêm mới
                    </Button>
                </Dropdown>
            );
        }

        return (
            <Link href={route("data.create", prop.table.id)}>
                <Button type="primary">
                    <PlusCircleOutlined />
                    Thêm mới
                </Button>
            </Link>
        );
    }
}

export function btnIndex(prop) {
    // cham cong
    const [chamCongMonth, setChamCongMonth] = useState(dayjs().format("MM"));
    const [chamCongYear, setChamCongYear] = useState(dayjs().format("YYYY"));
    const [dataChamCong, setDataChamCong] = useState("");
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [isOpenChamCong, setIsOpenChamCong] = useState(false);
    const [formChamCong] = Form.useForm({
        chamCongMonth: dayjs().format("MM"),
        setChamCongYear: dayjs().format("YYYY"),
        data: "",
    });

    // import/export
    const [loadingBtnExport, setLoadingBtnExport] = useState(false);
    const [isOpenConfirmExportExcel, setIsOpenConfirmExportExcel] = useState(false);
    const [isOpenConfirmExportAllExcel, setIsOpenConfirmExportAllExcel] = useState(false);


    const chamCong = (e) => {
        setLoadingBtn(true);
        router.post(route("data.create_data_cham_cong"), {
            table_id: prop.tableId,
            month: chamCongMonth,
            year: chamCongYear,
        });
    };

    const cancelChamCong = () => { };

    const onFinish = (values) => {
        values.table_id = prop.tableId;
        router.post(route("data.create_data_cham_cong"), values);
    };

    function ntnGenerateChamCong(tableName) {
        let result = "";
        if (prop.table.name == "cham_cong") {
            result = (
                <div>
                    <Modal
                        title={"Tạo data chấm công"}
                        open={isOpenChamCong}
                        onOk={chamCong}
                        onCancel={cancelChamCong}
                        footer={[]}
                    >
                        <Form
                            name="basic"
                            layout="vertical"
                            // form={formChamCong}
                            onFinish={onFinish}
                            autoComplete="off"
                            initialValues={formChamCong}
                        >
                            <Row>
                                <Col span={8}>
                                    <Form.Item name="month" label={"Tháng"}>
                                        <Select
                                            showSearch
                                            // style={{ width: 120 }}
                                            placeholder="Tháng"
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.label ?? "").includes(
                                                    input
                                                )
                                            }
                                            options={getMonth()}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name="year" label={"Năm"}>
                                        <InputNumber placeholder="Năm" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        name="data"
                                        label={"Dữ liệu chấm công"}
                                    >
                                        <TextArea placeholder="Data chấm công" />
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    <Button type="primary" htmlType="submit">
                                        {/* <CopyOutlined/> */}
                                        Lưu và xem chi tiết
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                    <Button
                        type="primary"
                        loading={loadingBtn}
                        onClick={() => setIsOpenChamCong(true)}
                        className="_right"
                    >
                        <PlusCircleOutlined />
                        Tạo dữ liệu chấm công
                    </Button>
                </div>
            );
        }

        return result;
    }

    function downloadMauHD() {
        let key = 1;

        if (
            ["admin_users"].includes(prop.table.name) &&
            prop.table.is_dowload_hd === 1
        ) {
            const items = [
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "hd-chinh-thuc" },
                            ])}
                        >
                            Mẫu HĐồng chính thức
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "hd-thu-viec" },
                            ])}
                        >
                            Mẫu HĐồng thử việc
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "hd-thuc-tap" },
                            ])}
                        >
                            Mẫu HĐồng thực tập
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
            ];
            return (
                <Dropdown menu={{ items }}>
                    <Button className="btn-drop">
                        <DownOutlined /> Download mẫu HĐLĐ
                    </Button>
                </Dropdown>
            );
        }

        if (["hop_dong"].includes(prop.table.name)) {
            const items = [
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "website" },
                            ])}
                        >
                            TK Website theo yêu cầu
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "web-express" },
                            ])}
                        >
                            Web Express
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "web-express" },
                            ])}
                        >
                            Phần mềm business
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "domain" },
                            ])}
                        >
                            Tên miền
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "hosting" },
                            ])}
                        >
                            Email Business
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "email-google" },
                            ])}
                        >
                            Email Google
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "hosting" },
                            ])}
                        >
                            Hosting
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "server" },
                            ])}
                        >
                            Server - VPS
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
                {
                    label: (
                        <a
                            target="new"
                            href={route("download.file", [
                                { file_download: "email-server" },
                            ])}
                        >
                            Email server
                        </a>
                    ),
                    key: key++,
                    icon: <DownloadOutlined />,
                },
            ];
            return (
                <Dropdown menu={{ items }}>
                    <Button className="btn-drop">
                        <DownOutlined /> Download mẫu hợp đồng
                    </Button>
                </Dropdown>
            );
        }
        return "";
    }

    function btnFromRoute() {
        let result;
        if (
            prop.table.add_btn_from_route &&
            prop.table.add_btn_from_route != "" &&
            prop.table.add_btn_from_route !== null
        ) {
            const routes = parseJson(prop.table.add_btn_from_route);
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
        const [gData, setGData] = useState(prop.columnData);

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
                    title={<div>Cài đặt <hr />{showsettingMenu(prop.tableSetting)}<hr /></div>}
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

    function btnThongKe() {
        if (prop.table.thong_ke && prop.table.thong_ke !== '') {
            return <Link href={route('data.thong_ke', [prop.table.id])}>
                <Button type="primary">
                    <PlusCircleOutlined />
                    Thống kê
                </Button>
            </Link>
        }
    }

    return (
        <Space className="_right">

            {btnFromRoute()}

            {btnThongKe()}

            {btnAddNew(prop)}

            {/* generate Chấm công */}
            {ntnGenerateChamCong(prop.table.name)}

            {/* btn download */}
            {downloadMauHD()}

            {prop.table.setting_shotcut === 1 ? btnSetting() : ''}
        </Space>
    );
}

export function showData02(col, prop, langId = 0) {
    let data;
    if (langId === 0) {
        data = prop.data;
    } else {
        data = prop[langId];
    }

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
        case "file":
        case "files":
            break;
        case "textarea":
            result = HTTextarea02(col, langId);
            break;
        case "number":
            result = HTNumber(col, langId);
            break;
        case "select":
            result = HTSelect02(col, prop, langId);
            break;
        case "selects":
            result = HTSelects(col, prop, "multiple");
            break;
        case "tags":
            result = HTSelects(col, prop.selectData[col.name], "tags");
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
            result = HTCascaderTable(col, prop);
            break;
        default:
            result = HTInput(col, langId);
            break;
    }

    return result;
}

export function showData(col, prop, langId = 0) {
    let data;
    if (langId === 0) {
        data = prop.data;
    } else {
        data = prop[langId];
    }

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
        case "file":
            break;
        case "textarea":
            result = HTTextarea(col, langId);
            break;
        case "number":
            result = HTNumber(col, langId);
            break;
        case "select":
            result = HTSelect(col, prop, "single", langId);
            break;
        case "selects":
            result = HTSelects(col, prop, "multiple");
            break;
        case "tags":
            result = HTSelects(col, prop.selectData[col.name], "tags");
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
            result = HTCascaderTable(col, prop);
            break;
        default:
            result = HTInput(col, langId);
            break;
    }

    return result;
}

export function showDataPopup(col, prop, langId = 0) {
    let data;
    if (langId === 0) {
        data = prop.data;
    } else {
        data = prop[langId];
    }

    let result;
    const typeEdit = col.type_edit;
    if (col.edit !== 1) {
        return false;
    }

    switch (typeEdit) {
        case "calendar_cham_cong":
        case "images_crop":
        case "image_crop":
        case "image":
        case "images":
        case "permission_list":
        case "selects_table":
        case "tiny":
            break;
        case "textarea":
            result = HTTextarea(col, langId);
            break;
        case "number":
            result = HTNumber(col, langId);
            break;
        case "select":
            result = HTSelectModal(col, prop);
            break;
        case "selects_normal":
            // result = HTSelectsNormal(col, prop);
            break;
        case "selects":
            result = HTSelectsModal(col, prop.selectsData[col.name].selectbox, "multiple");
            break;
        case "tags":
            result = HTSelects(col, prop.selectData[col.name], "tags");
            break;
        case "date":
            result = HTDate(col, langId);
            break;
        case "datetime":
            result = HTDateTime(col, langId);
            break;
        case "encryption":
            result = HTPassword(col, langId);
            break;
        case "cascader_table":
            result = HTCascaderTable(col, prop);
            break;
        default:
            result = HTInput(col, langId);
            break;
    }

    return result;
}

export function checkRule(col) {
    let rule = [];
    if (col.require === 1) {
        const msg = '"' + col.display_name + '" Không được để trống';
        rule.push({
            required: true,
            message: msg,
        });
    }
    return rule;
}

export function showCol(col, logData, selectsData) {
    let result;
    const typeEdit = col.type_edit;

    if (["block_basic", "block_right", "tab"].includes(col.block_type)) {
        return <Descriptions.Item label={col.display_name}></Descriptions.Item>;
    }

    switch (typeEdit) {
        case "permission_list":
            break;
        case "date":
            result = dayjs(logData[col.name]).format("DD/MM/YYYY");
            break;
        case "datetime":
            //result =  dayjs(data[col.name]).format('DD/MM/YYYY HH:mm:ss');
            const zone = new Date()
                .toLocaleTimeString("en-us", { timeZoneName: "short" })
                .split("GMT")[1];
            result = dayjs
                .tz(logData[col.name])
                .add(zone, "hour")
                .format("YYYY-MM-DD HH:mm:ss");
            break;
        case "number":
            result = numberFormat(logData[col.name]);
            break;
        case "select":
            result = "";
            if (selectsData && selectsData[col.name]) {
                result = selectsData[col.name][logData[col.name]];
            }
            break;
        case "tags":
        case "selects":
            if (selectsData[col.name]) {
                let selects;
                try {
                    result = JSON.parse(logData[col.name]).map((select) => {
                        return (
                            <Tag key={selectsData[col.name][select]}>
                                {selectsData[col.name][select]}
                            </Tag>
                        );
                    });
                } catch (error) {
                }
            }
            break;
        case "text":
        case "textarea":
            result = (
                <div
                    dangerouslySetInnerHTML={{
                        __html: nl2br(logData[col.name]),
                    }}
                />
            );
            break;
        default:
            result = "";
            // result = logData[col.name]
            break;
    }

    return (
        <Descriptions.Item label={col.display_name}>{result}</Descriptions.Item>
    );
}

export function showLog(prop) {
    const [dataLog, setDataLog] = useState("");
    const [isLoadOK, setIsLoadOK] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [contentModal, setContentModal] = useState(<Spin />);
    const onOkModal = () => {
        setIsOpenModal(false);
    };
    const onCancelModal = () => {
        setIsOpenModal(false);
    };

    function contentChange(data) {
        return prop.columns.map((col) => {
            if (col.edit === 1) {
                return (
                    <tr>
                        <td>
                            <b>{col.display_name} </b>
                        </td>
                        <td scope="col" className="th-log ant-table-cell">
                            {showCol(col, data.data_old, prop.selectData)}
                        </td>
                        <td scope="col" className="th-log ant-table-cell">
                            {showCol(col, data.data_new, prop.selectData)}
                        </td>
                    </tr>
                );
            }
        });
    }

    function openModal(data) {
        setIsOpenModal(true);
        const content = (
            <div className="ant-table ant-table-bordered main-table-03">
                <div className="ant-table-container">
                    <div className="ant-table-content">
                        <table>
                            <thead className="ant-table-thead thead-permission">
                                <tr>
                                    <th className="ant-table-cell" scope="col">
                                        Tên
                                    </th>
                                    <th className="ant-table-cell" scope="col">
                                        Nội dung cũ
                                    </th>
                                    <th className="ant-table-cell" scope="col">
                                        Nội dung thay đổi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{contentChange(data)}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
        setContentModal(content);
    }

    function showData(datas) {
        return datas.map((data, idx) => {
            return (
                <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                        <a
                            onClick={() => {
                                openModal(data);
                            }}
                        >
                            {data.name}
                        </a>
                    </td>
                </tr>
            );
        });
    }

    if (!isLoadOK) {
        axios
            .post(route("data.show_log", [prop.table.id, prop.dataId]))
            .then((response) => {
                const result = (
                    <div className="ant-table ant-table-bordered main-table-02">
                        <div className="ant-table-container">
                            <div className="ant-table-content">
                                <table>
                                    <thead className="ant-table-thead thead-permission">
                                        <tr>
                                            <th
                                                className="ant-table-cell"
                                                scope="col"
                                            >
                                                STT
                                            </th>
                                            <th
                                                className="ant-table-cell"
                                                scope="col"
                                            >
                                                Tiêu đề
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {showData(response.data.data)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

                setDataLog(result);
                setIsLoadOK(true);
            })
            .catch((error) => {
                message.error("Không tải được lịch sử thay đổi dữ liệu");
                setIsLoadOK(true);
            });
    }
    return (
        <div>
            <Modal
                title="Lịch sử thay đổi"
                open={isOpenModal}
                onOk={onOkModal}
                onCancel={onCancelModal}
                className="modal-large"
                footer=""
            >
                <div>{contentModal}</div>
            </Modal>
            {dataLog}
        </div>
    );
}

export function showDataRelated(configRelated, dataRelated) {
    // config
    function configColumnData(column, dataSelect, table) {
        let result = column.filter(function (col) {
            if (col.show_in_list === 0) {
                return false;
            }
            return true;
        }).map((col) => {
            return {
                title: col.display_name,
                dataIndex: col.name,
                key: col.id,
                render: (_, record) => {
                    return (
                        renderData(col, record)
                    );
                }
            };
        });

        result.push({
            title: "#",
            dataIndex: "operation",
            fixed: "right",
            width: 50,
            render: (_, record) => {
                return (
                    <div>
                        <a target="new" href={route("data.edit", [table.id, record.index,])}>
                            <Button type="button" className="btn-edit"><EditOutlined /> </Button>
                        </a>
                        <a target="new" href={route("data.detail", [table.id, record.index,])}>
                            <Button type="button" className="btn-view"><EyeOutlined /> </Button>
                        </a>
                    </div>
                );
            },
        });

        return result;
    }

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
        return (
            <td {...restProps}>{children}</td>
        );
    };

    const result = dataRelated.map((related, index) => {
        return (
            <div>
                <Divider orientation="left" dashed>
                    {
                        <div>
                            {configRelated[index].title} <b>|</b>{" "}
                            <a
                                target="new"
                                title="Xem tất cả"
                                href={route("data.index", [related.table.id])}
                            >
                                <ReadOutlined />
                            </a>
                        </div>
                    }
                </Divider>
                <Table
                    className="table-select"
                    size="small"
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    // loading={loadingTable}
                    dataSource={related.datas.dataSource}
                    columns={configColumnData(
                        related.columns,
                        related.select,
                        related.table
                    )}
                    // rowSelection={rowSelection}
                    rowClassName="editable-row"
                />
            </div>
        );
    });

    return result;
}

export function showDataSelectTable(prop, col, setting = []) {
    const editor = useRef([]);
    const [loadingBtnAdd, setLoadingBtnAdd] = useState(false);
    const [formSelectTable] = Form.useForm();
    const [isOpenAddSelectTable, setIsOpenAddSelectTable] = useState(prop.isShowModalSelectTable);
    const [dataSourceSelectTbl, setDataSourceSelectTbl] = useState(prop.selectTbl);
    const [loadingTable, setLoadingTable] = useState(false);
    const [selectTableIndex, setSelectTableIndex] = useState(0);
    const [keyEdit, setKeyEdit] = useState(0);
    const [editorValue, setEditorValue] = useState('');

    const [initialValues, setInitialValues] = useState(null);

    const onFinishFormSelectTable = (values) => {
        // format value form
        let dataSource_tmp;
        if (keyEdit === 0) {
            const idx = selectTableIndex - 1;
            setSelectTableIndex(idx);
            values['key'] = idx;
            values['action'] = idx;
            values['index'] = idx;

            dataSource_tmp = dataSourceSelectTbl[values.col_name].datas.dataSource;
            const values_tmp = formatValueForm(dataSourceSelectTbl[values.col_name].dataSelectTbl.columns, values, editor);
            dataSource_tmp.push(values_tmp);
        } else {
            values = formatValueForm(dataSourceSelectTbl[values.col_name].dataSelectTbl.columns, values, editor);
            dataSource_tmp = dataSourceSelectTbl[values.col_name].datas.dataSource;
            for (const [key, val] of Object.entries(dataSource_tmp)) {
                if (val.key === keyEdit) {
                    values['key'] = keyEdit;
                    dataSource_tmp[key] = values;
                    break;
                }
            }
        }

        dataSourceSelectTbl[values.col_name].datas.dataSource = dataSource_tmp;
        let dataSourceSelectTbl_tmp = cloneDeep(dataSourceSelectTbl);
        // set state
        setDataSourceSelectTbl(dataSourceSelectTbl_tmp);
        setKeyEdit(0);
        message.success('Đã thêm thành công');
        formSelectTable.resetFields();
        closeModalSelectTable();

        // save 2 storage
        saveStorage(values.col_name, dataSource_tmp);
    };

    function saveStorage(col_name, dataSource_tmp) {
        let storage = {};
        if (sessionStorage.getItem("storage")) {
            storage = parseJson(sessionStorage.getItem("storage"));
        }
        storage[col_name] = dataSource_tmp;
        sessionStorage.setItem("storage", JSON.stringify(storage));
        return storage;
    }

    const onOkModalSelectTbl = () => {
        formSelectTable.submit();
    };

    const onCancelModalSelectTbl = () => {
        formSelectTable.resetFields();
        closeModalSelectTable();
        message.error('Đã huỷ');
    };

    const openModalAddSelectTbl = (col) => {
        formSelectTable.setFieldValue('col_name', col.name);
        setKeyEdit(0);
        isOpenAddSelectTable[col.name] = true;
        let dataSourceSelectTbl_tmp = cloneDeep(isOpenAddSelectTable);
        setIsOpenAddSelectTable(dataSourceSelectTbl_tmp);
    };

    const openModalEditSelectTbl = (col, record) => {
        setKeyEdit(record.key);

        for (const [key, val] of Object.entries(prop.columnSelectTable[col.name])) {
            if (record[val.name]) {
                if (val.name === 'start_date' || val.name === 'end_date') {
                    formSelectTable.setFieldValue(key, dayjs(record[val.name], DATE_FORMAT));
                    continue;
                }
                if (val.type_edit === 'select' && record[val.name].info) {
                    const label = record[val.name].info.label ? record[val.name].info.label : record[val.name].info.name
                    formSelectTable.setFieldValue(key, {
                        disabled: false,
                        key: record[val.name].id,
                        label: label,
                        title: label,
                        value: record[val.name].id
                    });
                    continue;
                }

                if (val.type_edit === 'selects' && record[val.name].info) {
                    const slts = [];
                    for (const [k, v] of Object.entries(record[val.name].info)) {
                        slts.push({
                            disabled: false,
                            key: v.value,
                            label: v.label,
                            title: v.label,
                            value: v.value
                        });
                    }
                    formSelectTable.setFieldValue(key, slts);
                    continue;
                }

                if (val.type_edit === 'tiny') {
                    setEditorValue(record[val.name]);
                    continue;
                }

                // other
                formSelectTable.setFieldValue(key, record[val.name]);
            }
        }

        formSelectTable.setFieldValue('col_name', col.name);
        //open modal
        isOpenAddSelectTable[col.name] = true;
        let dataSourceSelectTbl_tmp = cloneDeep(isOpenAddSelectTable);
        setIsOpenAddSelectTable(dataSourceSelectTbl_tmp);
    };

    function handleImageUpload(targetImgElement, index, state, imageInfo, remainingFilesCount) {
        console.log(targetImgElement, index, state, imageInfo, remainingFilesCount)
    }
    function handleImageUploadError(errorMessage, result) {
        console.log(errorMessage, result)
    }
    function handleOnResizeEditor(height, prevHeight) {
        console.log(height, prevHeight)
    }
    function imageUploadHandler(xmlHttpRequest, info, core, colName) {
        const result = parseJson(xmlHttpRequest.response);
        for (const [key, val] of Object.entries(result.data)) {
            editor.current[colName].insertHTML('<img key="' + key + '" src="' + val.url + '">', true, true);
        }
    }

    function contentFormSelectTbl(colName) {
        if (!dataSourceSelectTbl[col.name].dataSelectTbl) {
            return [];
        }
        const listItems = dataSourceSelectTbl[col.name].dataSelectTbl.columns.map((column) => {
            const typeIgnore = ["image", "image_crop", "images", "images_crop"];
            if (column.name === 'data_id' || (column.edit === 1 && typeIgnore.includes(column.type_edit))) {
                return ''
            }

            if (column.type_edit === 'tiny' && column.edit === 1) {
                let config = optionSunEditor;
                config.imageUploadHeader = {
                    'X-CSRF-TOKEN': prop.token
                };
                return <Row key={column.id} layout="vertical" className="main-tiny01">
                    <Col key={column.id} label={column.display_name} className="main-tiny02">
                        <Divider orientation="left">{column.display_name}</Divider>
                        <Form.Item name={column.name}>
                            <SunEditor key={column.id}
                                getSunEditorInstance={(sunEditor) => { editor.current[column.name] = sunEditor }}
                                // data && data[col.name] ? data[col.name] : ''
                                setContents={editorValue}
                                onImageUpload={handleImageUpload}
                                onImageUploadError={handleImageUploadError}
                                onResizeEditor={handleOnResizeEditor}
                                imageUploadHandler={(xmlHttpRequest, info, core) => imageUploadHandler(xmlHttpRequest, info, core, column.name)}
                                setOptions={config}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            }

            if (column.block_type === null || column.block_type == '') {
                return showDataPopup(column, dataSourceSelectTbl[col.name].dataSelectTbl, editor);
            }

        });
        return listItems;
    };

    function configColumnData(column, selectColName) {
        let result = column.filter(function (col01) {
            if (col01.show_in_list === 0) {
                return false;
            }
            return true;
        }).map((col02) => {
            return {
                title: col02.display_name,
                dataIndex: col02.name,
                key: col02.id,
                render: (_, record) => {
                    if (['select'].includes(col02.type_edit)) {
                        return <div>{showSelect(col02, record)} </div>
                    }
                    if (['selects'].includes(col02.type_edit)) {
                        return <div>{showSelects(record[col02.name])}  </div>;
                    }
                    if (['date'].includes(col02.type_edit)) {
                        return <div>{dayjs(record[col.name]).format(DATE_FORMAT)} </div>;
                    }
                    if (['datetime'].includes(col02.type_edit)) {
                        console.log('datetime', record[col02.name]);
                        return dayjs(record[col02.name]).format(DATE_TIME_FORMAT);
                    }
                    if (['number'].includes(col02.type_edit)) {
                        return record[col02.name] ? <div>{numberFormat(record[col02.name])} </div> : '';
                    }
                    if (['text'].includes(col02.type_edit)) {
                        return record[col02.name] ? <div>{record[col02.name]} </div> : '';
                    }
                    if (['image', 'image_crop'].includes(col02.type_edit)) {
                        return <Image className="image-index" src={record[col02.name]}></Image>;
                    }
                    if (['images', 'images_crop'].includes(col02.type_edit) && record[col02.name].avatar) {
                        return <Image className="image-index" src={record[col02.name].avatar}></Image>;
                    }
                    if (['tiny'].includes(col02.type_edit) && record[col02.name]) {
                        return <div dangerouslySetInnerHTML={{ __html: record[col02.name] }} />;
                    }
                    if (['cascader'].includes(col02.type_edit) && record[col02.name]) {
                        console.log('ccc', col02.name, record[col02.name]);
                        console.log('prop', prop);
                        console.log('col', col);
                        let result = '';
                        try {
                            if (record[record[col02.name]] && record[record[col02.name]].info) {
                                result = record[record.cascader].info.name
                            } else {
                                console.log('name', record[col02.name]);
                                console.log('cascader', record[record[col02.name]]);
                                console.log('se', prop.selectTbl[col.name].select.selectData[record[col02.name][0]][record[col02.name][1]]);
                                result = prop.selectTbl[col.name].select.selectData[record[col02.name][0]][record[col02.name][1]];
                            }

                        } catch (error) {
                            console.log('cascader', error);
                        }
                        return result;
                    }
                },
            };
        });

        function onDeleteItemSelectTable(row, colName) {
            const dataSource_tmp = dataSourceSelectTbl[colName].datas.dataSource.filter((val) => {
                if (val.key !== row.key) {
                    return val;
                }
            });
            dataSourceSelectTbl[colName].datas.dataSource = dataSource_tmp;
            let dataSourceSelectTbl_tmp = cloneDeep(dataSourceSelectTbl);
            setDataSourceSelectTbl(dataSourceSelectTbl_tmp);
            saveStorage(colName, dataSource_tmp)
        }

        function checkShowBtnView(col, record) {
            if (record.key > 0) {
                return <a target="_blank" rel="noopener noreferrer" href={route('data.detail', [prop.selectTbl[col.name].dataSelectTbl.table.id, record.key])}>
                    <Button type="button" className="icon-view"><EyeOutlined /> </Button>
                </a>
            }
        }

        if (prop.table.is_show_btn_edit === 1) {
            result.push(
                {
                    title: '#',
                    dataIndex: 'operation',
                    fixed: 'right',
                    width: 50,
                    render: (_, record) => {
                        return <div>
                            {checkShowBtnView(col, record)}
                            <Button type="button" className="icon-edit" onClick={() => openModalEditSelectTbl(col, record)}><EditOutlined /> </Button>
                            <Popconfirm title="Bạn muốn xóa?" onConfirm={() => { onDeleteItemSelectTable(record, selectColName) }} cancelText="Dừng" okText="XÓA">
                                <Button type="button" className="btn-delete" htmlType="button"><DeleteOutlined /> </Button>
                            </Popconfirm>
                        </div>
                    },
                }
            );
        }
        return result;
    }

    function closeModalSelectTable() {
        let tmp = {};
        for (const [key, value] of Object.entries(isOpenAddSelectTable)) {
            tmp[key] = false;
        }
        setIsOpenAddSelectTable(tmp);
    }

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
        return (
            <td {...restProps}>{children}</td>
        );
    };

    return (
        <Row>
            <Col key={col.name} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: 24 }} >
                <Modal
                    title={col.display_name}
                    open={isOpenAddSelectTable[col.name]}
                    onOk={onOkModalSelectTbl}
                    onCancel={onCancelModalSelectTbl}
                    confirmLoading={loadingBtnAdd}
                    className='modal-large'
                >
                    <Form
                        layout="vertical"
                        form={formSelectTable}
                        onFinish={onFinishFormSelectTable}
                        autoComplete="off"
                        className='form-modal'
                        initialValues={initialValues}
                    >
                        {/* set name */}
                        <Form.Item className='_hidden' name='col_name' label={'col_name'}>
                            <Input />
                        </Form.Item>

                        {/* content form select */}
                        <Row>
                            {contentFormSelectTbl(col.name)}
                        </Row>
                    </Form>
                </Modal>

                <Divider orientation="left">{col.display_name}</Divider>

                <div>
                    <Button type="primary" onClick={() => openModalAddSelectTbl(col)}>Thêm</Button>
                </div>
                <Table className='table-select'
                    size='small'
                    components={{
                        body: {
                            cell: EditableCell
                        }
                    }}
                    loading={loadingTable}
                    dataSource={dataSourceSelectTbl[col.name].datas.dataSource}
                    columns={configColumnData(prop.selectTbl[col.name].dataSelectTbl.columns, col.name)}
                    // rowSelection={rowSelection}
                    rowClassName='editable-row'
                />
            </Col>
        </Row>
    );
}

export function showDataConfirm(data, columns) {
    const content = columns.map((col) => {
        if (col.show_in_list === 1) {
            return data[col.name];
        }
    }
    );
    return content;
}



