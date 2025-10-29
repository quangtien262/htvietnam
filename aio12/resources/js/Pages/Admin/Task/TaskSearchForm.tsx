import { Form, Input, Select, Row, Col } from "antd";

export default function TaskSearchForm({
    formSearch,
    users,
    priority,
    initialValuesForm,
    onFinishSearch
}: any) {
    return (
        <Form
            name="formSearch"
            form={formSearch}
            layout="vertical"
            onFinish={onFinishSearch}
            autoComplete="off"
            initialValues={initialValuesForm()}
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
                    <Form.Item name="pic" label="Người làm chính">
                        <Select
                            allowClear={true}
                            onClear={() => formSearch.submit()}
                            showSearch
                            placeholder="Chọn người làm chính"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            options={Object.keys(users).map((key) => ({
                                label: users[key].name,
                                value: users[key].id.toString()
                            }))}
                            onChange={() => formSearch.submit()}
                        />
                    </Form.Item>
                </Col>

                <Col sm={6}>
                    <Form.Item name="support" label="Người làm cùng">
                        <Select
                            showSearch
                            allowClear={true}
                            onClear={() => formSearch.submit()}
                            placeholder="Chọn người làm cùng"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            options={Object.keys(users).map((key) => ({
                                label: users[key].name,
                                value: users[key].id.toString()
                            }))}
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
                            options={Object.keys(priority).map((key) => ({
                                label: priority[key].name,
                                value: priority[key].id.toString()
                            }))}
                            onChange={() => formSearch.submit()}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}