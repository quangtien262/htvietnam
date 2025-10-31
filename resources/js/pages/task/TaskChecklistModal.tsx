import React from "react";
import { Modal, Input, Select, Checkbox, Button, Row, Col } from "antd";
import { PlusCircleOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";

interface ChecklistItem {
    name: string;
    content: string;
    admin_user_id: number | null;
}

interface TaskChecklistModalProps {
    isModalChecklist: boolean;
    setIsModalChecklist: (val: boolean) => void;
    formChecklist: ChecklistItem[];
    updateChecklistByIndex: (index: number, updatedData: any) => void;
    users: any;
    isApplyAll: boolean;
    setIsApplyAll: (val: boolean) => void;
    checkListAction: { id: number };
    removeFormChecklist: (key: number) => void;
    addFormCheckList: () => void;
    isLoadingBtn: boolean;
    updateOrCreateChecklist: () => void;
}

const TaskChecklistModal: React.FC<TaskChecklistModalProps> = ({
    isModalChecklist,
    setIsModalChecklist,
    formChecklist,
    updateChecklistByIndex,
    users,
    isApplyAll,
    setIsApplyAll,
    checkListAction,
    removeFormChecklist,
    addFormCheckList,
    isLoadingBtn,
    updateOrCreateChecklist,
}) => {
    return (
        <Modal title="Thêm checklist"
            open={isModalChecklist}
            onCancel={() => setIsModalChecklist(false)}
            footer={[]}
            width={1000}
        >
            <table className="table-sub">
                <thead>
                    <tr>
                        <th>Tiêu đề</th>
                        <th>Mô tả</th>
                        <th>
                            Người thực hiện
                            <br />
                            <Checkbox checked={isApplyAll}
                                onChange={(e) => setIsApplyAll(e.target.checked)}
                            >
                                Áp dụng tất cả
                            </Checkbox>
                        </th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                {formChecklist.map((item, key) => (
                    <tbody key={key}>
                        <tr>
                            <td>
                                <Input value={item.name} onChange={(e) => updateChecklistByIndex(key, { name: e.target.value })} />
                            </td>
                            <td>
                                <Input.TextArea value={item.content} onChange={(e) => updateChecklistByIndex(key, { content: e.target.value })} />
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
                                    value={item.admin_user_id}
                                    options={users}
                                    onChange={(value) => {
                                        if (!isApplyAll) {
                                            updateChecklistByIndex(key, { admin_user_id: value });
                                        }
                                        // Nếu áp dụng tất cả thì set cho toàn bộ
                                        if (isApplyAll) {
                                            // setFormChecklist(prev => prev.map(item => ({ ...item, admin_user_id: value })));
                                            // Để parent xử lý
                                        }
                                    }}
                                />
                            </td>
                            {checkListAction.id === 0 ? (
                                <td>
                                    <span onClick={() => removeFormChecklist(key)}
                                        title="Xóa"
                                        className="icon-large cursor"
                                        key="list-loadmore-more">
                                        <DeleteOutlined />
                                    </span>
                                </td>
                            ) : null}
                        </tr>
                    </tbody>
                ))}
                <tbody>
                    {checkListAction.id === 0 ? (
                        <tr>
                            <td colSpan={4}>
                                <a className="add-item01" onClick={() => addFormCheckList()}>
                                    <span className="icon-b"><PlusCircleOutlined /> Thêm Checklist</span>
                                </a>
                            </td>
                        </tr>
                    ) : null}
                    <tr>
                        <td colSpan={4}>
                            <Row className="main-modal-footer01">
                                <Col span={24} className="main-btn-popup">
                                    <span> </span>
                                    <Button className="btn-popup"
                                        loading={isLoadingBtn}
                                        type="primary"
                                        onClick={() => updateOrCreateChecklist()}
                                    >
                                        <CheckOutlined />
                                        Lưu Checklist
                                    </Button>
                                </Col>
                            </Row>
                        </td>
                    </tr>
                </tbody>
            </table>
        </Modal>
    );
};

export default TaskChecklistModal;
