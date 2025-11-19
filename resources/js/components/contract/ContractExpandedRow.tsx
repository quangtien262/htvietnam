import React, { useState } from 'react';
import { Row, Col, Button, Dropdown, Space, Image, MenuProps, Tag } from 'antd';
import {
    DownOutlined,
    EditOutlined,
    CheckCircleOutlined,
    CloseSquareOutlined,
    CaretRightOutlined,
    FileTextOutlined,
    UserOutlined,
    LoginOutlined,
    CloudOutlined,
    MehOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { numberFormat } from '../../common/function';
import CustomerDetailModal from '../CustomerDetailModal';

interface ContractExpandedRowProps {
    record: any;
    props: any;
    onEdit: (record: any) => void;
    onActive: (record: any) => void;
    onLogin: (record: any) => void;
}

const ContractExpandedRow: React.FC<ContractExpandedRowProps> = ({
    record,
    props,
    onEdit,
    onActive,
    onLogin,
}) => {
    const [customerDetailModalVisible, setCustomerDetailModalVisible] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const items: MenuProps['items'] = [
        {
            label: <a onClick={() => onEdit(record)}>Cập nhật</a>,
            key: '1',
            icon: <EditOutlined />,
        },
        {
            label: <a onClick={() => onActive(record)}>Active</a>,
            key: '2',
            icon: <CheckCircleOutlined />,
        },
        {
            label: 'Hủy hóa đơn',
            key: '3',
            icon: <CloseSquareOutlined />,
            danger: true,
            disabled: false,
        },
    ];

    const menuProps = {
        items,
    };

    return (
        <>
            <div className="float-btn-option">
                <Dropdown menu={menuProps}>
                    <Button className="btn-default02">
                        <Space>
                            Thao tác
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>
            <Row>
                <Col span={10}>
                    {record.images ? (
                        <Image width={150} src={record.images} />
                    ) : (
                        <Image className="image-list" src="/images/contract-updating.png" />
                    )}
                </Col>
                <Col span={14}>
                    <ul className="ul-info">
                        <li>
                            <b><CaretRightOutlined /> Tiêu đề:</b> {record.name}
                        </li>
                        <li>
                            <b><FileTextOutlined /> Mã Hợp đồng:</b> {record.code}
                        </li>
                        <li>
                            <b><UserOutlined /> Khách hàng: </b>
                            <a
                                style={{ cursor: 'pointer', color: '#1890ff', textDecoration: 'underline' }}
                                onClick={() => {
                                    setSelectedCustomerId(record.user_id);
                                    setCustomerDetailModalVisible(true);
                                }}
                            >
                                {record.ho_ten}
                            </a>
                            <span>  </span>
                            <button className="btn-default" onClick={() => onLogin(record)}>
                                {' '}
                                <LoginOutlined /> Login
                            </button>
                        </li>
                        <li>
                            <b><CloudOutlined /> Phòng:</b>{' '}
                            {props.room && props.room[record.room_id] ? props.room[record.room_id].name : ''}
                        </li>
                        <li>
                            <b><MehOutlined /> Số người ở:</b> {record.so_nguoi}
                        </li>
                        <li>
                            <b><ClockCircleOutlined /> Ngày hẹn đóng tiền:</b> {record.ngay_hen_dong_tien}
                        </li>
                    </ul>
                </Col>
                <Col span={24}>
                    <table className="table-info01">
                        <thead>
                            <tr>
                                <th className="text-left">Dịch vụ</th>
                                <th className="text-right">Giá</th>
                                <th className="text-right">Đơn vị</th>
                                <th className="text-right">Thành tiền</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-left">Tiền phòng</td>
                                <td className="text-right">{numberFormat(record.gia_thue)}</td>
                                <td className="text-right">Phòng</td>
                                <td className="text-right">
                                    <b>{numberFormat(record.gia_thue)}</b>
                                </td>
                                <td></td>
                            </tr>
                            {record.tien_coc ? (
                                <tr>
                                    <td className="text-left">Tiền cọc</td>
                                    <td className="text-right">{numberFormat(record.tien_coc)}</td>
                                    <td className="text-right">VNĐ</td>
                                    <td className="text-right">
                                        <b>{numberFormat(record.tien_coc)}</b>
                                    </td>
                                    <td></td>
                                </tr>
                            ) : (
                                ''
                            )}

                            {/* show services */}
                            {(() => {
                                if (record.services && Array.isArray(record.services)) {
                                    return record.services.map((service: any, idx: number) => {
                                        const serviceName = service.name ?? service.service_name ?? 'Dịch vụ';
                                        const per = service.per ?? service.per_default ?? '';
                                        const price = service.price ?? service.price_default ?? 0;
                                        const priceTotal = service.price_total ?? price;
                                        return (
                                            <tr key={idx}>
                                                <td className="text-left">{serviceName}</td>
                                                <td className="text-right">{numberFormat(price)}</td>
                                                <td className="text-right">{per}</td>
                                                <td className="text-right">
                                                    <b>{numberFormat(priceTotal)}</b>
                                                </td>
                                                <td>{service.note ?? ''}</td>
                                            </tr>
                                        );
                                    });
                                }
                            })()}

                            <tr>
                                <td colSpan={3} className="text-right _red">
                                    <b>Tổng</b>
                                </td>
                                <td className="text-right _red">
                                    <b>{numberFormat(record.total)}</b>
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </Col>
            </Row>

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                visible={customerDetailModalVisible}
                customerId={selectedCustomerId}
                onClose={() => setCustomerDetailModalVisible(false)}
                onLogin={(customer: any) => {
                    setCustomerDetailModalVisible(false);
                    onLogin({ ...record, ...customer });
                }}
            />
        </>
    );
};

export default ContractExpandedRow;
