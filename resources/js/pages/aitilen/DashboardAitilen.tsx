import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { ROUTE } from "../../common/route";



import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge, Menu, Switch, TabsProps, Tag
} from 'antd';


import { motion } from "framer-motion";
import dayjs from 'dayjs';
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

import "../../../css/home.css";
import { numberFormat, } from "../../function/common";
import { routeSales } from "../../function/config_route";
import { history } from "../../function/report";
import type { GetProp, MenuProps } from 'antd';

import TotalReport from "./components/TotalReport";
import TienPhongReport from "./components/TienPhongReport";
import DichVuReport from "./components/DichVuReport";
import ThuChiReport from "./components/ThuChiReport";
import CongNoReport from "./components/CongNoReport";
import AssetReport from "./components/AssetReport";


const DashboardAitilen: React.FC = () => {
    let key = 1;
    const items: TabsProps['items'] = [
        {
            key: (key++).toString(),
            label: 'Lợi nhuận thực tế',
            children: <TotalReport />,
        },
        {
            key: (key++).toString(),
            label: 'Lợi nhuận theo tiền phòng',
            children:  <TienPhongReport />,
        },
        {
            key: (key++).toString(),
            label: 'Tiền dịch vụ',
            children: <DichVuReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo thu/chi',
            children: <ThuChiReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo công nợ',
            children: <CongNoReport />,
        },

        {
            key: (key++).toString(),
            label: 'Báo cáo tài sản',
            children:  <AssetReport />,
        },


    ];
    type TabPosition = 'left' | 'right' | 'top' | 'bottom';
    const [mode, setMode] = useState<TabPosition>('left'); // top
    return (
        <div>
            <Tabs tabPosition={mode} defaultActiveKey="1" items={items} />
        </div>
    );
};

export default DashboardAitilen;
