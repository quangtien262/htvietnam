import React from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    Row,
    Col,
    Divider,
    Space,
    Radio
} from "antd";
import {
    CheckOutlined,
    CloseSquareOutlined,
    PlusCircleOutlined
} from "@ant-design/icons";
import { optionEntries } from "../../../Function/common";

export default function TaskFormModal({
    open,
    onClose,
    formData,
    onFinishData,
    initialValues,
    isLoadingBtn,
    status,
    users,
    priority,
    type,
    setTypeSubmit
}: any) {
    return (
        <Modal
            title="Thêm mới"
            open={open}
            onCancel={onClose}
            footer={[]}
            width={{
                xs: '90%',
                sm: '80%',
                md: '70%',
                lg: '60%',
                xl: '50%',
                xxl: '40%',
            }}
        >
            <Form
                name="htvn"
                form={formData}
                layout="vertical"
                onFinish={onFinishData}
                autoComplete="off"
                initialValues={initialValues}
                className="form-popup"
            >
                <Row>
                    <Col sm={24}>
                        <Form.Item name='task_status_id' label='Chọn trạng thái' rules={[{ required: true, message: 'Vui lòng nhập trạng thái công việc', }]}>
                            <Radio.Group
                                block
                                optionType="button"
                                buttonStyle="solid"
                                defaultValue={1}
                                options={Object.entries(status).map(([key, value]) => ({
                                    value: value.id,
                                    label: value.name,
                                    key: value.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    {/* Nội dung chi tiết */}
                    <Col sm={{ span: 16 }}>
                        <Row>
                            <Col sm={{ span: 24 }} className="main-item-form">
                                <div>
                                    <Divider orientation="left"><Space>Nội dung chi tiết</Space></Divider>
                                </div>
                            </Col>

                            <Col sm={{ span: 24 }}>
                                {/* Tên công việc */}
                                <Form.Item className="item-form-textarea" name='name' label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên công việc', }]}>
                                    <Input />
                                </Form.Item>
                            </Col>

                            <Col sm={{ span: 24 }}>
                                <Form.Item className="item-form" name='nguoi_thuc_hien' label="Người thực hiện">
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
                                    />
                                </Form.Item>
                            </Col>

                            <Col sm={{ span: 24 }}>
                                <Form.Item className="item-form" name='nguoi_theo_doi' label="Người phối hợp thực hiện hoặc theo dõi">
                                    <Select showSearch
                                        mode="multiple"
                                        style={{ width: "100%" }}
                                        placeholder="Người phối hợp thực hiện hoặc theo dõi"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={optionEntries(users)}
                                    />
                                </Form.Item>
                            </Col>

                            <Col sm={{ span: 24 }}>
                                {/* Mô tả chi tiết */}
                                <Form.Item className="item-form-textarea" name='description' label="Mô tả thêm">
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>

                    {/* Cài đặt */}
                    <Col sm={{ span: 8 }}>
                        <Row>
                            <Col sm={{ span: 24 }} className="main-item-form">
                                <div>
                                    <Divider orientation="left"><Space>Cài đặt</Space></Divider>
                                </div>
                            </Col>
                            {/* Độ ưu tiên */}
                            <Col sm={{ span: 24 }}>
                                <Form.Item className="item-form" name='task_priority_id' label="Độ ưu tiên">
                                    <Select showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn mức độ ưu tiên"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={optionEntries(priority)}
                                    />
                                </Form.Item>
                            </Col>
                            {/* Loại công việc */}
                            <Col sm={{ span: 24 }}>
                                <Form.Item className="item-form" name='task_type_ids' label="Loại công việc">
                                    <Select showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn loại công việc"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={optionEntries(type)}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Ngày bắt đầu */}
                            <Col sm={{ span: 24 }} className="main-item-form">
                                <Form.Item className="item-form" name='start' label="Ngày bắt đầu">
                                    <DatePicker format='DD/MM/YYYY' />
                                </Form.Item>
                            </Col>

                            {/* Ngày hoàn thành */}
                            <Col sm={{ span: 24 }} className="main-item-form">
                                <Form.Item className="item-form" name='end' label="Ngày hoàn thành">
                                    <DatePicker format='DD/MM/YYYY' />
                                </Form.Item>
                            </Col>

                            {/* Người giao việc */}
                            <Col sm={{ span: 24 }} className="main-item-form">
                                <Form.Item className="item-form" name='nguoi_tạo' label="Người giao việc">
                                    <Select showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn mức độ ưu tiên"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={optionEntries(users)}
                                    />
                                </Form.Item>
                            </Col>

                            <Col sm={{ span: 24 }}></Col>
                        </Row>
                    </Col>

                    {/* footer */}
                    <Col sm={{ span: 24 }}>
                        <Col span={24} className="main-btn-popup">
                            <Button className="btn-popup"
                                onClick={onClose}
                            >
                                <CloseSquareOutlined />
                                Hủy
                            </Button>
                            <span> </span>
                            <Button className="btn-popup btn-success" type="primary" loading={isLoadingBtn}
                                onClick={() => {
                                    setTypeSubmit('save');
                                    formData.submit();
                                }}
                            >
                                <CheckOutlined />
                                Lưu và đóng
                            </Button>
                            <span> </span>
                            <Button className="btn-popup" type="primary"
                                loading={isLoadingBtn}
                                onClick={() => {
                                    setTypeSubmit('save_continue');
                                    formData.submit();
                                }}
                            >
                                <PlusCircleOutlined />
                                Lưu và thêm mới
                            </Button>
                        </Col>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}