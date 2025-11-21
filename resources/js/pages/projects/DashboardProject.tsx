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

import ProfitReport from "./components/ProfitReport";

// import TotalReport from "./TotalReport";
// import TienPhongReport from "./TienPhongReport";
// import DichVuReport from "./DichVuReport";
// import ThuChiReport from "./ThuChiReport";
// import CongNoReport from "./CongNoReport";
// import AssetReport from "./AssetReport";


const DashboardProject: React.FC = () => {
    let key = 1;
    const items: TabsProps['items'] = [
        {
            key: (key++).toString(),
            label: 'Lợi nhuận thực tế',
            children: <ProfitReport />,
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

export default DashboardProject;
