import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Form, Radio, Select, InputNumber, Button, message, Row, Col, Card, Statistic, Input } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import API from '../../common/api';

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

export default function ChamCongPage() {
    const [thang, setThang] = useState(dayjs().month() + 1);
    const [nam, setNam] = useState(dayjs().year());
    const [chamCongs, setChamCongs] = useState<ChamCongData[]>([]);
    const [tongHop, setTongHop] = useState<TongHop>({
        tong_ngay: 0,
        di_lam: 0,
        nghi_phep: 0,
        nghi_ko_phep: 0,
        nghi_le: 0,
        di_muon: 0,
        tong_gio_lam_them: 0
    });
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
    }, [thang, nam]);

    const loadData = () => {
        setLoading(true);
        axios.get('/aio/api/hr/cham-cong/list', {
            params: { thang, nam }
        })
        .then((res: any) => {
            if (res.data.message === 'success') {
                setChamCongs(res.data.data.chamCongs || []);
                setTongHop(res.data.data.tongHop || {});
            }
        })
        .catch(() => message.error('Lỗi tải dữ liệu'))
        .finally(() => setLoading(false));
    };

    const dateCellRender = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        const record = chamCongs.find(c => c.ngay_cham_cong === dateStr);

        if (!record) return null;

        let status: 'success' | 'warning' | 'processing' | 'error' | 'default' = 'default';
        let text = '';

        if (record.type === 1) {
            status = record.kpi === 0 ? 'success' : 'warning';
            text = record.kpi === 0 ? 'Đúng giờ' : 'Muộn/Sớm';
        } else if (record.type === 2) {
            status = 'processing';
            text = 'Nghỉ phép';
        } else if (record.type === 3) {
            status = 'error';
            text = 'Không phép';
        } else if (record.type === 4) {
            status = 'default';
            text = 'Nghỉ lễ';
        }

        return <Badge status={status} text={text} />;
    };

    const onDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
        const dateStr = date.format('YYYY-MM-DD');
        const record = chamCongs.find(c => c.ngay_cham_cong === dateStr);

        if (record) {
            form.setFieldsValue({
                type: record.type,
                checkin_h: record.checkin_h || '08',
                checkin_m: record.checkin_m || '50',
                checkout_h: record.checkout_h || '17',
                checkout_m: record.checkout_m || '10',
                gio_lam_them: record.gio_lam_them,
                note: record.note
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                type: 1,
                checkin_h: '08',
                checkin_m: '50',
                checkout_h: '17',
                checkout_m: '10'
            });
        }
        setIsModalOpen(true);
    };

    const onFinish = (values: any) => {
        if (!selectedDate) return;

        const data = {
            ngay_cham_cong: selectedDate.format('YYYY-MM-DD'),
            type: values.type,
            checkin_h: values.type === 1 ? values.checkin_h : null,
            checkin_m: values.type === 1 ? values.checkin_m : null,
            checkout_h: values.type === 1 ? values.checkout_h : null,
            checkout_m: values.type === 1 ? values.checkout_m : null,
            gio_lam_them: values.type === 1 ? (values.gio_lam_them || 0) : 0,
            note: values.note
        };

        setLoading(true);
        axios.post('/aio/api/hr/cham-cong/store', data)
            .then((res: any) => {
                if (res.data.message === 'success') {
                    message.success('Chấm công thành công');
                    setIsModalOpen(false);
                    form.resetFields();
                    loadData();
                }
            })
            .catch(() => {
                message.error('Lỗi lưu dữ liệu');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const getHourOptions = () => {
        return Array.from({ length: 24 }, (_, i) => ({
            label: i.toString().padStart(2, '0'),
            value: i.toString().padStart(2, '0')
        }));
    };

    const getMinuteOptions = () => {
        return Array.from({ length: 60 }, (_, i) => ({
            label: i.toString().padStart(2, '0'),
            value: i.toString().padStart(2, '0')
        }));
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Chấm công</h2>

            {/* Thống kê */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Tổng ngày"
                            value={tongHop.tong_ngay}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Đi làm"
                            value={tongHop.di_lam}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Nghỉ phép"
                            value={tongHop.nghi_phep}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Đi muộn"
                            value={tongHop.di_muon}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Giờ làm thêm"
                            value={tongHop.tong_gio_lam_them}
                            suffix="h"
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Lịch */}
            <Calendar
                cellRender={dateCellRender}
                onSelect={onDateSelect}
                onPanelChange={(date) => {
                    setThang(date.month() + 1);
                    setNam(date.year());
                }}
            />

            {/* Modal chấm công */}
            <Modal
                title={`Chấm công ngày ${selectedDate?.format('DD/MM/YYYY')}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="type" label="Loại chấm công" rules={[{ required: true }]}>
                        <Radio.Group>
                            <Radio value={1}>Đi làm</Radio>
                            <Radio value={2}>Nghỉ phép</Radio>
                            <Radio value={3}>Nghỉ không phép</Radio>
                            <Radio value={4}>Nghỉ lễ</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type');
                            if (type === 1) {
                                return (
                                    <>
                                        <Form.Item label="Giờ check-in">
                                            <Input.Group compact>
                                                <Form.Item name="checkin_h" noStyle>
                                                    <Select style={{ width: '50%' }} options={getHourOptions()} />
                                                </Form.Item>
                                                <Form.Item name="checkin_m" noStyle>
                                                    <Select style={{ width: '50%' }} options={getMinuteOptions()} />
                                                </Form.Item>
                                            </Input.Group>
                                        </Form.Item>

                                        <Form.Item label="Giờ check-out">
                                            <Input.Group compact>
                                                <Form.Item name="checkout_h" noStyle>
                                                    <Select style={{ width: '50%' }} options={getHourOptions()} />
                                                </Form.Item>
                                                <Form.Item name="checkout_m" noStyle>
                                                    <Select style={{ width: '50%' }} options={getMinuteOptions()} />
                                                </Form.Item>
                                            </Input.Group>
                                        </Form.Item>

                                        <Form.Item name="gio_lam_them" label="Giờ làm thêm">
                                            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </>
                                );
                            }
                            return null;
                        }}
                    </Form.Item>

                    <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={2} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                            Xác nhận
                        </Button>
                        <Button onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
