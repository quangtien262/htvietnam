import { useState, useRef } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, message, Form, Input, Select, Col, Row } from 'antd';
import axios from 'axios';
import '../../../../css/form.css';


export default function formTable(props) {

    const [loadingBtn, setLoadingBtn] = useState(false);
    const [formSendMail] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const tinyRefs = useRef([]);
    const { TextArea } = Input;
    const [editorData, setEditorData] = useState('');

    const onFinish = (values) => {
        setLoadingBtn(true);
        values.content = tinyRefs.current.getContent();
        axios.post(route('mail.send_mail'), values)
            .then(response => {
                message.success('Gửi mail thành công');
                setLoadingBtn(false);
            }).catch(error => {
                message.error('Gửi mail thất bại');
                setLoadingBtn(false);
            });
    };

    const handleChange = (value) => {
        getTemplate(route('mail.template', [value]));
    }

    function getTemplate(api) {
        axios.get(api)
            .then(response => {
                setEditorData(response.data);
            }).catch(error => {
                message.error('Tải mẫu email thất bại');
            });
    }



    return (
        <AdminLayout
            auth={props.auth}
            header={'Cài đặt bảng'}
            tables={props.tables}
            content={
                <div>
                    {contextHolder}

                    <Form
                        name="user"
                        layout="vertical"
                        onFinish={onFinish}
                        form={formSendMail}
                        autoComplete="off"
                    >
                        <Row>
                            <Col span={12}>
                                <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Vui lòng Nhập tiêu đề thư' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Chọn Mẫu gửi mail theo dịch vụ" name="service">
                                    <Select
                                        showSearch
                                        placeholder="Search to Select"
                                        optionFilterProp="children"
                                        onChange={handleChange}
                                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input)}
                                        options={[
                                            { value: 'website_bao_gia', label: 'Báo giá Website Express' },
                                            { value: 'website_successfully', label: 'Đăng ký Website Express thành công' },
                                            { value: 'hosting_bao_gia', label: 'Báo giá Hosting' },
                                            { value: 'hosting_successfully', label: 'Đăng ký Hosting thành công' },
                                            { value: 'vps_bao_gia', label: 'Báo giá VPS' },
                                            { value: 'vps_successfully', label: 'Đăng ký VPS thành công' },
                                            { value: 'gmail_bao_gia', label: 'Báo giá Gmail' },
                                            { value: 'gmail_successfully', label: 'Đăng ký Gmail thành công' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label="Mail TO" name="mail_to" rules={[{ required: true, message: 'Vui lòng Nhập email cần gửi' }]}>
                                    <TextArea></TextArea>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Mail CC" name="mail_cc">
                                    <TextArea></TextArea>
                                </Form.Item>
                            </Col>

                            <Col label={24}>
                                <Form.Item>
                                    đổi sang SUN
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Button type="primary" htmlType="submit" loading={loadingBtn}>Gửi Mail</Button>
                            </Col>

                        </Row>
                    </Form>

                </div>
            }
        />
    );
}
