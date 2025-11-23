import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { clone, cloneDeep, create, set } from 'lodash';
import type { CheckboxProps } from 'antd';
import {
    Button, List,
    Table, DatePicker,
    message, Flex,
    Modal, Space,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Row, Col,
    Checkbox,
    Tag,
    Divider,
    Image,
    Upload,
    Dropdown,
    MenuProps,
} from "antd";


import {
    PlusSquareOutlined, ExclamationCircleOutlined, DownOutlined,
    RiseOutlined, FileSearchOutlined,
    PlusCircleOutlined, CheckOutlined,
    DeleteOutlined, FileAddOutlined, FormOutlined
} from "@ant-design/icons";


import "../../../css/form.css";
import { optionEntries, showInfo } from "../../function/common";
import { callApi } from "../../function/api";
import { formatValueForm } from "../../function/input";
import { DON_VI_SERVICE } from "../../function/constant";
import { inArray, parseJson, numberFormat, removeByIndex } from "../../function/common";
import { API } from "../../common/api";
import { ref } from "process";

const CheckboxGroup = Checkbox.Group;
const daysInMonth_default = dayjs().daysInMonth();

const DienNuoc: React.FC = () => {
    const [params] = useSearchParams();
    const p = params.get("p");
    // state
    const dataService_empty = {
        id: 0,
        room_id: null,
        dien_start: 0,
        dien_end: 0,
        nuoc_start: 0,
        nuoc_end: 0,
        nonglanh_start: 0,
        nonglanh_end: 0,
        maybom_start: 0,
        maybom_end: 0,
    };

    const [props, setProps] = useState([]);
    const [dataService, setDataService] = useState([
        { ...dataService_empty },
        { ...dataService_empty },
        { ...dataService_empty }
    ]);
    const [searchData, setSearchData] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [soNguoi, setSoNguoi] = useState(1);
    const [tienPhong, setTienPhong] = useState(0);
    const [tienCoc, setTienCoc] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState(daysInMonth_default);
    const [soNgayThue, setSoNgayThue] = useState(daysInMonth_default);
    const [tienTraCoc, setTienTraCoc] = useState(0);
    const [dateEdit, setDateEdit] = useState<dayjs.Dayjs | null>(null);

    const [month, setMonth] = useState<dayjs.Dayjs | null>(null);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();

    // upload excel
    const [fileList, setFileList] = useState([]);

    const [isModalDataThang, setIsModalDataThang] = useState(false);

    const [formEdit] = Form.useForm();

    const [dataAction, setDataAction] = useState({ id: 0 });
    const [datasAction, setDatasAction] = useState([]);

    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [isDraft, setIsDraft] = useState(2);
    const [note_applyAll, setNote_applyAll] = useState(false);

    const [isRecycleBin, setIsRecycleBin] = useState(false);

    // add số điện nước
    const plainOptions = ['dien', 'nuoc', 'maybom', 'nonglanh'];
    const defaultCheckedList = ['dien'];

    const [checkedList, setCheckedList] = useState<string[]>(defaultCheckedList);

    const checkAll = plainOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < plainOptions.length;

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            position: ["bottonRight"],
            total: 0,
            onChange: (page: number, pageSize?: number) => {
                console.log('xxx', page, pageSize);
                setPagination({ page, pageSize });
            },
        },
    });


    // useEffect
    function fetchData(request = {}) {
        setLoadingTable(true);

        // Đảm bảo pageSize được truyền trong request
        const requestWithPagination = {
            ...request,
            pageSize: request.pageSize || (searchData as any).pageSize || 25, // Mặc định 25 nếu không có
            page: request.page || (searchData as any).page || 1
        };

        axios.post(API.aitilen_DienNuoc, requestWithPagination)
            .then((res: any) => {
                const propsTmp = res.data.data
                console.log('propsTmp', propsTmp);
                setProps(res.data.data);
                setDataSource(propsTmp.datas);
                setTableParams({
                    pagination: {
                        current: propsTmp.pageConfig.currentPage,
                        pageSize: propsTmp.pageConfig.perPage,
                        total: propsTmp.pageConfig.total,
                    },
                });
                // setKhachHangData(propsTmp.khachHang.data);
                // setMocThoiGian(propsTmp.mocThoiGian);
                // setKhoangThoiGian(!propsTmp.khoangThoiGian[0] ? propsTmp.khoangThoiGian : [dayjs(propsTmp.khoangThoiGian[0]), dayjs(propsTmp.khoangThoiGian[1])]);
                // setKeyword(propsTmp.searchData.sm_keyword ? propsTmp.searchData.sm_keyword : '');
                setLoadingTable(false);
            })
            .catch((err: any) => console.error(err));

    }
    useEffect(() => {
        fetchData();
    }, []);

    // Theo dõi sự thay đổi của searchData và pageSize
    useEffect(() => {
        console.log('SearchData updated:', searchData);
        console.log('Current pageSize from searchData:', (searchData as any).pageSize || 'Not set (default: 25)');
    }, [searchData]);

    // search/reload
    function search(request: any = {}) {
        setLoadingTable(true);

        // Đảm bảo pageSize được truyền trong request
        const requestWithPagination = {
            ...request,
            pageSize: request.pageSize || (searchData as any).pageSize || 25, // Mặc định 25 nếu không có
            page: request.page || (searchData as any).page || 1
        };

        console.log('Sending request with pageSize:', requestWithPagination);

        axios.post(API.aitilen_SearchDienNuoc, requestWithPagination)
            .then((response: any) => {
                const res = response.data.data
                console.log('Received pageConfig:', res.pageConfig);
                setDataSource(res.datas);
                setTableParams({
                    pagination: {
                        current: res.pageConfig.currentPage,
                        pageSize: res.pageConfig.perPage,
                        position: ["bottonRight"],
                        total: res.pageConfig.total,
                        onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
                    },
                });
                setLoadingTable(false);
            })
            .catch((err: any) => console.error(err));
    }


    const onChange = (list: string[]) => {
        setCheckedList(list);
    };

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setCheckedList(e.target.checked ? plainOptions : []);
    };

    function submitFormEdit() {
        console.log('dataService', dataService);
        if (!dateEdit) {
            message.error("Vui lòng chọn tháng/năm");
            return;
        }
        let isValid = false;
        dataService.forEach((item: any, index: number) => {
            if (item.room_id) {
                isValid = true;
                return;
            }
        });
        if (!isValid) {
            message.error("Vui lòng chọn ít nhất 1 phòng");
            return;
        }
        // return;
        axios.post(API.aitilen_SaveDienNuoc, {
            datas: dataService,
            month: dateEdit.month() + 1,
            year: dateEdit.year(),
        }).then((response) => {
            console.log('response', response);

            if (response.data.status_code === 200) {
                message.success("Đã lưu dữ liệu thành công");
                setIsOpenFormEdit(false);
                search(searchData);
            } else {
                message.error("Đã lưu dữ liệu thất bại");
            }
            setLoadingTable(false);
        }).catch((error) => {
            message.error("Lưu dữ liệu thất bại");
            setLoadingTable(false);
        });

    }

    function setPagination(pagination: { page?: number; pageSize?: number }) {
        console.log('setPagination', pagination);
        let searchData_tmp = { ...(searchData as any) };
        if (pagination.page) searchData_tmp.page = pagination.page;
        if (pagination.pageSize) searchData_tmp.pageSize = pagination.pageSize;
        setSearchData(searchData_tmp);

        // Gọi search với dữ liệu mới để cập nhật kết quả
        search(searchData_tmp);
    }

    function fastEditRecord(id: number, field: string, value: any) {
        console.log('va', value);

        axios.post(API.aitilen_FastEditDienNuoc, {
            id: id,
            field: field,
            value: value,
        }).then((response) => {
            console.log('response', response);
            if (response.data.status_code === 200) {
                message.success("Đã cập nhật dữ liệu thành công");
                // update dataSource
                let data_tmp = cloneDeep(dataSource);
                data_tmp.forEach((item: any, index: number) => {
                    if (item.id === id) {
                        item[field] = value;
                    }
                });
                search(searchData);
            } else {
                message.error("Đã cập nhật dữ liệu thất bại1");
            }
            setLoadingTable(false);
        }).catch((error) => {
            console.log(error);

            message.error("Cập nhật dữ liệu thất bại2");
        });
    }


    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'room_id',
            key: 'id',
            render: (text: any, record: any) => {
                return <>
                    {props.room[record.room_id] ? <Tag color="blue">{props.room[record.room_id].name}</Tag> : ''}
                </>;
            }
        },
        {
            title: <span>Số điện/nước {showInfo('Chỉ hiển thị nếu có sẵn chỉ số đầu')}</span>,
            dataIndex: 'room_id',
            key: 'id',
            render: (text: any, record: any) => {
                return <>
                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Điện cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'dien_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.dien_start ? <Tag className="_point" color="blue">Điện:{record.dien_start}-{record.dien_end}</Tag> : ''}
                    </Popconfirm>

                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Nước cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'nuoc_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.nuoc_start ? <Tag className="_point" color="green">Nước:{record.nuoc_start}-{record.nuoc_end}</Tag> : ''}

                    </Popconfirm>

                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Nóng lạnh cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'nonglanh_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.nonglanh_start ? <Tag className="_point" color="orange">Nóng lạnh:{record.nonglanh_start}-{record.nonglanh_end}</Tag> : ''}
                    </Popconfirm>

                    <Popconfirm
                        title={<><FormOutlined /> Sửa nhanh</>}
                        okText="Đóng"
                        showCancel={false}
                        icon={null}
                        description={<>
                            <InputNumber addonBefore="Máy bơm cuối"
                                onBlur={(e) => fastEditRecord(record.id, 'maybom_end', e.target.value)}
                            />
                        </>}
                    >
                        {record.maybom_start ? <Tag className="_point" color="yellow">Máy bơm:{record.maybom_start}-{record.maybom_end}</Tag> : ''}
                    </Popconfirm>


                </>;
            }
        },
    ];


    const EditableCell = (props: any) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = props;
        let inputNode;
        return <td {...restProps}>{children}</td>;
    };
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    const confirmDelete = () => {
        setIsOpenConfirmDelete(true);
    };
    const handleCancelDelete = () => {
        setIsOpenConfirmDelete(false);
    };

    function addSub() {
        let dataDetail_tmp = cloneDeep(dataService);
        dataDetail_tmp.push(dataService_empty);
        setDataService(dataDetail_tmp);
    }

    const inFinishSearch = (values: any) => {
        values.p = p;
        if (values.end_date) {
            values.end_date = values.end_date.format('YYYY-MM');
        }
        // Format date picker to month and year
        if (values.date) {
            values.month = values.date.month() + 1;
            values.year = values.date.year();
        } else if (!values.month || !values.year) {
            values.month = (searchData as any).month;
            values.year = (searchData as any).year;
        }
        if (!values.room && (searchData as any).room) {
            values.room = (searchData as any).room;
        }
        if (isRecycleBin) {
            values.is_recycle_bin = 1;
        }
        console.log('Search values:', values);
        setSearchData(values);
        search(values);
    }

    function initialsFormSearch() {
        let result = { ...(searchData as any) };
        if (searchData && (searchData as any).month && (searchData as any).year) {
            result.date = dayjs((searchData as any).year + '-' + String((searchData as any).month).padStart(2, '0'));
        }
        return result;
    }

    // Hàm cập nhật giá trị cho từng trường của từng hàng
    function handleChangeInput(index: number, field: string, value: number) {
        let data_tmp = cloneDeep(dataService);
        data_tmp[index][field] = value;
        setDataService(data_tmp);
    }

    const items = [
        {
            key: '1',
            label: <div onClick={() => { setIsOpenFormEdit(true) }}>
                <PlusSquareOutlined />
                Thêm nhanh
            </div>,
        },
        {
            key: '2',
            label: <div onClick={() => setIsModalDataThang(true)}>
                <FileAddOutlined /> Tạo data tháng
            </div>,
        },
    ];

    function openQuickEditFromSelection() {
        if (!selectedRowKeys.length) {
            message.warning('Vui lòng chọn ít nhất 1 dòng');
            return;
        }

        // Dựng map id -> record để truy xuất nhanh
        const mapById = new Map<string, any>(
            (dataSource || []).map((item: any) => [String(item.id), item])
        );

        // Lấy bản ghi đầy đủ theo đúng thứ tự người dùng đã chọn
        const selectedRecords: any[] = selectedRowKeys
            .map((k) => mapById.get(String(k)))
            .filter(Boolean);

        if (!selectedRecords.length) {
            message.warning('Không tìm thấy bản ghi phù hợp trong lựa chọn');
            return;
        }

        // Kiểm tra tất cả bản ghi phải cùng tháng/năm
        const monthYearSet = new Set(
            selectedRecords.map((r: any) => {
                const m = Number(r?.month ?? (searchData as any)?.month);
                const y = Number(r?.year ?? (searchData as any)?.year);
                return `${y}-${m}`;
            })
        );

        if (monthYearSet.size > 1) {
            message.error('Vui lòng chọn các bản ghi cùng tháng/năm');
            return;
        }

        // Set lại dateEdit theo tháng/năm chung
        const [onlyPair] = Array.from(monthYearSet);
        const [yStr, mStr] = onlyPair.split('-');
        const yNum = Number(yStr);
        const mNum = Number(mStr);
        if (yNum && mNum) {
            setDateEdit(dayjs(`${yNum}-${String(mNum).padStart(2, '0')}`));
        }

        // Chuẩn hóa data đưa vào form nhanh
        const selectedRows = selectedRecords.map((r: any) => ({
            id: r.id,
            room_id: r.room_id.toString() ?? null,
            dien_start: Number(r.dien_start ?? 0),
            dien_end: Number(r.dien_end ?? 0),
            nuoc_start: Number(r.nuoc_start ?? 0),
            nuoc_end: Number(r.nuoc_end ?? 0),
            nonglanh_start: Number(r.nonglanh_start ?? 0),
            nonglanh_end: Number(r.nonglanh_end ?? 0),
            maybom_start: Number(r.maybom_start ?? 0),
            maybom_end: Number(r.maybom_end ?? 0),
        }));

        setDataService(selectedRows);
        setIsOpenFormEdit(true);
    }

    const items02 = [
        {
            key: '1',
            label: <a onClick={() => openQuickEditFromSelection()}><FormOutlined /> Sửa nhanh</a>,
        },
        {
            key: '2',
            label: <a onClick={() => setIsModalXoaOpen(true)}><DeleteOutlined /> Xóa</a>,
        },
    ];

    function createDataMonth() {
        if (!month) {
            message.error("Vui lòng chọn tháng/năm cần tạo dữ liệu");
            return;
        }

        axios.post(API.CreateDataDienNuocThang, {
            month: month.month() + 1,
            year: month.year(),
        }).then((response) => {
            console.log('response', response);

            if (response.data.status_code === 200) {
                message.success("Đã tạo dữ liệu thành công");
                setIsModalDataThang(false);
                search(searchData);
            } else {
                message.error("Đã tạo dữ liệu thất bại");
            }
            setLoadingTable(false);
        }).catch((error) => {
            message.error("Tạo dữ liệu thất bại");
            setLoadingTable(false);
        });
    }


    return (
        <div>

            <Divider orientation="left">
                Danh sách số điện/nước {searchData && (searchData as any).month && (searchData as any).year ? `tháng ${(searchData as any).month}/${(searchData as any).year}` : ''}
            </Divider>

            <Row>
                {/* search  */}
                <Col span={24} className="main-search-left">
                    <Form form={formSearch} layout="vertical"
                        onFinish={inFinishSearch}
                        initialValues={initialsFormSearch()}
                    >
                        <Row gutter={[16, 16]}>
                            {/* Tòa nhà */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: 8 }}>
                                    <span>Chọn Tòa nhà </span>
                                    <Popconfirm
                                        title="Chọn phòng"
                                        okText="Đóng"
                                        showCancel={false}
                                        icon={null}
                                        description={<>
                                            <Form.Item
                                                name="room"
                                            >
                                                <Select
                                                    showSearch
                                                    addonBefore="Phòng"
                                                    allowClear={true}
                                                    style={{ width: "100%" }}
                                                    placeholder="Chọn phòng"
                                                    optionFilterProp="children"
                                                    options={optionEntries(props.room)}
                                                    onChange={() => formSearch.submit()}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? "")
                                                            .toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>

                                            <Checkbox value={isRecycleBin} onChange={() => {
                                                setIsRecycleBin(!isRecycleBin);
                                                formSearch.submit();
                                            }}>Chỉ tìm trong thùng rác</Checkbox>
                                        </>}
                                        onConfirm={() => {
                                            formSearch.setFieldsValue({ apm: [] });
                                            formSearch.submit();
                                        }}
                                    >
                                        <a className="_right"><FileSearchOutlined /> Chọn phòng</a>
                                    </Popconfirm>
                                </div>
                                <Form.Item name="apm" style={{ marginBottom: 0 }}>
                                    <Select
                                        showSearch
                                        allowClear={true}
                                        onChange={() => formSearch.submit()}
                                        mode="multiple"
                                        style={{ width: "100%" }}
                                        placeholder="Chọn tòa nhà"
                                        optionFilterProp="children"
                                        options={optionEntries(props.apm)}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>

                            {/* Tháng/Năm */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: 8 }}>Chọn Tháng/Năm</div>
                                <Form.Item name="date" style={{ marginBottom: 0 }}>
                                    <DatePicker
                                        picker="month"
                                        placeholder="Chọn tháng/năm"
                                        style={{ width: "100%" }}
                                        format="MM/YYYY"
                                        onChange={() => formSearch.submit()}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Col>

                {/* content */}
                <Col span={24} className="main-content02">
                    <Row>
                        {/* thao tác */}
                        <Col className="text-left" span={12}>
                            <Dropdown
                                disabled={!hasSelected}
                                className="btn-dropdown _left"
                                menu={{ items: items02 }}>
                                <Button type="primary">
                                    <Space>
                                        Thao tác {hasSelected ? `(${selectedRowKeys.length})` : ''}
                                        <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                        </Col>

                        {/* Thêm nhanh */}
                        <Col className="text-right" span={12}>
                            <Dropdown.Button type="primary"
                                className="btn-dropdown _right"
                                onClick={() => {
                                    setIsOpenFormEdit(true);
                                    setDataAction({ id: 0 });
                                }}
                                menu={{ items }}
                            >
                                <PlusCircleOutlined /> Thêm nhanh
                            </Dropdown.Button>
                        </Col>

                        <Col span={24}><br /></Col>
                    </Row>

                    <Table
                        size="small"
                        // scroll={{ x: 1500, y: 7000 }}
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        loading={loadingTable}
                        pagination={tableParams.pagination}
                        dataSource={dataSource}
                        columns={columns}
                        rowSelection={rowSelection}
                    />
                </Col>

            </Row>

            {/* modal xóa */}
            <Modal title="Xác nhận xóa"
                open={isModalXoaOpen}
                onOk={async () => {
                    const query = (selectedRowKeys || []).map(k => `ids[]=${encodeURIComponent(String(k))}`).join('&');

                    axios.post(API.aitilen_DeleteDienNuoc, {
                        ids: selectedRowKeys,
                    })
                        .then((response) => {
                            // console.log('re', response);
                            if (response.data.status_code === 200) {
                                message.success("Xóa thành công");
                                search(searchData);
                            } else {
                                message.error("Xóa thất bại, vui lòng tải lại trình duyệt và thử lại");
                            }
                            setLoadingTable(false);
                            setIsModalXoaOpen(false);
                        }).catch((error) => {
                            message.error("Xóa không thành công, vui lòng tải lại trình duyệt và thử lại")
                            setLoadingTable(false);
                            setIsModalXoaOpen(false);
                        });


                }}
                okText="Xác nhận xóa"
                cancelText="Hủy"
                maskClosable={true}
                // confirmLoading={confirmLoading}
                onCancel={() => { setIsModalXoaOpen(false); }}>
                <ul>
                    <li>Các thông tin về data này sẽ bị chuyển đến thùng rác</li>
                    <li>Bạn có thể phục hồi lại data này trong mục Thùng rác</li>
                </ul>
            </Modal>

            {/* Xác nhận tạo data tháng */}
            <Modal title={<span><ExclamationCircleOutlined /> Xác nhận tạo data tháng</span>}
                open={isModalDataThang}

                onOk={() => createDataMonth()}
                okText="Xác nhận"
                cancelText="Hủy"
                maskClosable={true}
                onCancel={() => { setIsModalDataThang(false); }}>
                <p><b>Chọn tháng cần tạo:</b> <DatePicker value={month} picker="month" onChange={(date) => setMonth(date)} /></p>
                <p><b>LƯU Ý:</b></p>
                <ul>
                    <li><em>Tạo dữ liệu số điện nước dựa theo số liệu của tháng trước đó</em></li>
                    <li><em>Nếu đã có sẵn dữ liệu trước đó, data cũ sẽ bị chuyển vào thùng rác</em></li>
                    <li><em>Bạn có thể phục hồi lại data cũ trong mục Thùng rác</em></li>
                </ul>
            </Modal>

            <Modal title={dataAction.id === 0 ? "Thêm mới" : "Cập nhật"}
                open={isOpenFormEdit}
                onOk={() => {
                    submitFormEdit();
                }}
                okText="Lưu dữ liệu "
                cancelText="Hủy"
                maskClosable={false}
                width={1000}
                onCancel={() => { setIsOpenFormEdit(false); }}>

                <span>Chọn tháng/năm</span>
                <DatePicker picker="month" value={dateEdit} onChange={(date) => setDateEdit(date)} />
                <p> </p>
                <b>Chọn loại data:</b>
                <em>
                    <span> ( </span>
                    <Checkbox indeterminate={indeterminate}
                        onChange={onCheckAllChange}
                        checked={checkAll}>
                    </Checkbox>
                    <span> Chọn tất cả )</span>
                </em>
                <br />
                <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />
                <table className="table-salary" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Phòng</th>
                            {checkedList.includes('dien') && (
                                <>
                                    <th>Số điện</th>
                                </>
                            )}
                            {checkedList.includes('nuoc') && (
                                <>
                                    <th>Số nước</th>
                                </>
                            )}
                            {checkedList.includes('nonglanh') && (
                                <>
                                    <th>Nóng lạnh</th>
                                </>
                            )}
                            {checkedList.includes('maybom') && (
                                <>
                                    <th>Máy bơm</th>
                                </>
                            )}
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataService.map((item: any, index: number) => (
                            <tr key={index}>
                                <td>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn phòng"
                                        optionFilterProp="children"
                                        options={optionEntries(props.room)}
                                        value={item.room_id}
                                        onChange={(value) => handleChangeInput(index, 'room_id', value)}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                    />
                                </td>
                                {checkedList.includes('dien') && (
                                    <>
                                        <td>
                                            <InputNumber
                                                value={item.dien_start}
                                                onChange={(value) => handleChangeInput(index, 'dien_start', value)}
                                                addonBefore="start"
                                            />
                                            <InputNumber
                                                value={item.dien_end}
                                                onChange={(value) => handleChangeInput(index, 'dien_end', value)}
                                                addonBefore="end"
                                            />
                                        </td>
                                    </>
                                )}
                                {checkedList.includes('nuoc') && (
                                    <>
                                        <td>
                                            <InputNumber
                                                value={item.nuoc_start}
                                                onChange={(value) => handleChangeInput(index, 'nuoc_start', value)}
                                                addonBefore="start"
                                            />
                                            <InputNumber
                                                value={item.nuoc_end}
                                                onChange={(value) => handleChangeInput(index, 'nuoc_end', value)}
                                                addonBefore="end"
                                            />
                                        </td>
                                    </>
                                )}
                                {checkedList.includes('nonglanh') && (
                                    <>
                                        <td>
                                            <InputNumber
                                                value={item.nonglanh_start}
                                                onChange={(value) => handleChangeInput(index, 'nonglanh_start', value)}
                                                addonBefore="start"
                                            />
                                            <InputNumber
                                                value={item.nonglanh_end}
                                                onChange={(value) => handleChangeInput(index, 'nonglanh_end', value)}
                                                addonBefore="end"
                                            />
                                        </td>
                                    </>
                                )}
                                {checkedList.includes('maybom') && (
                                    <>
                                        <td>
                                            <InputNumber
                                                value={item.maybom_start}
                                                onChange={(value) => handleChangeInput(index, 'maybom_start', value)}
                                                addonBefore="start"
                                            />
                                            <InputNumber
                                                value={item.maybom_end}
                                                onChange={(value) => handleChangeInput(index, 'maybom_end', value)}
                                                addonBefore="end"
                                            />
                                        </td>
                                    </>
                                )}
                                <td>
                                    <Button
                                        onClick={() => {
                                            let data_tmp = cloneDeep(dataService);
                                            data_tmp.splice(index, 1);
                                            setDataService(data_tmp);
                                        }}
                                    >
                                        <DeleteOutlined /> Xóa
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: 16, textAlign: "left" }}>
                    <Button
                        type="dashed"
                        icon={<PlusCircleOutlined />}
                        onClick={addSub}
                    >
                        Thêm hàng
                    </Button>
                </div>
            </Modal>

        </div>
    );
};

export default DienNuoc;
