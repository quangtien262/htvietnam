import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import React from "react";
import { Modal, Form, Input, Button, ColorPicker, Row, Col, Table, Popconfirm } from "antd";
import { CopyOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
const { TextArea } = Input;

export interface StatusSettingModalProps {
    isShowStatusSetting: boolean;
    closePopupStatus: () => void;
    isModalAddConfig: boolean;
    setIsModalAddConfig: (v: boolean) => void;
    onfinishFormStatus: (values: any) => void;
    formStatus: any;
    columnsStatus: any;
    statusData: any[];
    onDragEnd2: (event: any) => void;
    RowDnd: React.FC<any>;
    statusAction: any;
    deleteTableStatus: (id: number) => void;
}

const StatusSettingModal: React.FC<StatusSettingModalProps> = ({
    isShowStatusSetting,
    closePopupStatus,
    isModalAddConfig,
    setIsModalAddConfig,
    onfinishFormStatus: onfinishFormStatus,
    formStatus: formStatus,
    columnsStatus: columnsStatus,
    statusData,
    onDragEnd2,
    RowDnd,
    statusAction: statusAction,
    deleteTableStatus: deleteTableStatus,
}) => (
    <Modal
        title="Cài đặt trạng thái"
        className="status-setting"
        open={isShowStatusSetting}
        onCancel={closePopupStatus}
        footer={[]}
    >
        <div>
            {/* Thêm / Sửa trạng thái */}
            <Modal
                title={''}
                open={isModalAddConfig}
                footer={null}
                onCancel={() => setIsModalAddConfig(false)}
            >
                <Form layout="vertical" onFinish={onfinishFormStatus} form={formStatus}>
                    <Form.Item label='Tên' name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Mô tả' name="description">
                        <Input />
                    </Form.Item>
                    <Form.Item label='Màu chữ' name="color">
                        <ColorPicker showText />
                    </Form.Item>

                    <Form.Item label='Màu nền' name="background">
                        <ColorPicker showText />
                    </Form.Item>

                    <Button type="primary" htmlType="submit"> <CopyOutlined /> Lưu dữ liệu </Button>
                </Form>
            </Modal>
            {/* TODO: taskConfig */}
            <div>
                <Button type="dashed" onClick={() => setIsModalAddConfig(true)} style={{ marginBottom: 16 }}>
                    <PlusCircleOutlined /> Thêm mới
                </Button>
                <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd2}>
                    <SortableContext items={statusData.map((i) => i.key)} strategy={verticalListSortingStrategy}>
                        <Table
                            rowKey="key"
                            components={{ body: { row: RowDnd } }}
                            columns={columnsStatus}
                            dataSource={statusData}
                        />
                    </SortableContext>
                </DndContext>
            </div>
            <Row>
                <Col sm={24} className="text-center">
                    <br />
                    <Button type="primary" className="btn-submit01" onClick={closePopupStatus}>
                        Đóng
                    </Button>
                </Col>
            </Row>
        </div>
    </Modal>
);

export default StatusSettingModal;
