import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
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
    Divider,
    Tabs,
    Col, Image, Radio, List
} from "antd";
import { Link } from "@inertiajs/react";
import axios from "axios";
import {
    DeleteOutlined,
    StopOutlined,
    CheckOutlined,
    ArrowRightOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    BarsOutlined, PlusCircleOutlined
} from "@ant-design/icons";

import "../../../../css/list02.css";
import { numberFormat } from "../../../Function/common";
import { cloneDeep } from "lodash";
import { JSX } from "react/jsx-runtime";
import dayjs from "dayjs";

// Utility to ensure value is always an array
function safeArray<T>(value: T | T[] | undefined | null): T[] {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return [value];
}

export function ProductInfo(product: any) {

    const id = product.info.id as number;
    let banTrucTiep = <span className="text_success"><CheckCircleOutlined /> Cho phép bán trực tiếp</span>;
    if (product.info.ban_truc_tiep === 1) {
        banTrucTiep = <span className="text_warning"><CloseCircleOutlined /> Không bán trực tiếp</span>;
    }
    let data01 = [
        <p><b>Loại hàng: </b>  {product.info.product_type_name}</p>,
        <p><b>Nhóm hàng: </b> {product.info.product_group_name}</p>,
        <p><b>Thương hiệu: </b> {product.info.thuong_hieu_name}</p>,
    ];

    let data02 = [
        <p><b>Vị trí: </b> {product.info.vi_tri_name}</p>,
        <p><b>Tồn kho: </b> {product.info.ton_kho}</p>,
        <p><b>Định mức tồn: </b> {product.info.dinh_muc_ton_it_nhat} <ArrowRightOutlined /> {numberFormat(product.info.dinh_muc_ton_nhieu_nhat)}</p>,
        <p><b>Trọng lượng: </b> {product.info.trong_luong}</p>,
        <p>{banTrucTiep}</p>,
    ]

    if (product.info.product_type_id === 1) {
        data01.push(<p><b>Hoa hồng bán hàng: </b> {numberFormat(product.info.ck_nv_tu_van)} {product.info.is_ck_nv_tu_van_percen === 1 ? '%' : <sup>đ</sup>}</p>);
        data01.push(<p><b>Hoa hồng thực hiện: </b> {numberFormat(product.info.ck_nv_cham_soc)} {product.info.is_ck_nv_cham_soc_percen === 1 ? '%' : <sup>đ</sup>}</p>);
    }

    if (product.info.product_type_id === 2) {

    }

    const hhInfo = <Row>
        <Col sm={{ span: 24 }}>
            <h3 className="h3"><em>{product.info.code}</em> - {product.info.name}</h3>
        </Col>
        <Col sm={{ span: 8 }}>
            {/* <Carousel>
                        </Carousel> */}
            {product.info.images && product.info.images.avatar ? <Image className="image-list" src={product.info.images.avatar}></Image> : <Image className="image-list" src='/images/no-image.jpg'></Image>}

        </Col>
        <Col sm={{ span: 8 }}>
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
        <Col sm={{ span: 8 }}>
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


        {product.info.mo_ta && product.info.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Mô Tả: </b>{product.info.mo_ta}</p></Col> : ''}

        {product.info.ghi_chu && product.info.ghi_chu !== '' ? <Col sm={{ span: 24 }}><p><b>Ghi chú:{product.info.ghi_chu}</b></p></Col> : ''}

    </Row>

    const columnNguyenLieu = [
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
        }
    ];

    const columnDichVuTrongGoi = [
        {
            title: 'Mã hàng hóa',
            dataIndex: 'product_code',
            key: 'product_code',
        },
        {
            title: 'Tên dịch vụ',
            dataIndex: 'product_name',
            key: 'product_name',
        },
        {
            title: 'Số lượng',
            dataIndex: 'so_luong',
            key: 'so_luong',
        }
    ];

    const columnKiemKho = [
        {
            title: 'Mã chứng từ',
            dataIndex: 'code',
            key: 'product_code',
        },
        {
            title: 'Thực tế',
            dataIndex: 'thuc_te',
            key: 'thuc_te',
        },
        {
            title: 'Tồn kho',
            dataIndex: 'ton_kho',
            key: 'ton_kho',
        },
        {
            title: 'SL lệch',
            dataIndex: 'so_luong_lech',
            key: 'so_luong_lech',
        },
        {
            title: 'Giá trị lệch',
            dataIndex: 'gia_tri_lech',
            key: 'gia_tri_lech',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
        }
    ];

    const columnBanHang = [
        {
            title: 'Mã chứng từ',
            dataIndex: 'data_code',
            key: 'data_code',
        },
        {
            title: 'Ngày bán',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text: any, record: any) => (
                <span>{dayjs(record.created_at).format('DD/MM/YYYY')}</span>
            ),
        },
        {
            title: 'giá bán',
            dataIndex: 'don_gia',
            key: 'don_gia',
            render: (text: any, record: any) => (
                <span>{numberFormat(record.don_gia)} <sup>đ</sup></span>
            ),
        },
        {
            title: 'Số Lượng',
            dataIndex: 'so_luong',
            key: 'so_luong',
        },
        {
            title: 'Thành tiền',
            dataIndex: 'thanh_tien',
            key: 'thanh_tien',
            render: (text: any, record: any) => (
                <span>{numberFormat(record.thanh_tien)} <sup>đ</sup></span>
            ),
        }
    ];

    const columnNhapHang = [
        {
            title: 'Mã chứng từ',
            dataIndex: 'product_code',
            key: 'product_code',
        },
        {
            title: 'Đối tác',
            dataIndex: 'product_name',
            key: 'product_name',
        },
        {
            title: 'Số Lượng',
            dataIndex: 'so_luong',
            key: 'so_luong',
        },
        {
            title: 'Tồn cuối',
            dataIndex: 'so_luong',
            key: 'so_luong',
        }
    ];

    let item = [
        {
            label: 'Thông tin', //hh/dv
            key: '1',
            children: hhInfo,
        },{
            label: <span>Lịch sử bán hàng</span> as any,
            key: '3',
            children: <Table
                columns={columnBanHang}
                dataSource={product.banHang}
            />
        }
    ]
    //SP
    if (product.info.product_type_id === 1) {

        item.push({
            label: <span>Kiểm kho</span> as any,
            key: '2',
            children: <Table
                columns={columnKiemKho}
                dataSource={product.kiemKho}
            />,
        }, {
            label: <span>Nhập hàng</span> as any,
            key: '4',
            children: <Table
                columns={columnNhapHang}
                dataSource={product.nhapHang}
            />,
        }, {
            label: <span>Khách trả hàng</span> as any,
            key: '5',
            children: <Table
                columns={columnNhapHang}
                dataSource={product.khachTraHang}
            />,
        }, {
            label: <span>Trả hàng nhập</span> as any,
            key: '6',
            children: <Table
                columns={columnNhapHang}
                dataSource={product.traHangNCC}
            />,
        }
        )
    }

    // DV
    if (product.info.product_type_id === 2) {
        item.push({
            label: <span>Nguyên liệu</span> as any, // dv
            key: '3',
            children: <Table
                columns={columnNguyenLieu}
                dataSource={product.nguyenLieu}
            />,
        });
    }

    // // goi dv
    if (product.info.product_type_id === 3) {
        item.push({
            label: <span>Dịch vụ trong gói</span> as any,
            key: '4',
            children: <Table
                columns={columnDichVuTrongGoi}
                dataSource={product.dichVuTrongGoi}
            />,
        });
    }
     
    // // card
    if (product.info.product_type_id === 4) {
        let LoaiHH: React.ReactNode = null;
        if (product.loaiHangHoaApDung) {
            LoaiHH = safeArray(product.loaiHangHoaApDung).map((loai, idx) => (
                <li key={idx}>{loai.name}</li>
            ));
        }
        let LoaiHHStr: React.ReactNode = null;
        if (LoaiHH) {
            LoaiHHStr = <ul>{LoaiHH}</ul>;
        }
        let proApply: React.ReactNode = <em>Áp dụng cho tất cả hàng hóa, dịch vụ, gói dịch vụ</em>;
        if (product.productApply.length > 0) {
            proApply = safeArray(product.productApply).map((pro, idx) => (
                <li key={idx}>({pro.code}) {pro.name}</li>
            ));
        }
        console.log('proApply', proApply);
        

        item.push({
            label: <span>Áp dụng</span> as any,
            key: '5',
            children: <div>
                <p><b>Loại hình được áp dụng:</b></p>
                <ul>{LoaiHH}</ul>

                <p><b>Hàng hóa chỉ định: </b></p>
                <ul>{proApply}</ul>
            </div>,
        });
    }


    return <div>
        <Tabs
            defaultActiveKey="1"
            items={item}
        />
    </div>
}


