import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    Checkbox,
    Row,
    Space,
    notification,
    Divider,
    Tabs,
    Col, Radio, List
} from "antd";

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    PlusCircleOutlined,
    DeleteOutlined,
    MailFilled,
    PhoneFilled,
    SignatureFilled,
    CheckOutlined,
    MoneyCollectFilled,
    BookFilled,
    CloseCircleOutlined,
    EyeFilled,
    CheckCircleOutlined,
    FileTextFilled,
    BarsOutlined
} from "@ant-design/icons";

import "../../../../css/list02.css";

import { numberFormat } from "../../../Function/common";
import { cloneDeep } from "lodash";

export default function Dashboard(props) {
    const [formSearch] = Form.useForm();
    const [nghiLam, setNghiLam] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [users, setUsers] = useState(props.users.data);
    const [pidAction, setPidAction] = useState(0);
    const [isModalNgungKinhDoanhOpen, setIsModalNgungKinhDoanhOpen] = useState(0);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(0);
    const [loadingLichSuMuaHang, setLoadingLichSuMuaHang] = useState(false);
    const [lichSuMuaHang, setLichSuMuaHang] = useState([]);

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'khach_hang',
            key: 'khach_hang',
        },
        {
            title: 'Tiền thu',
            dataIndex: 'tien_thu',
            key: 'tien_thu',
        },
    ];


    function getLichSuMuaHang(id) {
        setLoadingLichSuMuaHang(true);
        axios.post(route("customer.lichSuMuaHang", [id]))
            .then((response) => {
                if (response.data.status_code === 200) {
                    const lichSuMuaHang_tmp = cloneDeep(lichSuMuaHang);
                    lichSuMuaHang_tmp[id] = response.data.data;
                    setLichSuMuaHang(lichSuMuaHang_tmp);
                    setLoadingLichSuMuaHang(false);
                } else {
                    message.error("Không lấy được thông tin dịch vụ");
                    setLoadingLichSuMuaHang(false);
                }
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            }
            );
    }

    const deleteItem = () => {
        setLoadingTable(true);
        axios.post(route("product.deleteUser"), { pid: pidAction })
            .then((response) => {
                // setLoadingTable(false);
                // setPidAction(0);
                message.success("Đã xóa");
                window.location.reload();
            })
            .catch((error) => {
                setLoadingTable(false);
                message.error("Cập nhật thất bại");
            }
            );
    }

    const expandedRowRender = (record) => {
        let banTrucTiep = <span className="text_success"><CheckCircleOutlined /> Cho phép bán trực tiếp</span>;
        if (record.ban_truc_tiep === 1) {
            banTrucTiep = <span className="text_warning"><CloseCircleOutlined /> Không bán trực tiếp</span>;
        }
        let data01 = [
            <p><b><SignatureFilled /> Mã: </b> {record.code}</p>,
            <p><b><PhoneFilled /> Chi nhánh: </b> {record.phone}, {record.chi_nhanh}</p>,
            <p><b><BookFilled /> Khách hàng: </b> {record.khach_hang}</p>,
            <p><b><MailFilled /> Hình thức thu: </b> </p>,
            <p><b><FileTextFilled /> Ghi chú: </b> </p>,
        ];

        let data02 = [
            <p><b><MoneyCollectFilled /> Tiền thu: </b> {numberFormat(record.tien_thu)}</p>,
            <p><b><MoneyCollectFilled /> Phí cà thẻ </b> {numberFormat(record.tien_con_lai)}</p>,
            <p><b><EyeFilled /> Trạng thái: </b> Đã thu</p>,
            <p><b><BookFilled /> Thời gian: </b> {record.created_at}</p>,
        ]



        if (record.product_type_id === 1) {
            data01.push(<p><b>Hoa hồng bán hàng: </b> {numberFormat(record.ck_nv_tu_van)} {record.is_ck_nv_tu_van_percen === 1 ? '%' : <sup>đ</sup>}</p>);
            data01.push(<p><b>Hoa hồng thực hiện: </b> {numberFormat(record.ck_nv_cham_soc)} {record.is_ck_nv_cham_soc_percen === 1 ? '%' : <sup>đ</sup>}</p>);
        }

        if (record.product_type_id === 2) {

        }

        const hhInfo = <Row>
            <Col sm={{ span: 24 }}>
                <h3 className="h3"><em>{record.code}</em> - {record.name}</h3>
            </Col>
            <Col sm={{ span: 12 }}>
                <List className="list01"
                    bordered
                    dataSource={data01}
                    renderItem={(item) => (
                        <List.Item>
                            {item}
                        </List.Item>
                    )}
                />
            </Col>
            <Col sm={{ span: 12 }}>
                <List className="list01"
                    bordered
                    dataSource={data02}
                    renderItem={(item) => (
                        <List.Item>
                            {item}
                        </List.Item>
                    )}
                />
            </Col>


            {record.mo_ta && record.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Mô Tả: </b>{record.mo_ta}</p></Col> : ''}

            {record.mo_ta && record.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Ghi chú:{record.ghi_chu}</b></p></Col> : ''}

            <Col sm={{ span: 24 }} >
                <Divider orientation="left">
                    <Space>
                        <Link href={route('product.edit', [record.id])}><Button className="_success"><CheckOutlined /> Cập nhật</Button></Link>
                        <Button onClick={() => { setIsModalXoaOpen(true); setPidAction(record.id); }}><DeleteOutlined /> Xóa</Button>
                    </Space>
                </Divider>

            </Col>
        </Row>

        const columnNguyenLieu = [
            {
                title: 'STT',
                dataIndex: 'stt',
                key: 'stt',
            },
            {
                title: 'Mã hàng hóa',
                dataIndex: 'product_code',
                key: 'product_code',
            },
            {
                title: 'Nguyên liệu tiêu hao',
                dataIndex: 'product_name',
                key: 'product_name',
            },
            {
                title: 'Số lượng',
                dataIndex: 'so_luong',
                key: 'so_luong',
                // render: () => <div><Badge status="success" text="Finished" /></div>,
            }
        ];

        const columnLichSuMuaHang = [
            {
                title: 'STT',
                dataIndex: 'stt',
                key: 'stt',
            },
            {
                title: 'Mã hóa đơn',
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: 'Tổng',
                dataIndex: 'tong_tien',
                key: 'tong_tien',
            },
            {
                title: 'Trừ thẻ',
                dataIndex: 'tien_tru_the',
                key: 'tien_tru_the',
            },
            {
                title: 'Thanh toán',
                dataIndex: 'thanh_toan',
                key: 'thanh_toan',
            },
            {
                title: 'Thời gian',
                dataIndex: 'created_at',
                key: 'created_at',
            }
        ];

        let item = [
            {
                label: 'Thông tin', //hh/dv
                key: '1',
                children: hhInfo,
            },
            {
                label: <span onClick={() => { getLichSuMuaHang(record.id) }}>Lịch sử </span>, // dv
                key: '3',
                children: <Table
                    loading={loadingLichSuMuaHang}
                    columns={columnLichSuMuaHang}
                    dataSource={lichSuMuaHang[record.id]}
                />,
            }
        ]


        return <div>
            <Tabs
                defaultActiveKey="1"
                items={item}
            />
        </div>
    };

    const handleCancel = () => {
        setIsModalNgungKinhDoanhOpen(false);
    }
    const handleCancelDelete = () => {
        setIsModalXoaOpen(false);
    }

    const search = () => {
        // const values = formSearch.getFieldsValue();
        // console.log('values', values);
        formSearch.submit();
    }

    const onFinishSearch = (values) => {
        console.log('vaa', values);
        setLoadingTable(true);
        axios.post(route("product.search"), values)
            .then((response) => {
                console.log('response.data.data', response.data.data.data);

                if (response.data.status_code === 200) {
                    setProducts(response.data.data.data);
                    setLoadingTable(false);
                } else {
                    message.error("Không lấy được thông tin dịch vụ");
                    setLoadingTable(false);
                }
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            }
            );
    }

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={props.tables}
                current={props.table}
                content={
                    <div>
                        <Modal title="Xác nhận nghỉ làm"
                            open={isModalNgungKinhDoanhOpen}
                            onOk={nghiLam}
                            okText="Nghỉ làm"
                            cancelText="Hủy"
                            onCancel={handleCancel}>
                            <p>Các hàng hóa ngừng kinh doanh sẽ không hiển thị ở danh sách hàng hóa nữa. Bạn có thể xem lại ở phần
                                <em>hàng hóa ngừng kinh doanh</em>.</p>

                        </Modal>
                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            onOk={deleteItem}
                            okText="Đồng ý xóa"
                            cancelText="Hủy"
                            onCancel={handleCancelDelete}>
                            <p>Các thông tin về hàng hóa này sẽ bị xóa hoàn toàn</p>
                        </Modal>

                        {/* <div style={{ marginBottom: 16 }}>
                                <em>
                                    {" "}
                                    Trang {props.pageConfig.currentPage}, hiển thị{" "}
                                    {props.pageConfig.count}/{props.pageConfig.total}
                                </em>
                            </div> */}


                        <Row>
                            <Col sm={{ span: 24 }}>
                                <Link href={route('product.add')}>
                                    <Button type="primary" className="_right">
                                        <PlusCircleOutlined />Thêm mới
                                    </Button>
                                </Link>
                            </Col>

                            <Col sm={{ span: 24 }}>
                                <br />
                            </Col>

                            <Col sm={{ span: 4 }}>
                                <Form
                                    name="basic"
                                    layout="vertical"
                                    onFinish={onFinishSearch}
                                    // onFinishFailed={onFinishSearchFailed}
                                    autoComplete="off"
                                    form={formSearch}
                                    // initialValues={initialValueSearch()}
                                    // initialValues={props.searchData}
                                >
                                    <Row gutter={24} className="main-search-left">

                                        <Col sm={{ span: 24 }} className='item-search' onBlur={search}>
                                            <Form.Item name='keyword' label='Từ khoá'>
                                                <Input />
                                            </Form.Item>
                                        </Col>

                                        {/* Nhóm hàng */}
                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='customer_group_id'
                                                label={<span>Nhóm <a target="new" href={route('data.tblName', ['customer_group'])}><BarsOutlined /></a></span>}>
                                                <Checkbox.Group onChange={search}
                                                    className="list-checkbox01"
                                                    options={props.customerGroup.map((u) => {
                                                        return {
                                                            value: u.id,
                                                            label: u.name,
                                                            data: u,
                                                        }
                                                    })
                                                    }
                                                />

                                            </Form.Item>
                                        </Col>

                                        {/* Thương hiệu */}
                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='gioi_tinh_id'
                                                label={<div>Giới tính <a target="new" href={route('data.tblName', ['gioi_tinh'])}><BarsOutlined /></a></div>}>
                                                <Checkbox.Group onChange={search}
                                                    options={props.gioiTinh.map((u) => {
                                                        return {
                                                            value: u.id,
                                                            label: u.name,
                                                            data: u,
                                                        }
                                                    })
                                                    }
                                                />

                                            </Form.Item>
                                        </Col>

                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='is_recycle_bin' label='Trạng thái'>
                                                <Radio.Group
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8,
                                                    }}
                                                    onChange={search}
                                                    defaultValue={0}
                                                    options={[
                                                        { value: 0, label: 'Đang Hoạt động' },
                                                        { value: 1, label: 'Ngừng hoạt động' },
                                                        { value: 2, label: 'Đã xóa' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>

                                    </Row>
                                </Form>
                            </Col>
                            <Col sm={{ span: 20 }}>
                                <Table
                                    rowClassName={(_, index) =>
                                        index % 2 === 0 ? "even-row" : "odd-row"
                                    }
                                    columns={columns}
                                    loading={loadingTable}
                                    expandable={{
                                        expandedRowRender,
                                        defaultExpandedRowKeys: ['1'],
                                    }}
                                    dataSource={users}
                                    pagination={{ pageSize: 17 }}
                                />
                            </Col>
                        </Row>

                    </div>
                }
            />
        </div>
    );
}
