import React, { useState } from 'react';
import { Card, Form, Select, InputNumber, Button, Result, Space } from 'antd';
import { SwapOutlined } from '@ant-design/icons';

const CURRENCIES = [
    { code: 'VND', name: 'Vietnam Dong', symbol: '₫', rate: 1 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.000043 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.000039 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.000033 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 0.0062 },
];

const CurrencyConverter: React.FC = () => {
    const [fromCurrency, setFromCurrency] = useState('VND');
    const [toCurrency, setToCurrency] = useState('USD');
    const [amount, setAmount] = useState(1000000);
    const [result, setResult] = useState<number | null>(null);

    const handleConvert = () => {
        const from = CURRENCIES.find(c => c.code === fromCurrency);
        const to = CURRENCIES.find(c => c.code === toCurrency);
        
        if (from && to) {
            const converted = (amount * from.rate) / to.rate;
            setResult(converted);
        }
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setResult(null);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title="Công Cụ Chuyển Đổi Currency">
                <Form layout="vertical">
                    <Form.Item label="Từ Currency">
                        <Select
                            value={fromCurrency}
                            onChange={(value) => {
                                setFromCurrency(value);
                                setResult(null);
                            }}
                            style={{ width: '100%' }}
                        >
                            {CURRENCIES.map(c => (
                                <Select.Option key={c.code} value={c.code}>
                                    {c.symbol} {c.name} ({c.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Số Tiền">
                        <InputNumber
                            value={amount}
                            onChange={(value) => {
                                setAmount(value || 0);
                                setResult(null);
                            }}
                            min={0}
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    </Form.Item>

                    <div style={{ textAlign: 'center', margin: '16px 0' }}>
                        <Button
                            icon={<SwapOutlined />}
                            onClick={handleSwap}
                            shape="circle"
                        />
                    </div>

                    <Form.Item label="Sang Currency">
                        <Select
                            value={toCurrency}
                            onChange={(value) => {
                                setToCurrency(value);
                                setResult(null);
                            }}
                            style={{ width: '100%' }}
                        >
                            {CURRENCIES.map(c => (
                                <Select.Option key={c.code} value={c.code}>
                                    {c.symbol} {c.name} ({c.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" onClick={handleConvert} block>
                            Chuyển Đổi
                        </Button>
                    </Form.Item>
                </Form>

                {result !== null && (
                    <Result
                        status="success"
                        title={
                            <div>
                                <div style={{ fontSize: 18 }}>
                                    {amount.toLocaleString()} {fromCurrency}
                                </div>
                                <div style={{ fontSize: 32, color: '#1890ff', margin: '16px 0' }}>
                                    {result.toLocaleString(undefined, { 
                                        minimumFractionDigits: 2, 
                                        maximumFractionDigits: 2 
                                    })} {toCurrency}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>
                                    Tỷ giá: 1 {fromCurrency} = {
                                        (CURRENCIES.find(c => c.code === fromCurrency)?.rate! / 
                                         CURRENCIES.find(c => c.code === toCurrency)?.rate!).toFixed(6)
                                    } {toCurrency}
                                </div>
                            </div>
                        }
                    />
                )}
            </Card>
        </div>
    );
};

export default CurrencyConverter;
