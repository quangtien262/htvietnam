import React from 'react';
import { List, Button, InputNumber, Select, Space, Tag, Avatar, Popconfirm, Input, Empty } from 'antd';
import {
    DeleteOutlined, ScissorOutlined, SkinOutlined, TeamOutlined,
    PercentageOutlined, EditOutlined
} from '@ant-design/icons';
import type { CartItem } from '../SpaPOSScreen';

const { TextArea } = Input;
const { Option } = Select;

interface ShoppingCartProps {
    cart: CartItem[];
    staffList: any[];
    onUpdateItem: (key: string, updates: Partial<CartItem>) => void;
    onRemoveItem: (key: string) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
    cart,
    staffList,
    onUpdateItem,
    onRemoveItem
}) => {
    if (cart.length === 0) {
        return (
            <div style={{ padding: 40 }}>
                <Empty description="Giỏ hàng trống" />
            </div>
        );
    }

    return (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <List
                dataSource={cart}
                renderItem={(item) => (
                    <List.Item
                        key={item.key}
                        style={{ padding: '12px 16px', alignItems: 'flex-start' }}
                    >
                        <div style={{ flex: 1 }}>
                            {/* Item Info */}
                            <div style={{ marginBottom: 8 }}>
                                <Space>
                                    {item.type === 'service' ? (
                                        <ScissorOutlined style={{ color: '#1890ff' }} />
                                    ) : (
                                        <SkinOutlined style={{ color: '#52c41a' }} />
                                    )}
                                    <strong>{item.name}</strong>
                                    {item.stock !== undefined && item.stock <= 10 && (
                                        <Tag color="orange">Còn {item.stock}</Tag>
                                    )}
                                </Space>
                                <div style={{ fontSize: 12, color: '#999', marginLeft: 24 }}>
                                    {item.ma}
                                </div>
                            </div>

                            {/* Quantity & Price */}
                            <Space style={{ marginBottom: 8, marginLeft: 24 }} size={16}>
                                <div>
                                    <span style={{ fontSize: 12, marginRight: 8 }}>SL:</span>
                                    <InputNumber
                                        size="small"
                                        min={1}
                                        max={item.stock}
                                        value={item.quantity}
                                        onChange={(value) => onUpdateItem(item.key, { quantity: value || 1 })}
                                        style={{ width: 60 }}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 12, marginRight: 8 }}>Giá:</span>
                                    <strong style={{ color: '#52c41a' }}>
                                        {(item.price * item.quantity).toLocaleString()} VNĐ
                                    </strong>
                                </div>
                            </Space>

                            {/* Staff Selection (for services) */}
                            {item.type === 'service' && (
                                <div style={{ marginBottom: 8, marginLeft: 24 }}>
                                    <Select
                                        size="small"
                                        style={{ width: '100%' }}
                                        placeholder="Chọn KTV"
                                        allowClear
                                        value={item.ktv_id}
                                        onChange={(value, option: any) => {
                                            onUpdateItem(item.key, {
                                                ktv_id: value,
                                                ktv_name: option?.children
                                            });
                                        }}
                                        suffixIcon={<TeamOutlined />}
                                    >
                                        {staffList.map(staff => (
                                            <Option key={staff.id} value={staff.id}>
                                                {staff.ten_ktv}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {/* Item Discount */}
                            <div style={{ marginBottom: 8, marginLeft: 24 }}>
                                <Space size={8}>
                                    <PercentageOutlined style={{ fontSize: 12 }} />
                                    <span style={{ fontSize: 12 }}>Giảm giá:</span>
                                    <InputNumber
                                        size="small"
                                        min={0}
                                        max={100}
                                        value={item.discount_percent || 0}
                                        onChange={(value) => onUpdateItem(item.key, { discount_percent: value || 0 })}
                                        style={{ width: 60 }}
                                        suffix="%"
                                    />
                                    {item.discount_percent && item.discount_percent > 0 && (
                                        <span style={{ fontSize: 12, color: 'red' }}>
                                            -{((item.price * item.quantity * item.discount_percent) / 100).toLocaleString()} VNĐ
                                        </span>
                                    )}
                                </Space>
                            </div>

                            {/* Note */}
                            <div style={{ marginLeft: 24 }}>
                                <Input
                                    size="small"
                                    placeholder="Ghi chú..."
                                    value={item.note}
                                    onChange={(e) => onUpdateItem(item.key, { note: e.target.value })}
                                    prefix={<EditOutlined style={{ fontSize: 12 }} />}
                                />
                            </div>

                            {/* Total After Discount */}
                            {item.discount_percent && item.discount_percent > 0 && (
                                <div style={{ marginTop: 8, marginLeft: 24, fontSize: 14 }}>
                                    <strong>
                                        Thành tiền:{' '}
                                        <span style={{ color: '#52c41a' }}>
                                            {(
                                                item.price * item.quantity -
                                                (item.price * item.quantity * item.discount_percent) / 100
                                            ).toLocaleString()}{' '}
                                            VNĐ
                                        </span>
                                    </strong>
                                </div>
                            )}
                        </div>

                        {/* Delete Button */}
                        <Popconfirm
                            title="Xóa sản phẩm này?"
                            onConfirm={() => onRemoveItem(item.key)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default ShoppingCart;
