import React, { useState } from "react";
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
    Table,Image, Tag
} from "antd";
import { useForm, router, Link } from "@inertiajs/react";
import cloneDeep from "lodash/cloneDeep";
import {
    PlusCircleOutlined,
    ArrowRightOutlined,
    ReadOutlined,
    EditOutlined,
    EyeOutlined,
    DownloadOutlined,DownOutlined
} from "@ant-design/icons";
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
} from "./input";
import { inArray, parseJson, nl2br, numberFormat } from "./common";
import { showCol } from "./data";
import { checkShowData, checkShowDataLang } from "./detail";
// import { contentFormSelectTbl } from "./common";
import axios from "axios";
import dayjs from "dayjs";
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

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

export function loadDataLanguage(table, data) {
    const [dataLang, setDataLang] = useState("");
    const [isLoadOK, setIsLoadOK] = useState(false);
    // let dataLang = '';
    if (!isLoadOK) {
        axios
            .get(route("data.detail_lang", [table.id, data.id]))
            .then((response) => {
                response = response.data.data;
                let tabDataLanguage = response.languages.map((lang) => {
                    let children = null;
                    if(response.dataLang[lang.id]) {
                        children = checkShowDataLang(response.dataLang[lang.id]);
                    }
                    return {
                        key: lang.id,
                        label: lang.name,
                        children: children,
                    }
                });

                const result = <div>
                        <Divider orientation="left">Nội dung thay đổi theo từng ngôn ngữ</Divider>
                        <Tabs defaultActiveKey="1" items={tabDataLanguage}/>
                    </div>

                setDataLang(result);
                setIsLoadOK(true);
            })
            .catch((error) => {
                message.error("Tải dữ liệu theo ngôn ngữ thất bại");
                setIsLoadOK(true);
            });
    }
    return (
        <div>
            {dataLang}
        </div>
    );
}
