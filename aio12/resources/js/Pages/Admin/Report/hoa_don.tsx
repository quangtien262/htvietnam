import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Table,
    Form,
    Input,
    Row,
    Col,
    Radio 
} from "antd";
import { router } from "@inertiajs/react";
import "../../../../css/list02.css";
import { numberFormat } from "../../../Function/common";

export default function Dashboard(props) {
    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [hoaDon, setHoaDon] = useState(props.hoaDon.data);
    function initialValueSearch() {
        return [];
    }
    const expandDataSource = Array.from({
        length: 3,
    }).map((_, i) => ({
        key: i.toString(),
        date: '2014-12-24 23:12:00',
        name: 'Hàng hóa ' +i,
        upgradeNum: 'Upgraded: 56',
    }));

    const expandColumns = [
        {
            title: 'Mã',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Tên hàng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'SL',
            key: 'state',
            render: () => 1,
            // render: () => <div><Badge status="success" text="Finished" /></div>,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'don_gia',
            key: 'don_gia',
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
        },
        {
            title: 'Thành tiền',
            dataIndex: 'thanh_tien',
            key: 'thanh_tien',
        },
        // {
        //     title: 'Action',
        //     key: 'operation',
        //     render: () => (
        //         <Space size="middle">
        //             <Dropdown
        //                 menu={{
        //                     items,
        //                 }}
        //             >
        //                 <a>
        //                     More <DownOutlined />
        //                 </a>
        //             </Dropdown>
        //         </Space>
        //     ),
        // },
    ];

    const columns = [
        {
            title: 'Thời gian',
            // dataIndex: 'updated_at',
            key: 'name',
            render: (record) => <span>{record.created_at}</span>,
        },
        {
            title: 'Doanh Thu',
            key: 'doanh_thu',
            render: (record) => <span>{numberFormat(record.TongChiPhi)}</span>,
        },
        {
            title: 'CK tư vấn bán',
            key: 'version',
            render: (record) => <span>{record.chiet_khau_nv_tu_van}</span>,
        },
        {
            title: 'CK NV làm dv',
            key: 'version',
            render: (record) => <span>{record.chiet_khau_nv_thuc_hien}</span>,
        }
    ];

    const expandedRowRender = () => (
        <div><Table columns={expandColumns} dataSource={expandDataSource} pagination={false} /></div>
    );
    console.log(props.hoaDon);
    
    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={props.tables}
                current={props.table}
                content={
                    <div>
                        <Form form={form} component={false}>
                            <div style={{ marginBottom: 16 }}>
                                {/* <em>
                                    {" "}
                                    Trang {props.pageConfig.currentPage}, hiển thị{" "}
                                    {props.pageConfig.count}/{props.pageConfig.total}
                                </em> */}
                            </div>

                            <hr />
                            <br />

                            <Row>
                                <Col sm={{ span: 3 }}>
                                    <Form
                                        name="basic"
                                        layout="vertical"
                                        // onFinish={onFinishSearch}
                                        // onFinishFailed={onFinishSearchFailed}
                                        autoComplete="off"
                                        form={formSearch}
                                        initialValues={initialValueSearch()}
                                        // initialValues={props.searchData}
                                    >
                                        <Row gutter={24} className="main-search-left">

                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='sm_keyword' label='Từ khoá'>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='sm_keyword' label='Chi nhánh'>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='sm_keyword' label='Thời gian'>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }} className='item-search'>
                                                <Form.Item name='sm_keyword' label='Trạng thái'>
                                                <Radio.Group
                                                    style={{ display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8,}}
                                                    // onChange={onChange}
                                                    // value={value}
                                                    options={[
                                                        { value: 1, label: 'Hoàn thành' },
                                                        { value: 2, label: 'Đã hủy' },
                                                    ]}
                                                    />
                                                </Form.Item>
                                            </Col>

                                        </Row>
                                    </Form>
                                </Col>
                                <Col sm={{ span: 21 }}>
                                    <Table
                                        columns={columns}
                                        expandable={{
                                            expandedRowRender,
                                            defaultExpandedRowKeys: ['0'],
                                        }}
                                        dataSource={hoaDon}
                                    />
                                </Col>
                            </Row>
                        </Form>
                    </div>
                }
            />
        </div>
    );
}
