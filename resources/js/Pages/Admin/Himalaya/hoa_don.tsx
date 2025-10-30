import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Typography,
    Select,
    Row,
    Space,
    Tag,
    Card,
    Descriptions,
    notification,
    Divider,
    Image,
    Col,
    Breadcrumb,
} from "antd";

import { Link, router } from "@inertiajs/react";
import {HomeOutlined, FileDoneOutlined } from "@ant-design/icons";
import "../../../../css/form.css";
import { numberFormat } from "../../../Function/common";

export default function Dashboard(props) {
    const [api, contextHolder] = notification.useNotification();

    const Context = React.createContext({
        name: "Default",
    });

    function nvTuVan(nv) {
        let nvTuVan = [];
        if(nv.nvTuVan) {
            nv.nvTuVan.forEach((n) => {
                
                console.log('nnnn', n);
                nvTuVan.push(<Tag bordered={false} color="cyan">{n.ho_ten}({numberFormat(n.TienChietKhau)}<sup>đ</sup>)</Tag>);
            });
        }
        return nvTuVan;
    }

    // NV thực hiện
    function nvThucHien(nv) {
        let nvThucHien = [];
        if(nv.nvThucHien) {
            nv.nvThucHien.forEach((n) => {
                nvThucHien.push(<Tag bordered={false} color="processing">{n.ho_ten}({numberFormat(n.TienChietKhau)}<sup>đ</sup>)</Tag>);
            });
        }
        return nvThucHien;
    }

    function contentHoaDonChiTiet(data) {
        let result = [];
        let idx = 0;
        data.hoa_don_chi_tiet.map((val) => {
            // console.log('val', val);
            
            idx++;
            result.push(<tr key={idx}>
                <td>{val.hoa_don.ten_san_pham}</td>
                <td>{numberFormat(val.hoa_don.thanh_tien)}</td>
                <td>{val.hoa_don.so_luong}</td>
                <td>{val.hoa_don.vat}</td>
                <td>{numberFormat(val.hoa_don.thanh_toan)}</td>
                <td>{ nvTuVan(val) }</td>
                <td>{ nvThucHien(val) }</td>
                <td>{val.hoa_don.ghi_chu}</td>
            </tr>) 
        });

        return result;
    }

    function configColumnData() {
        let result = props.columns
            .map((col) => {
                return {
                    title: col.title,
                    dataIndex: col.dataIndex,
                    key: col.key,
                    render: (_, record) => {
                        // console.log(record);
                        if(col.key === 'id') {
                            return <div key={col.key}>{record.id}</div>
                        }
                        
                        if(col.key === 'hoa_don') {
                            return <div key={col.key}>
                                        <ul className="ul01">
                                            <li><b>ĐV:</b>{record.UserLap}</li>
                                            <li><b>Mã:</b>{record.code}</li>
                                            <li><b>NV:</b>{record.UserNhap}</li>
                                            <li><em>{record.NgayVaoSo}</em></li>
                                        </ul>
                                    </div>
                        }
                        if(col.key === 'khach_hang') {
                            return <div key={col.key}>
                                        <ul className="ul01">
                                            <li>{record.ma_khach_hang}</li>
                                            <li><b>{record.ten_khach_hang}</b></li>
                                            <li><em>{record.phone}</em></li>
                                            <li><em>{record.phone02}</em></li>
                                        </ul>
                                    </div>
                        }

                        if(col.key === 'thanh_tien') {
                            return <div key={col.key}>
                                        <ul className="ul01">
                                            <li><b>Tổng tiền:</b>{record.tong_tien}</li>
                                            <li><b>chiết khấu:</b>{record.code}</li>
                                            <li><b>VAT:</b>{record.vat_money}</li>
                                            <li><b>Phí ngân hàng:</b> 0</li>
                                            <li><b>Phải thanh toán:</b>{record.thanh_toan}</li>
                                        </ul>
                                    </div>
                        }
                        

                        if(col.key === 'note') {
                            return <div key={col.key}>{record.note}</div>
                        }

                        if(col.key === 'chi_tiet_don_hang') {
                            return <div key={col.key}>
                                        <table className="sub-table">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>Giá</th>
                                                    <th>SL</th>
                                                    <th>VAT</th>
                                                    <th>Thanh Toán</th>
                                                    <th>NV tư vấn</th>
                                                    <th>NV thực hiện</th>
                                                    <th>Ghi chú</th>
                                                </tr>

                                                { contentHoaDonChiTiet(record) }
                                                
                                            </thead>
                                        </table>
                                    </div>
                        }
                        
                    },
                }
            });
        return result;
    }

    // console.log(props.hoaDon.data);
    
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: props.pageConfig.currentPage,
            pageSize: props.pageConfig.perPage,
            position: ["bottonRight"],
            total: props.pageConfig.total,
            onChange: (page, pageSize) => setPagination({ page, pageSize }),
        },
    });

    function setPagination(pagination) {
        router.get(
            route("hima.hoaDon"),
            pagination
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
                        <Col span={24}>
                            <Breadcrumb
                                items={[
                                {
                                    href: '',
                                    title: (
                                        <>
                                            <HomeOutlined />
                                            <span>Trang chủ</span>
                                        </>
                                    ),
                                    
                                },
                                {
                                    href: '',
                                    title: (
                                        <>
                                            <FileDoneOutlined />
                                            <span>Báo cáo thu</span>
                                        </>
                                    ),
                                },
                                ]}
                            />
                            <hr/>
                        </Col>


                        <Table
                            size="small"
                            // scroll={{ x: 1500, y: 7000 }}
                            // components={{
                            //     body: {
                            //         cell: EditableCell,
                            //     },
                            // }}
                            // loading={loadingTable}
                            pagination={tableParams.pagination}
                            // dataSource={formatData(dataSource)}
                            dataSource={props.hoaDon}
                            columns={configColumnData()}
                            // rowSelection={rowSelection}
                            rowClassName="editable-row"
                            className="table-index"
                        />
                    </div>
                }
            />
        </div>
    );
}
