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
    EditOutlined,
} from "@ant-design/icons";

import "../../../../css/form.css";

import { routeWeb } from "../../../Function/config_route";

export default function Dashboard(props: { auth: unknown; table: { id: number; parent_id: number; } | undefined; landingpages: readonly any[] | undefined; }) {
    
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
                menus={props.menus}
                menuParentID = {props.p}
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
