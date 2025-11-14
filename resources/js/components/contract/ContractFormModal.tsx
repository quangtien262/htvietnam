import React from 'react';
import { Modal, Form, Row, Col, Select, DatePicker, InputNumber, Checkbox, Input } from 'antd';
import { InsertRowAboveOutlined, PlusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { showInfo, optionEntries, numberFormat } from '../../common/function';
import { FormInstance } from 'antd/es/form';

interface ContractFormModalProps {
    open: boolean;
    dataAction: any;
    formEdit: FormInstance;
    props: any;
    dataService: any[];
    dataService_thangMay: any;
    tienPhong: number;
    tienCoc: number;
    soNguoi: number;
    soNgayThue: number;
    daysInMonth: number;
    note_applyAll: boolean;

    onCancel: () => void;
    onFinish: (values: any) => void;
    onSetDataService: (data: any[]) => void;
    onSetTienPhong: (value: number) => void;
    onSetTienCoc: (value: number) => void;
    onSetSoNguoi: (value: number) => void;
    onSetDaysInMonth: (value: number) => void;
    onSetNoteApplyAll: (value: boolean) => void;
    onTotal: (soNgay: number, dataService: any[], tongSoNgay: number, soNguoi: number) => void;
    showFormDataDetail: () => React.ReactNode;
    addSub: () => void;
    initialsFormatData: () => any;
}

const ContractFormModal: React.FC<ContractFormModalProps> = ({
    open,
    dataAction,
    formEdit,
    props,
    dataService,
    dataService_thangMay,
    tienPhong,
    tienCoc,
    soNguoi,
    soNgayThue,
    daysInMonth,
    note_applyAll,
    onCancel,
    onFinish,
    onSetDataService,
    onSetTienPhong,
    onSetTienCoc,
    onSetSoNguoi,
    onSetDaysInMonth,
    onSetNoteApplyAll,
    onTotal,
    showFormDataDetail,
    addSub,
    initialsFormatData,
}) => {
    const handleSetDefaultServices = () => {
        // Clone, không mutate props
        const defaultServices = [...(props.serviceDefault || [])];

        // Thêm thang máy cho các tòa 8,7,27 (nếu chưa có)
        if (dataAction.apartment_id && [8, 7, 27].includes(Number(dataAction.apartment_id))) {
            const hasElevator = defaultServices.some(
                (s: any) => (s?.code === 'THANG_MAY') || (String(s?.name || '').toLowerCase() === 'thang máy')
            );
            if (!hasElevator) {
                defaultServices.push({
                    ...dataService_thangMay,
                });
            }
        }

        onSetDataService(defaultServices);
    };

    const handleDateChange = (value: any) => {
        let day = 0;
        if (value) {
            // value là kiểu dayjs, lấy số ngày của tháng đã chọn
            day = value.daysInMonth();
        } else {
            day = dayjs().daysInMonth();
        }
        onSetDaysInMonth(day);
        // Cập nhật lại số tiền
        onTotal(soNgayThue, dataService, day, soNguoi);
    };

    return (
        <Modal
            title={dataAction.id === 0 ? 'Thêm mới hợp đồng' : 'Chỉnh sửa hợp đồng'}
            open={open}
            onOk={() => {
                formEdit.submit();
            }}
            okText={dataAction.id === 0 ? 'Tạo hợp đồng' : 'Cập nhật hợp đồng'}
            cancelText="Hủy"
            maskClosable={false}
            width={1000}
            onCancel={onCancel}
        >
            <Form
                form={formEdit}
                layout="vertical"
                onFinish={onFinish}
                initialValues={initialsFormatData()}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="user_id"
                            label="Khách hàng"
                            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                        >
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Chọn khách hàng"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={props.users}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="room_id"
                            label="Phòng"
                            rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
                        >
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Chọn phòng"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={optionEntries(props.room)}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="contract_status_id"
                            label="Trạng thái"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Chọn phòng"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={optionEntries(props.status)}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="start_date"
                            label={
                                <>
                                    <span>Ngày bắt đầu</span> {showInfo('Ngày bắt đầu hợp đồng')}
                                </>
                            }
                            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                        >
                            <DatePicker
                                className="form-item01"
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder={'Chọn tháng/năm'}
                                onChange={handleDateChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="end_date"
                            label={
                                <>
                                    <span>Ngày kết thúc</span> {showInfo('Ngày kết thúc hợp đồng')}
                                </>
                            }
                            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                        >
                            <DatePicker
                                className="form-item01"
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder={'Chọn tháng/năm'}
                                onChange={handleDateChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="ngay_hen_dong_tien"
                            label={
                                <>
                                    <span>Ngày đóng tiền</span>{' '}
                                    {showInfo('Ngày hẹn đóng tiền của kỳ thanh toán')}
                                </>
                            }
                            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn đóng tiền' }]}
                        >
                            <InputNumber min={1} max={31} className="form-item01" />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="so_nguoi"
                            label="Số người ở"
                            rules={[{ required: true, message: 'Vui lòng chọn số người ở' }]}
                        >
                            <InputNumber
                                className="form-item01"
                                min={1}
                                onChange={(value) => {
                                    const v = value ?? 1;
                                    onSetSoNguoi(v);
                                    onTotal(soNgayThue, dataService, daysInMonth, v);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <table className="table-salary">
                            <thead>
                                <tr>
                                    <th>
                                        <span>Chọn dịch vụ</span>
                                        <br />
                                        <a onClick={handleSetDefaultServices}>
                                            <InsertRowAboveOutlined /> Mặc định
                                        </a>
                                    </th>
                                    <th>Giá</th>
                                    <th>Đơn vị</th>
                                    <th>Thành tiền</th>
                                    <th>
                                        Mô tả thêm
                                        {showInfo(
                                            'Mô tả thêm cho dịch vụ, nếu chọn áp dụng tất cả, thì ghi chú này sẽ được áp dụng cho tất cả các dịch vụ'
                                        )}
                                        <br />
                                        <Checkbox
                                            checked={note_applyAll}
                                            onChange={(e) => {
                                                onSetNoteApplyAll(e.target.checked);
                                            }}
                                        >
                                            <a className="text-normal">Áp dụng tất cả</a>
                                        </Checkbox>
                                    </th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Tiền phòng</td>
                                    <td>
                                        <Form.Item name="gia_thue">
                                            <InputNumber
                                                formatter={(value) =>
                                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                }
                                                onChange={(value) => {
                                                    onSetTienPhong(value ?? 0);
                                                }}
                                            />
                                        </Form.Item>
                                    </td>
                                    <td>Tháng</td>
                                    <td>
                                        <b>{numberFormat(tienPhong)}</b>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>Tiền cọc</td>
                                    <td>
                                        <Form.Item name="tien_coc">
                                            <InputNumber
                                                formatter={(value) =>
                                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                }
                                                onChange={(value) => {
                                                    onSetTienCoc(value ?? 0);
                                                }}
                                            />
                                        </Form.Item>
                                    </td>
                                    <td>VNĐ</td>
                                    <td>
                                        <b>{numberFormat(tienCoc)}</b>
                                    </td>
                                    <td></td>
                                </tr>

                                {showFormDataDetail()}

                                <tr>
                                    <td colSpan={6} className="main-result-submitform">
                                        <ul>{/* {result} */}</ul>
                                    </td>
                                </tr>

                                <tr>
                                    <td colSpan={6} className="text-left">
                                        <a className="add-item01" onClick={addSub}>
                                            <span className="icon-b">
                                                <PlusCircleOutlined /> Thêm dịch vụ
                                            </span>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="text-right">
                                        <b>Tổng tiền dịch vụ hàng tháng:</b>
                                    </td>
                                    <td className="text-left">
                                        <b className="_red">
                                            {numberFormat(
                                                dataService.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.price_total > 0 ? item.price_total : 0),
                                                    0
                                                )
                                            )}
                                        </b>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="text-right">
                                        <b>Tổng phí cố định hàng tháng</b>:
                                        <em>(tiền phòng & dịch vụ)</em>
                                    </td>
                                    <td className="text-left">
                                        <b className="_red">
                                            {numberFormat(
                                                dataService.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.price_total > 0 ? item.price_total : 0),
                                                    0
                                                ) + tienPhong
                                            )}
                                        </b>
                                    </td>
                                    <td></td>
                                </tr>

                                <tr>
                                    <td colSpan={3} className="text-right">
                                        <b>Tổng tiền phòng, cọc & dịch vụ dự tính:</b>
                                    </td>
                                    <td className="text-left">
                                        <b className="_red">
                                            {numberFormat(
                                                dataService.reduce(
                                                    (sum: number, item: any) =>
                                                        sum + (item.price_total > 0 ? item.price_total : 0),
                                                    0
                                                ) +
                                                    tienPhong +
                                                    tienCoc
                                            )}
                                        </b>
                                    </td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ContractFormModal;
