import { useState } from "react";
import {
    Button,
    message,
    Input,
    Select,
    Row, Col,
    Checkbox,
} from "antd";
import axios from "axios";
import {
    PlusCircleOutlined,
    DeleteOutlined, CheckOutlined
} from "@ant-design/icons";
import { optionEntries } from "../Function/common";

export function formAddTaskExpress(users) {
    const formAddTaskExpress_default = {
        name: '',
        description: '',
        nguoi_thuc_hien: null
    };
    const [formAddTaskExpress, setFormAddTaskExpress] = useState([formAddTaskExpress_default, formAddTaskExpress_default, formAddTaskExpress_default]);
    const [formAddTaskExpress_applyAll, setFormAddTaskExpress_applyAll] = useState(true);

    function remove(key) {
        setFormAddTaskExpress(prev =>
            prev.filter((_, index) => index !== key)
        );
    }

    function updateformAddTaskExpres(idx, key, val) {
        console.log('xxxx');

        if (key === 'nguoi_thuc_hien' && formAddTaskExpress_applyAll) {
            setFormAddTaskExpress(prev =>
                prev.map(item => ({
                    ...item,
                    nguoi_thuc_hien: val
                }))
            );
            return;
        }

        let updated = [...formAddTaskExpress]; // sao chép mảng
        updated[idx] = { ...updated[idx], [key]: val }; // cập nhật phần tử
        setFormAddTaskExpress(updated); // cập nhật state
    };

    function addExpress() {
        axios.post(route("task.addTaskExpress"), {
            datas: formAddTaskExpress
        }).then((response) => {
            location.reload();
            // setChecklist(response.data.data);
            // setIsLoadingBtn(false);
            // setIsModalChecklist(false);
            // message.success("Tạo công việc thành công");

            // // let formChecklist_tmp = cloneDeep(formChecklist);
            // const formChecklist_tmp = [formChecklist_default, formChecklist_default, formChecklist_default];
            // setFormChecklist(formChecklist_tmp);
        }).catch((error) => {
            message.error("Tạo checklist thất bại");
        });
    }

    return <table className="table-sub">
        <thead>
            <tr>
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>
                    Người thực hiện
                    <br />
                    <Checkbox checked={formAddTaskExpress_applyAll}
                        onChange={(e) => { setFormAddTaskExpress_applyAll(e.target.checked) }}
                    >
                        <em>Áp dụng tất cả</em>
                    </Checkbox>
                </th>
                <th>Xóa</th>
            </tr>
        </thead>
        {/* form Thêm checklist */}
        {
            formAddTaskExpress.map((item, key) => {
                return <tbody key={key}>
                    <tr>
                        <td>
                            <Input value={item.name}
                                onChange={(e) => {
                                    updateformAddTaskExpres(key, 'name', e.target.value);
                                }}
                            />
                        </td>
                        <td>
                            <Input.TextArea value={item.description}
                                onChange={(e) => {
                                    // const updated = [...formAddTaskExpress]; // sao chép mảng
                                    // updated[key] = { ...updated[key], description: e.target.value }; // cập nhật phần tử
                                    // setFormAddTaskExpress(updated); // cập nhật state
                                    updateformAddTaskExpres(key, 'description', e.target.value);
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
                                options={optionEntries(users)}
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
            })
        }

        <tbody>
            <tr>
                <td colSpan={4}>
                    <a className="add-item01" onClick={() => addFormCheckList()}>
                        <span className="icon-b" onClick={() => setFormAddTaskExpress(prev => [...prev, formAddTaskExpress_default])}>
                            <PlusCircleOutlined /> Thêm công việc
                        </span>
                    </a>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <Row className="main-modal-footer01">
                        <Col span={24} className="main-btn-popup">
                            <span> </span>
                            <Button className="btn-popup" type="primary" onClick={()=>addExpress()}>
                                <CheckOutlined />
                                Tạo Công việc
                            </Button>
                        </Col>
                    </Row>
                </td>
            </tr>
        </tbody>

    </table>
}



