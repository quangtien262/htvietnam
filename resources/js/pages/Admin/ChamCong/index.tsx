import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Form, Select, InputNumber, Button, message, Descriptions, Row, Col, Card, Statistic, Space, Radio, Input } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;

interface ChamCongData {
    id: number;
    ngay_cham_cong: string;
    type: number;
    checkin_h?: string;
    checkin_m?: string;
    checkout_h?: string;
    checkout_m?: string;
    kpi: number;
    note?: string;
    luong_nghi_nua_ngay: number;
    luong_nghi_ca_ngay: number;
    gio_lam_them: number;
    is_approved: number;
}

interface TongHop {
    tong_ngay: number;
    di_lam: number;
    nghi_phep: number;
    nghi_ko_phep: number;
    nghi_le: number;
    di_muon: number;
    tong_gio_lam_them: number;
}

export default function ChamCongPage(props: any) {
    const [thang, setThang] = useState(dayjs().month() + 1);
    const [nam, setNam] = useState(dayjs().year());
    const [chamCongs, setChamCongs] = useState<ChamCongData[]>([]);
    const [tongHop, setTongHop] = useState<TongHop | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [thang, nam]);

    const loadData = () => {
        setLoading(true);
        axios.get(route('hr.cham-cong.index'), {
            params: { thang, nam }
        })
        .then(res => {
            // Assuming Inertia will pass data via props
            // For now using props passed from controller
        })
        .catch(err => message.error('Lỗi tải dữ liệu'))
        .finally(() => setLoading(false));
    };

    const onDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
        const existing = chamCongs.find(
            cc => dayjs(cc.ngay_cham_cong).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

        if (existing) {
            // Edit existing
            form.setFieldsValue({
                type: existing.type,
                checkin_h: existing.checkin_h,
                checkin_m: existing.checkin_m,
                checkout_h: existing.checkout_h,
                checkout_m: existing.checkout_m,
                gio_lam_them: existing.gio_lam_them,
                note: existing.note,
            });
        } else {
            // New
            form.resetFields();
            form.setFieldsValue({ type: 1 });
        }

        setIsModalOpen(true);
    };

    const onFinish = (values: any) => {
        const data = {
            ...values,
            admin_user_id: props.auth.user.id,
            ngay_cham_cong: selectedDate?.format('YYYY-MM-DD'),
        };

        setLoading(true);
        axios.post(route('api.hr.cham-cong.store'), data)
            .then(res => {
                if (res.data.message === 'success') {
                    message.success('Chấm công thành công');
                    setIsModalOpen(false);
                    loadData();
                }
            })
            .catch(err => {
                message.error(err.response?.data?.error || 'Có lỗi xảy ra');
            })
            .finally(() => setLoading(false));
    };

    const dateCellRender = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        const cc = chamCongs.find(c => dayjs(c.ngay_cham_cong).format('YYYY-MM-DD') === dateStr);

        if (!cc) return null;

        let status: 'success' | 'processing' | 'error' | 'warning' | 'default' = 'default';
        let text = '';

        switch (cc.type) {
            case 1: // Đi làm
                status = cc.kpi === -1 ? 'warning' : 'success';
                text = `${cc.checkin_h}:${cc.checkin_m} - ${cc.checkout_h}:${cc.checkout_m}`;
                break;
            case 2:
                status = 'processing';
                text = 'Nghỉ phép';
                break;
            case 3:
                status = 'error';
                text = 'Nghỉ không phép';
                break;
            case 4:
                status = 'default';
                text = 'Nghỉ lễ';
                break;
            case 5:
                status = 'default';
                text = 'Cuối tuần';
                break;
        }

        return (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><Badge status={status} text={text} /></li>
                {cc.note && <li style={{ fontSize: 11, color: '#999' }}>{cc.note}</li>}
                {cc.gio_lam_them > 0 && (
                    <li><Badge color="blue" text={`+${cc.gio_lam_them}h`} /></li>
                )}
            </ul>
        );
    };

    const getHourOptions = () => {
        return Array.from({ length: 24 }, (_, i) => ({
            value: i.toString().padStart(2, '0'),
            label: i.toString().padStart(2, '0')
        }));
    };

    const getMinuteOptions = () => {
        return Array.from({ length: 60 }, (_, i) => ({
            value: i.toString().padStart(2, '0'),
            label: i.toString().padStart(2, '0')
        }));
    };

    return (
        <AdminLayout
            auth={props.auth}
            header="Chấm công"
            content={
                <div>
                    {/* Statistics */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Tổng ngày"
                                    value={tongHop?.tong_ngay || 0}
                                    prefix={<CalendarOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Đi làm"
                                    value={tongHop?.di_lam || 0}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Nghỉ phép"
                                    value={tongHop?.nghi_phep || 0}
                                    valueStyle={{ color: '#1677ff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Đi muộn"
                                    value={tongHop?.di_muon || 0}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<CloseCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={4}>
                            <Card>
                                <Statistic
                                    title="Giờ làm thêm"
                                    value={tongHop?.tong_gio_lam_them || 0}
                                    suffix="h"
                                    valueStyle={{ color: '#1677ff' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Calendar */}
                    <Card>
                        <Calendar
                            cellRender={dateCellRender}
                            onSelect={onDateSelect}
                            onPanelChange={(date) => {
                                setThang(date.month() + 1);
                                setNam(date.year());
                            }}
                        />
                    </Card>

                    {/* Modal Form */}
                    <Modal
                        title={`Chấm công - ${selectedDate?.format('DD/MM/YYYY')}`}
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        footer={null}
                        width={600}
                    >
                        <Form
                            form={form}
                            onFinish={onFinish}
                            layout="vertical"
                        >
                            <Form.Item
                                name="type"
                                label="Loại chấm công"
                                rules={[{ required: true }]}
                            >
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value={1}>Đi làm</Radio.Button>
                                    <Radio.Button value={2}>Nghỉ phép</Radio.Button>
                                    <Radio.Button value={3}>Nghỉ không phép</Radio.Button>
                                    <Radio.Button value={4}>Nghỉ lễ</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
                                {({ getFieldValue }) =>
                                    getFieldValue('type') === 1 ? (
                                        <>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Check in">
                                                        <Space>
                                                            <Form.Item name="checkin_h" noStyle rules={[{ required: true }]}>
                                                                <Select style={{ width: 80 }} options={getHourOptions()} placeholder="Giờ" />
                                                            </Form.Item>
                                                            <span>:</span>
                                                            <Form.Item name="checkin_m" noStyle rules={[{ required: true }]}>
                                                                <Select style={{ width: 80 }} options={getMinuteOptions()} placeholder="Phút" />
                                                            </Form.Item>
                                                        </Space>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Check out">
                                                        <Space>
                                                            <Form.Item name="checkout_h" noStyle rules={[{ required: true }]}>
                                                                <Select style={{ width: 80 }} options={getHourOptions()} placeholder="Giờ" />
                                                            </Form.Item>
                                                            <span>:</span>
                                                            <Form.Item name="checkout_m" noStyle rules={[{ required: true }]}>
                                                                <Select style={{ width: 80 }} options={getMinuteOptions()} placeholder="Phút" />
                                                            </Form.Item>
                                                        </Space>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item name="gio_lam_them" label="Giờ làm thêm">
                                                <InputNumber min={0} step={0.5} style={{ width: '100%' }} suffix="giờ" />
                                            </Form.Item>
                                        </>
                                    ) : null
                                }
                            </Form.Item>

                            <Form.Item name="note" label="Ghi chú">
                                <TextArea rows={2} />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Lưu
                                    </Button>
                                    <Button onClick={() => setIsModalOpen(false)}>
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            }
        />
    );
}
