import React, { useState } from 'react';
import { Row, Col, Card, Input, Empty, Badge, Tag, Image, Spin } from 'antd';
import {
    SearchOutlined, ScissorOutlined, SkinOutlined, DollarOutlined,
    ClockCircleOutlined, PlusOutlined
} from '@ant-design/icons';

interface ProductCatalogProps {
    items: any[];
    type: 'service' | 'product';
    onAddToCart: (item: any) => void;
    loading?: boolean;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
    items,
    type,
    onAddToCart,
    loading = false
}) => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Group items by category
    const itemsByCategory = items.reduce((acc: any, item) => {
        const categoryName = item.danh_muc?.ten_danh_muc || 'Khác';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {});

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = searchText
            ? (type === 'service'
                ? item.ten_dich_vu?.toLowerCase().includes(searchText.toLowerCase()) ||
                  item.ma_dich_vu?.toLowerCase().includes(searchText.toLowerCase())
                : item.ten_san_pham?.toLowerCase().includes(searchText.toLowerCase()) ||
                  item.ma_san_pham?.toLowerCase().includes(searchText.toLowerCase())
            )
            : true;

        const matchesCategory = selectedCategory
            ? item.danh_muc?.ten_danh_muc === selectedCategory
            : true;

        return matchesSearch && matchesCategory;
    });

    const categories = Object.keys(itemsByCategory);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    return (
        <div>
            {/* Search & Filter */}
            <div style={{ marginBottom: 16 }}>
                <Input
                    size="large"
                    placeholder={`Tìm kiếm ${type === 'service' ? 'dịch vụ' : 'sản phẩm'}...`}
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </div>

            {/* Category Filters */}
            <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Tag
                    color={!selectedCategory ? 'blue' : 'default'}
                    style={{ cursor: 'pointer', padding: '4px 12px' }}
                    onClick={() => setSelectedCategory(null)}
                >
                    Tất cả ({items.length})
                </Tag>
                {categories.map(category => (
                    <Tag
                        key={category}
                        color={selectedCategory === category ? 'blue' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category} ({itemsByCategory[category].length})
                    </Tag>
                ))}
            </div>

            {/* Items Grid */}
            {filteredItems.length > 0 ? (
                <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                    <Row gutter={[12, 12]}>
                        {filteredItems.map(item => {
                            const isService = type === 'service';
                            const name = isService ? item.ten_dich_vu : item.ten_san_pham;
                            const code = isService ? item.ma_dich_vu : item.ma_san_pham;
                            const price = isService ? item.gia : item.gia_ban;
                            const outOfStock = !isService && item.ton_kho <= 0;

                            return (
                                <Col xs={12} sm={8} md={6} key={item.id}>
                                    <Badge.Ribbon
                                        text={outOfStock ? 'Hết hàng' : ''}
                                        color="red"
                                        style={{ display: outOfStock ? 'block' : 'none' }}
                                    >
                                        <Card
                                            hoverable={!outOfStock}
                                            onClick={() => !outOfStock && onAddToCart(item)}
                                            style={{
                                                opacity: outOfStock ? 0.5 : 1,
                                                cursor: outOfStock ? 'not-allowed' : 'pointer',
                                                height: '100%'
                                            }}
                                            bodyStyle={{ padding: 8 }}
                                            cover={
                                                item.hinh_anh ? (
                                                    <Image
                                                        src={item.hinh_anh}
                                                        height={120}
                                                        style={{ objectFit: 'cover' }}
                                                        preview={false}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        height: 120,
                                                        background: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {isService ? (
                                                            <ScissorOutlined style={{ fontSize: 32, color: '#999' }} />
                                                        ) : (
                                                            <SkinOutlined style={{ fontSize: 32, color: '#999' }} />
                                                        )}
                                                    </div>
                                                )
                                            }
                                        >
                                            <div style={{ minHeight: 80 }}>
                                                <div style={{
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    marginBottom: 4,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    minHeight: 36
                                                }}>
                                                    {name}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                                                    {code}
                                                </div>
                                                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a', marginBottom: 4 }}>
                                                    <DollarOutlined /> {price.toLocaleString()} VNĐ
                                                </div>
                                                {isService ? (
                                                    <div style={{ fontSize: 11, color: '#666' }}>
                                                        <ClockCircleOutlined /> {item.thoi_gian_thuc_hien} phút
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: 11, color: item.ton_kho <= 10 ? 'red' : '#666' }}>
                                                        Kho: {item.ton_kho}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </Badge.Ribbon>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            ) : (
                <Empty description={`Không có ${type === 'service' ? 'dịch vụ' : 'sản phẩm'} nào`} />
            )}
        </div>
    );
};

export default ProductCatalog;
