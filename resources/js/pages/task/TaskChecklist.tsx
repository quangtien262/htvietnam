import React from "react";
import { Divider, Flex, Progress, List, Tag, Popconfirm, Checkbox } from "antd";
import { CheckSquareFilled, PlusSquareFilled, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { nl2br } from "../../function/common";
import { API } from "../../common/api";
import { set } from "lodash";
interface ChecklistItem {
    id: number;
    name: string;
    content: string;
    admin_user_id: number;
    nguoi_thuc_hien_name?: string;
    is_checked?: boolean;
}

interface TaskChecklistProps {
    checklist: ChecklistItem[];
    checklistPercent: number;
    setCheckListAction: (item: any) => void;
    setIsModalChecklist: (val: boolean) => void;
    setFormChecklist: (val: any) => void;
    formChecklist_default: any;
    removeChecklistByIndex: (key: number, id: number) => void;
    axios: any;
    route: any;
    dataAction: any;
    setChecklist: (val: any) => void;
    setChecklistPercent: (val: any) => void;
    message: any;
    nl2br: (val: string) => string;
}

const TaskChecklist: React.FC<TaskChecklistProps> = ({
    checklist,
    checklistPercent,
    setCheckListAction,
    setIsModalChecklist,
    setFormChecklist,
    formChecklist_default,
    removeChecklistByIndex,
    axios,
    dataAction,
    setChecklist,
    setChecklistPercent,
    message,
}) => {
    return (
        <div>
            <Divider orientation="left">
                <span className="title-desc"><CheckSquareFilled /> Checklist</span>
                <span> | </span>
                <span className="desc cursor" onClick={() => {
                    setCheckListAction({ id: 0 });
                    setIsModalChecklist(true);
                    setFormChecklist([formChecklist_default, formChecklist_default, formChecklist_default]);
                }}> <PlusSquareFilled /> Thêm</span>
            </Divider>
            <Flex gap="small" vertical>
                <Progress percent={checklistPercent} status={checklistPercent === 100 ? "success" : "active"} />
            </Flex>

            <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                pagination={{
                    pageSize: 10,
                }}
                dataSource={!checklist ? [] : checklist.map((item: any) => item)}
                locale={{ emptyText: 'Danh sách checklist trống' }}
                renderItem={(item, key) => (
                    <List.Item
                        actions={[
                            <span key="user">{item.nguoi_thuc_hien_name ? <Tag color="cyan">{item.nguoi_thuc_hien_name}</Tag> : ''}</span>,
                            <a title="Sửa checklist này"
                                onClick={() => {
                                    setIsModalChecklist(true);
                                    setCheckListAction(item);
                                    setFormChecklist([{ id: item.id, name: item.name, content: item.content, admin_user_id: item.nguoi_thuc_hien }]);
                                }}
                                className="icon-large"
                                key="list-loadmore-edit">
                                <EditOutlined />
                            </a>,
                            <Popconfirm
                                icon={<DeleteOutlined />}
                                title="Xác nhận xóa"
                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                onConfirm={() => {
                                    removeChecklistByIndex(item.id);
                                }}
                                key="list-loadmore-more"
                            >
                                <span title="Xóa" className="icon-large cursor"><DeleteOutlined /></span>
                            </Popconfirm>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                <Checkbox defaultChecked={item.is_checked ? true : false}
                                    onChange={(e) => {
                                        let status = 0;
                                        if (e.target.checked) {
                                            status = 1;
                                        }
                                        axios.post(API.taskChecklist_ChangeStatus, {
                                            id: item.id,
                                            value: status,
                                            task_id: dataAction.id,
                                        }).then((response: any) => {
                                            message.success('Cập nhật checklist thành công');
                                            setChecklist(response.data.data.checklist);
                                            setChecklistPercent(response.data.data.percent);

                                        }).catch((error: any) => {
                                            message.error('Cập nhật checklist thất bại');
                                        });
                                    }}
                                />
                            }
                            title={
                                <div>
                                    <b style={{ color: item.is_checked ? 'green' : '#000', fontWeight: item.is_checked ? 'normal' : 'bold' }}>
                                        {item.name}
                                    </b>
                                </div>
                            }
                            description={item.content !== null || item.content !== '' ? <div dangerouslySetInnerHTML={{ __html: nl2br(item.content) }} /> : ''}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TaskChecklist;
