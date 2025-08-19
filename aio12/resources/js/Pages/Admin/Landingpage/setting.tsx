import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    Table,
    message,
    Modal,
    Tag,
    Input,
    InputNumber,
    Popconfirm,
    Radio,
    Select,
    Row, Col,
    Space,
    DatePicker,
    Checkbox,
    notification,
    Divider,
    Image,
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
    CaretRightOutlined, MinusCircleOutlined, DashboardOutlined
} from "@ant-design/icons";

import "../../../../css/form.css";

import { callApi } from "../../../Function/api";
;
import { inArray, parseJson, numberFormat, removeByIndex } from "../../../Function/common";
import dayjs from "dayjs";

import { DATE_FORMAT, DATE_TIME_FORMAT, DATE_SHOW, DATE_TIME_SHOW, MOC_THOI_GIAN } from '../../../Function/constant';
import { cloneDeep } from "lodash";
const { TextArea } = Input;

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
    HTTime, HTColor, HTCascaderTable, smartSearch02, smartSearch, showDataSearch, showDataSearch02,

} from "../../../Function/input";

import { routeWeb } from "../../../Function/config_route";

export default function Dashboard(props: { auth: unknown; table: { id: number; parent_id: number; } | undefined; landingpages: readonly any[] | undefined; }) {


    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Cài đặt trang Landingpage'}
                tables={routeWeb}
                current={props.table}
                content={
                    <div>
                        <Row>
                            <Col sm={{ span: 24 }}>
                                <h1>Cài đặt {props.menu?.name}</h1>
                                <p>Đây là trình cài đặt website landingpage</p>
                                <p>Vui lòng click chọn nút màu đỏ để <b>`sửa nội dung`</b> hoặc <b>`cài đặt`</b> ở các khối tương ứng</p>
                                <p>Click <a onClick={() => window.open(props.link, '_blank')}>vào đây</a> để có thể cài đặt nhanh ở phía bên ngoài website</p>
                            </Col>
                            <Col sm={{ span: 24 }}>
                                <iframe
                                    src={props.link}
                                    width="100%"
                                    height="1000"
                                    style={{ border: 'none' }}
                                    title="Demo iframe"
                                />
                            </Col>
                        </Row>

                    </div>
                }
            />
        </div>
    );
}
