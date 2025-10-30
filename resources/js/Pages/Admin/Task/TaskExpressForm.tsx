import React, { useState } from "react";
import { Input, Select, Checkbox, Button, Row, Col, message } from "antd";
import { PlusCircleOutlined, CheckOutlined, CloseSquareOutlined, DeleteOutlined } from "@ant-design/icons";
// import { optionEntries, showInfo } from "../../../Function/common";
import axios from "axios";

export default function TaskExpressForm({
    users,
    status,
    parentName,
    pid,
    setIsLoadingBtn,
    setIsModalAddExpress,
    setColumns
}: any) {
    const formAddTaskExpress_default = {
        name: '',
        description: '',
        nguoi_thuc_hien: null,
        task_status_id: null
    };
    const [formAddTaskExpress, setFormAddTaskExpress] = useState([
        formAddTaskExpress_default,
        formAddTaskExpress_default,
        formAddTaskExpress_default
    ]);
    const [nguoiThucHien_applyAll, setNguoiThucHien_applyAll] = useState(true);
    const [status_applyAll, setStatus_applyAll] = useState(true);

    function remove(key: number) {
        setFormAddTaskExpress(prev =>
            prev.filter((_, index) => index !== key)
        );
    }

    function updateformAddTaskExpres(idx: number, key: string, val: any) {
        if (key === 'nguoi_thuc_hien' && nguoiThucHien_applyAll) {
            setFormAddTaskExpress(prev =>
                prev.map(item => ({
                    ...item,
                    [key]: val
                }))
            );
            return;
        }

        if (key === 'task_status_id' && status_applyAll) {
            setFormAddTaskExpress(prev =>
                prev.map(item => ({
                    ...item,
                    [key]: val
                }))
            );
            return;
        }

        let updated = [...formAddTaskExpress];
        updated[idx] = { ...updated[idx], [key]: val };
        setFormAddTaskExpress(updated);
    };

    async function addExpress() {
        let isValid = true;
        formAddTaskExpress.forEach((item) => {
            if (item.name && item.name.trim() !== '' && !item.task_status_id) {
                isValid = false;
                message.error(<em>Vui lòng nhập trạng thái cho <b>{item.name}</b></em>);
            }
        });
        if (!isValid) return;

        setIsLoadingBtn(true);
        try {
            const response = await axios.post(route("task.addTaskExpress", [parentName]), {
                datas: formAddTaskExpress,
                pid: pid
            });
            setIsLoadingBtn(false);
            setIsModalAddExpress(false);
            setColumns(response.data.data);
        } catch (error) {
            setIsLoadingBtn(false);
            message.error("Tạo mới thất bại");
        }
    }

    return (
        <table className="table-sub">
            <thead>
                <tr>
                    <th>
                        <span>Tiêu đề </span>
                        {showInfo('Chỉ lưu những công việc có nhập nội dung cho tiêu đề. nếu bỏ trống tiêu đề thì sẽ bỏ qua')}
                    </th>
                    <th>
                        <span>Mô tả </span>
                        {showInfo('Mô tả ngắn về công việc (nếu có)')}
                    </th>
                    <th>
                        <span>Trạng thái </span>
                        {showInfo('Trạng thái hoặc tiến độ hiện tại của công việc, chọn áp dụng tất cả thì sẽ được áp dụng cho tất cả cho các trạng thái khác giống như trạng thái mà bạn vừa chọn')}
                        <br />
                        <Checkbox checked={status_applyAll}
                            onChange={(e) => { setStatus_applyAll(e.target.checked) }}
                        >
                            <em>Áp dụng tất cả</em>
                        </Checkbox>
                    </th>
                    <th>
                        <span>Người thực hiện </span>
                        {showInfo('Chọn người làm chính cho công việc này, chọn áp dụng tất cả thì sẽ được áp dụng cho tất cả cho các "Người thực hiện" đều giống như lựa chọn mà bạn vừa chọn')}
                        <br />
                        <Checkbox checked={nguoiThucHien_applyAll}
                            onChange={(e) => { setNguoiThucHien_applyAll(e.target.checked) }}
                        >
                            <em>Áp dụng tất cả</em>
                        </Checkbox>
                    </th>
                    <th>Xóa</th>
                </tr>
            </thead>
            {formAddTaskExpress.map((item, key) => (
                <tbody key={key}>
                    <tr>
                        <td>
                            <Input value={item.name}
                                placeholder="Nhập tiêu đề"
                                onChange={(e) => {
                                    updateformAddTaskExpres(key, 'name', e.target.value);
                                }}
                            />
                        </td>
                        <td>
                            <Input.TextArea value={item.description}
                                placeholder="Nhập mô tả ngắn"
                                onChange={(e) => {
                                    updateformAddTaskExpres(key, 'description', e.target.value);
                                }}
                            />
                        </td>
                        <td>
                            <Select
                                showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn trạng thái"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={status}
                                value={item.task_status_id}
                                onChange={(val) => {
                                    updateformAddTaskExpres(key, 'task_status_id', val);
                                }}
                            />
                        </td>
                        <td>
                            <Select
                                showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn nhân viên thực hiện"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={users}
                                value={item.nguoi_thuc_hien}
                                onChange={(val) => {
                                    updateformAddTaskExpres(key, 'nguoi_thuc_hien', val);
                                }}
                            />
                        </td>
                        <td>
                            <span onClick={() => remove(key)} title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                        </td>
                    </tr>
                </tbody>
            ))}
            <tbody>
                <tr>
                    <td colSpan={4}>
                        <a className="add-item01">
                            <span className="icon-b" onClick={() => setFormAddTaskExpress(prev => [...prev, formAddTaskExpress_default])}>
                                <PlusCircleOutlined /> Thêm mới
                            </span>
                        </a>
                    </td>
                </tr>
                <tr>
                    <td colSpan={4}>
                        <Row className="main-modal-footer01">
                            <Col span={24} className="main-btn-popup">
                                <Button className="btn-popup" type="primary" onClick={addExpress} loading={false}>
                                    <CheckOutlined />
                                    TẠO MỚI
                                </Button>
                                <span> </span>
                                <Button className="btn-popup" onClick={() => setIsModalAddExpress(false)} loading={false}>
                                    <CloseSquareOutlined />
                                    ĐÓNG
                                </Button>
                            </Col>
                        </Row>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
