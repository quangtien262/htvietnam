import React, { useState, useEffect } from "react";
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Card,
    Select, Checkbox,
    Row,
    Tag,
    Statistic,
    Empty,
    notification,
    Divider,
    Badge, Tabs,
    Col, Image,
    Breadcrumb, Radio, List, Upload
} from "antd";
import {
    RightSquareFilled, ArrowDownOutlined, UploadOutlined,
    CheckCircleFilled, StarFilled,
    SearchOutlined,
    CopyFilled,
    DeleteOutlined,
    MailFilled, EyeOutlined,
    PhoneFilled,
    SignatureFilled,
    StopOutlined,
    CheckOutlined,
    MoneyCollectFilled,
    BookFilled,
    CloseCircleOutlined,
    EyeFilled,
    CheckCircleOutlined,
    FileTextFilled,
    HomeOutlined, BarsOutlined
} from "@ant-design/icons";

import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import ImgCrop from 'antd-img-crop';

import dayjs from "dayjs";
import axios from "axios";

import "../../css/form.css";

import { getGioiTinh, numberFormat } from "../function/common";
import { LOAI_CHUNG_TU } from "../Function/constant";
import { on } from "events";
// import { callApi } from "../Function/api";

export function khachHangInfo(data: any, mainClass = 'tab-info') {

    if (!data || data.length === 0) {
        return '';
    }
    const khachHang = data.khachHang;

    let data01 = [
        <p><b><SignatureFilled /> Mã: </b> {khachHang.code}</p>,
        <p><b><FileTextFilled /> Họ tên: </b> {khachHang.name}</p>,
        <p><b><FileTextFilled /> Giới tính: </b> {getGioiTinh(khachHang.gioi_tinh_id)}</p>,
        <p><b><FileTextFilled /> Ngày sinh: </b> {khachHang.ngay_sinh}</p>,
        <p><b><FileTextFilled /> Số điện thoại: </b> {khachHang.phone}, {khachHang.phone02}</p>,
        <p><b><FileTextFilled /> Email: </b> {khachHang.email}</p>,
        <p><b><FileTextFilled /> Facebook: </b> {khachHang.facebook}</p>,
        <p><b><FileTextFilled /> Địa chỉ: </b> {khachHang.address}</p>,
    ];

    let data02 = [
        <p><b><BookFilled /> Chi nhánh: </b> {khachHang.chi_nhanh}</p>,
        <p><b><BookFilled /> Nhóm khách hàng: </b> {khachHang.customer_group}</p>,
        <p><b><MoneyCollectFilled /> Công ty: </b> {khachHang.cong_ty}</p>,
        <p><b><MoneyCollectFilled /> MST: </b> {khachHang.mst}</p>,
        <p><b><EyeFilled /> Nguồn khách: </b> {khachHang.user_source}</p>,
        <p><b><EyeFilled /> Ngày tạo TK: </b> {dayjs(khachHang.created_at).format('DD/MM/YYYY HH:mm:ss')}</p>,
        <p><b><EyeFilled /> Mô tả: </b> {khachHang.note}</p>,
    ]

    let key = 1;
    return <Tabs className={mainClass + ' width100'}
        defaultActiveKey="1"
        items={[
            // Thông tin
            {
                label: <span className="title-sub-tab">Thông tin</span>,
                key: key++,
                children: <Row>
                    <Col sm={8}>

                        {khachHang.image ? <Image className="image-list" src={khachHang.image}></Image> : <Image className="image-list" src='/images/no-image.jpg'></Image>}

                    </Col>
                    <Col sm={8}>
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
                    <Col sm={8}>
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
                </Row>
            },

            // Thẻ đã mua
            {
                label: <span className="title-sub-tab">Thẻ đã mua</span>, //hh/dv
                key: key++,
                children: <Row className='width100'>
                    <Col sm={8}>

                        <Card variant="borderless">
                            <Statistic
                                title="Tổng đã nạp"
                                value={khachHang.tong_tien_da_nap}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<MoneyCollectFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={8}>
                        <Card variant="borderless" className='sub-item-home'>
                            <Statistic
                                title="Tiền đã dùng"
                                value={khachHang.tien_da_su_dung}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={8}>
                        <Card variant="borderless" className='sub-item-home'>
                            <Statistic
                                title="Tiền còn lại"
                                value={khachHang.tien_con_lai}
                                valueStyle={{ color: '#07378c' }}
                                prefix={<RightSquareFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={24}>
                        <br />
                        <table className="table-sub">
                            <thead>
                                <tr>
                                    <th>Mã thẻ nạp</th>
                                    <th>Tên thẻ nạp</th>
                                    <th>Số tiền</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                    <th>Ngày nạp</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.theGT.map((card, idx) => {
                                    return <tr key={idx}>
                                        <td>{card.card_code}</td>
                                        <td>{card.product_name}</td>
                                        <td>{numberFormat(card.menh_gia_the)}</td>
                                        <td>{numberFormat(card.so_luong)}</td>
                                        <td>{numberFormat(card.thanh_tien)}</td>
                                        <td>{dayjs(card.created_at).format('DD/MM/YYYY')}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                        {data.theGT.length === 0 ? <Empty description="Chưa có lịch sử nạp thẻ" /> : ''}
                    </Col>
                </Row>
            },
            {
                // gói dịch vụ
                label: <span className="title-sub-tab">Gói DV đã mua</span>,
                key: key++,
                children: <Row className='width100'>
                    <Col sm={24}>
                        <br />
                        <table className="table-sub">
                            <thead>
                                <tr>
                                    <th>Mã/Tên gói</th>
                                    <th>Tổng SL</th>
                                    <th>Đã dùng</th>
                                    <th>Ngày mua</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.goiDichVu.map((goi, idx) => {

                                    return <tr key={idx}>
                                        <td>
                                            <Popconfirm
                                                showCancel={false}
                                                placement="topLeft"
                                                title="Chi tiết gói dịch vụ"
                                                description={() => {
                                                    const content = goi.cardService.map((item, idx) => {
                                                        return <tr key={idx}>
                                                            <td>{item.product_name}</td>
                                                            <td>{numberFormat(item.product_gia_ban)}<sup>đ</sup></td>
                                                            <td>{numberFormat(Math.round(goi.card.menh_gia_the / goi.card.so_luong))}<sup>đ</sup></td>
                                                            <td>{item.so_luong_da_su_dung}</td>
                                                        </tr>
                                                    });
                                                    return <table className="table-sub">
                                                        <thead>
                                                            <tr>
                                                                <th>Tên dịch vụ</th>
                                                                <th>Giá bán lẻ</th>
                                                                <th>Giá trong gói</th>
                                                                <th>Đã sử dụng</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {content}
                                                        </tbody>
                                                    </table>
                                                }}
                                            >
                                                <div>
                                                    <a>{goi.card.product_code}-{goi.so_luong}</a>
                                                    <br />
                                                    <a>{goi.card.product_name}</a>
                                                </div>
                                            </Popconfirm>
                                        </td>
                                        <td>{goi.card.so_luong}</td>
                                        <td>{goi.card.so_luong_da_su_dung}</td>
                                        <td>{goi.card.created_at ? dayjs(goi.card.created_at).format('DD/MM/YYYY') : ''}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>

                        {data.goiDichVu.length === 0 ? <Empty description="Chưa có lịch sử nạp thẻ" /> : ''}
                    </Col>
                </Row>
            },
            // Công nợ
            {
                label: <span className="title-sub-tab">Công nợ</span>,
                key: key++,
                children: <Row className='width100'>
                    <Col sm={8}>
                        <Card variant="borderless">
                            <Statistic
                                title="Công nợ hiện tại"
                                value={khachHang.cong_no_hien_tai}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<MoneyCollectFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={8}>
                        <Card variant="borderless" className='sub-item-home'>
                            <Statistic
                                title="Đã thanh toán"
                                value={khachHang.cong_no_da_thanh_toan}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={8}>
                        <Card variant="borderless" className='sub-item-home'>
                            <Statistic
                                title="Tổng công nợ"
                                value={khachHang.tong_cong_no}
                                valueStyle={{ color: '#07378c' }}
                                prefix={<CopyFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={24}>
                        <br />
                        <table className="table-sub">
                            <thead>
                                <tr>
                                    <th>Mã phiếu</th>
                                    <th>Loại</th>
                                    <th>Giá trị <br /> hóa đơn</th>
                                    <th>Còn nợ</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày ghi nợ</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.congNo.map((no, idx) => {
                                    return <tr key={idx}>
                                        <td>{no.ma_chung_tu}</td>
                                        <td>{LOAI_CHUNG_TU[no.loai_chung_tu]}</td>
                                        <td>{numberFormat(no.tong_tien_hoa_don)}</td>
                                        <td>{numberFormat(no.so_tien_no)}</td>
                                        <td>{no.cong_no_status_name}</td>
                                        <td>{no.created_at ? dayjs(no.created_at).format('DD/MM/YYYY') : ''}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                        {data.congNo.length === 0 ? <Empty description="Chưa có lịch sử công nợ" /> : ''}
                    </Col>
                </Row>
            },
            {
                label: <span className="title-sub-tab">Lịch sử giao dịch</span>,
                key: key++,
                children: <Row className='width100'>

                    <Col sm={12}>
                        <Card variant="borderless">
                            <Statistic
                                title="Tổng tiền giao dịch"
                                value={data.tongGiaoDich}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={12}>
                        <Card variant="borderless" className='sub-item-home'>
                            <Statistic
                                title="Tổng giảm giá"
                                value={data.tongGiamGia}
                                valueStyle={{ color: '#07378c' }}
                                prefix={<CopyFilled />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>

                    <Col sm={24}>
                        <br />
                        <table className="table-sub">
                            <thead>
                                <tr>
                                    <th>Mã hóa đơn</th>
                                    <th>Tổng tiền hàng</th>
                                    <th>VAT</th>
                                    <th>Giảm giá</th>
                                    <th>Thanh toán</th>
                                    <th>Công nợ</th>
                                    <th>Ngày giao dịch</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.history.map((hdon, idx) => {
                                    return <tr key={idx}>
                                        <td>{hdon.ma_chung_tu}</td>
                                        <td>{numberFormat(hdon.TongTienHang)}</td>
                                        <td>{numberFormat(hdon.TongTienThue)}</td>
                                        <td>{numberFormat(hdon.giam_gia)}</td>
                                        <td>{numberFormat(hdon.thanh_toan)}</td>
                                        <td>{numberFormat(hdon.cong_no)}</td>
                                        <td>{hdon.created_at ? dayjs(hdon.created_at).format('DD/MM/YYYY') : ''}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                        {data.history.length === 0 ? <Empty description="Chưa có lịch sử giao dịch" /> : ''}
                    </Col>
                </Row>
            },
        ]
        } />
}

export function formEditKhachHang(props: any, user: any, onSuccess: (data: any) => void) {
    const { TextArea } = Input;
    const [formCustomer] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const onFinishCustomer = (values: any) => {
        values.id = user.id;
        axios.post(route("customer.edit"), values)
            .then((response) => {
                console.log('respons', response);
                if (response.data.status_code === 200) {
                    onSuccess(response.data.data);
                    message.success("Cập nhật khách hàng thành công");
                } else {
                    message.error("Cập nhật thất bại");
                }
            })
            .catch((error) => {
                console.log(error);
                message.error("Cập nhật thất bại");
            });
    }

    const onDragEnd = ({ active, over }: { active: any; over: any }) => {
        if (active.id !== over?.id) {
            setFileList((prev) => {
                const activeIndex = prev.findIndex((i) => i.uid === active.id);
                const overIndex = prev.findIndex((i) => i.uid === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };
    const DraggableUploadListItem = ({ originNode, file }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: file.uid,
        });
        return (
            <div
                ref={setNodeRef}
                // style={style}
                // prevent preview event when drag end
                className={isDragging ? 'is-dragging' : ''}
                {...attributes}
                {...listeners}
            >
                {/* hide error tooltip when dragging */}
                {file.status === 'error' && isDragging ? originNode.props.children : originNode}
            </div>
        );
    };

    formCustomer.setFieldsValue(user);

    return <Form
        name="basic"
        layout="horizontal"
        onFinish={onFinishCustomer}
        // onFinishFailed={onFinishSearchFailed}
        autoComplete="off"
        form={formCustomer}
    // initialValues={initialFormCustomer()}
    >
        <Row>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='cong_ty' label='Tên công ty' >
                    <Input />
                </Form.Item>
            </Col>

            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='mst' label='Mã số thuế'>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='name' label='Họ tên' rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng', }]}>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='phone' label='Điện thoại' rules={[{ required: true, message: 'Vui lòng nhập số điện thoại', }]}>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='gioi_tinh_id' label={<p>Giới tính</p>} rules={[{ required: true, message: 'Vui lòng chọn giới tính', }]}>
                    <Select
                        placeholder="Chọn gới tính"
                        optionFilterProp="children"
                        options={[
                            { label: 'Nữ', value: 2 },
                            { label: 'Nam', value: 1 },
                        ]}
                    />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='email' label='Email'>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='facebook' label='Facebook'>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='address' label='Địa chỉ'>
                    <Input />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='customer_status_id' label='Trạng thái'>
                    <Select defaultValue={1}
                        placeholder="Chọn trạng thái"
                        optionFilterProp="children"
                        options={[
                            { value: 1, label: 'Đang Hoạt động' },
                            { value: 2, label: 'Ngừng hoạt động' },
                        ]}
                    />

                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='user_source_id' label='Nguồn khách hàng'>
                    <Select
                        placeholder="Nguồn khách hàng"
                        optionFilterProp="children"
                        options={props.userSource.map((g: any) => {
                            return { label: g.name, value: g.id }
                        })}
                    />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='customer_group_id' label='Nhóm khách hàng'>
                    <Select
                        placeholder="Chọn nhóm khách hàng"
                        optionFilterProp="children"
                        options={props.customerGroup.map((g: any) => {
                            return { label: g.name, value: g.id }
                        })}
                    />
                </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name='note' label='Ghi chú'>
                    <TextArea rows={4} />
                </Form.Item>
            </Col>

            <Col md={{ span: 24 }}>
                <Form.Item
                    name='image'
                    label="Hình ảnh"
                >

                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                            <ImgCrop
                                aspect={1}
                                aspectSlider={true}
                                rotationSlider={true}
                                showGrid={true}
                                showReset={true}
                            >
                                <Upload multiple
                                    action={route("data.upload_image")}
                                    listType="picture-card" // picture-card
                                    fileList={fileList}
                                    maxCount={1}
                                    onChange={onChange}
                                    itemRender={(originNode, file) => (
                                        <DraggableUploadListItem originNode={originNode} file={file} />
                                    )}
                                >
                                    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                </Upload>
                            </ImgCrop>
                        </SortableContext>
                    </DndContext>
                </Form.Item>
            </Col>

            <Col md={{ span: 24 }} className="text-center">
                <Button type="default" className="btn-05" style={{ marginRight: 8 }} onClick={() => onSuccess({ close: true })}>
                    HỦY
                </Button>
                <Button type="primary" htmlType="submit" className="btn-05">
                    <span className="btn-05">{user.id ? 'CẬP NHẬT' : 'THÊM KHÁCH HÀNG'}</span>
                </Button>
            </Col>
        </Row>

    </Form>
}
