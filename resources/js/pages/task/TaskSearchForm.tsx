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
                        <Select className="form-item04"
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
                        <Select className="form-item04"
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

                <Col sm={6}>
                    <Form.Item name="tags" label="Tags">
                        <Select className="form-item04"
                            showSearch
                            allowClear={true}
                            onClear={() => formSearch.submit()}
                            placeholder="Chọn tags"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            // options={tags}
                            onChange={() => formSearch.submit()}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}
