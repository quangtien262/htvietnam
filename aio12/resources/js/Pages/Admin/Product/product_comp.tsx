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

// Utility to ensure value is always an array
function safeArray<T>(value: T | T[] | undefined | null): T[] {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return [value];
}

export function ProductInfo(record: { ban_truc_tiep: number; product_type_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; product_group_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; thuong_hieu_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; vi_tri_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; ton_kho: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; dinh_muc_ton_it_nhat: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; dinh_muc_ton_nhieu_nhat: any; trong_luong: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; product_type_id: number; ck_nv_tu_van: any; is_ck_nv_tu_van_percen: number; ck_nv_cham_soc: any; is_ck_nv_cham_soc_percen: number; code: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; images: { avatar: string | undefined; }; mo_ta: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; ghi_chu: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; id: unknown; loai_hang_hoa: { map: (arg0: (loai: any) => JSX.Element) => string; }; }) {

    const [nguyenLieu, setNguyenLieu] = useState([]);
    const [loadingNguyenLieu, setLoadingNguyenLieu] = useState(false);
    const [loadingSubData, setLoadingSubData] = useState(false);
    const [dichVuTrongGoi, setDichVuTrongGoi] = useState([]);
    const [kiemKhoData, setKiemKhoData] = useState<{ [key: string]: any[] }>({});
    const [banHangData, setBanHangData] = useState<{ [key: string]: any[] }>({});
    const [nhapHangData, setNhapHangData] = useState<{ [key: string]: any[] }>({});
    const [khachTraHangData, setKhachTraHangData] = useState<{ [key: string]: any[] }>({});
    const [traHangNhapData, setTraHangNhapData] = useState<{ [key: string]: any[] }>({});


    const [productApDung, setProductApDung] = useState([]);
    const [loadingDVTrongGoi, setLoadingDVTrongGoi] = useState(false);
    const id = record.id as number;
    let banTrucTiep = <span className="text_success"><CheckCircleOutlined /> Cho phép bán trực tiếp</span>;
    if (record.ban_truc_tiep === 1) {
        banTrucTiep = <span className="text_warning"><CloseCircleOutlined /> Không bán trực tiếp</span>;
    }
    let data01 = [
        <p><b>Loại hàng: </b>  {record.product_type_name}</p>,
        <p><b>Nhóm hàng: </b> {record.product_group_name}</p>,
        <p><b>Thương hiệu: </b> {record.thuong_hieu_name}</p>,
    ];

    let data02 = [
        <p><b>Vị trí: </b> {record.vi_tri_name}</p>,
        <p><b>Tồn kho: </b> {record.ton_kho}</p>,
        <p><b>Định mức tồn: </b> {record.dinh_muc_ton_it_nhat} <ArrowRightOutlined /> {numberFormat(record.dinh_muc_ton_nhieu_nhat)}</p>,
        <p><b>Trọng lượng: </b> {record.trong_luong}</p>,
        <p>{banTrucTiep}</p>,
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
        <Col sm={{ span: 8 }}>
            {/* <Carousel>
                        </Carousel> */}
            {record.images && record.images.avatar ? <Image className="image-list" src={record.images.avatar}></Image> : <Image className="image-list" src='/images/no-image.jpg'></Image>}

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


        {record.mo_ta && record.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Mô Tả: </b>{record.mo_ta}</p></Col> : ''}

        {record.ghi_chu && record.ghi_chu !== '' ? <Col sm={{ span: 24 }}><p><b>Ghi chú:{record.ghi_chu}</b></p></Col> : ''}

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
        }
    ];

    const columnDichVuTrongGoi = [
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
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
        },
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

    const columnNhapHang = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
        },
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
        },
    ]
    //SP


    // if (record.product_type_id === 1) {

    //     item.push({
    //         label: <span onClick={() => { getTheKho(id) }}>Kiểm kho</span> as any,
    //         key: '2',
    //         children: <Table
    //             loading={loadingSubData}
    //             columns={columnKiemKho}
    //             dataSource={kiemKhoData[id]}
    //         />,
    //     }, {
    //         label: <span onClick={() => { getBanHang(id) }}>Bán hàng</span> as any,
    //         key: '3',
    //         children: <Table
    //             loading={loadingSubData}
    //             columns={columnBanHang}
    //             dataSource={banHangData[id]}
    //         />
    //     }, {
    //         label: <span onClick={() => { getNhapHang(id) }}>Nhập hàng</span> as any,
    //         key: '4',
    //         children: <Table
    //             loading={loadingSubData}
    //             columns={columnNhapHang}
    //             dataSource={nhapHangData[id]}
    //         />,
    //     }, {
    //         label: <span onClick={() => { getNhapHang(id) }}>Khách trả hàng</span> as any,
    //         key: '5',
    //         children: <Table
    //             loading={loadingSubData}
    //             columns={columnNhapHang}
    //             dataSource={khachTraHangData[id]}
    //         />,
    //     }, {
    //         label: <span onClick={() => { getNhapHang(id) }}>Trả hàng nhập</span> as any,
    //         key: '6',
    //         children: <Table
    //             loading={loadingSubData}
    //             columns={columnNhapHang}
    //             dataSource={traHangNhapData[id]}
    //         />,
    //     }
    //     )
    // }
    // // DV
    // if (record.product_type_id === 2) {
    //     item.push({
    //         label: <span onClick={() => { getNguyenLieu(id) }}>Nguyên liệu</span> as any, // dv
    //         key: '3',
    //         children: <Table
    //             loading={loadingNguyenLieu}
    //             columns={columnNguyenLieu}
    //             dataSource={nguyenLieu[id]}
    //         />,
    //     });
    // }
    // // goi dv
    // if (record.product_type_id === 3) {
    //     item.push({
    //         label: <span onClick={() => { getDichVuTrongGoi(id) }}>Dịch vụ trong gói</span> as any, // dv
    //         key: '4',
    //         children: <Table
    //             loading={loadingDVTrongGoi}
    //             columns={columnDichVuTrongGoi}
    //             dataSource={dichVuTrongGoi[id]}
    //         />,
    //     });
    // }
    // // card
    // if (record.product_type_id === 4) {
    //     let LoaiHH: React.ReactNode = null;
    //     if (record.loai_hang_hoa) {
    //         LoaiHH = safeArray(record.loai_hang_hoa).map((loai, idx) => (
    //             <li key={idx}>{props.typeProduct[loai]}</li>
    //         ));
    //     }
    //     let LoaiHHStr: React.ReactNode = null;
    //     if (LoaiHH) {
    //         LoaiHHStr = <ul>{LoaiHH}</ul>;
    //     }
    //     let proApdung: React.ReactNode = null;
    //     if (productApDung[record.id]) {
    //         proApdung = safeArray(productApDung[record.id]).map((pro, idx) => (
    //             <li key={idx}>({pro.code}) {pro.name}</li>
    //         ));
    //     }

    //     item.push({
    //         label: <span onClick={() => { getApDung(record) }}>Áp dụng</span> as any,
    //         key: '5',
    //         children: <div>
    //             <p><b>Loại:</b></p>
    //             <ul>{LoaiHH}</ul>

    //             <p><b>Hàng hóa chỉ định: </b></p>
    //             <ul>{proApdung}</ul>
    //         </div>,
    //     });
    // }


    return <div>
        <Tabs
            defaultActiveKey="1"
            items={item}
        />
    </div>
}


