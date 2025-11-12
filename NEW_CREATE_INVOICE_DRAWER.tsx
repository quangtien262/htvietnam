      {/* Create Invoice Drawer - 2 Column Layout with Shopping Cart */}
      <Drawer
        title="Tạo hóa đơn mới"
        placement="right"
        width={isMobile ? '100%' : '90%'}
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                onClick={handleCreateInvoice}
                disabled={cart.length === 0 || !selectedUserId}
              >
                Tạo hóa đơn
              </Button>
            </Space>
          </div>
        }
      >
        <Row gutter={24}>
          {/* Left Column - Product List */}
          <Col xs={24} lg={14}>
            <Card 
              title="Danh sách sản phẩm/dịch vụ"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={productSearchText}
                onChange={(e) => setProductSearchText(e.target.value)}
                style={{ marginBottom: 16 }}
                allowClear
              />
              
              <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                <List
                  dataSource={filteredProducts}
                  locale={{ emptyText: 'Không tìm thấy sản phẩm' }}
                  renderItem={(product: any) => (
                    <List.Item
                      key={product.id}
                      style={{ 
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'background 0.3s',
                      }}
                      className="product-item"
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: 8 
                        }}>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: 15 }}>
                              {product.name}
                            </Text>
                            <div>
                              <Tag color="blue" style={{ marginTop: 4 }}>
                                {product.type}
                              </Tag>
                            </div>
                          </div>
                        </div>
                        
                        {product.description && (
                          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                            {product.description}
                          </Text>
                        )}
                        
                        {product.pricings && product.pricings.length > 0 && (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: 8,
                            marginTop: 8
                          }}>
                            {product.pricings.map((pricing: any) => (
                              <Button
                                key={pricing.id}
                                size="small"
                                type="default"
                                onClick={() => addToCart(product, pricing)}
                                style={{ 
                                  textAlign: 'left',
                                  height: 'auto',
                                  padding: '8px 12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start'
                                }}
                              >
                                <Text strong style={{ fontSize: 12, color: '#1890ff' }}>
                                  {pricing.cycle_display}
                                </Text>
                                <Text style={{ fontSize: 13, color: '#000' }}>
                                  {pricing.price.toLocaleString('vi-VN')} VNĐ
                                </Text>
                                {pricing.setup_fee > 0 && (
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    + Phí setup: {pricing.setup_fee.toLocaleString('vi-VN')} VNĐ
                                  </Text>
                                )}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>

          {/* Right Column - Order Info & Cart */}
          <Col xs={24} lg={10}>
            {/* Customer Selection */}
            <Card 
              title="Thông tin đơn hàng" 
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ marginBottom: 12 }}>
                <Text strong>Khách hàng <Text type="danger">*</Text></Text>
                <Select
                  showSearch
                  placeholder="Chọn khách hàng"
                  optionFilterProp="label"
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={clients}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <Text strong>Hạn thanh toán</Text>
                <DatePicker 
                  value={dueDate}
                  onChange={setDueDate}
                  format="YYYY-MM-DD"
                  style={{ width: '100%', marginTop: 8 }} 
                  placeholder="Chọn ngày"
                />
              </div>

              <div>
                <Text strong>Ghi chú</Text>
                <Input.TextArea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú cho hóa đơn..."
                  style={{ marginTop: 8 }}
                />
              </div>
            </Card>

            {/* Shopping Cart */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCartOutlined />
                  <span>Giỏ hàng ({cart.length})</span>
                </div>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <ShoppingCartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <div style={{ marginTop: 8, color: '#999' }}>
                    Chưa có sản phẩm nào
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chọn sản phẩm từ danh sách bên trái
                  </Text>
                </div>
              ) : (
                <div style={{ maxHeight: 'calc(100vh - 600px)', overflowY: 'auto' }}>
                  <List
                    dataSource={cart}
                    renderItem={(item, index) => (
                      <List.Item
                        key={index}
                        style={{ padding: '12px 0' }}
                        actions={[
                          <Button
                            key="delete"
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeFromCart(index)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <div>
                              <Text strong style={{ fontSize: 14 }}>
                                {item.product_name}
                              </Text>
                              <div>
                                <Tag size="small" color="blue" style={{ marginTop: 4 }}>
                                  {item.billing_cycle_display}
                                </Tag>
                              </div>
                            </div>
                          }
                          description={
                            <div style={{ marginTop: 8 }}>
                              <div style={{ marginBottom: 4 }}>
                                <Text style={{ fontSize: 13 }}>
                                  Đơn giá: {item.unit_price.toLocaleString('vi-VN')} VNĐ
                                </Text>
                              </div>
                              {item.setup_fee > 0 && (
                                <div style={{ marginBottom: 4 }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Phí setup: {item.setup_fee.toLocaleString('vi-VN')} VNĐ
                                  </Text>
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <Text style={{ fontSize: 12 }}>Số lượng:</Text>
                                <InputNumber
                                  size="small"
                                  min={1}
                                  value={item.qty}
                                  onChange={(value) => updateCartItemQty(index, value || 1)}
                                  style={{ width: 70 }}
                                />
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <Text strong style={{ fontSize: 13, color: '#1890ff' }}>
                                  Thành tiền: {((item.unit_price * item.qty) + item.setup_fee).toLocaleString('vi-VN')} VNĐ
                                </Text>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>

            {/* Total Summary */}
            {cart.length > 0 && (
              <Card size="small">
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Tạm tính:</Text>
                    <Text>{calculateTotal().toLocaleString('vi-VN')} VNĐ</Text>
                  </div>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                    {calculateTotal().toLocaleString('vi-VN')} VNĐ
                  </Text>
                </div>
              </Card>
            )}
          </Col>
        </Row>

        {/* Custom CSS for hover effect */}
        <style>{`
          .product-item:hover {
            background-color: #f5f5f5;
          }
        `}</style>
      </Drawer>
