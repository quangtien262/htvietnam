import React, { useState } from "react";
import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Tag,
    TabsProps
} from 'antd';
import {
    SoundOutlined, MonitorOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import {
    Tooltip, Cell, Pie, PieChart, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    ReferenceLine, LineChart, Line
} from 'recharts';
import { numberFormat } from "./common";
import axios from 'axios';
import { searchByTime } from "../components/comp_common";
import dayjs from "dayjs";

export function history() {
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

export function report_kho_nhapHang() {
    const data = [
        { key: 1, date: "2025-08-01", product: "Gạo ST25", quantity: 200, price: 15000 },
        { key: 2, date: "2025-08-02", product: "Đường trắng", quantity: 100, price: 12000 },
        { key: 3, date: "2025-08-02", product: "Dầu ăn", quantity: 80, price: 11000 },
        { key: 4, date: "2025-08-03", product: "Nước mắm", quantity: 60, price: 30000 },
    ];

    const columns = [
        { title: "Ngày nhập", dataIndex: "date", key: "date" },
        { title: "Tên hàng", dataIndex: "product", key: "product" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
        { title: "Giá nhập (VND)", dataIndex: "price", key: "price", render: (text: { toLocaleString: () => any; }) => text.toLocaleString() },
        {
            title: "Thành tiền (VND)",
            key: "total",
            render: (_: any, record: { quantity: number; price: number; }) => (record.quantity * record.price).toLocaleString()
        },
    ];

    return <div style={{ padding: 20 }} className='content-home'>
        {/* Bảng nhập hàng */}
        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Báo cáo nhập hàng
            </h3>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                rowClassName={(_, index) => (index % 2 === 0 ? "even-row" : "odd-row")}
            />
        </div>
        {/* Biểu đồ nhập hàng */}
        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Biểu đồ biến động
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#1890ff" name="Số lượng nhập" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
}

export function report_kho_tongQuan(props) {

    function ThongKeTheoLoaiTheoTenSP() {

        const COLORS = ["#0088FE", "#05b405ff", "#FFBB28", "#FF8042"];
        // Custom label rendering function
        const renderThongKeLoaiTheoTenSP = ({
            cx, cy, midAngle, innerRadius, outerRadius, percent, index
        }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            return (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
            );
        };

        return <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={props.tkeLoaiSPTheoTen}
                    cx="50%" // X position
                    cy="50%" // Y position
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    label={renderThongKeLoaiTheoTenSP}
                >
                    {props.tkeLoaiSPTheoTen.map((entry: any, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>
                {/* Tooltip hiển thị name và value khi hover */}
                <Tooltip
                    formatter={(value, name, props) => [`${value}`, `${props.payload.name}`]}
                />
            </PieChart>
        </ResponsiveContainer>
    }


    function ThongKeTheoSoLuongSP() {

        const COLORS = ["#0088FE", "#05b405ff", "#FFBB28", "#FF8042"];
        // Custom label rendering function
        const renderThongKeLoaiTheoSoLuongSP = ({
            cx, cy, midAngle, innerRadius, outerRadius, percent, index
        }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return (
                <text key={index} x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
            );
        };

        return <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={props.tkeLoaiSPTheoSoLuong}
                    cx="50%" // X position
                    cy="50%" // Y position
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    label={renderThongKeLoaiTheoSoLuongSP}
                >
                    {props.tkeLoaiSPTheoSoLuong.map((entry: any, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>
                {/* Tooltip hiển thị name và value khi hover */}
                <Tooltip
                    formatter={(value, name, props) => [`${value}`, `${props.payload.name}`]}
                />
            </PieChart>
        </ResponsiveContainer>
    }

    return <Row className='content-home'>
        <Col span={18}>
            <Row>
                {/* Top ban chay */}
                <Col span={24} className='item-home'>
                    <div className='sub-item-home'>
                        <h3>
                            <MonitorOutlined />
                            Sản phẩm mới về
                        </h3>

                        <Table
                            size="small"
                            dataSource={props.latestProducts}
                            pagination={{ pageSize: 10 }}
                            rowClassName={(_, index) =>
                                index % 2 === 0 ? "even-row" : "odd-row"
                            }
                            columns={
                                [
                                    {
                                        title: 'Mã',
                                        dataIndex: 'code',
                                        key: 'code',
                                    },
                                    {
                                        title: 'Tên hàng',
                                        dataIndex: 'name',
                                        key: 'name',
                                    },
                                    {
                                        title: 'Giá bán',
                                        dataIndex: 'gia_ban',
                                        key: 'gia_ban',
                                        render: (record: any) => {
                                            return <span>{numberFormat(record)}</span>
                                        },
                                    },
                                    {
                                        title: 'Giá vốn',
                                        dataIndex: 'gia_von',
                                        key: 'gia_von',
                                        render: (record: any) => {
                                            return <span>{numberFormat(record)}</span>
                                        },
                                    },
                                    {
                                        title: 'Tồn kho',
                                        dataIndex: 'ton_kho',
                                        key: 'ton_kho',
                                    }
                                ]
                            }
                        />
                    </div>
                </Col>
            </Row>
        </Col>
        <Col span={6} className='item-home'>
            <div className='sub-item-home'>
                <h3>
                    <MonitorOutlined />
                    Thống kê theo loại sản phẩm
                </h3>
                {ThongKeTheoLoaiTheoTenSP()}
            </div>

            <div className='sub-item-home'>
                <h3>
                    <MonitorOutlined />
                    Thống kê theo số lượng sản phẩm
                </h3>
                {ThongKeTheoSoLuongSP()}
            </div>

            <div className='sub-item-home'>
                <h3>
                    <MonitorOutlined />
                    Thống kê theo Sản phẩm
                </h3>
                {ThongKeTheoSoLuongSP()}
            </div>
        </Col>
    </Row>
}

export function report_kho_tonKho() {
    interface StockData {
        key: number;
        productName: string;
        sku: string;
        category: string;
        unit: string;
        openingStock: number;
        imported: number;
        exported: number;
        closingStock: number;
    }
    const data: StockData[] = [
        {
            key: 1,
            productName: 'Sản phẩm 01',
            sku: 'GAO-ST25',
            category: 'Thực phẩm',
            unit: 'Kg',
            openingStock: 500,
            imported: 200,
            exported: 150,
            closingStock: 550,
        },
        {
            key: 2,
            productName: 'Sản phẩm 02',
            sku: 'NUOC-LAVIE500',
            category: 'Đồ uống',
            unit: 'Chai',
            openingStock: 300,
            imported: 100,
            exported: 80,
            closingStock: 320,
        },
        {
            key: 2,
            productName: 'Sản phẩm 03',
            sku: 'NUOC-LAVIE500',
            category: 'Đồ uống',
            unit: 'Chai',
            openingStock: 300,
            imported: 100,
            exported: 80,
            closingStock: 320,
        },
        {
            key: 2,
            productName: 'Sản phẩm 04',
            sku: 'NUOC-LAVIE500',
            category: 'Đồ uống',
            unit: 'Chai',
            openingStock: 300,
            imported: 100,
            exported: 80,
            closingStock: 320,
        },
    ];

    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Mã SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'Tồn đầu kỳ',
            dataIndex: 'openingStock',
            key: 'openingStock',
        },
        {
            title: 'Nhập trong kỳ',
            dataIndex: 'imported',
            key: 'imported',
        },
        {
            title: 'Xuất trong kỳ',
            dataIndex: 'exported',
            key: 'exported',
        },
        {
            title: 'Tồn cuối kỳ',
            dataIndex: 'closingStock',
            key: 'closingStock',
        },
    ];

    const dataChart = [
        {
            name: 'Sản phẩm 01',
            openingStock: 500,
            imported: 200,
            exported: 150,
            closingStock: 550,
        },
        {
            name: 'Sản phẩm 02',
            openingStock: 300,
            imported: 100,
            exported: 80,
            closingStock: 320,
        },
        {
            name: 'Sản phẩm 03',
            openingStock: 300,
            imported: 100,
            exported: 80,
            closingStock: 320,
        },
        {
            name: 'Sản phẩm 04',
            openingStock: 300,
            imported: 100,
            exported: 80,
            closingStock: 320,
        },
    ];


    return (
        <div className="content-home">
            <div className='sub-item-home'>
                <h3>
                    <MonitorOutlined />
                    Sản phẩm tồn kho
                </h3>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    rowClassName={(_, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
                />
            </div>

            <div className='sub-item-home'>
                <h3>
                    <MonitorOutlined />
                    Biền đồ biến động
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dataChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="openingStock" fill="#8884d8" name="Tồn đầu kỳ" />
                        <Bar dataKey="imported" fill="#05b405ff" name="Nhập trong kỳ" />
                        <Bar dataKey="exported" fill="#ff7f50" name="Xuất trong kỳ" />
                        <Bar dataKey="closingStock" fill="#ffc658" name="Tồn cuối kỳ" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

    );

}

export function report_kho_kiemKeKho() {
    const data = [
        {
            key: "1",
            product: "Gạo ST25",
            unit: "Kg",
            systemQty: 100,
            actualQty: 98,
            difference: -2
        },
        {
            key: "2",
            product: "Đường trắng",
            unit: "Kg",
            systemQty: 50,
            actualQty: 50,
            difference: 0
        },
        {
            key: "3",
            product: "Nước mắm",
            unit: "Chai",
            systemQty: 200,
            actualQty: 205,
            difference: 5
        }
    ];

    const columns = [
        {
            title: "Tên sản phẩm",
            dataIndex: "product",
            key: "product"
        },
        {
            title: "Đơn vị",
            dataIndex: "unit",
            key: "unit",
            align: "center"
        },
        {
            title: "Tồn hệ thống",
            dataIndex: "systemQty",
            key: "systemQty",
            align: "center"
        },
        {
            title: "Tồn thực tế",
            dataIndex: "actualQty",
            key: "actualQty",
            align: "center"
        },
        {
            title: "Chênh lệch",
            dataIndex: "difference",
            key: "difference",
            align: "center",
            render: (diff) => (
                <Tag color={diff > 0 ? "green" : diff < 0 ? "red" : "blue"}>
                    {diff}
                </Tag>
            )
        }
    ];

    const dataChart = [
        { name: "Gạo ST25", systemQty: 100, actualQty: 98 },
        { name: "Đường trắng", systemQty: 50, actualQty: 50 },
        { name: "Nước mắm", systemQty: 200, actualQty: 205 }
    ];

    return <div className="content-home">

        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Sản phẩm tồn kho
            </h3>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
            />
        </div>


        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Biểu đồ thống kê
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dataChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="systemQty" fill="#8884d8" name="Tồn hệ thống" />
                    <Bar dataKey="actualQty" fill="#05b405ff" name="Tồn thực tế" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
}

export function report_kho_congNo() {
    const columns = [
        { title: "Mã đối tác", dataIndex: "code", key: "code" },
        { title: "Tên đối tác", dataIndex: "name", key: "name" },
        { title: "Giá trị nhập", dataIndex: "importValue", key: "importValue" },
        { title: "Giá trị xuất", dataIndex: "exportValue", key: "exportValue" },
        { title: "Đã thanh toán", dataIndex: "paid", key: "paid" },
        { title: "Còn nợ", dataIndex: "debt", key: "debt" },
        { title: "Ngày giao dịch gần nhất", dataIndex: "lastDate", key: "lastDate" },
    ];

    const data = [
        {
            key: 1,
            code: "NCC001",
            name: "Nhà cung cấp A",
            importValue: "200,000,000",
            exportValue: "0",
            paid: "150,000,000",
            debt: "50,000,000",
            lastDate: "05/08/2025",
        },
        {
            key: 2,
            code: "KH001",
            name: "Khách hàng B",
            importValue: "0",
            exportValue: "120,000,000",
            paid: "80,000,000",
            debt: "40,000,000",
            lastDate: "06/08/2025",
        },
    ];

    const dataChart02 = [
        {
            name: 'Nhà cung cấp A',
            noNhap: 12000000,
            noXuat: 8000000
        },
        {
            name: 'Nhà cung cấp B',
            noNhap: 5000000,
            noXuat: 3000000
        },
        {
            name: 'Khách hàng C',
            noNhap: 0,
            noXuat: 10000000
        },
        {
            name: 'Khách hàng D',
            noNhap: 2000000,
            noXuat: 7000000
        }
    ];

    const dataChart = [
        { name: "Nợ phải thu (Khách hàng)", value: 40 },
        { name: "Nợ phải trả (Nhà cung cấp)", value: 50 },
    ];

    const COLORS = ["#05b405ff", "#FF8042"];
    return <div style={{ padding: 20 }} className='content-home'>

        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Báo cáo theo tổng công nợ
            </h3>
            <PieChart width={400} height={400}>
                <Pie
                    data={dataChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={3}
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>

        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Báo cáo chi tiết công nợ
            </h3>
            <Table columns={columns} dataSource={data} bordered pagination={false} />
        </div>

        <div style={{ width: '100%', height: 400 }}>
            <div className='sub-item-home'>
                <h3>
                    <MonitorOutlined />
                    Biểu đồ báo cáo công nợ tổng quan
                </h3>
            </div>
            <ResponsiveContainer>
                <BarChart
                    data={dataChart02}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => value.toLocaleString()} />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="noNhap" fill="#b64402ff" name="Nợ nhập hàng" />
                    <Bar dataKey="noXuat" fill="#05b405ff" name="Nợ xuất hàng" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
}

export function report_DoanhThu() {

    const khoangThoiGian = [dayjs().subtract(7, 'day'), dayjs()];

    const [dataDoanhThu, setDataDoanhThu] = useState([]);
    const [title, setTitle] = useState('');

    const [slKhachHangMoi, setSlKhachHangMoi] = useState(0);
    const [khachHangMoi, setKhachHangMoi] = useState(0);
    const [slDonHangMoi, setSlDonHangMoi] = useState(0);
    const [doanhThu, setDoanhThu] = useState(0);

    function fetchDataDoanhThu(dateRange: any) {
        axios.get(route('sale.report_doanhThu'), {
            params: {
                startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
                endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
            }
        })
            .then(response => {
                console.log('response', response);
                setDataDoanhThu(response.data.data.dataDoanhThu);
                setSlKhachHangMoi(response.data.data.slKhachHangMoi);
                setSlDonHangMoi(response.data.data.slDonHangMoi);
                setDoanhThu(response.data.data.doanhThu);
                setKhachHangMoi(response.data.data.khachHangMoi);
                setTitle(response.data.data.title);
            })
            .catch(error => {
                console.error('Error fetching dataDoanhThu:', error);
            });
    }

    // call api to get dataDoanhThu vaf setDataDoanhThu
    React.useEffect(() => {
        fetchDataDoanhThu(khoangThoiGian);
    }, []);

    const columnsDoanhThu = [
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        {
            title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue',
            render: (val: number) => numberFormat(val) + ' đ'
        },
    ];
    return (
        <>
            <Row>
                <Col span={24} className="mb-4">
                    {searchByTime(khoangThoiGian, (data: any) => {
                        fetchDataDoanhThu(data.time);
                    })}
                </Col>
            </Row>
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card className="rounded-2xl shadow-md p-4">
                        <Statistic title="Tổng doanh thu" value={doanhThu} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card className="rounded-2xl shadow-md p-4">
                        <Statistic title="Tổng đơn hàng" value={slDonHangMoi} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card className="rounded-2xl shadow-md p-4">
                        <Statistic title="Khách hàng mới" value={slKhachHangMoi} />
                    </Card>
                </Col>
            </Row>
            <Card className="rounded-2xl shadow-md p-4 mb-4">
                <h3 className="text-lg font-medium mb-3">Biểu đồ doanh thu</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dataDoanhThu} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={value => value.toLocaleString()} />
                        <Tooltip formatter={value => value.toLocaleString() + ' đ'} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} name="Doanh thu" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
            <Card className="rounded-2xl shadow-md p-4">
                <Table
                    columns={columnsDoanhThu}
                    dataSource={dataDoanhThu}
                    pagination={false}
                    rowKey="date"
                    rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
                />
            </Card>
        </>
    );
}

export function report_DonHang() {
    const khoangThoiGian = [dayjs().subtract(7, 'day'), dayjs()];
    const [datas, setDatas] = useState([]);
    const [dataChart, setDataChart] = useState([]);

    function fetchData(dateRange: any) {
        axios.get(route('sale.report_DonHang'), {
            params: {
                startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
                endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
            }
        })
            .then(response => {
                setDatas(response.data.data.dataDonHang);
                setDataChart(response.data.data.dataChart);
            })
            .catch(error => {
                console.error('Error fetching dataDonHang:', error);
            });
    }

    React.useEffect(() => {
        fetchData(khoangThoiGian);
    }, []);

    return <>
        <Row>
            <Col span={24} className="mb-4">
                {searchByTime(khoangThoiGian, (data) => {
                    fetchData(data.time);
                })}
            </Col>
        </Row>
        <Card className="rounded-2xl shadow-md p-4 mb-4">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={value => value + ' đơn'} />
                    <Legend />
                    <Bar dataKey="orders" fill="#82ca9d" name="Số đơn hàng" />
                </BarChart>
            </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl shadow-md p-4">
            <Table
                columns={[
                    {
                        title: 'Ngày',
                        dataIndex: 'date',
                        key: 'date',
                    },
                    {
                        title: 'Tổng đơn hàng',
                        dataIndex: 'total_orders',
                        key: 'total_orders',
                    },
                    {
                        title: 'Tổng thu trong ngày',
                        dataIndex: 'total_revenue',
                        key: 'total_revenue',
                        render: (record) => {
                            return <span>{numberFormat(record)}</span>
                        }
                    }]}
                dataSource={datas}
                pagination={false}
                rowKey="orderCode"
                rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
        </Card>
    </>
}

export function report_sales_KhachHang() {
    const khoangThoiGian = [dayjs().subtract(7, 'day'), dayjs()];
    const [datas, setDatas] = useState([]);
    const [dataChart, setDataChart] = useState([]);

    function fetchData(dateRange: any) {
        axios.get(route('sale.report_khachHang'), {
            params: {
                startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
                endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
            }
        })
            .then(response => {
                console.log('dataDonHang', response.data.data);

                setDatas(response.data.data.dataKhachHang);
            })
            .catch(error => {
                console.error('Error fetching dataDonHang:', error);
            });
    }

    React.useEffect(() => {
        fetchData(khoangThoiGian);
    }, []);


    return <>
        <Row>
            <Col span={24} className="mb-4">
                {searchByTime(khoangThoiGian, (data) => {
                    fetchData(data.time);
                })}
            </Col>
        </Row>
        <Card className="rounded-2xl shadow-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-3">Biểu đồ số lượng mua theo khách hàng</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={datas}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="users_name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value, label, data) => {
                        return <>
                            <p>Tổng tiền: {numberFormat(value)} <sup>đ</sup></p>
                            <p>Tổng đơn hàng: {numberFormat(data.payload.total_orders)} đơn</p>
                        </>
                    }} />
                    <Legend />
                    <Bar dataKey="thanh_toan" fill="#8884d8" name="Tổng tiền" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card className="rounded-2xl shadow-md p-4">
            <h3 className="text-lg font-medium mb-3">Bảng khách hàng mua hàng</h3>
            <Table
                columns={[
                    { title: 'Khách hàng', dataIndex: 'users_name', key: 'users_name' },
                    // { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
                    { title: 'Số đơn hàng', dataIndex: 'total_orders', key: 'total_orders' },
                    { title: 'Tổng tiền', dataIndex: 'thanh_toan', key: 'thanh_toan', render: (val: number) => numberFormat(val) + ' đ' },

                ]}
                dataSource={datas}
                pagination={false}
                rowKey="name"
                rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
        </Card>
    </>
}

export function report_sales_NhanVienSale() {
    const khoangThoiGian = [dayjs().subtract(7, 'day'), dayjs()];
    const [datas, setDatas] = useState([]);

    function fetchData(dateRange: any) {
        axios.get(route('sale.report_nhanVienSale'), {
            params: {
                startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
                endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
            }
        })
            .then(response => {
                setDatas(response.data.data.dataNhanVien);
            })
            .catch(error => {
                console.error('Error fetching dataDonHang:', error);
            });
    }

    React.useEffect(() => {
        fetchData(khoangThoiGian);
    }, []);
    return <>
        <Row>
            <Col span={24} className="mb-4">
                {searchByTime(khoangThoiGian, (data) => {
                    fetchData(data.time);
                })}
            </Col>
        </Row>
        <Card className="rounded-2xl shadow-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-3">Biểu đồ doanh số theo nhân viên</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datas} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="users_name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value, label, data) => {
                        return <>
                            <p>Tổng đơn hàng: {numberFormat(data.payload.total_orders)} đơn</p>
                            <p>Tổng tiền: {numberFormat(data.payload.thanh_tien)} <sup>đ</sup></p>
                        </>
                    }} />
                    <Legend />
                    <Bar dataKey="thanh_tien" fill="#82ca9d" name="Doanh số" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card className="rounded-2xl shadow-md p-4">
            <h3 className="text-lg font-medium mb-3">Bảng doanh số nhân viên</h3>
            <Table
                columns={[
                    { title: 'Nhân viên', dataIndex: 'users_name', key: 'users_name' },
                    { title: 'SL đơn hàng', dataIndex: 'total_orders', key: 'total_orders' },
                    { title: 'Tổng doanh số', dataIndex: 'thanh_tien', key: 'thanh_tien', render: (val: number) => numberFormat(val) + ' đ' },
                ]}
                dataSource={datas}
                pagination={false}
                rowKey="name"
                rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
        </Card>
    </>
}

export function report_sales_NhanVienLamDV() {
    const khoangThoiGian = [dayjs().subtract(7, 'day'), dayjs()];
    const [datas, setDatas] = useState([]);

    function fetchData(dateRange: any) {
        axios.get(route('sale.report_nhanVienKT'), {
            params: {
                startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
                endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
            }
        })
            .then(response => {
                setDatas(response.data.data.dataNhanVien);
            })
            .catch(error => {
                console.error('Error fetching dataDonHang:', error);
            });
    }

    React.useEffect(() => {
        fetchData(khoangThoiGian);
    }, []);


    return <>
        <Row>
            <Col span={24} className="mb-4">
                {searchByTime(khoangThoiGian, (data) => {
                    fetchData(data.time);
                })}
            </Col>
        </Row>
        <Card className="rounded-2xl shadow-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-3">Biểu đồ doanh số theo nhân viên</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datas} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="users_name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value, label, data) => {
                        return <>
                            <p>Tổng đơn hàng: {numberFormat(data.payload.total_orders)} đơn</p>
                            <p>Tổng tiền: {numberFormat(data.payload.thanh_tien)} <sup>đ</sup></p>
                        </>
                    }} />
                    <Legend />
                    <Bar dataKey="thanh_tien" fill="#82ca9d" name="Doanh số" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card className="rounded-2xl shadow-md p-4">
            <h3 className="text-lg font-medium mb-3">Bảng doanh số nhân viên</h3>
            <Table
                columns={[
                    { title: 'Nhân viên', dataIndex: 'users_name', key: 'users_name' },
                    { title: 'SL đơn hàng', dataIndex: 'total_orders', key: 'total_orders' },
                    { title: 'Tổng doanh số', dataIndex: 'thanh_tien', key: 'thanh_tien', render: (val: number) => numberFormat(val) + ' đ' },
                ]}
                dataSource={datas}
                pagination={false}
                rowKey="name"
                rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
        </Card>
    </>
}

export function report_sale_congNo() {
    
    const khoangThoiGian = [dayjs().subtract(7, 'day'), dayjs()];
    const [datas, setDatas] = useState([]);

    function fetchData(dateRange: any) {
        axios.get(route('sale.report_congNo'), {
            params: {
                startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
                endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
            }
        })
            .then(response => {
                console.log('bbbbbb', response.data.data.dataCongNo);

                setDatas(response.data.data.dataCongNo);
            })
            .catch(error => {
                console.error('Error fetching dataDonHang:', error);
            });
    }

    React.useEffect(() => {
        fetchData(khoangThoiGian);
    }, []);
    
    const columns = [
        { title: 'Đối tượng', dataIndex: 'users_name', key: 'users_name' },
        { title: 'Tổng nợ', dataIndex: 'thanh_toan', key: 'thanh_toan', render: (v: number) => numberFormat(v) },
        { title: 'Đã thanh toán', dataIndex: 'da_thanh_toan', key: 'da_thanh_toan', render: (v: number) => numberFormat(v) },
        { title: 'Công nợ', key: 'cong_no', render: (_: any, r: any) => numberFormat(r.cong_no) },
    ];
    return (
        <div>
            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Biểu đồ công nợ" style={{ marginBottom: 16 }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datas} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="users_name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => numberFormat(value)} />
                                <Legend />
                                <Bar dataKey="cong_no" name="Công nợ" fill="#d11e06ff" />
                                <Bar dataKey="da_thanh_toan" name="Đã thanh toán" fill="#04be0dff" />
                                <Bar dataKey="thanh_toan" name="Tổng nợ" fill="#045fd4ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Bảng công nợ">
                        <Table
                            dataSource={datas}
                            columns={columns}
                            rowKey="ten"
                            pagination={false}
                            rowClassName={(_, idx) => (idx % 2 === 0 ? 'even-row' : 'odd-row')}
                            style={{ marginBottom: 16 }}
                        />
                    </Card>
                </Col>
            </Row>
            <style>{`
                .even-row { background: #fafafa; }
                .odd-row { background: #fff; }
            `}</style>
        </div>
    );
}