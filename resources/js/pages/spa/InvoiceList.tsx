import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Drawer, Descriptions,
    Row, Col, Statistic, DatePicker, Badge, message, Popconfirm, Divider, Timeline, InputNumber
} from 'antd';
import {
    FileTextOutlined, EyeOutlined, PrinterOutlined, DeleteOutlined,
    DollarOutlined, CalendarOutlined, UserOutlined, ShopOutlined,
    ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
    ExportOutlined, SearchOutlined, FilterOutlined, CreditCardOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import { API } from '../../common/api';
import { numberFormat } from '../../common/function';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Invoice {
    id: number;
    ma_hoa_don: string;
    khach_hang_id?: number;
    khach_hang?: {
        id: number;
        name: string;
        ho_ten?: string;
        phone?: string;
        sdt?: string;
    };
    chi_nhanh_id: number;
    chi_nhanh?: {
        id: number;
        ten_chi_nhanh: string;
    };
    ngay_ban: string;
    tong_tien_dich_vu: number;
    tong_tien_san_pham: number;
    tong_tien: number;
    giam_gia: number;
    tien_tip: number;
    tong_thanh_toan: number;
    phuong_thuc_thanh_toan?: any;
    thanh_toan_tien_mat: number;
    thanh_toan_chuyen_khoan: number;
    thanh_toan_the: number;
    thanh_toan_vi: number;
    phi_ca_the: number;
    trang_thai: string;
    nguoi_ban?: string;
    ghi_chu?: string;
    created_at: string;
}

interface DebtInfo {
    id: number;
    so_tien_no: number;
    so_tien_da_thanh_toan: number;
    tong_tien_hoa_don: number;
    ngay_hen_tat_toan?: string;
}

interface InvoiceDetail extends Invoice {
    cong_no?: DebtInfo;
    chi_tiets: Array<{
        id: number;
        dich_vu_id?: number;
        san_pham_id?: number;
        ktv_id?: number;
        dich_vu?: {
            id: number;
            ten_dich_vu: string;
        };
        san_pham?: {
            id: number;
            ten_san_pham: string;
        };
        ktv?: {
            id: number;
            admin_user?: {
                name: string;
            };
        };
        so_luong: number;
        don_gia: number;
        thanh_tien: number;
        chiet_khau_don_hang?: number;
        chiet_khau_don_hang_type?: 'percent' | 'cash';
        ghi_chu?: string;
        sale_commissions?: Array<{
            staff_id: number;
            staff_name: string;
            commission_value: number;
            commission_unit: 'percent' | 'cash';
            commission_type: 'sale' | 'service';
        }>;
        service_commissions?: Array<{
            staff_id: number;
            staff_name: string;
            commission_value: number;
            commission_unit: 'percent' | 'cash';
            commission_type: 'sale' | 'service';
        }>;
    }>;
    hoa_hongs?: Array<{
        id: number;
        ktv_id: number;
        ktv?: {
            admin_user?: {
                name: string;
            };
        };
        gia_tri_goc: number;
        ti_le_hoa_hong: number;
        tien_hoa_hong: number;
    }>;
}

const InvoiceList: React.FC = () => {
    // State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);

    // Debt payment modal
    const [payDebtModalVisible, setPayDebtModalVisible] = useState(false);
    const [debtInvoice, setDebtInvoice] = useState<InvoiceDetail | null>(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[any, any] | null>(null);

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        cancelled: 0,
        today_revenue: 0,
        today_count: 0,
    });

    // Load invoices
    useEffect(() => {
        loadInvoices();
    }, [pagination.current, pagination.pageSize, searchText, selectedStatus, dateRange]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.spaInvoiceList, {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    search: searchText || undefined,
                    trang_thai: selectedStatus || undefined,
                    tu_ngay: dateRange?.[0]?.format('YYYY-MM-DD'),
                    den_ngay: dateRange?.[1]?.format('YYYY-MM-DD'),
                }
            });

            if (response.data.status_code === 200) {
                const data = response.data.data;
                setInvoices(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            console.error('Load invoices error:', error);
            message.error('Không thể tải danh sách hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (record: Invoice) => {
        try {
            const response = await axios.get(API.spaInvoiceDetail(record.id));
            if (response.data.status_code === 200) {
                setSelectedInvoice(response.data.data);
                setDetailDrawerVisible(true);
            }
        } catch (error) {
            message.error('Không thể tải chi tiết hóa đơn');
        }
    };

    const handlePrint = async (record: Invoice) => {
        try {
            const response = await axios.get(API.spaInvoicePrint(record.id));
            if (response.data.status_code === 200) {
                const invoice = response.data.data;

                // Create print window
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                if (!printWindow) {
                    message.error('Vui lòng cho phép cửa sổ popup để in');
                    return;
                }

                // Generate print HTML
                const printContent = generatePrintHTML(invoice);
                printWindow.document.write(printContent);
                printWindow.document.close();

                // Print after content is loaded
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            message.error('Không thể in hóa đơn');
        }
    };

    const generatePrintHTML = (invoice: InvoiceDetail) => {
        const now = dayjs().format('DD/MM/YYYY HH:mm');
        const ngayBan = dayjs(invoice.ngay_ban).format('DD/MM/YYYY HH:mm');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Hóa đơn ${invoice.ma_hoa_don}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    .invoice-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #ddd;
                        padding: 30px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 28px;
                        color: #1890ff;
                        margin-bottom: 10px;
                    }
                    .header p {
                        color: #666;
                        margin: 5px 0;
                    }
                    .info-section {
                        margin: 20px 0;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    .info-box {
                        padding: 15px;
                        background: #f5f5f5;
                        border-radius: 5px;
                    }
                    .info-box h3 {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                    }
                    .info-box p {
                        margin: 5px 0;
                        color: #333;
                    }
                    .info-box strong {
                        display: inline-block;
                        min-width: 100px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background: #f0f0f0;
                        font-weight: 600;
                        color: #333;
                    }
                    td.number {
                        text-align: right;
                    }
                    td.center {
                        text-align: center;
                    }
                    .total-section {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #333;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        font-size: 15px;
                    }
                    .total-row.grand-total {
                        font-size: 20px;
                        font-weight: bold;
                        color: #1890ff;
                        border-top: 2px solid #1890ff;
                        margin-top: 10px;
                        padding-top: 15px;
                    }
                    .payment-methods {
                        margin-top: 20px;
                        padding: 15px;
                        background: #e6f7ff;
                        border-radius: 5px;
                    }
                    .payment-methods h4 {
                        margin-bottom: 10px;
                        color: #1890ff;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    .signature-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                        margin-top: 50px;
                        text-align: center;
                    }
                    .signature-box {
                        padding: 20px;
                    }
                    .signature-box h4 {
                        margin-bottom: 60px;
                        font-weight: normal;
                    }
                    .note {
                        margin-top: 20px;
                        padding: 15px;
                        background: #fff7e6;
                        border-left: 4px solid #faad14;
                    }
                    @media print {
                        body { padding: 0; }
                        .invoice-container { border: none; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <h1>HÓA ĐƠN BÁN HÀNG</h1>
                        <p><strong>${invoice.ma_hoa_don}</strong></p>
                        <p>${invoice.chi_nhanh?.ten_chi_nhanh || 'N/A'}</p>
                    </div>

                    <div class="info-section">
                        <div class="info-box">
                            <h3>Thông tin khách hàng</h3>
                            <p><strong>Tên:</strong> ${invoice.khach_hang?.name || invoice.khach_hang?.ho_ten || 'Khách lẻ'}</p>
                            ${invoice.khach_hang?.phone || invoice.khach_hang?.sdt
                                ? `<p><strong>SĐT:</strong> ${invoice.khach_hang.phone || invoice.khach_hang.sdt}</p>`
                                : ''
                            }
                        </div>
                        <div class="info-box">
                            <h3>Thông tin hóa đơn</h3>
                            <p><strong>Ngày bán:</strong> ${ngayBan}</p>
                            <p><strong>Người bán:</strong> ${invoice.nguoi_ban || 'N/A'}</p>
                            <p><strong>In lúc:</strong> ${now}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">STT</th>
                                <th>Tên sản phẩm/dịch vụ</th>
                                <th style="width: 80px;" class="center">SL</th>
                                <th style="width: 120px;" class="number">Đơn giá</th>
                                <th style="width: 140px;" class="number">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.chi_tiets.map((item, index) => `
                                <tr>
                                    <td class="center">${index + 1}</td>
                                    <td>
                                        ${item.dich_vu?.ten_dich_vu || item.san_pham?.ten_san_pham}
                                        ${item.ktv ? `<br><small style="color: #666;">KTV: ${item.ktv.admin_user?.name || 'N/A'}</small>` : ''}
                                        ${item.ghi_chu ? `<br><small style="color: #999; font-style: italic;">${item.ghi_chu}</small>` : ''}
                                    </td>
                                    <td class="center">${item.so_luong}</td>
                                    <td class="number">${item.don_gia.toLocaleString('vi-VN')}</td>
                                    <td class="number"><strong>${item.thanh_tien.toLocaleString('vi-VN')}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span>Tổng tiền dịch vụ:</span>
                            <span>${invoice.tong_tien_dich_vu.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div class="total-row">
                            <span>Tổng tiền sản phẩm:</span>
                            <span>${invoice.tong_tien_san_pham.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div class="total-row">
                            <span>Tổng cộng:</span>
                            <span><strong>${invoice.tong_tien.toLocaleString('vi-VN')} ₫</strong></span>
                        </div>
                        ${invoice.giam_gia > 0 ? `
                            <div class="total-row" style="color: #ff4d4f;">
                                <span>Giảm giá:</span>
                                <span>-${invoice.giam_gia.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        ` : ''}
                        ${invoice.tien_tip > 0 ? `
                            <div class="total-row" style="color: #52c41a;">
                                <span>Tiền tip:</span>
                                <span>+${invoice.tien_tip.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        ` : ''}
                        <div class="total-row grand-total">
                            <span>TỔNG THANH TOÁN:</span>
                            <span>${invoice.tong_thanh_toan.toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>

                    ${invoice.phuong_thuc_thanh_toan ? `
                        <div class="payment-methods">
                            <h4>Phương thức thanh toán:</h4>
                            ${Object.entries(invoice.phuong_thuc_thanh_toan).map(([method, amount]: [string, any]) => `
                                <p><strong>${method}:</strong> ${amount.toLocaleString('vi-VN')} ₫</p>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${invoice.ghi_chu ? `
                        <div class="note">
                            <strong>Ghi chú:</strong><br>
                            ${invoice.ghi_chu}
                        </div>
                    ` : ''}

                    ${invoice.hoa_hongs && invoice.hoa_hongs.length > 0 ? `
                        <div style="margin-top: 30px;">
                            <h3 style="margin-bottom: 15px; color: #52c41a;">Hoa hồng KTV</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>KTV</th>
                                        <th class="number">Giá trị gốc</th>
                                        <th class="center">Tỷ lệ</th>
                                        <th class="number">Hoa hồng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${invoice.hoa_hongs.map(hh => `
                                        <tr>
                                            <td>${hh.ktv?.admin_user?.name || 'N/A'}</td>
                                            <td class="number">${hh.gia_tri_goc.toLocaleString('vi-VN')} ₫</td>
                                            <td class="center">${hh.ti_le_hoa_hong}%</td>
                                            <td class="number"><strong style="color: #52c41a;">${hh.tien_hoa_hong.toLocaleString('vi-VN')} ₫</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}

                    <div class="signature-section">
                        <div class="signature-box">
                            <h4>Người mua hàng</h4>
                            <p>(Ký, ghi rõ họ tên)</p>
                        </div>
                        <div class="signature-box">
                            <h4>Người bán hàng</h4>
                            <p>(Ký, ghi rõ họ tên)</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Cảm ơn quý khách! Hẹn gặp lại!</p>
                        <p style="margin-top: 10px;">In lúc: ${now}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(API.spaInvoiceDelete(id));
            if (response.data.status_code === 200) {
                message.success('Đã xóa hóa đơn');
                loadInvoices();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa hóa đơn');
        }
    };

    // Handle debt payment
    const handleOpenPayDebt = async (invoice: Invoice) => {
        setPaymentLoading(true);
        try {
            // Fetch full invoice detail to get debt info
            const response = await axios.get(API.spaInvoiceDetail(invoice.id));
            if (response.data.status_code === 200) {
                const fullInvoice = response.data.data;
                setDebtInvoice(fullInvoice); // Set full invoice with cong_no
                // Set default payment amount = remaining debt
                const debtAmount = fullInvoice.cong_no?.so_tien_no || 0;
                setPaymentAmount(debtAmount);
                setPayDebtModalVisible(true);
            }
        } catch (error: any) {
            message.error('Không thể tải thông tin công nợ');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePayDebt = async () => {
        if (!debtInvoice || !debtInvoice.cong_no) return;

        if (paymentAmount <= 0) {
            message.error('Số tiền thanh toán phải lớn hơn 0');
            return;
        }

        if (paymentAmount > debtInvoice.cong_no.so_tien_no) {
            message.error(`Số tiền thanh toán không được vượt quá số tiền nợ (${numberFormat(debtInvoice.cong_no.so_tien_no)} ₫)`);
            return;
        }

        setPaymentLoading(true);
        try {
            const response = await axios.post(`/aio/api/spa/invoices/${debtInvoice.id}/pay-debt`, {
                so_tien_thanh_toan: paymentAmount,
            });

            if (response.data.success) {
                message.success(response.data.message || 'Thanh toán công nợ thành công');
                setPayDebtModalVisible(false);
                setDebtInvoice(null);
                setPaymentAmount(0);
                loadInvoices();
            } else {
                message.error(response.data.message || 'Thanh toán thất bại');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi thanh toán công nợ');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.post(API.spaInvoiceExport, {
                tu_ngay: dateRange?.[0]?.format('YYYY-MM-DD'),
                den_ngay: dateRange?.[1]?.format('YYYY-MM-DD'),
                trang_thai: selectedStatus,
            });

            if (response.data.status_code === 200) {
                message.success('Đã xuất dữ liệu');
                // TODO: Download file
            }
        } catch (error) {
            message.error('Không thể xuất dữ liệu');
        }
    };

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string; icon: any }> = {
            'cho_thanh_toan': { color: 'orange', text: 'Chờ thanh toán', icon: <ClockCircleOutlined /> },
            'da_thanh_toan': { color: 'green', text: 'Đã thanh toán', icon: <CheckCircleOutlined /> },
            'con_cong_no': { color: 'volcano', text: 'Còn công nợ', icon: <DollarOutlined /> },
            'da_huy': { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
        };

        const config = statusConfig[status] || { color: 'default', text: status, icon: null };
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const columns: ColumnsType<Invoice> = [
        {
            title: 'Mã HĐ',
            dataIndex: 'ma_hoa_don',
            key: 'ma_hoa_don',
            width: 120,
            fixed: 'left',
            render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
        },
        {
            title: 'Ngày bán',
            dataIndex: 'ngay_ban',
            key: 'ngay_ban',
            width: 150,
            render: (date) => (
                <div>
                    <div>{dayjs(date).format('DD/MM/YYYY')}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                        {dayjs(date).format('HH:mm')}
                    </div>
                </div>
            ),
            sorter: (a, b) => dayjs(a.ngay_ban).unix() - dayjs(b.ngay_ban).unix(),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'khach_hang',
            key: 'khach_hang',
            width: 200,
            render: (khachHang) => (
                <div>
                    <div>
                        <UserOutlined /> {khachHang?.name || khachHang?.ho_ten || 'Khách lẻ'}
                    </div>
                    {khachHang?.phone || khachHang?.sdt ? (
                        <div style={{ fontSize: 12, color: '#999' }}>
                            {khachHang.phone || khachHang.sdt}
                        </div>
                    ) : null}
                </div>
            ),
        },
        {
            title: 'Chi nhánh',
            dataIndex: 'chi_nhanh',
            key: 'chi_nhanh',
            width: 150,
            render: (chiNhanh) => (
                <div>
                    <ShopOutlined /> {chiNhanh?.ten_chi_nhanh || 'N/A'}
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'tong_tien',
            key: 'tong_tien',
            width: 130,
            align: 'right',
            render: (value) => (
                <strong style={{ color: '#52c41a' }}>
                    {numberFormat(value)} ₫
                </strong>
            ),
            sorter: (a, b) => a.tong_tien - b.tong_tien,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'giam_gia',
            key: 'giam_gia',
            width: 120,
            align: 'right',
            render: (value) => value > 0 ? (
                <span style={{ color: '#ff4d4f' }}>
                    -{numberFormat(value)} ₫
                </span>
            ) : '-',
        },
        {
            title: 'Thanh toán',
            dataIndex: 'tong_thanh_toan',
            key: 'tong_thanh_toan',
            width: 140,
            align: 'right',
            render: (value) => (
                <strong style={{ color: '#1890ff', fontSize: 15 }}>
                    {numberFormat(value)} ₫
                </strong>
            ),
            sorter: (a, b) => a.tong_thanh_toan - b.tong_thanh_toan,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 140,
            render: (status) => getStatusTag(status),
            filters: [
                { text: 'Chờ thanh toán', value: 'cho_thanh_toan' },
                { text: 'Đã thanh toán', value: 'da_thanh_toan' },
                { text: 'Còn công nợ', value: 'con_cong_no' },
                { text: 'Đã hủy', value: 'da_huy' },
            ],
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={() => handlePrint(record)}
                    />
                    {record.trang_thai === 'con_cong_no' && (
                        <Button
                            type="link"
                            size="small"
                            icon={<CreditCardOutlined />}
                            onClick={() => handleOpenPayDebt(record)}
                            style={{ color: '#ff4d4f' }}
                        >
                            Trả nợ
                        </Button>
                    )}
                    {record.trang_thai !== 'da_thanh_toan' && (
                        <Popconfirm
                            title="Xác nhận xóa hóa đơn?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng hóa đơn"
                            value={stats.total}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã thanh toán"
                            value={stats.paid}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Chờ thanh toán"
                            value={stats.pending}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={stats.today_revenue}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Card */}
            <Card
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Quản lý Hóa đơn</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<ExportOutlined />}
                        onClick={handleExport}
                    >
                        Xuất Excel
                    </Button>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Input.Search
                                placeholder="Tìm kiếm mã HĐ, khách hàng, SĐT..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="cho_thanh_toan">Chờ thanh toán</Option>
                                <Option value="da_thanh_toan">Đã thanh toán</Option>
                                <Option value="con_cong_no">Còn công nợ</Option>
                                <Option value="da_huy">Đã hủy</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={10}>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder={['Từ ngày', 'Đến ngày']}
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as any)}
                            />
                        </Col>
                    </Row>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} hóa đơn`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title={`Chi tiết hóa đơn: ${selectedInvoice?.ma_hoa_don}`}
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={700}
                extra={
                    <Space>
                        {selectedInvoice?.trang_thai === 'con_cong_no' && (
                            <Button
                                type="primary"
                                danger
                                icon={<CreditCardOutlined />}
                                onClick={() => handleOpenPayDebt(selectedInvoice)}
                            >
                                Trả nợ
                            </Button>
                        )}
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={() => selectedInvoice && handlePrint(selectedInvoice)}
                        >
                            In
                        </Button>
                    </Space>
                }
            >
                {selectedInvoice && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã hóa đơn" span={2}>
                                <strong>{selectedInvoice.ma_hoa_don}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày bán" span={2}>
                                {dayjs(selectedInvoice.ngay_ban).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng" span={2}>
                                {selectedInvoice.khach_hang?.name || selectedInvoice.khach_hang?.ho_ten || 'Khách lẻ'}
                                {selectedInvoice.khach_hang?.phone && ` - ${selectedInvoice.khach_hang.phone}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh" span={2}>
                                {selectedInvoice.chi_nhanh?.ten_chi_nhanh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người bán" span={2}>
                                {selectedInvoice.nguoi_ban || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={2}>
                                {getStatusTag(selectedInvoice.trang_thai)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Chi tiết sản phẩm/dịch vụ</Divider>
                        <Table
                            dataSource={selectedInvoice.chi_tiets}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Tên',
                                    dataIndex: 'ten',
                                    render: (_, record) => (
                                        <div>
                                            <div>{record.dich_vu?.ten_dich_vu || record.san_pham?.ten_san_pham}</div>
                                            {record.ktv && (
                                                <div style={{ fontSize: 12, color: '#999' }}>
                                                    KTV: {record.ktv.admin_user?.name}
                                                </div>
                                            )}
                                            {/* Chiết khấu sản phẩm */}
                                            {record.chiet_khau_don_hang && record.chiet_khau_don_hang > 0 && (
                                                <div style={{ marginTop: 4 }}>
                                                    <Tag color="orange" style={{ fontSize: 11 }}>
                                                        CK: {record.chiet_khau_don_hang_type === 'percent'
                                                            ? `${record.chiet_khau_don_hang}%`
                                                            : `${numberFormat(record.chiet_khau_don_hang)}₫`
                                                        }
                                                    </Tag>
                                                </div>
                                            )}
                                            {/* NV Tư vấn */}
                                            {record.sale_commissions && record.sale_commissions.length > 0 && (
                                                <div style={{ marginTop: 4 }}>
                                                    <div style={{ fontSize: 11, color: '#1890ff', fontWeight: 500 }}>NV Tư vấn:</div>
                                                    {record.sale_commissions.map((comm, idx) => (
                                                        <Tag key={idx} color="blue" style={{ marginTop: 2, fontSize: 11 }}>
                                                            {comm.staff_name} ({comm.commission_unit === 'percent' ? `${comm.commission_value}%` : `${numberFormat(comm.commission_value)}đ`})
                                                        </Tag>
                                                    ))}
                                                </div>
                                            )}
                                            {/* NV Làm dịch vụ */}
                                            {record.service_commissions && record.service_commissions.length > 0 && (
                                                <div style={{ marginTop: 4 }}>
                                                    <div style={{ fontSize: 11, color: '#52c41a', fontWeight: 500 }}>NV Làm DV:</div>
                                                    {record.service_commissions.map((comm, idx) => (
                                                        <Tag key={idx} color="green" style={{ marginTop: 2, fontSize: 11 }}>
                                                            {comm.staff_name} ({comm.commission_unit === 'percent' ? `${comm.commission_value}%` : `${numberFormat(comm.commission_value)}đ`})
                                                        </Tag>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    title: 'SL',
                                    dataIndex: 'so_luong',
                                    width: 60,
                                    align: 'center',
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'don_gia',
                                    width: 100,
                                    align: 'right',
                                    render: (value) => `${numberFormat(value)} ₫`,
                                },
                                {
                                    title: 'Thành tiền',
                                    dataIndex: 'thanh_tien',
                                    width: 120,
                                    align: 'right',
                                    render: (value) => (
                                        <strong style={{ color: '#52c41a' }}>
                                            {numberFormat(value)} ₫
                                        </strong>
                                    ),
                                },
                            ]}
                        />

                        <Divider>Thông tin thanh toán</Divider>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tổng tiền dịch vụ">
                                {numberFormat(selectedInvoice.tong_tien_dich_vu)} ₫
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền sản phẩm">
                                {numberFormat(selectedInvoice.tong_tien_san_pham)} ₫
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng cộng">
                                <strong>{numberFormat(selectedInvoice.tong_tien)} ₫</strong>
                            </Descriptions.Item>
                            {selectedInvoice.giam_gia > 0 && (
                                <Descriptions.Item label="Giảm giá">
                                    <span style={{ color: '#ff4d4f' }}>
                                        -{numberFormat(selectedInvoice.giam_gia)} ₫
                                    </span>
                                </Descriptions.Item>
                            )}
                            {selectedInvoice.tien_tip > 0 && (
                                <Descriptions.Item label="Tiền tip">
                                    <span style={{ color: '#52c41a' }}>
                                        +{numberFormat(selectedInvoice.tien_tip)} ₫
                                    </span>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Tổng thanh toán">
                                <strong style={{ color: '#1890ff', fontSize: 18 }}>
                                    {numberFormat(selectedInvoice.tong_thanh_toan)} ₫
                                </strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Phương thức thanh toán</Divider>
                        <Descriptions bordered column={1}>
                            {selectedInvoice.thanh_toan_tien_mat > 0 && (
                                <Descriptions.Item label="💵 Tiền mặt">
                                    <strong style={{ color: '#52c41a' }}>
                                        {numberFormat(selectedInvoice.thanh_toan_tien_mat)} ₫
                                    </strong>
                                </Descriptions.Item>
                            )}
                            {selectedInvoice.thanh_toan_chuyen_khoan > 0 && (
                                <Descriptions.Item label="🏦 Chuyển khoản">
                                    <strong style={{ color: '#52c41a' }}>
                                        {numberFormat(selectedInvoice.thanh_toan_chuyen_khoan)} ₫
                                    </strong>
                                </Descriptions.Item>
                            )}
                            {selectedInvoice.thanh_toan_the > 0 && (
                                <>
                                    <Descriptions.Item label="💳 Quẹt thẻ">
                                        <strong style={{ color: '#52c41a' }}>
                                            {numberFormat(selectedInvoice.thanh_toan_the)} ₫
                                        </strong>
                                    </Descriptions.Item>
                                    {selectedInvoice.phi_ca_the > 0 && (
                                        <Descriptions.Item label="📊 Phí cà thẻ">
                                            <span style={{ color: '#ff4d4f' }}>
                                                -{numberFormat(selectedInvoice.phi_ca_the)} ₫
                                            </span>
                                        </Descriptions.Item>
                                    )}
                                    {selectedInvoice.phi_ca_the > 0 && (
                                        <Descriptions.Item label="✅ Thực nhận từ thẻ">
                                            <strong style={{ color: '#1890ff' }}>
                                                {numberFormat(selectedInvoice.thanh_toan_the - selectedInvoice.phi_ca_the)} ₫
                                            </strong>
                                        </Descriptions.Item>
                                    )}
                                </>
                            )}
                            {selectedInvoice.thanh_toan_vi > 0 && (
                                <Descriptions.Item label="👛 Ví điện tử">
                                    <strong style={{ color: '#52c41a' }}>
                                        {numberFormat(selectedInvoice.thanh_toan_vi)} ₫
                                    </strong>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {selectedInvoice.hoa_hongs && selectedInvoice.hoa_hongs.length > 0 && (
                            <>
                                <Divider>Hoa hồng KTV</Divider>
                                <Table
                                    dataSource={selectedInvoice.hoa_hongs}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        {
                                            title: 'KTV',
                                            dataIndex: 'ktv',
                                            render: (ktv) => ktv?.admin_user?.name,
                                        },
                                        {
                                            title: 'Giá trị gốc',
                                            dataIndex: 'gia_tri_goc',
                                            align: 'right',
                                            render: (value) => `${value.toLocaleString()} ₫`,
                                        },
                                        {
                                            title: 'Tỷ lệ',
                                            dataIndex: 'ti_le_hoa_hong',
                                            align: 'center',
                                            render: (value) => `${value}%`,
                                        },
                                        {
                                            title: 'Hoa hồng',
                                            dataIndex: 'tien_hoa_hong',
                                            align: 'right',
                                            render: (value) => (
                                                <strong style={{ color: '#52c41a' }}>
                                                    {value.toLocaleString()} ₫
                                                </strong>
                                            ),
                                        },
                                    ]}
                                />
                            </>
                        )}

                        {selectedInvoice.ghi_chu && (
                            <>
                                <Divider>Ghi chú</Divider>
                                <p>{selectedInvoice.ghi_chu}</p>
                            </>
                        )}
                    </div>
                )}
            </Drawer>

            {/* Debt Payment Modal */}
            <Modal
                title={<Space><CreditCardOutlined style={{ color: '#ff4d4f' }} /> Thanh toán công nợ</Space>}
                open={payDebtModalVisible}
                onOk={handlePayDebt}
                onCancel={() => {
                    setPayDebtModalVisible(false);
                    setDebtInvoice(null);
                    setPaymentAmount(0);
                }}
                okText="Xác nhận thanh toán"
                cancelText="Hủy"
                confirmLoading={paymentLoading}
                width={600}
            >
                {debtInvoice && debtInvoice.cong_no && (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Card size="small" style={{ background: '#fff7e6', borderColor: '#ffa940' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <strong>Mã hóa đơn:</strong> {debtInvoice.ma_hoa_don}
                                </div>
                                <div>
                                    <strong>Khách hàng:</strong> {debtInvoice.khach_hang?.name || debtInvoice.khach_hang?.ho_ten || 'Khách lẻ'}
                                </div>
                            </Space>
                        </Card>

                        <Card size="small" style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Tổng hóa đơn:</span>
                                    <span style={{ fontSize: 15, fontWeight: 'bold' }}>
                                        {numberFormat(debtInvoice.tong_thanh_toan)} ₫
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Đã thanh toán:</span>
                                    <span style={{ color: '#52c41a', fontSize: 15, fontWeight: 'bold' }}>
                                        {numberFormat(debtInvoice.cong_no.so_tien_da_thanh_toan)} ₫
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed #d9d9d9' }}>
                                    <span style={{ fontWeight: 'bold' }}>Còn nợ:</span>
                                    <span style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 'bold' }}>
                                        {numberFormat(debtInvoice.cong_no.so_tien_no)} ₫
                                    </span>
                                </div>
                            </Space>
                        </Card>

                        <div>
                            <div style={{ marginBottom: 8, fontSize: 15, fontWeight: 500 }}>
                                Số tiền thanh toán: <span style={{ color: 'red' }}>*</span>
                            </div>
                            <InputNumber
                                size="large"
                                value={paymentAmount}
                                onChange={(value) => setPaymentAmount(value || 0)}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                addonAfter="₫"
                                placeholder="Nhập số tiền thanh toán"
                                min={0}
                                max={debtInvoice.cong_no.so_tien_no}
                                style={{ width: '100%', fontSize: 16 }}
                            />
                            <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                                Nhập số tiền thanh toán (tối đa: {numberFormat(debtInvoice.cong_no.so_tien_no)} ₫)
                            </div>
                        </div>

                        {paymentAmount > 0 && (
                            <Card size="small" style={{
                                background: paymentAmount >= debtInvoice.cong_no.so_tien_no ? '#f6ffed' : '#fffbe6',
                                borderColor: paymentAmount >= debtInvoice.cong_no.so_tien_no ? '#b7eb8f' : '#ffe58f'
                            }}>
                                <div style={{ fontSize: 13, color: paymentAmount >= debtInvoice.cong_no.so_tien_no ? '#52c41a' : '#faad14' }}>
                                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                                    {paymentAmount >= debtInvoice.cong_no.so_tien_no
                                        ? 'Thanh toán đủ - Hóa đơn sẽ chuyển sang trạng thái "Đã thanh toán"'
                                        : `Thanh toán một phần - Còn lại: ${numberFormat(debtInvoice.cong_no.so_tien_no - paymentAmount)} ₫`}
                                </div>
                            </Card>
                        )}
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default InvoiceList;
