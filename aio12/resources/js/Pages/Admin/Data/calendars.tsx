import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Badge, Calendar, Select,  Row, Col, Radio, Spin, Modal, Form, message, List } from "antd";
import { Link, router } from "@inertiajs/react";
import axios from 'axios';

import { btnAddNew, showDataPopup } from "../../../Function/data";
import { routeQLKho, tblKhoHang, routeSales, tblSale } from "../../../Function/config_route";

export default function Dashboard(props) {
    const [listData, setListData] = useState(props.calendars);
    const [mode, setMode] = useState('month');
    const [month, setMonth] = useState(props.month);
    const [year, setYear] = useState(props.year);
    const [contentForm, setContentForm] = useState(<Spin />);
    const [isOpenAddExpress, setIsOpenAddExpress] = useState(false);
    const [isOpenDetail, setIsOpenDetail] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [dataDetail, setDataDetail] = useState([]);
    const [formData] = Form.useForm();
    const DATE_FORMAT = "YYYY-MM-DD";
    const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";



    const getMonthData = (value) => {
        if (value.month() === 8) {
            return "stt = 8";
        }
    };

    const monthCellRender = (value) => {
        const num = getMonthData(value);
        // return num ? (
        //     <div className="notes-month">
        //         <section>{num}</section>
        //         <span>Tháng </span>
        //     </div>
        // ) : null;
    };

    const dateCellRender = (value) => {
        const key = "" + value.year() + (+value.month() + 1) + value.date();

        if (listData[key] && +listData[key].length > 0) {
            return (
                <ul className="events01">
                    {listData[key].map((item) => (
                        <li key={item.name}>
                            <Badge
                                status="success"
                                text={
                                    <a
                                    // href={route("data.detail", [
                                    //     props.table.id,
                                    //     item.id,
                                    // ])}
                                    >
                                        {item.name}
                                    </a>
                                }
                            />
                        </li>
                    ))}
                </ul>
            );
        }
    };

    const cellRender = (current, info) => {
        if (info.type === "date") return dateCellRender(current);
        if (info.type === "month") return monthCellRender(current);
        return info.originNode;
    };

    const onSelectCalendar = (date) => {
        console.log('date', date.format("YYYYMMD"));
        console.log('listData', listData);
        if (mode == 'year') {
            setMode('month');
            setMonth(date.format("MM"));
            setYear(date.format("YYYY"));
            loadData(date.format("YYYY-MM-01"));
        }
        if (mode == 'month') {
            setIsOpenDetail(true);
            setCurrentDate(date.format("DD/MM/YYYY"));
            setDataDetail(listData[date.format("YYYYMD")]);
        }
    };

    function loadData(date) {
        axios.post(route('data.get_calendar'), {
            table_id: props.table.id,
            date: date
        })
            .then((response) => {
                if (response.status === 200) {
                    message.success("Thêm mới thành công!");
                    setListData(response.data.data);
                } else {
                    message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
                }
            })
            .catch((error) => {
                console.log('error', error);
                message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
            });
    }

    const onPanelChange = (date, mode) => {
        console.log("mode", mode);
        console.log("eee", date.format("YYYY-MM-DD"));
        setMode(mode);
    };

    const headerRender = ({ value, type, onChange, onTypeChange }) => {
        const start = 0;
        const end = 12;
        const monthOptions = [];

        let current = value.clone();
        const localeData = value.localeData();
        const months = [];
        for (let i = 0; i < 12; i++) {
            current = current.month(i);
            months.push(localeData.monthsShort(current));
        }

        for (let i = start; i < end; i++) {
            monthOptions.push(
                <Select.Option key={i} value={i} className="month-item">
                    {months[i]}
                </Select.Option>
            );
        }

        const year = value.year();
        const month = value.month();
        const options = [];
        for (let i = year - 10; i < year + 10; i += 1) {
            options.push(
                <Select.Option key={i} value={i} className="year-item">
                    {i}
                </Select.Option>
            );
        }
        return (
            <div style={{ padding: 8 }}>
                {/* <Typography.Title level={4}>Custom header</Typography.Title> */}
                <Row gutter={8}>
                    <Col>
                        <Radio.Group
                            size="large"
                            onChange={(e) => onTypeChange(e.target.value)}
                            value={type}
                        >
                            <Radio.Button value="month">Tháng</Radio.Button>
                            <Radio.Button value="year">Năm</Radio.Button>
                        </Radio.Group>
                    </Col>
                    <Col>
                        <Select
                            size="small"
                            dropdownMatchSelectWidth={false}
                            className="my-year-select"
                            value={year}
                            onChange={(newYear) => {
                                const now = value.clone().year(newYear);
                                onChange(now);
                            }}
                        >
                            {options}
                        </Select>
                    </Col>
                    <Col>
                        <Select
                            size="small"
                            dropdownMatchSelectWidth={false}
                            value={month}
                            onChange={(newMonth) => {
                                const now = value.clone().month(newMonth);
                                onChange(now);
                            }}
                        >
                            {monthOptions}
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    };

    const onOk = () => formData.submit();

    const onCancel = () => {
        setIsOpenAddExpress(false);
    };

    const onFinish = (values) => {
        values = formatValueForm(values);
        values.table_id = props.table.id;
        axios.post(route('data.tblSelect.save'), values)
            .then((response) => {
                if (response.status === 200) {
                    message.success("Thêm mới thành công!");
                    loadData(year + '-' + month + '-01');
                    setIsOpenAddExpress(false);
                } else {
                    message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
                }
            })
            .catch((error) => {
                console.log('error', error);
                message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
            });

    };

    function formatValueForm(values) {
        for (const [key, col] of Object.entries(props.columns)) {
            if (col.type_edit === "tiny") {
                values[col.name] = tinyRefs.current[col.name].getContent();
            }
            if (col.type_edit === "date") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_FORMAT);
            }
            if (col.type_edit === "datetime") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_TIME_FORMAT);
            }
        }
        return values;
    }

    function openModal() {
        setIsOpenAddExpress(true);
        axios.post(route('data.data_create'), {
            table_id: props.table.id,
        })
            .then((response) => {
                if (response.status === 200) {
                    const listItems = response.data.data.columns.map((column) => {
                        if (column.block_type === null || column.block_type == '') {
                            return showDataPopup(column, response.data.data);
                        }
                    });
                    setContentForm(listItems);
                    setSelectTableId(response.data.data.table.id);
                } else {
                    message.success("Có lỗi xảy ra, xin vui lòng thử lại");
                }
            })
            .catch((response) => {
                message.error("Có lỗi xảy ra, xin vui lòng thử lại");
            });
    }


    function itemMenu() {
        if (tblKhoHang.includes(props.table.name)) {
            return routeQLKho;
        }
        if (tblSale.includes(props.table.name)) {
            return routeSales;
        }
        return props.tables;
    }

    return (
        <AdminLayout
            auth={props.auth}
            header="Trang chủ"
            menus={props.menus}
            menuParentID={props.p}
            current={props.table}
            content={
                <div>
                    {btnAddNew(props)}

                    {/* <Button type="primary" onClick={() => openModal()}>
                        Thêm mới
                    </Button> */}

                    <Calendar
                        mode={mode}
                        locale="vi_VN"
                        cellRender={cellRender}
                        onPanelChange={onPanelChange}
                        onSelect={onSelectCalendar}
                        // onChange={onSelectCalendar}
                        headerRender={headerRender}
                    />

                    <Modal
                        title={'Thêm mới'}
                        open={isOpenAddExpress}
                        onOk={onOk}
                        onCancel={onCancel}
                    // confirmLoading={loadingBtnAdd}
                    >
                        <Form
                            name="basic"
                            layout="vertical"
                            form={formData}
                            onFinish={onFinish}
                            // onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            className='form-modal'
                        >
                            {contentForm}
                        </Form>
                    </Modal>

                    <Modal
                        title={currentDate}
                        open={isOpenDetail}
                        onOk={() => setIsOpenDetail(false)}
                        onCancel={() => setIsOpenDetail(false)}
                    // confirmLoading={loadingBtnAdd}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={dataDetail}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Link href={route("data.detail", [props.table.id, item.id])}>{item.name}</Link>}
                                        description={
                                            <div>
                                                <p><b>Thời gian:</b> {item.calendar}</p>
                                                <p><b>Ghi chú:</b> {item.note}</p>
                                            </div>
                                        }
                                    />
                                    {/* {item.note} */}
                                </List.Item>
                            )}
                        />
                    </Modal>

                </div>
            }
        />
    );
}
