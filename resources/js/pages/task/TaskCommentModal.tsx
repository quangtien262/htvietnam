import React from "react";
import { Modal, Form, Input, Button } from "antd";
import { CopyOutlined } from "@ant-design/icons";

interface TaskCommentModalProps {
    isModalComment: boolean;
    setIsModalComment: (val: boolean) => void;
    formComment: any;
    onFinishFormComment: (values: any) => void;
    isLoadingBtn: boolean;
}

const TaskCommentModal: React.FC<TaskCommentModalProps> = ({
    isModalComment,
    setIsModalComment,
    formComment,
    onFinishFormComment,
    isLoadingBtn,
}) => {
    return (
        <Modal title="Thêm comment"
            open={isModalComment}
            onCancel={() => setIsModalComment(false)}
            footer={[]}
        >
            <Form
                name="formComment"
                form={formComment}
                layout="vertical"
                onFinish={onFinishFormComment}
                autoComplete="off"
            >
                <Form.Item className="edit-description" name='content' label=''>
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={isLoadingBtn}>
                    <CopyOutlined />
                    Lưu comment
                </Button>
            </Form>
        </Modal>
    );
};

export default TaskCommentModal;
