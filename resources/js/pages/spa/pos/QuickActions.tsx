import React, { useState } from 'react';
import { Space, Button, Popover, List, Badge, Input, Modal } from 'antd';
import {
    HistoryOutlined, SaveOutlined, BarcodeOutlined, ScanOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface QuickActionsProps {
    onHoldInvoice: () => void;
    onRecallInvoice: (invoice: any) => void;
    onBarcodeInput: (barcode: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
    onHoldInvoice,
    onRecallInvoice,
    onBarcodeInput,
}) => {
    const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');

    const heldInvoices = JSON.parse(localStorage.getItem('spa_held_invoices') || '[]');

    const handleBarcodeSubmit = () => {
        if (barcodeInput) {
            onBarcodeInput(barcodeInput);
            setBarcodeInput('');
            setBarcodeModalVisible(false);
        }
    };

    const heldInvoicesContent = (
        <div style={{ width: 300 }}>
            {heldInvoices.length > 0 ? (
                <List
                    size="small"
                    dataSource={heldInvoices}
                    renderItem={(invoice: any) => (
                        <List.Item
                            style={{ cursor: 'pointer' }}
                            onClick={() => onRecallInvoice(invoice)}
                        >
                            <List.Item.Meta
                                title={`${invoice.cart.length} sản phẩm`}
                                description={
                                    <div>
                                        <div>{invoice.customer?.ho_ten || 'Khách lẻ'}</div>
                                        <div style={{ fontSize: 11 }}>
                                            {dayjs(invoice.createdAt).format('DD/MM HH:mm')}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                    Không có hóa đơn tạm
                </div>
            )}
        </div>
    );

    return (
        <Space>
            <Button
                icon={<SaveOutlined />}
                onClick={onHoldInvoice}
                title="Lưu hóa đơn tạm"
            >
                Lưu tạm
            </Button>

            <Popover
                content={heldInvoicesContent}
                title="Hóa đơn tạm"
                trigger="click"
                placement="bottomRight"
            >
                <Badge count={heldInvoices.length}>
                    <Button icon={<HistoryOutlined />}>
                        Khôi phục
                    </Button>
                </Badge>
            </Popover>

            <Button
                icon={<BarcodeOutlined />}
                onClick={() => setBarcodeModalVisible(true)}
                title="Quét mã vạch"
            >
                Quét mã
            </Button>

            <Modal
                title="Quét mã vạch"
                open={barcodeModalVisible}
                onCancel={() => {
                    setBarcodeModalVisible(false);
                    setBarcodeInput('');
                }}
                onOk={handleBarcodeSubmit}
                okText="Thêm vào giỏ"
            >
                <Input
                    size="large"
                    placeholder="Nhập hoặc quét mã vạch..."
                    prefix={<ScanOutlined />}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onPressEnter={handleBarcodeSubmit}
                    autoFocus
                />
            </Modal>
        </Space>
    );
};

export default QuickActions;
