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
    sessionStorage.clear();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);


    function configColumnData() {
        let key = 0
        return [
            {
                title: "Tên trang",
                dataIndex: "name",
                ellipsis: true,
                key:key++
            },
            {
                title: "Kiểu hiển thị",
                dataIndex: "is_active",
                ellipsis: true,
                key:key++,
                render: (_: any, record: any) => {
                    return <div>
                        <Tag color="#09769bff">Landingpage</Tag>
                    </div>
                },
            },
            {
                title: "Trạng thái",
                dataIndex: "is_active",
                ellipsis: true,
                key:key++,
                render: (_: any, record: { is_active: number; }) => {
                    return (
                        <div>
                            {record.is_active === 1 ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Đang khóa</Tag>}
                        </div>
                    );
                },
            },
            {
                title: "Cài đặt page",
                dataIndex: "operation",
                fixed: 'right' as 'right',
                key:key++,
                // width: 50,
                render: (_: any, record: any) => {
                    if (record) {
                        return (
                            <Link href={route('adm.landingpage.setting', [record.id])}>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<EditOutlined />}
                                >
                                    Cài đặt
                                </Button>
                            </Link>
                        );
                    }
                },
            }
        ]
    }

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
                                <Table
                                    size="small"
                                    // pagination={tableParams.pagination}
                                    // dataSource={formatData(dataSource)}
                                    dataSource={props.landingpages}
                                    // rowSelection={rowSelection}
                                    rowClassName="editable-row"
                                    className="table-index"
                                    // expandable={expandable}
                                    columns={configColumnData()}
                                />
                            </Col>
                        </Row>
                    </div>
                }
            />
        </div>
    );
}
