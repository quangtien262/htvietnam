// Em tách phần mô tả công việc ra component riêng cho sếp
import React from 'react';
import { Divider, Popconfirm, Form, Input, Empty } from 'antd';
import { EditFilled, SnippetsFilled } from '@ant-design/icons';
import { nl2br } from '../../function/common';

interface TaskDescriptionProps {
    isLoadingBtn: boolean;
    formDesc: any;
    onFinishFormDesc: (values: any) => void;
    dataAction: any;
}

const TaskDescription: React.FC<TaskDescriptionProps> = ({ isLoadingBtn, formDesc, onFinishFormDesc, dataAction }) => {
    return (
        <>
            <Divider orientation="left">
                <span className="title-desc"><SnippetsFilled /> Mô tả</span>
                <span> | </span>
                <Popconfirm
                    icon={<EditFilled />}
                    title="Sửa mô tả"
                    okButtonProps={{ loading: isLoadingBtn }}
                    onConfirm={() => formDesc.submit()}
                    description={
                        <Form
                            name="formDesc"
                            form={formDesc}
                            layout="vertical"
                            onFinish={onFinishFormDesc}
                            autoComplete="off"
                            initialValues={{ description: dataAction.description }}
                        >
                            <Form.Item className="edit-description" name='description' label=''>
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Form>
                    }
                >
                    <span className="desc cursor"> <EditFilled /> Sửa</span>
                </Popconfirm>
            </Divider>
            <div>
                <p className="description01">{!dataAction.description ? <Empty image={null} description="Chưa có mô tả" /> : <div dangerouslySetInnerHTML={{ __html: nl2br(dataAction.description) }} />}</p>
            </div>
        </>
    );
};

export default TaskDescription;
