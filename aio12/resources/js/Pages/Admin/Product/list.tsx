import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import axios from "axios";
import { JSX } from "react/jsx-runtime";
import { cloneDeep } from "lodash";
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
import { routeQLKho } from "../../../Function/config_route";
import { ProductInfo } from "./product_comp";
import { s } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

// Utility to ensure value is always an array
function safeArray<T>(value: T | T[] | undefined | null): T[] {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null) return [];
    return [value];
}

export default function ProductList(props: any) {
    const [formSearch] = Form.useForm();
    // const [nguyenLieu, setNguyenLieu] = useState([]);

    // const [loadingNguyenLieu, setLoadingNguyenLieu] = useState(false);
    // const [dichVuTrongGoi, setDichVuTrongGoi] = useState([]);
    // const [kiemKhoData, setKiemKhoData] = useState<{ [key: string]: any[] }>({});
    // const [banHangData, setBanHangData] = useState<{ [key: string]: any[] }>({});
    // const [nhapHangData, setNhapHangData] = useState<{ [key: string]: any[] }>({});
    // const [khachTraHangData, setKhachTraHangData] = useState<{ [key: string]: any[] }>({});
    // const [traHangNhapData, setTraHangNhapData] = useState<{ [key: string]: any[] }>({});


    // const [productApDung, setProductApDung] = useState([]);
    // const [loadingDVTrongGoi, setLoadingDVTrongGoi] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [productDetail, setProductDetail] = useState<{ [key: number]: any }>({});
    const [products, setProducts] = useState(props.products.data);

    const [pidAction, setPidAction] = useState<number>(0);
    const [isModalNgungKinhDoanhOpen, setIsModalNgungKinhDoanhOpen] = useState<boolean>(false);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState<boolean>(false);

    const columns = [
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
        },
        // {
        //     title: 'Thời gian',
        //     // dataIndex: 'updated_at',
        //     key: 'name',
        //     render: (record) => <span>{record.created_at}</span>,
        // },
    ];

    const expandedRowRender = (record: any) => {
        if (!productDetail[record.id as number]) {
            axios.post(route('product.info', [record.id]))
                .then((response) => {
                    console.log('response', response);
                    if (response.data.status_code === 200) {
                        setProductDetail((prevState) => {
                            return {
                                ...prevState,
                                [record.id]: response.data.data
                            };
                        });
                    } else {
                        message.error("Lỗi không lấy được thông tin chi tiết sản phẩm");
                        setLoadingInfo(false);
                    }
                })
                .catch((error) => {
                    message.error("Cập nhật thất bại");
                });
        }
        if (productDetail[record.id as number]) {
            return <>
                    {ProductInfo(productDetail[record.id as number])}
                    <Col sm={{ span: 24 }} >
                        <Divider orientation="left">
                            <Space>
                                <Link href={route('product.edit', {pid: record.id, p: props.p})}><Button className="_success"><CheckOutlined /> Cập nhật</Button></Link>
                                {/* <Button className="_warning"> <SnippetsOutlined /> Sao chép</Button> */}
                                <Button onClick={() => { setIsModalNgungKinhDoanhOpen(true); setPidAction(id); }}><StopOutlined /> Ngừng kinh doanh</Button>
                                <Button onClick={() => { setIsModalXoaOpen(true); setPidAction(id); }}><DeleteOutlined /> Xóa</Button>
                            </Space>
                        </Divider>
                    </Col>
                </>;
        }

        return 'Đang tải...';
    };

    // const expandedRowRender = (record: { ban_truc_tiep: number; product_type_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; product_group_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; thuong_hieu_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; vi_tri_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; ton_kho: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; dinh_muc_ton_it_nhat: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; dinh_muc_ton_nhieu_nhat: any; trong_luong: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; product_type_id: number; ck_nv_tu_van: any; is_ck_nv_tu_van_percen: number; ck_nv_cham_soc: any; is_ck_nv_cham_soc_percen: number; code: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; images: { avatar: string | undefined; }; mo_ta: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; ghi_chu: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; id: unknown; loai_hang_hoa: { map: (arg0: (loai: any) => JSX.Element) => string; }; }) => {

    //     axios.post(route('product.info', [record.id]))
    //         .then((response) => {
    //             console.log('response', response);
    //             if (response.data.status_code === 200) {

    //             } else {
    //                 message.error("Lỗi không lấy được thông tin chi tiết sản phẩm");
    //                 setLoadingSubData(false);
    //             }
    //         })
    //         .catch((error) => {
    //             message.error("Cập nhật thất bại");
    //         });

    //     const id = record.id as number;
    //     let banTrucTiep: React.ReactNode = '';
    //     if (record.ban_truc_tiep === 1) {
    //         banTrucTiep = <span className="text_warning"><CloseCircleOutlined /> Không bán trực tiếp</span>;
    //     } else {
    //         banTrucTiep = <span className="text_success"><CheckCircleOutlined /> Cho phép bán trực tiếp</span>
    //     }
    //     let data01 = [
    //         <p><b>Loại hàng: </b>  {record.product_type_name}</p>,
    //         <p><b>Nhóm hàng: </b> {record.product_group_name}</p>,
    //         <p><b>Thương hiệu: </b> {record.thuong_hieu_name}</p>,
    //     ];

    //     let data02 = [
    //         <p><b>Vị trí: </b> {record.vi_tri_name}</p>,
    //         <p><b>Tồn kho: </b> {record.ton_kho}</p>,
    //         <p><b>Định mức tồn: </b> {record.dinh_muc_ton_it_nhat} <ArrowRightOutlined /> {numberFormat(record.dinh_muc_ton_nhieu_nhat)}</p>,
    //         <p><b>Trọng lượng: </b> {record.trong_luong}</p>,
    //         <p>{banTrucTiep}</p>,
    //     ]

    //     if (record.product_type_id === 1) {
    //         data01.push(<p><b>Hoa hồng bán hàng: </b> {numberFormat(record.ck_nv_tu_van)} {record.is_ck_nv_tu_van_percen === 1 ? '%' : <sup>đ</sup>}</p>);
    //         data01.push(<p><b>Hoa hồng thực hiện: </b> {numberFormat(record.ck_nv_cham_soc)} {record.is_ck_nv_cham_soc_percen === 1 ? '%' : <sup>đ</sup>}</p>);
    //     }

    //     if (record.product_type_id === 2) {

    //     }

    //     const hhInfo = <Row>
    //         <Col sm={{ span: 24 }}>
    //             <h3 className="h3"><em>{record.code}</em> - {record.name}</h3>
    //         </Col>
    //         <Col sm={{ span: 8 }}>
    //             {/* <Carousel>
    //                 </Carousel> */}
    //             {record.images && record.images.avatar ? <Image className="image-list" src={record.images.avatar}></Image> : <Image className="image-list" src='/images/no-image.jpg'></Image>}

    //         </Col>
    //         <Col sm={{ span: 8 }}>
    //             <List className="list01"
    //                 bordered
    //                 dataSource={data01}
    //                 renderItem={(item) => (
    //                     <List.Item>
    //                         {item}
    //                     </List.Item>
    //                 )}
    //             />
    //         </Col>
    //         <Col sm={{ span: 8 }}>
    //             <List className="list01"
    //                 bordered
    //                 dataSource={data02}
    //                 renderItem={(item) => (
    //                     <List.Item>
    //                         {item}
    //                     </List.Item>
    //                 )}
    //             />
    //         </Col>


    //         {record.mo_ta && record.mo_ta !== '' ? <Col sm={{ span: 24 }}><p><b>Mô Tả: </b>{record.mo_ta}</p></Col> : ''}

    //         {record.ghi_chu && record.ghi_chu !== '' ? <Col sm={{ span: 24 }}><p><b>Ghi chú:{record.ghi_chu}</b></p></Col> : ''}

    //         <Col sm={{ span: 24 }} >
    //             <Divider orientation="left">
    //                 <Space>
    //                     <Link href={route('product.edit', {pid: record.id, p: props.p})}><Button className="_success"><CheckOutlined /> Cập nhật</Button></Link>
    //                     {/* <Button className="_warning"> <SnippetsOutlined /> Sao chép</Button> */}
    //                     <Button onClick={() => { setIsModalNgungKinhDoanhOpen(true); setPidAction(id); }}><StopOutlined /> Ngừng kinh doanh</Button>
    //                     <Button onClick={() => { setIsModalXoaOpen(true); setPidAction(id); }}><DeleteOutlined /> Xóa</Button>
    //                 </Space>
    //             </Divider>

    //         </Col>
    //     </Row>

    //     const columnNguyenLieu = [
    //         {
    //             title: 'STT',
    //             dataIndex: 'stt',
    //             key: 'stt',
    //         },
    //         {
    //             title: 'Mã hàng hóa',
    //             dataIndex: 'product_code',
    //             key: 'product_code',
    //         },
    //         {
    //             title: 'Nguyên liệu tiêu hao',
    //             dataIndex: 'product_name',
    //             key: 'product_name',
    //         },
    //         {
    //             title: 'Số lượng',
    //             dataIndex: 'so_luong',
    //             key: 'so_luong',
    //         }
    //     ];

    //     const columnDichVuTrongGoi = [
    //         {
    //             title: 'STT',
    //             dataIndex: 'stt',
    //             key: 'stt',
    //         },
    //         {
    //             title: 'Mã hàng hóa',
    //             dataIndex: 'product_code',
    //             key: 'product_code',
    //         },
    //         {
    //             title: 'Tên dịch vụ',
    //             dataIndex: 'product_name',
    //             key: 'product_name',
    //         },
    //         {
    //             title: 'Số lượng',
    //             dataIndex: 'so_luong',
    //             key: 'so_luong',
    //         }
    //     ];

    //     const columnKiemKho = [
    //         {
    //             title: 'Mã chứng từ',
    //             dataIndex: 'code',
    //             key: 'product_code',
    //         },
    //         {
    //             title: 'Thực tế',
    //             dataIndex: 'thuc_te',
    //             key: 'thuc_te',
    //         },
    //         {
    //             title: 'Tồn kho',
    //             dataIndex: 'ton_kho',
    //             key: 'ton_kho',
    //         },
    //         {
    //             title: 'SL lệch',
    //             dataIndex: 'so_luong_lech',
    //             key: 'so_luong_lech',
    //         },
    //         {
    //             title: 'Giá trị lệch',
    //             dataIndex: 'gia_tri_lech',
    //             key: 'gia_tri_lech',
    //         },
    //         {
    //             title: 'Ngày tạo',
    //             dataIndex: 'created_at',
    //             key: 'created_at',
    //         }
    //     ];

    //     const columnBanHang = [
    //         {
    //             title: 'STT',
    //             dataIndex: 'stt',
    //             key: 'stt',
    //         },
    //         {
    //             title: 'Mã chứng từ',
    //             dataIndex: 'product_code',
    //             key: 'product_code',
    //         },
    //         {
    //             title: 'Đối tác',
    //             dataIndex: 'product_name',
    //             key: 'product_name',
    //         },
    //         {
    //             title: 'Số Lượng',
    //             dataIndex: 'so_luong',
    //             key: 'so_luong',
    //         },
    //         {
    //             title: 'Tồn cuối',
    //             dataIndex: 'so_luong',
    //             key: 'so_luong',
    //         }
    //     ];

    //     const columnNhapHang = [
    //         {
    //             title: 'STT',
    //             dataIndex: 'stt',
    //             key: 'stt',
    //         },
    //         {
    //             title: 'Mã chứng từ',
    //             dataIndex: 'product_code',
    //             key: 'product_code',
    //         },
    //         {
    //             title: 'Đối tác',
    //             dataIndex: 'product_name',
    //             key: 'product_name',
    //         },
    //         {
    //             title: 'Số Lượng',
    //             dataIndex: 'so_luong',
    //             key: 'so_luong',
    //         },
    //         {
    //             title: 'Tồn cuối',
    //             dataIndex: 'so_luong',
    //             key: 'so_luong',
    //         }
    //     ];

    //     let item = [
    //         {
    //             label: 'Thông tin', //hh/dv
    //             key: '1',
    //             children: hhInfo,
    //         },
    //     ]
    //     //SP


    //     if (record.product_type_id === 1) {

    //         item.push({
    //             label: <span onClick={() => { getTheKho(id) }}>Kiểm kho</span> as any,
    //             key: '2',
    //             children: <Table
    //                 loading={loadingSubData}
    //                 columns={columnKiemKho}
    //                 dataSource={kiemKhoData[id]}
    //             />,
    //         }, {
    //             label: <span onClick={() => { getBanHang(id) }}>Bán hàng</span> as any,
    //             key: '3',
    //             children: <Table
    //                 loading={loadingSubData}
    //                 columns={columnBanHang}
    //                 dataSource={banHangData[id]}
    //             />
    //         }, {
    //             label: <span onClick={() => { getNhapHang(id) }}>Nhập hàng</span> as any,
    //             key: '4',
    //             children: <Table
    //                 loading={loadingSubData}
    //                 columns={columnNhapHang}
    //                 dataSource={nhapHangData[id]}
    //             />,
    //         }, {
    //             label: <span onClick={() => { getNhapHang(id) }}>Khách trả hàng</span> as any,
    //             key: '5',
    //             children: <Table
    //                 loading={loadingSubData}
    //                 columns={columnNhapHang}
    //                 dataSource={khachTraHangData[id]}
    //             />,
    //         }, {
    //             label: <span onClick={() => { getNhapHang(id) }}>Trả hàng nhập</span> as any,
    //             key: '6',
    //             children: <Table
    //                 loading={loadingSubData}
    //                 columns={columnNhapHang}
    //                 dataSource={traHangNhapData[id]}
    //             />,
    //         }
    //         )
    //     }
    //     // DV
    //     if (record.product_type_id === 2) {
    //         item.push({
    //             label: <span onClick={() => { getNguyenLieu(id) }}>Nguyên liệu</span> as any, // dv
    //             key: '3',
    //             children: <Table
    //                 loading={loadingNguyenLieu}
    //                 columns={columnNguyenLieu}
    //                 dataSource={nguyenLieu[id]}
    //             />,
    //         });
    //     }
    //     // goi dv
    //     if (record.product_type_id === 3) {
    //         item.push({
    //             label: <span onClick={() => { getDichVuTrongGoi(id) }}>Dịch vụ trong gói</span> as any, // dv
    //             key: '4',
    //             children: <Table
    //                 loading={loadingDVTrongGoi}
    //                 columns={columnDichVuTrongGoi}
    //                 dataSource={dichVuTrongGoi[id]}
    //             />,
    //         });
    //     }
    //     // card
    //     if (record.product_type_id === 4) {
    //         let LoaiHH: React.ReactNode = null;
    //         if (record.loai_hang_hoa) {
    //             LoaiHH = safeArray(record.loai_hang_hoa).map((loai, idx) => (
    //                 <li key={idx}>{props.typeProduct[loai]}</li>
    //             ));
    //         }
    //         let LoaiHHStr: React.ReactNode = null;
    //         if (LoaiHH) {
    //             LoaiHHStr = <ul>{LoaiHH}</ul>;
    //         }
    //         let proApdung: React.ReactNode = null;
    //         if (productApDung[record.id]) {
    //             proApdung = safeArray(productApDung[record.id]).map((pro, idx) => (
    //                 <li key={idx}>({pro.code}) {pro.name}</li>
    //             ));
    //         }

    //         item.push({
    //             label: <span onClick={() => { getApDung(record) }}>Áp dụng</span> as any,
    //             key: '5',
    //             children: <div>
    //                 <p><b>Loại:</b></p>
    //                 <ul>{LoaiHH}</ul>

    //                 <p><b>Hàng hóa chỉ định: </b></p>
    //                 <ul>{proApdung}</ul>
    //             </div>,
    //         });
    //     }


    //     return <div>
    //         <Tabs
    //             defaultActiveKey="1"
    //             items={item}
    //         />
    //     </div>
    // };

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

    const onFinishSearch = (values: any) => {
        setLoadingTable(true);
        values.p = props.p;
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

    const ngungKinhDoanh = () => {
        setLoadingTable(true);
        axios.post(route("product.ngungKinhDoanh"), { pid: pidAction })
            .then((response) => {
                // setLoadingTable(false);
                // setPidAction(0);
                message.success("Đã ngừng kinh doanh");
                window.location.reload();
            })
            .catch((error) => {
                setLoadingTable(false);
                message.error("Cập nhật thất bại");
            }
            );
    }

    const deleteProduct = () => {
        setLoadingTable(true);
        axios.post(route("product.deleteProduct"), { pid: pidAction })
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

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={routeQLKho}
                current={props.table}
                content={
                    <div>
                        <Modal title="Xác nhận Ngừng Kinh Doanh"
                            open={isModalNgungKinhDoanhOpen}
                            onOk={ngungKinhDoanh}
                            okText="Ngừng kinh doanh"
                            cancelText="Hủy"
                            onCancel={handleCancel}>
                            <p>Các hàng hóa ngừng kinh doanh sẽ không hiển thị ở danh sách hàng hóa nữa. Bạn có thể xem lại ở phần
                                <em>hàng hóa ngừng kinh doanh</em>.</p>

                        </Modal>
                        <Modal title="Xác nhận xóa"
                            open={isModalXoaOpen}
                            onOk={deleteProduct}
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
                                <Row>
                                    <Col sm={{ span: 8 }}>
                                        <p className="title01">Quản lý hàng hóa</p>
                                    </Col>
                                    <Col sm={{ span: 8 }}>

                                    </Col>
                                    <Col sm={{ span: 8 }}>
                                        <Link href={route('product.add', { p: props.p })}>
                                            <Button type="primary" className="_right">
                                                <PlusCircleOutlined />Thêm mới
                                            </Button>
                                        </Link>
                                    </Col>
                                </Row>

                            </Col>

                            <Col sm={{ span: 4 }}>
                                <Form
                                    name="basic"
                                    layout="vertical"
                                    onFinish={onFinishSearch}
                                    // onFinishFailed={onFinishSearchFailed}
                                    autoComplete="off"
                                    form={formSearch}
                                >
                                    <Row gutter={24} className="main-search-left">

                                        <Col sm={{ span: 24 }} className='item-search' onBlur={search}>
                                            <Form.Item name='keyword' label='Từ khoá'>
                                                <Input />
                                            </Form.Item>
                                        </Col>

                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='product_type_id' label='Loại'>
                                                <Checkbox.Group onChange={search}
                                                    options={[
                                                        { value: 1, label: 'Hàng hóa' },
                                                        { value: 2, label: 'Dịch vụ' },
                                                        { value: 3, label: 'Gói dịch vụ, liệu trình' },
                                                        { value: 4, label: 'Thẻ khách hàng' },
                                                    ]}
                                                />

                                            </Form.Item>
                                        </Col>

                                        {/* Nhóm hàng */}
                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='product_group_id'
                                                label={<span>Nhóm hàng <a target="new" href={route('data.tblName', ['product_group'])}><BarsOutlined /></a></span>}>
                                                <Checkbox.Group onChange={search}
                                                    className="list-checkbox01"
                                                    options={props.productGroup.map((u: { id: any; name: any; }) => {
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
                                            <Form.Item name='thuong_hieu_id'
                                                label={<div>Thương hiệu <a target="new" href={route('data.tblName', ['thuong_hieu'])}><BarsOutlined /></a></div>}>
                                                <Checkbox.Group onChange={search}
                                                    options={props.thuongHieu.map((u: { id: any; name: any; }) => {
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

                                        {/* Vị trí */}
                                        <Col sm={{ span: 24 }} className='item-search'>
                                            <Form.Item name='vi_tri_id' label='Vị trí'>
                                                <Checkbox.Group onChange={search}
                                                    options={props.viTri.map((u: { id: any; name: any; }) => {
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
                                            <Form.Item name='ngung_kinh_doanh' label='Trạng thái'>
                                                <Radio.Group
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8,
                                                    }}
                                                    onChange={search}
                                                    defaultValue={0}
                                                    options={[
                                                        { value: 0, label: 'Đang kinh doanh' },
                                                        { value: 1, label: 'Ngừng kinh doanh' },
                                                        { value: 2, label: 'Thùng rác' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>

                                    </Row>
                                </Form>
                            </Col>
                            <Col sm={{ span: 20 }}>
                                <Table
                                    columns={columns}
                                    loading={loadingTable}
                                    expandable={{
                                        expandedRowRender,
                                        defaultExpandedRowKeys: ['1'],
                                    }}
                                    rowClassName={(_, index) =>
                                        index % 2 === 0 ? "even-row" : "odd-row"
                                    }
                                    dataSource={products}
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
