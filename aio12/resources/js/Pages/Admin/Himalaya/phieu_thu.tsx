import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Table,
    Tag,
} from "antd";
import { router } from "@inertiajs/react";
import "../../../../css/list.css";
import {  numberFormat } from "../../../Function/common";

export default function Dashboard(props) {



    function contentPhieuThuChiTiet(data) {
        let result = [];
        let idx = 0;
        data.id.phieu_thu.map((val) => {
            idx++;
            // console.log('val', );
            result.push(<tr key={idx}>
                <td><a>{props.tenChungTu[val.LoaiCT]}</a></td>
                <td>{val.TienMat}</td>
                <td>{numberFormat(val.TienGui)}</td>
                <td>{val.TienThu}</td>
                <td>{val.ma_khach_hang} - {val.ten_khach_hang}</td>
                <td>{val.ChiPhiNganHang}</td>
                <td>{val.GhiChu}</td>
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
                        if(col.key === 'id') {
                            return <div key={col.key}>{record.id.id}</div>
                        }

                        if(col.key === 'phieu_thu') {
                            return <div key={col.key}>
                                        <ul className="ul01">
                                            <li><b>Số:</b>{record.code}</li>
                                            <li><b>ĐV:</b>{record.UserLap}</li>
                                            <li><em>{record.thoi_gian}</em></li>
                                        </ul>
                                    </div>
                        }
                        
                        if(col.key === 'khach_hang') {
                            return <div key={col.key}>
                                        <ul className="ul01">
                                            <li><b>ĐV:</b></li>
                                        </ul>
                                    </div>
                        }
                        

                        if(col.key === 'money') {
                            return <div key={col.key}><b>{numberFormat(record.so_tien)}</b></div>
                        }

                        if(col.key === 'note') {
                            return <div key={col.key}>{record.description}</div>
                        }

                        if(col.key === 'detail') {
                            return <div key={col.key}>
                                        <table className="sub-table">
                                            <thead>
                                                <tr>
                                                    <th>Loại</th>
                                                    <th>Tiền mặt</th>
                                                    <th>Tiền gửi</th>
                                                    <th>Tiền thu</th>
                                                    <th>Khách hàng</th>
                                                    <th>Phí ngân hàng</th>
                                                    <th>Ghi chú</th>
                                                </tr>

                                                { contentPhieuThuChiTiet(record) }
                                                
                                            </thead>
                                        </table>
                                    </div>
                        }
                        
                    },
                }
            });
        return result;
    }
    

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
                        dataSource={props.phieuThu.data}
                        columns={configColumnData()}
                        // rowSelection={rowSelection}
                        rowClassName="editable-row"
                        className="table-index"
                    />
                }
            />
        </div>
    );
}
