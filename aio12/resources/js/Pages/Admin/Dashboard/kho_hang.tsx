import { useState } from "react";
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from "@inertiajs/react";

import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge,
    TabsProps
} from 'antd';

import {
    SoundOutlined, MonitorOutlined,
    MessageOutlined,
} from "@ant-design/icons";

import {
    Tooltip, Cell, Pie, PieChart, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';


import "../../../../css/home.css";
import { numberFormat } from "../../../Function/common";
import { routeQLKho } from "../../../Function/config_route";
import { report_kho_nhapHang, report_kho_tongQuan, report_kho_tonKho, report_kho_kiemKeKho, report_kho_congNo } from "../../../Function/report";

export default function Dashboard(props: any) {
    const [nhapHangData, setNhapHangData] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    function history() {
        return <div className='sub-item-home'>
            <h3>
                <SoundOutlined />
                LỊCH SỬ CẬP NHẬT KHO
            </h3>
            <List
                dataSource={[
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0232</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa thêm mới sản phẩm <a>SP000123</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0232</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0233</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa thêm mới sản phẩm <a>SP000125</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0234</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0235</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0236</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0237</a></div>,
                    },
                    {
                        title: <div><a>An</a> Vừa tạo hóa đơn<a>HD0238</a></div>,
                    }
                ]}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<a><MessageOutlined /></a>}
                            title={<span className='text-normal'>{item.title}</span>}
                        />
                    </List.Item>
                )}
            />
        </div>
    }

    let key = 1;
    const items: TabsProps['items'] = [
        {
            key: key++,
            label: 'Tổng quan',
            children: report_kho_tongQuan(props),
        },
        {
            key: key++,
            children: report_kho_nhapHang(),
            label: <span>Báo cáo nhập hàng</span>,
        },
        {
            key: key++,
            label: 'Báo cáo tồn kho',
            children: report_kho_tonKho(),
        },
        {
            key: key++,
            label: 'Báo cáo kiểm kê kho',
            children: report_kho_kiemKeKho(),
        },
        {
            key: key++,
            label: 'Công nợ',
            children: report_kho_congNo(),
        },
        {
            key: key++,
            label: 'Lịch sử cập nhật kho',
            children: history(),
        },
    ];
    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={routeQLKho}
            content={
                <div>

                    <Tabs tabPosition="left" defaultActiveKey="1" items={items} />


                </div>
            }
        />
    );
}
