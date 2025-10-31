import React from "react";
import { Divider, List, Popconfirm, Tag } from "antd";
import { CheckSquareFilled, PlusSquareFilled, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { API } from "../../common/api";
import axios from "../../utils/axiosConfig";
import { nl2br} from "../../function/common";
interface CommentItem {
    id: number;
    content: string;
    admin_users_name: string;
    created_at: string;
}

interface TaskCommentProps {
    comments: CommentItem[];
    setCommentAction: (item: any) => void;
    setIsModalComment: (val: boolean) => void;
    formComment: any;
    axios: any;
    route: any;
    message: any;
}

const DATE_TIME_SHOW = "DD/MM/YYYY HH:mm";

const TaskComment: React.FC<TaskCommentProps> = ({
    comments,
    setCommentAction,
    setIsModalComment,
    formComment,
    setComments,
    message,
}) => {
    return (
        <div>
            <Divider orientation="left">
                <span className="title-desc"><CheckSquareFilled /> Comment</span>
                <span> | </span>
                <span className="desc cursor"
                    onClick={() => {
                        setCommentAction({ id: 0 });
                        setIsModalComment(true);
                        formComment.resetFields();
                    }}
                >
                    <PlusSquareFilled />
                    Thêm
                </span>
            </Divider>

            <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                pagination={{
                    pageSize: 5,
                }}
                dataSource={!comments ? [] : comments.map((item: any) => item)}
                renderItem={(item: any) => (
                    <List.Item
                        actions={[
                            <a title="Sửa comment này"
                                className="icon-large"
                                key="list-loadmore-edit"
                                onClick={() => {
                                    setIsModalComment(true);
                                    setCommentAction(item);
                                    formComment.setFieldValue('content', item.content);
                                }}
                            >
                                <EditOutlined />
                            </a>,
                            <Popconfirm
                                icon={<DeleteOutlined />}
                                title="Xác nhận xóa"
                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                onConfirm={() => {
                                    axios.post(API.taskCommentDelete, { id: item.id }).then((response: any) => {
                                        message.success('Xóa comment thành công');
                                        // Cập nhật lại danh sách comment
                                        setComments(comments.filter((c) => c.id !== item.id));
                                    }).catch((error: any) => {
                                        message.error('Xóa comment thất bại');
                                    });
                                }}
                                key="list-loadmore-more"
                            >
                                <span title="Xóa" className="icon-large cursor"><DeleteOutlined /></span>
                            </Popconfirm>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<div></div>}
                            title={<div>
                                <b>{item.admin_users_name}</b>
                                <em className="text-normal date01"> {dayjs(item.created_at).format(DATE_TIME_SHOW)}</em>
                            </div>}
                            description={
                                <div>
                                    <p>{item.content ? <div dangerouslySetInnerHTML={{ __html: nl2br(item.content) }} /> : null}</p>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TaskComment;
