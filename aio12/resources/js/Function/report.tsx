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

export function report_DoanhThu(props) {

    const [dataDoanhThu, setDataDoanhThu] = useState([]);


    // const dataDoanhThu = [
    //     { date: '2025-09-01', revenue: 12000000 },
    //     { date: '2025-09-02', revenue: 15000000 },
    //     { date: '2025-09-03', revenue: 9000000 },
    //     { date: '2025-09-04', revenue: 18000000 },
    //     { date: '2025-09-05', revenue: 21000000 },
    //     { date: '2025-09-06', revenue: 17000000 },
    //     { date: '2025-09-07', revenue: 11000000 },
    // ];

    // call api to get dataDoanhThu vaf setDataDoanhThu
    React.useEffect(() => {
        axios.get(route('sale.report_doanhThu'))
            .then(response => {
                setDataDoanhThu(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching dataDoanhThu:', error);
            });
    }, []);

    const columnsDoanhThu = [
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        {
            title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue',
            render: (val: number) => val.toLocaleString() + ' đ'
        },
    ];
    return (
        <>
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card className="rounded-2xl shadow-md p-4">
                        <Statistic title="Tổng doanh thu" value={props.doanhThu} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card className="rounded-2xl shadow-md p-4">
                        <Statistic title="Tổng đơn hàng" value={props.slDonHangMoi} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card className="rounded-2xl shadow-md p-4">
                        <Statistic title="Khách hàng mới" value={props.slKhachHangMoi} />
                    </Card>
                </Col>
            </Row>
            <Card className="rounded-2xl shadow-md p-4 mb-4">
                <h3 className="text-lg font-medium mb-3">Biểu đồ doanh thu 7 ngày gần nhất</h3>
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
                <h3 className="text-lg font-medium mb-3">Bảng doanh thu 7 ngày gần nhất</h3>
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

export function report_DonHang(props) {
    return <>

        <Card className="rounded-2xl shadow-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-3">Biểu đồ số lượng đơn hàng theo ngày</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                    { date: '2025-09-07', orders: 12 },
                    { date: '2025-09-06', orders: 9 },
                    { date: '2025-09-05', orders: 7 },
                    { date: '2025-09-04', orders: 10 },
                    { date: '2025-09-03', orders: 8 },
                    { date: '2025-09-02', orders: 11 },
                    { date: '2025-09-01', orders: 6 },
                ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <h3 className="text-lg font-medium mb-3">Bảng đơn hàng 7 ngày gần nhất</h3>
            <Table
                columns={[
                    { title: 'Mã đơn', dataIndex: 'orderCode', key: 'orderCode' },
                    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
                    { title: 'Ngày', dataIndex: 'date', key: 'date' },
                    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: (val: number) => val.toLocaleString() + ' đ' },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
                ]}
                dataSource={[
                    { orderCode: 'HD001', customer: 'Nguyễn Văn A', date: '2025-09-07', total: 1200000, status: <Tag color="green">Hoàn thành</Tag> },
                    { orderCode: 'HD002', customer: 'Trần Thị B', date: '2025-09-07', total: 950000, status: <Tag color="orange">Đang xử lý</Tag> },
                    { orderCode: 'HD003', customer: 'Lê Văn C', date: '2025-09-06', total: 2100000, status: <Tag color="green">Hoàn thành</Tag> },
                    { orderCode: 'HD004', customer: 'Phạm Thị D', date: '2025-09-06', total: 1750000, status: <Tag color="red">Đã hủy</Tag> },
                    { orderCode: 'HD005', customer: 'Ngô Văn E', date: '2025-09-05', total: 800000, status: <Tag color="green">Hoàn thành</Tag> },
                    { orderCode: 'HD006', customer: 'Đỗ Thị F', date: '2025-09-05', total: 1350000, status: <Tag color="green">Hoàn thành</Tag> },
                    { orderCode: 'HD007', customer: 'Bùi Văn G', date: '2025-09-04', total: 1100000, status: <Tag color="orange">Đang xử lý</Tag> },
                ]}
                pagination={false}
                rowKey="orderCode"
                rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
        </Card>
    </>
}

export function report_sales_KhachHang(props) {
    return <>
        <Card className="rounded-2xl shadow-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-3">Biểu đồ số lượng mua theo khách hàng</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                    { name: 'Nguyễn Văn A', orders: 5 },
                    { name: 'Trần Thị B', orders: 3 },
                    { name: 'Lê Văn C', orders: 4 },
                    { name: 'Phạm Thị D', orders: 2 },
                    { name: 'Ngô Văn E', orders: 6 },
                    { name: 'Đỗ Thị F', orders: 1 },
                    { name: 'Bùi Văn G', orders: 2 },
                ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={value => value + ' đơn'} />
                    <Legend />
                    <Bar dataKey="orders" fill="#8884d8" name="Số đơn hàng" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card className="rounded-2xl shadow-md p-4">
            <h3 className="text-lg font-medium mb-3">Bảng khách hàng mua hàng gần nhất</h3>
            <Table
                columns={[
                    { title: 'Khách hàng', dataIndex: 'name', key: 'name' },
                    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
                    { title: 'Số đơn hàng', dataIndex: 'orders', key: 'orders' },
                    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: (val: number) => val.toLocaleString() + ' đ' },
                    { title: 'Hạng', dataIndex: 'rank', key: 'rank', render: (val: string) => <Tag color={val === 'VIP' ? 'gold' : 'blue'}>{val}</Tag> },
                ]}
                dataSource={[
                    { name: 'Nguyễn Văn A', phone: '0901234567', orders: 5, total: 12000000, rank: 'VIP' },
                    { name: 'Trần Thị B', phone: '0912345678', orders: 3, total: 9500000, rank: 'Thường' },
                    { name: 'Lê Văn C', phone: '0923456789', orders: 4, total: 10500000, rank: 'VIP' },
                    { name: 'Phạm Thị D', phone: '0934567890', orders: 2, total: 5000000, rank: 'Thường' },
                    { name: 'Ngô Văn E', phone: '0945678901', orders: 6, total: 15000000, rank: 'VIP' },
                    { name: 'Đỗ Thị F', phone: '0956789012', orders: 1, total: 2000000, rank: 'Thường' },
                    { name: 'Bùi Văn G', phone: '0967890123', orders: 2, total: 3500000, rank: 'Thường' },
                ]}
                pagination={false}
                rowKey="name"
                rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
        </Card>
    </>
}

export function report_sales_NhanVien(props) {
    return <>
        <Card className="rounded-2xl shadow-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-3">Biểu đồ doanh số theo nhân viên</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                    { name: 'Nguyễn Văn NV1', sales: 15 },
                    { name: 'Trần Thị NV2', sales: 10 },
                    { name: 'Lê Văn NV3', sales: 12 },
                    { name: 'Phạm Thị NV4', sales: 8 },
                    { name: 'Ngô Văn NV5', sales: 18 },
                    { name: 'Đỗ Thị NV6', sales: 7 },
                    { name: 'Bùi Văn NV7', sales: 9 },
                ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={value => value + ' đơn'} />
                    <Legend />
                    <Bar dataKey="sales" fill="#82ca9d" name="Số đơn bán" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card className="rounded-2xl shadow-md p-4">
            <h3 className="text-lg font-medium mb-3">Bảng doanh số nhân viên</h3>
            <Table
                columns={[
                    { title: 'Nhân viên', dataIndex: 'name', key: 'name' },
                    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
                    { title: 'Số đơn bán', dataIndex: 'sales', key: 'sales' },
                    { title: 'Tổng doanh thu', dataIndex: 'total', key: 'total', render: (val: number) => val.toLocaleString() + ' đ' },
                    { title: 'Xếp hạng', dataIndex: 'rank', key: 'rank', render: (val: string) => <Tag color={val === 'Xuất sắc' ? 'gold' : val === 'Khá' ? 'blue' : 'default'}>{val}</Tag> },
                ]}
                dataSource={[
                    { name: 'Nguyễn Văn NV1', phone: '0901111111', sales: 15, total: 25000000, rank: 'Xuất sắc' },
                    { name: 'Trần Thị NV2', phone: '0902222222', sales: 10, total: 17000000, rank: 'Khá' },
                    { name: 'Lê Văn NV3', phone: '0903333333', sales: 12, total: 19500000, rank: 'Khá' },
                    { name: 'Phạm Thị NV4', phone: '0904444444', sales: 8, total: 12000000, rank: 'Trung bình' },
                    { name: 'Ngô Văn NV5', phone: '0905555555', sales: 18, total: 30000000, rank: 'Xuất sắc' },
                    { name: 'Đỗ Thị NV6', phone: '0906666666', sales: 7, total: 11000000, rank: 'Trung bình' },
                    { name: 'Bùi Văn NV7', phone: '0907777777', sales: 9, total: 14000000, rank: 'Trung bình' },
                ]}
                pagination={false}
                rowKey="name"
                rowClassName={(_, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
        </Card>
    </>
}

export function report_sale_congNo() {
    // Dữ liệu mẫu công nợ
    const dataCongNo = [
        { ten: 'Công ty A', no: 12000000, co: 8000000 },
        { ten: 'Công ty B', no: 5000000, co: 2000000 },
        { ten: 'Công ty C', no: 9000000, co: 10000000 },
        { ten: 'Công ty D', no: 3000000, co: 0 },
        { ten: 'Công ty E', no: 0, co: 4000000 },
    ];
    const columns = [
        { title: 'Đối tượng', dataIndex: 'ten', key: 'ten' },
        { title: 'Nợ', dataIndex: 'no', key: 'no', render: (v: number) => v.toLocaleString() },
        { title: 'Có', dataIndex: 'co', key: 'co', render: (v: number) => v.toLocaleString() },
        { title: 'Công nợ', key: 'congno', render: (_: any, r: any) => (r.no - r.co).toLocaleString() },
    ];
    return (
        <div>
            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Biểu đồ công nợ" style={{ marginBottom: 16 }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dataCongNo} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ten" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                <Legend />
                                <Bar dataKey="no" name="Nợ" fill="#f5222d" />
                                <Bar dataKey="co" name="Có" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Bảng công nợ">
                        <Table
                            dataSource={dataCongNo}
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