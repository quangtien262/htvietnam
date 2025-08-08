import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Table,
    message,
    Modal,
    Tag,
} from "antd";

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    DeleteOutlined
} from "@ant-design/icons";
import "../../../../css/list.css";
import { numberFormat } from "../../../Function/common";

export default function Dashboard(props) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);

    const Context = React.createContext({
        name: "Default",
    });

    function nvTuVan(nv) {
        let nvTuVan = [];
        if (nv.nvTuVan) {
            nv.nvTuVan.forEach((n) => {

                nvTuVan.push(<Tag key={n.id} bordered={false} color="cyan">{n.ho_ten} {n.id}</Tag>);
            });
        }
        return nvTuVan;
    }

    // NV thực hiện
    function nvThucHien(nv) {
        let nvThucHien = [];
        if (nv.nvThucHien) {
            nv.nvThucHien.forEach((n) => {
                nvThucHien.push(<Tag bordered={false} color="processing">{n.ho_ten}</Tag>);
            });
        }
        return nvThucHien;
    }

    function contentHoaDonChiTiet(data) {
        let result = [];
        let idx = 0;
        data.hoa_don_chi_tiet.map((val) => {

            idx++;
            result.push(<tr key={idx}>
                <td>{val.hoa_don.ten_san_pham}</td>
                <td>{numberFormat(val.hoa_don.thanh_tien)}</td>
                <td>{val.hoa_don.so_luong}</td>
                <td>{val.hoa_don.vat}</td>
                <td>{numberFormat(val.hoa_don.thanh_toan)}</td>
                <td>{nvTuVan(val)}</td>
                <td>{nvThucHien(val)}</td>
                <td>{val.hoa_don.ghi_chu}</td>
            </tr>)
        });

        return result;
    }

    function configColumnData() {
        let result = props.columns
            .map((col) => {
                let stt = 1;
                return {
                    title: col.title,
                    dataIndex: col.dataIndex,
                    key: col.key,
                    render: (_, record) => {
                        if (col.key === 'id') {
                            return <div key={col.key}>{stt++}</div>
                        }

                        if (col.key === 'hoa_don') {
                            return <div key={col.key}>
                                <ul className="ul01">
                                    <li><b>Mã:</b>{record.code}</li>
                                    <li><b>ĐV:</b>{record.chi_nhanh}</li>
                                    <li><b>NV:</b>{record.nguoi_tao}</li>
                                    <li><em>{record.NgayVaoSo}</em></li>
                                </ul>
                            </div>
                        }
                        if (col.key === 'khach_hang') {
                            return <div key={col.key}>
                                <ul className="ul01">
                                    <li>{record.ma_khach_hang}</li>
                                    <li><b>{record.ten_khach_hang}</b></li>
                                    <li><em>{record.phone}</em></li>
                                    <li><em>{record.phone02}</em></li>
                                </ul>
                            </div>
                        }

                        if (col.key === 'thanh_tien') {
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


                        if (col.key === 'note') {
                            return <div key={col.key}>{record.note}</div>
                        }

                        if (col.key === 'chi_tiet_don_hang') {
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

                                        {contentHoaDonChiTiet(record)}

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

    const deletes = () => {
        setLoadingBtnDelete(true); // ajax request after empty completing
        axios
            .post(route("hima.deleteHoaDonDraft", [props.table.id]), {
                ids: selectedRowKeys,
            })
            .then((response) => {
                if (response.data.status_code == 200) {
                    message.success("Đã xóa");
                    message.success("Đang cập nhật lại dữ liệu");
                    // setDataSource(dataSrc);
                    // setSelectedRowKeys([]);
                    router.get(route("hoaDon.draft"));
                } else {
                    setLoadingBtnDelete(false);
                    setIsOpenConfirmDelete(false);
                    setSelectedRowKeys([]);
                    message.error("Xóa thất bại");
                }

            })
            .catch((error) => {
                console.log('error', error);

                setLoadingBtnDelete(false);
                setSelectedRowKeys([]);
                setIsOpenConfirmDelete(false);
                message.error("Có lỗi xảy ra");
            });
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('newSelectedRowKeys', newSelectedRowKeys);

        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const confirmDelete = () => {
        setIsOpenConfirmDelete(true);
    };
    const handleCancelDelete = () => {
        setIsOpenConfirmDelete(false);
    };

    const hasSelected = selectedRowKeys.length > 0;
    const hasEdit = (selectedRowKeys.length === 1);

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={props.tables}
                current={props.table}
                content={
                    <div>

                        <Modal
                            title="Xác nhận xóa"
                            open={isOpenConfirmDelete}
                            onOk={deletes}
                            onCancel={handleCancelDelete}
                            confirmLoading={loadingBtnDelete}
                        >
                            <p>
                                Dữ liệu đã xóa sẽ <b>không thể khôi phục</b> lại
                                được <br />{" "}
                                <b>(Số lượng {selectedRowKeys.length})</b>
                            </p>
                        </Modal>

                        <Button
                            type="primary"
                            onClick={confirmDelete}
                            disabled={!hasSelected}
                            loading={loadingBtnDelete}
                        >
                            <DeleteOutlined />
                            Xóa
                        </Button>
                        <Button
                            type="primary"
                            // onClick={confirmDelete}
                            disabled={!hasEdit}
                            loading={loadingBtnDelete}
                        >
                            <Link href={route('hima.formHoaDon', selectedRowKeys)}>
                                <DeleteOutlined />
                                Sửa
                            </Link>
                        </Button>

                        <Link href={route('hima.formHoaDon')}>
                            <Button type="primary" className="btn-draft _right">Thêm mới hóa đơn</Button>
                        </Link>
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
                            rowSelection={rowSelection}
                            rowClassName="editable-row"
                            className="table-index"
                        />
                    </div>
                }
            />
        </div>
    );
}
