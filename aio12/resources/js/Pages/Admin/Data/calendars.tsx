import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import axios from 'axios';
import {
    Badge, Calendar, Select, Row, Col, Radio, Input,
    Modal, Form, message, List, Button, DatePicker, Checkbox
} from "antd";
import { PlusCircleOutlined, CloseSquareOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';


import { btnAddNew, showDataPopup } from "../../../Function/data";
import { optionEntries, showInfo } from "../../../Function/common";

import "../../../../css/form.css";
import "../../../../css/task.css";



export default function Dashboard(props: any) {
    const [formData] = Form.useForm();
    const [listData, setListData] = useState(props.calendars);
    const [mode, setMode] = useState('month');
    const [month, setMonth] = useState(props.month);
    const [year, setYear] = useState(props.year);
    const [isOpenAddNew, setIsOpenAddNew] = useState(false);
    const [isOpenAddExpress, setIsOpenAddExpress] = useState(false);
    const [isOpenDetail, setIsOpenDetail] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [dataDetail, setDataDetail] = useState([]);

    const [isLoadingBtn, setIsLoadingBtn] = useState(false);

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

    const onPanelChange = (date: any, mode: string) => {
        console.log("mode", mode);
        console.log("eee", date.format("YYYY-MM-DD"));
        setMode(mode);
    };

    const headerRender = ({
        value,
        type,
        onChange,
        onTypeChange,
    }: {
        value: any;
        type: string;
        onChange: (date: any) => void;
        onTypeChange: (type: string) => void;
    }) => {
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
        setIsOpenAddNew(false);
    };

    const onFinish = (values: any) => {
        values = formatValueForm(values);
        values.table_id = props.table.id;
        axios.post(route('data.tblSelect.save'), values)
            .then((response) => {
                if (response.status === 200) {
                    message.success("Thêm mới thành công!");
                    loadData(year + '-' + month + '-01');
                    setIsOpenAddNew(false);
                } else {
                    message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
                }
            })
            .catch((error) => {
                console.log('error', error);
                message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
            });

    };

    function formatValueForm(values: any) {
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
        setIsOpenAddNew(true);
        formData.resetFields();
    }

    function formAddTaskExpress() {
        let formAddExpress_default: any = [];
        props.columns.forEach((col: any) => {
            if (col.edit === 1 && col.require === 1) {
                formAddExpress_default.push({
                    name: col.name,
                    type_edit: col.type_edit,
                    display_name: col.display_name,
                    edit: col.edit,
                    require: col.require,
                    value: null,
                });
            }

        });
        const [formAddExpress, setFormAddExpress] = useState([formAddExpress_default, formAddExpress_default]);
        const [date_applyAll, setDate_applyAll] = useState(true);

        function remove(key) {
            setFormAddExpress(prev =>
                prev.filter((_, index) => index !== key)
            );
        }

        function updateformAddExpres(col: any, val: any, rowIndex: number = 0) {
            if (col.type_edit === 'datetime' && date_applyAll) {
                // Apply to all rows for this specific column name
                setFormAddExpress(prev =>
                    prev.map(row =>
                        row.map(column => {
                            if (column.name === col.name) {
                                return {
                                    ...column,
                                    value: val
                                };
                            }
                            return column;
                        })
                    )
                );
                return;
            }

            // Update only specific row and column
            setFormAddExpress(prev =>
                prev.map((row, rIndex) => {
                    if (rIndex === rowIndex) {
                        // Update specific row
                        return row.map((column: any) => {
                            if (column.name === col.name) {
                                return {
                                    ...column,
                                    value: val
                                };
                            }
                            return column;
                        });
                    }
                    return row;
                })
            );
        };

        function addExpress() {
            // validation form
            let isValid = true;

            formAddExpress.forEach((item, index) => {
                if (item.name && item.name.trim() !== '' && !item.task_status_id) {
                    isValid = false;
                    message.error(<em>Vui lòng nhập trạng thái cho <b>{item.name}</b></em>);
                }
            });
            if (!isValid) return;

            setIsLoadingBtn(true);
            axios.post(route("task.addTaskExpress", [props.parentName]), {
                datas: formAddExpress,
                pid: props.pid
            }).then((response) => {
                setIsLoadingBtn(false);
                setIsModalAddExpress(false);
                setColumns(response.data.data);
            }).catch((error) => {
                message.error("Tạo mới thất bại");
            });
        }

        return <table className="table-sub">
            <thead>
                <tr>
                    {formAddExpress_default.map((item, key) => {
                        return <th key={item.name}>
                            <span>{item.display_name}</span>
                            {item.type_edit === 'datetime' ?
                                <>
                                    <br />
                                    <Checkbox checked={date_applyAll}
                                        onChange={(e) => { setDate_applyAll(e.target.checked) }}
                                    >
                                        <em>Áp dụng tất cả</em>
                                    </Checkbox>
                                </> : ''
                            }
                        </th>;
                    })}
                    <th>Xóa</th>
                </tr>
            </thead>
            <tbody>
                {/* form Thêm task express */}
                {
                    formAddExpress.map((item, key) => {
                        return <tr key={key}>
                            {item.map((col: any, colKey: number) => {

                                console.log('====================================');
                                console.log('colcolcolcol', col);
                                console.log('====================================');
                                if (col.type_edit === 'select') {
                                    return <td key={colKey}>
                                        <Select
                                            value={col.value}
                                            onChange={val => updateformAddExpres(col, val, key)}
                                            options={props.selectData[col.name] || []}
                                            placeholder={`Chọn ${col.display_name}`}
                                        />
                                    </td>;
                                }

                                if (col.type_edit === 'text') {
                                    return <td key={colKey}>
                                        <Input
                                            value={col.value}
                                            onChange={e => updateformAddExpres(col, e.target.value, key)}
                                            placeholder={`Nhập ${col.display_name}`}
                                        />
                                    </td>;
                                }

                                if (col.type_edit === 'textarea') {
                                    return <td key={colKey}>
                                        <Input.TextArea
                                            value={col.value}
                                            onChange={e => updateformAddExpres(col, e.target.value, key)}
                                            placeholder={`Nhập ${col.display_name}`}
                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                        />
                                    </td>;
                                }

                                if (col.type_edit === 'datetime') {
                                    return <td key={colKey}>
                                        <DatePicker
                                            value={col.value}
                                            onChange={date => updateformAddExpres(col, date, key)}
                                            placeholder={`Nhập ${col.display_name}`}
                                        />
                                    </td>;
                                }
                            })}
                            <td>
                                <Button type="link" onClick={() => remove(key)}>Xóa</Button>
                            </td>
                        </tr>;
                    })
                }
            </tbody>
            <tbody>
                <tr>
                    <td colSpan={4}>
                        <a className="add-item01">
                            <span className="icon-b" onClick={() => setFormAddExpress(prev => [...prev, formAddExpress_default])}>
                                <PlusCircleOutlined /> Thêm mới
                            </span>
                        </a>
                    </td>
                </tr>
                <tr>
                    <td colSpan={4}>
                        <Row className="main-modal-footer01">
                            <Col span={24} className="main-btn-popup">
                                <Button className="btn-popup" type="primary" onClick={() => addExpress()} loading={isLoadingBtn}>
                                    <CheckOutlined />
                                    TẠO MỚI
                                </Button>
                                <span> </span>
                                <Button className="btn-popup" onClick={() => setIsOpenAddExpress(false)} loading={isLoadingBtn}>
                                    <CloseSquareOutlined />
                                    ĐÓNG
                                </Button>
                            </Col>
                        </Row>
                    </td>
                </tr>
            </tbody>

        </table>
    }


    return (
        <AdminLayout
            auth={props.auth}
            content={
                <div>

                    <Button type="primary" onClick={() => setIsOpenAddExpress(true)} style={{ marginBottom: '10px' }}>
                        <PlusCircleOutlined />
                        Thêm nhanh
                    </Button>

                    <Button type="primary" onClick={() => openModal()} style={{ marginBottom: '10px' }}>
                        <PlusCircleOutlined />
                        Thêm mới1
                    </Button>

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

                    {/* Thêm mới */}
                    <Modal
                        title={'Thêm mới'}
                        open={isOpenAddNew}
                        onOk={onOk}
                        onCancel={onCancel}
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
                            {props.columns.map((col: any) => {
                                return showDataPopup(col, props);
                            })}
                        </Form>
                    </Modal>

                    {/* add express */}
                    <Modal
                        title={'Thêm nhanh'}
                        open={isOpenAddExpress}
                        footer={[]}
                        onCancel={() => setIsOpenAddExpress(false)}
                        width={1000}
                    >
                        {formAddTaskExpress()}
                    </Modal>


                    {/* Chi tiết ngày */}
                    <Modal
                        title={currentDate}
                        open={isOpenDetail}
                        onOk={() => setIsOpenDetail(false)}
                        onCancel={() => setIsOpenDetail(false)}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={dataDetail}
                            renderItem={(item: any, index: number) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<a>{item.name}</a>}
                                        description={
                                            <div>
                                                <b>[</b><em>{item.calendar ? dayjs(item.calendar).format('HH:mm') : ''}</em><b>]</b>
                                                <span> </span>
                                                {item.note}
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
