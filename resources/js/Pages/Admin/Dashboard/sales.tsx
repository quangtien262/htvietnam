import react, { useState } from "react";
import AdminLayout from '@/layouts/AdminLayout';

import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge, Menu, Switch, TabsProps, Tag
} from 'antd';


import { motion } from "framer-motion";
import dayjs from 'dayjs';
import { Inertia } from "@inertiajs/inertia";
import {
    SoundOutlined, MonitorOutlined,
    MessageOutlined, AppstoreOutlined,
    CalendarOutlined,
    LinkOutlined,
    MailOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import {
    Tooltip, Cell, Pie, PieChart, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    LineChart, Line
} from 'recharts';

import "../../../../css/home.css";
import { numberFormat } from "../../../Function/common";
import { routeSales } from "../../../Function/config_route";
import { history } from "../../../Function/report";
import type { GetProp, MenuProps } from 'antd';

import {
    report_DonHang, report_DoanhThu,
    report_sales_KhachHang, report_sales_NhanVienSale,
    report_sales_NhanVienLamDV, report_sale_congNo
} from "../../../Function/report";

// Báo cáo công nợ: bảng + biểu đồ


export default function Dashboard(props: any) {
    const [donHangData, setDonHangData] = useState<React.ReactNode>('');


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
    // Dữ liệu mẫu cho báo cáo doanh thu


    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Báo cáo doanh thu',
            children: report_DoanhThu(),
        },
        {
            key: '2',
            label: <span>Báo cáo đơn hàng</span>,
            children: report_DonHang(),
        },
        {
            key: '3',
            label: 'Báo cáo khách hàng',
            children: report_sales_KhachHang(),
        },
        {
            key: '4',
            label: 'Nhân viên sale',
            children: report_sales_NhanVienSale(),
        },
        {
            key: '6',
            label: 'Nhân viên làm DV',
            children: report_sales_NhanVienLamDV(),
        },
        {
            key: '5',
            label: 'Báo cáo công nợ',
            children: report_sale_congNo(),
        },
    ];
    type TabPosition = 'left' | 'right' | 'top' | 'bottom';
    const [mode, setMode] = useState<TabPosition>('left'); // top
    return (
        <AdminLayout
            auth={props.auth}
            content={
                <div>
                    <Tabs tabPosition={mode} defaultActiveKey="1" items={items} />
                </div>
            }
        />
    );
}
