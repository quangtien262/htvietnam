import { Form, Input, Select, Row, Col } from "antd";

export default function TaskSearchForm({
    formSearch,
    users,
    priority,
    // initialValuesForm,
    onFinishSearch
}: any) {
    return (
        <Form
            name="formSearch"
            form={formSearch}
            layout="vertical"
            onFinish={onFinishSearch}
            autoComplete="off"
            // initialValues={initialValuesForm()}
            className="form-popup"
        >
            <Row>
                <Col sm={6}>
                    <Form.Item name="keyword" label="Từ khóa">
                        <Input
                            placeholder="Nhập từ khóa"
                            onBlur={() => formSearch.submit()}
                            allowClear={true}
                            onClear={() => formSearch.submit()}
                        />
                    </Form.Item>
                </Col>

                <Col sm={6}>
                    <Form.Item name="pic" label="Người làm / support">
                        <Select
                            allowClear={true}
                            onClear={() => formSearch.submit()}
                            showSearch
                            placeholder="Chọn người làm"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            options={users}
                            onChange={() => formSearch.submit()}
                        />
                    </Form.Item>
                </Col>

                <Col sm={6}>
                    <Form.Item name="priority" label="Mức độ ưu tiên">
                        <Select
                            showSearch
                            allowClear={true}
                            onClear={() => formSearch.submit()}
                            placeholder="Chọn mức độ ưu tiên"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            options={priority}
                            onChange={() => formSearch.submit()}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}
