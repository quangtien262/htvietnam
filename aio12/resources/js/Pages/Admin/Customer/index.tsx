import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/inertia-react";
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
Select,Checkbox,
    Row,
    Space,
    Tag,
    Dropdown,
    Descriptions,
    notification,
    Divider,
    Badge,Tabs,
    Col,Image,
    Breadcrumb,Radio, List, Upload
} from "antd";

import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ImgCrop from 'antd-img-crop';

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    HomeFilled,
    FacebookFilled,
    SearchOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    MailFilled,UploadOutlined ,
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

import "../../../../css/form.css";
// import { btnIndex, showDataConfirm } from "../../../Function/data";
// import { smartSearch, showDataSearch } from "../../../Function/input";
// import { renderData } from "../../../Function/index";
import { inArray, parseJson, numberFormat } from "../../../Function/common";
import { cloneDeep } from "lodash";
// import { TextArea } from "devextreme-react";
// import dayjs from "dayjs";
import { khachHangInfo } from "../../../Components/khach_hang_info";
import { routeSales } from "../../../Function/config_route";

export default function Dashboard(props) {
    const { TextArea } = Input;
    const [api, contextHolder] = notification.useNotification();
    const [formSearch] = Form.useForm();
    const [formCustomer] = Form.useForm();
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [nghiLam, setNghiLam] = useState(false);
    const [dichVuTrongGoi, setDichVuTrongGoi] = useState([]);
    const [loadingDVTrongGoi, setLoadingDVTrongGoi] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    const [khachHangData, setKhachHangData] = useState([]);
    
    const [users, setUsers] = useState(props.users.data);

    const [pidAction, setPidAction] = useState(0);
    const [isModalHoatDongOpen, setIsModalHoatDongOpen] = useState(false);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalEdit, setIsModalEdit] = useState(false);
    
    const [loadingLichSuMuaHang, setLoadingLichSuMuaHang] = useState(false);
    const [lichSuMuaHang, setLichSuMuaHang] = useState([]);
    const [goiDV, setGoiDV] = useState([]);
    const [cardGT, setCardGT] = useState([]);
    const [idEdit, setIdEdit] = useState(0);
    const [indexEdit, setIndexEdit] = useState(0);


    const [fileList, setFileList] = useState([]);
    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            setFileList((prev) => {
            const activeIndex = prev.findIndex((i) => i.uid === active.id);
            const overIndex = prev.findIndex((i) => i.uid === over?.id);
            return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    function setPagination(pagination) {
        router.get(
            route("hima.hoaDon"),
            pagination
        );
    }
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



    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
    ];

    const onFinishCustomer = (values) => {
        setLoadingTable(true);
        values.id = idEdit;
        axios.post(route("customer.edit"), values)
            .then((response) => {
                console.log('respons', response);
                if(idEdit === 0) {
                    location.reload();
                }
                if (response.data.status_code === 200) {
                    let users_tmp = cloneDeep(users);
                    users_tmp[indexEdit] = response.data.data;
                    setUsers(users_tmp);
                } else {
                    message.error("Không lấy được thông tin dịch vụ");
                }
                setLoadingTable(false);
                setIsModalEdit(false);
            })
            .catch((error) => {
                console.log(error);
                setLoadingTable(false);
                setIsModalEdit(false);
                message.error("Cập nhật thất bại");
            }
        );
    }


    function getLichSuMuaHang(id) {
        if(lichSuMuaHang[id]) {
            return ;
        }
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

    function getGoiDichVu(id) {
        if(goiDV[id]) {
            return ;
        }
        setLoadingLichSuMuaHang(true);
        axios.post(route("customer.goiDichVu"), {users_id:id})
            .then((response) => {
                if (response.data.status_code === 200) {
                    const goiDV_tmp = cloneDeep(goiDV);
                    goiDV_tmp[id] = response.data.data;
                    setGoiDV(goiDV_tmp);
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

    function getCardGT(id) {
        if(cardGT[id]) {
            return ;
        }
        setLoadingLichSuMuaHang(true);
        axios.post(route("customer.cardGT"), {users_id:id})
            .then((response) => {
                if (response.data.status_code === 200) {
                    const cardGT_tmp = cloneDeep(cardGT);
                    cardGT_tmp[id] = response.data.data;
                    setCardGT(cardGT_tmp);
                    setLoadingLichSuMuaHang(false);
                } else {
                    message.error("Không lấy được thông tin thẻ giá trị");
                    setLoadingLichSuMuaHang(false);
                }
            })
            .catch((error) => {
                message.error("Thất bại");
            }
        );
    }

    function editCustomer(item, index) {
        setIsModalEdit(true); 
        setIdEdit(item.id);
        setIndexEdit(index);
        formCustomer.setFieldValue('name', item.name);
        formCustomer.setFieldValue('phone', item.phone);
        formCustomer.setFieldValue('gioi_tinh_id', item.gioi_tinh_id);
        formCustomer.setFieldValue('ngay_sinh', item.ngay_sinh);
        formCustomer.setFieldValue('facebook', item.facebook);
        formCustomer.setFieldValue('address', item.address);
        formCustomer.setFieldValue('customer_status_id', item.customer_status_id);
        formCustomer.setFieldValue('customer_group_id', item.customer_group_id);
    }

    const expandedRowRender = (record, index) => {
        if(!khachHangData[record.id]) {
            axios.post(route("customer.detail"), { id: record.id })
                .then((response) => {
                    console.log('response', response.data.data);
                    if(response.status === 200) {
                        // set khach hang
                        let khachHangData_tmp = cloneDeep(khachHangData);
                        khachHangData_tmp[record.id] = response.data.data;

                        console.log('khachHangData_tmp', khachHangData_tmp);
                        
                        setKhachHangData(khachHangData_tmp);
                    }
                    
                })
                .catch((error) => {
                    message.error("Lỗi tải hóa đơn chi tiết");
                }
            );
        }

        return <Col>
                    <Row colSpan={24}>
                        { khachHangData[record.id] ? khachHangInfo(khachHangData[record.id]) : '' }
                    </Row>
                    <Row colSpan={24}>
                        <Divider orientation="left">
                            <Space>
                                <Button className="_success" onClick={() => editCustomer(record, index)}>
                                    <CheckOutlined />
                                    Cập nhật
                                </Button>
                                <Button onClick={() => {setIsModalHoatDongOpen(true); setPidAction(record.id);}}><StopOutlined /> Ngừng hoạt động</Button>
                                <Button onClick={() => {setIsModalXoaOpen(true); setPidAction(record.id);}}><DeleteOutlined /> Xóa</Button>
                            </Space>
                        </Divider>
                    </Row>
                </Col>
    };
    
    const handleCancel = () => {
        setIsModalHoatDongOpen(false);
    }
    const handleCancelDelete = () => {
        setIsModalXoaOpen(false);
    }

    const search = () => {
        formSearch.submit();
    }

    const onFinishSearch = (values) => {
        console.log('vaa', values);
        setLoadingTable(true);
        axios.post(route("customer.search"), values)
            .then((response) => {
                console.log('response.data.data', response.data.data.data);
                
                if (response.data.status_code === 200) {
                    setUsers(response.data.data.data);
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

    function ngungHoatDong() {
        setLoadingTable(true);
        axios.post(route("data.updateCurrentColumn"), {
                table:'users',
                column_name:'customer_status_id',
                value:2,
                id:pidAction
            })
            .then((response) => {
                message.success("Đã đổi trạng thái sang ngừng hoạt động");
                location.reload();
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            }
        );
    }

    function deleteUser() {
        setLoadingTable(true);
        axios.post(route("data.updateCurrentColumn"), {
                table:'users',
                column_name:'is_recycle_bin',
                value:1,
                id:pidAction
            })
            .then((response) => {
                message.success("Đã xóa");
                location.reload();
            })
            .catch((error) => {
                message.error("Cập nhật thất bại");
            }
        );
    }

    const cancelEdit = () => {
        setIsModalEdit(false);
    }

    function initialFormCustomer() {
        return {
            name:'',
            phone:'',
            gioi_tinh_id:null,
            ngay_sinh:null,
            facebook:'',
            address:'',
            customer_group_id:null,
            customer_status_id:1
        };
    }

    function addNewCustomer() {
        formCustomer.resetFields();
        setIsModalEdit(true); 
        setIdEdit(0);
    }

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={routeSales}
                current={props.table}
                content={
                    <div>
                        {/* modal ngừng hoạt động */}
                        <Modal title="Xác nhận ngừng hoạt động" 
                            open={isModalHoatDongOpen} 
                            onOk={() => ngungHoatDong()} 
                            okText="Ngừng hoạt động"
                            cancelText="Hủy"
                            onCancel={handleCancel}>
                            <p>Các khách hàng ngừng hoạt động sẽ không hiển thị ở danh sách hàng hóa nữa. Bạn có thể xem lại ở phần lọc 
                                <em>khách hàng ngừng hoạt động</em>.</p>
                            
                        </Modal>

                        {/* modal xóa */}
                        <Modal title="Xác nhận xóa" 
                            open={isModalXoaOpen} 
                            onOk={deleteUser} 
                            okText="Đồng ý xóa"
                            cancelText="Hủy"
                            onCancel={handleCancelDelete}>
                            <p>Các thông tin về khách hàng này sẽ bị xóa hoàn toàn</p>
                        </Modal>

                        {/* modal edit */}
                        <Modal title={<p className="title02">Thêm khách hàng <hr/></p>}
                            open={isModalEdit} 
                            onOk={() => {formCustomer.submit();}} 
                            okText={<span className="btn-05">Lưu</span>}
                            cancelText="Hủy"
                            width={1000}
                            onCancel={cancelEdit}>
                                
                                <Form
                                    name="basic"
                                    layout="horizontal"
                                    onFinish={onFinishCustomer}
                                    // onFinishFailed={onFinishSearchFailed}
                                    autoComplete="off"
                                    form={formCustomer}
                                    initialValues={initialFormCustomer()}
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
                                            <Form.Item name='name' label='Họ tên' rules={[{ required: true,message: 'Vui lòng nhập tên khách hàng',}]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col md={{ span: 12 }} sm={{ span: 24 }}>
                                            <Form.Item name='phone' label='Điện thoại' rules={[{ required: true,message: 'Vui lòng nhập số điện thoại',}]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col md={{ span: 12 }} sm={{ span: 24 }}>
                                            <Form.Item name='gioi_tinh_id' label={<p>Giới tính</p>} rules={[{ required: true,message: 'Vui lòng chọn giới tính',}]}>
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
                                                    options={props.userSource.map((g)=>{
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
                                                    options={props.customerGroup.map((g)=>{
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
                                    </Row>

                                </Form>

                        </Modal>
                        
                            {/* <div style={{ marginBottom: 16 }}>
                                <em>
                                    {" "}
                                    Trang {props.pageConfig.currentPage}, hiển thị{" "}
                                    {props.pageConfig.count}/{props.pageConfig.total}
                                </em>
                            </div> */}
                            

                            <Row>
                                <Col sm={{span:24}}>
                                    <Button type="primary" className="_right" 
                                        onClick={()=>{addNewCustomer()}}>
                                        <PlusCircleOutlined />Thêm mới
                                    </Button>
                                </Col>

                                <Col sm={{span:24}}>
                                    <br />
                                </Col>

                                {/* Search */}
                                <Col sm={{ span: 6 }}>
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

                                            {/* Giới tính  */}
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
                                                <Form.Item name='customer_status_id' label='Trạng thái'>
                                                <Radio.Group
                                                    style={{ display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8,}}
                                                    onChange={search}
                                                    defaultValue={0}
                                                    options={[
                                                        { value: 1, label: 'Đang Hoạt động' },
                                                        { value: 2, label: 'Ngừng hoạt động' },
                                                        { value: 3, label: 'Đã xóa' },
                                                    ]}
                                                    />
                                                </Form.Item>
                                            </Col>

                                        </Row>
                                    </Form>
                                </Col>

                                {/* content */}
                                <Col sm={{ span: 18 }}>
                                    <Table
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
