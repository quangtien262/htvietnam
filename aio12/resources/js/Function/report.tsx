import React, { useState, useEffect } from "react";
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
import { c } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

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

export function report_kho_nhapHang(dateRange: any) {
    // start là 
    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
    const [data, setData] = useState([]);
    const [totalByMonth, setTotalByMonth] = useState([]);
    const columns = [
        { title: "Ngày nhập", dataIndex: "created_at", key: "created_at", render: (text) => dayjs(text).format('DD/MM/YYYY') },
        { title: "Tên hàng", dataIndex: "product_name", key: "product_name" },
        { title: "Số lượng", dataIndex: "so_luong", key: "so_luong" },
        { title: "Giá nhập", dataIndex: "gia_nhap", key: "gia_nhap", render: (price: number) => numberFormat(price) },
        { title: "Thành tiền", dataIndex: "thanh_tien", key: "thanh_tien", render: (thanh_tien: number) => numberFormat(thanh_tien) },

    ];
    function fetchDataNhapHang(dateRange: any) {
        axios.get(route('khoHang.api.nhapHang', {
            startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
            endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
        })).then((res) => {
            console.log('res.data.data', res.data.data);
            setData(res.data.data.data);
            setTotalByMonth(res.data.data.totalByMonth);
        });
    }

    useEffect(() => {
        fetchDataNhapHang(khoangThoiGian);
    }, []);

    return <div style={{ padding: 20 }} className='content-home'>
        <Row>
            <Col span={24} className="mb-4">
                {searchByTime(khoangThoiGian, (data: any) => {
                    fetchDataNhapHang(data.time);
                })}
            </Col>
        </Row>


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
                <BarChart data={totalByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name, info) => {
                        return <>
                            {numberFormat(info.payload.thanh_tien)}
                            <p>Số lượng: {info.payload.so_luong}</p>
                        </>;
                    }} />
                    <Legend />
                    <Bar dataKey="thanh_tien" fill="#01327aff" name="Tổng tiền" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
}

export function report_kho_tongQuan() {
    const [summary, setSummary] = useState({
        totalProduct: 0,
        totalStock: 0,
        totalImport: 0,
        totalExport: 0,
    });
    const [loaiHangHoa, setLoaiHangHoa] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(route('khoHang.api.tongQuan')).then((res) => {
            console.log('res.res.data.data.loaiHangHoa', res.data.data.loaiHangHoa);
            
            setSummary(res.data.data.summary);
            setChartData(res.data.data.chartData);
            setTopProducts(res.data.data.topProducts);
            setLoaiHangHoa(res.data.data.loaiHangHoa);
            setLoading(false);
        });
    }, []);

    const COLORS = ["#05b405ff", "#FF8042", "#0427b1ff", "#c90a3dff"];


    return (
        <Spin spinning={loading}>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng sản phẩm" value={summary.totalProduct} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng tồn kho" value={summary.totalStock} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng nhập kho" value={summary.totalImport} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng xuất kho" value={summary.totalExport} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={16}>
                    <Card title="Biểu đồ nhập/xuất kho theo tháng trong năm">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="import" fill="#82ca9d" name="Nhập kho" />
                                <Bar dataKey="export" fill="#8884d8" name="Xuất kho" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Biểu đồ nhập/xuất kho theo tháng trong năm">
                        <div className='sub-item-home'>
                            <h3>
                                <MonitorOutlined />
                                Báo cáo theo loại hàng hóa
                            </h3>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={loaiHangHoa}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={140}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label
                                >
                                    {loaiHangHoa.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Top sản phẩm tồn kho cao nhất">
                        <Table
                            columns={[
                                { title: "Mã sản phẩm", dataIndex: "code", key: "code" },
                                { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
                                { title: "Tồn kho", dataIndex: "ton_kho", key: "ton_kho" },
                            ]}
                            dataSource={topProducts}
                            size="small"
                            pagination={false}
                            rowKey="code"
                        />
                    </Card>
                </Col>
            </Row>
        </Spin>
    );
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
    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
    const [data, setData] = useState([]);

    function fetchData(dateRange: any) {
        axios.get(route('khoHang.api.kiemKho', {
            startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
            endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
        })).then((res) => {
            console.log('kiemKho', res.data.data);
            setData(res.data.data);
        });
    }

    useEffect(() => {
        fetchData(khoangThoiGian);
    }, []);

    return <div className="content-home">
        <Row>
            <Col span={24} className="mb-4">
                {searchByTime(khoangThoiGian, (data: any) => {
                    fetchData(data.time);
                })}
            </Col>
        </Row>
        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Biểu đồ thống kê
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ton_kho" fill="#8884d8" name="Tồn hệ thống" />
                    <Bar dataKey="thuc_te" fill="#05b405ff" name="Tồn thực tế" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Sản phẩm tồn kho
            </h3>
            <Table
                columns={[
                    {
                        title: "Mã SP",
                        dataIndex: "product_code",
                        key: "product_code",
                        align: "center"
                    },
                    {
                        title: "Tên sản phẩm",
                        dataIndex: "product_name",
                        key: "product_name"
                    },
                    {
                        title: "Tồn hệ thống",
                        dataIndex: "ton_kho",
                        key: "ton_kho",
                        align: "center"
                    },
                    {
                        title: "Tồn thực tế",
                        dataIndex: "thuc_te",
                        key: "thuc_te",
                        align: "center"
                    },
                    {
                        title: "Chênh lệch",
                        dataIndex: "so_luong_lech",
                        key: "so_luong_lech",
                        align: "center",
                        render: (diff) => (
                            <Tag color={diff > 0 ? "green" : diff < 0 ? "red" : "blue"}>
                                {diff}
                            </Tag>
                        )
                    }
                ]}
                dataSource={data}
                rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
            />
        </div>

    </div>
}

export function report_kho_congNo() {
    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
    const columns = [
        { title: "Mã công nợ", dataIndex: "code", key: "code" },
        { title: "Tên đối tác", dataIndex: "name", key: "name" },
        { title: "Công nợ", dataIndex: "so_tien_no", key: "so_tien_no" },
        { title: "Đã thanh toán", dataIndex: "so_tien_da_thanh_toan", key: "so_tien_da_thanh_toan" },
        { title: "Ngày giao dịch gần nhất", dataIndex: "updated_at", key: "updated_at" },
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

    const [congNo, setCongNo] = useState([]);
    const [tongCongNo, setTongCongNo] = useState([]);
    function fetchData(dateRange: any) {
        axios.get(route('khoHang.api.congNo', {
            startDate: dayjs(dateRange[0]).format('YYYY-MM-DD 00:00:00'),
            endDate: dayjs(dateRange[1]).format('YYYY-MM-DD 23:59:59'),
        })).then((res) => {
            setCongNo(res.data.data.congNo);
            setTongCongNo(res.data.data.tongCongNo);
        });
    }
    useEffect(() => {
        fetchData(khoangThoiGian);
    }, []);

    const COLORS = ["#05b405ff", "#FF8042"];
    return <div style={{ padding: 20 }} className='content-home'>
        <Row>
            <Col span={24} className="mb-4">
                {searchByTime(khoangThoiGian, (data: any) => {
                    fetchData(data.time);
                })}
            </Col>
        </Row>

        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Báo cáo chi tiết công nợ
            </h3>
            <Table columns={columns} dataSource={congNo} bordered pagination={false} />
        </div>

        <div className='sub-item-home'>
            <h3>
                <MonitorOutlined />
                Báo cáo theo tổng công nợ
            </h3>
            <PieChart width={400} height={400}>
                <Pie
                    data={tongCongNo}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={3}
                    dataKey="value"
                    label
                >
                    {tongCongNo.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
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

        <Row>
            <Col span={24} className="mb-4">
                <br /><br /><br /><br /><br />
            </Col>
        </Row>
    </div>
}

export function report_DoanhThu() {

    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];

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
    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
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
    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
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
    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
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
    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
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

    const khoangThoiGian = [dayjs().subtract(30, 'day'), dayjs()];
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